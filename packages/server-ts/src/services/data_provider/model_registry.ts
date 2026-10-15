import mongoose, { ConnectOptions, Connection, Model } from 'mongoose';
import { CollectionDefinition } from '../../class/collection_definition';
import { MongoOption } from './service';

/**
 * Options for every connection modular-rest opens. `dbName` is added per logical
 * database, except in `singleDatabase` mode (see getOrCreateConnection).
 */
const baseConnectOptions: ConnectOptions = {
  serverSelectionTimeoutMS: 10000, // 10 second timeout for server selection
  socketTimeoutMS: 45000, // 45 second timeout for socket operations
};

/**
 * In `singleDatabase` mode the connection string is the only thing naming the physical
 * database. Without a path segment the driver silently falls back to `test`, so refuse it.
 */
function assertDatabaseInUri(mongoBaseAddress: string): void {
  const match = /^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/.exec(mongoBaseAddress);
  if (!match || !decodeURIComponent(match[1]).trim()) {
    throw new Error(
      '[modular-rest] mongo.singleDatabase requires the database name in the path of ' +
        'mongoBaseAddress, e.g. mongodb://host:27017/<database>?...'
    );
  }
}

/**
 * ModelRegistry - Singleton class for managing mongoose models and connections
 * Pre-creates all models before database connections are established
 */
class ModelRegistry {
  private static instance: ModelRegistry;
  private connections: Record<string, Connection> = {};
  private models: Record<string, Record<string, Model<any>>> = {};
  private collectionDefinitions: CollectionDefinition[] = [];
  private mongoOption: MongoOption | null = null;
  /** `singleDatabase` mode: the one connection every logical database resolves to. */
  private sharedConnection: Connection | null = null;
  /** `singleDatabase` mode: physical collection name -> `<database>.<collection>` owning it. */
  private physicalCollectionOwners: Record<string, string> = {};

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of ModelRegistry
   * @returns {ModelRegistry} The singleton instance
   */
  static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  /**
   * Register a collection definition and create its model
   * @param {CollectionDefinition} definition - The collection definition
   * @param {MongoOption} mongoOption - MongoDB connection options
   * @returns {Model<any>} The created mongoose model
   */
  registerCollection(definition: CollectionDefinition, mongoOption: MongoOption): Model<any> {
    // Store mongoOption if not already stored
    if (!this.mongoOption) {
      this.mongoOption = mongoOption;
    }

    const { database, collection, schema } = definition;

    // Check if this definition is already registered
    const isAlreadyRegistered = this.collectionDefinitions.some(
      def => def.database === database && def.collection === collection
    );

    // Store collection definition if not already registered
    if (!isAlreadyRegistered) {
      this.collectionDefinitions.push(definition);
    }

    // Initialize models object for this database if needed
    if (!this.models[database]) {
      this.models[database] = {};
    }

    // Check if model already exists
    if (this.models[database][collection]) {
      return this.models[database][collection];
    }

    // Get or create connection for this database
    const connection = this.getOrCreateConnection(database, mongoOption);

    // One shared connection means one model namespace: a collection name reused by another
    // logical database would otherwise surface as Mongoose's opaque OverwriteModelError.
    if (mongoOption.singleDatabase && connection.models[collection]) {
      const owner = Object.keys(this.models).find(db => this.models[db][collection]);
      throw new Error(
        `[modular-rest] mongo.singleDatabase: collection "${collection}" is defined in both ` +
          `"${owner}" and "${database}". All logical databases share one physical database ` +
          `in this mode, so collection names must be unique across them.`
      );
    }

    // Create model on the connection
    // Mongoose allows creating models before connection is established
    const model = connection.model(collection, schema);
    this.models[database][collection] = model;

    if (mongoOption.singleDatabase) {
      // Different model names can still pluralize to the same physical collection.
      const physicalName = model.collection.collectionName;
      const owner = this.physicalCollectionOwners[physicalName];
      if (owner && owner !== `${database}.${collection}`) {
        throw new Error(
          `[modular-rest] mongo.singleDatabase: "${database}.${collection}" and "${owner}" ` +
            `would both store documents in the physical collection "${physicalName}".`
        );
      }
      this.physicalCollectionOwners[physicalName] = `${database}.${collection}`;
    }

    return model;
  }

  /**
   * Get the connection serving a logical database, creating it on first use.
   *
   * By default each logical database gets its own connection bound to
   * `dbPrefix + database` through `dbName`. With `mongoOption.singleDatabase`, every
   * logical database resolves to ONE shared connection opened WITHOUT `dbName`, so the
   * physical database stays the one named in `mongoBaseAddress`.
   *
   * @param {string} database - Logical database name
   * @param {MongoOption} mongoOption - MongoDB connection options
   * @returns {Connection} The (possibly still connecting) mongoose connection
   */
  getOrCreateConnection(database: string, mongoOption: MongoOption): Connection {
    const existing = this.connections[database];
    if (existing) {
      return existing;
    }

    if (mongoOption.singleDatabase) {
      if (!this.sharedConnection) {
        assertDatabaseInUri(mongoOption.mongoBaseAddress);
        this.sharedConnection = mongoose.createConnection(
          mongoOption.mongoBaseAddress,
          baseConnectOptions
        );
      }
      this.connections[database] = this.sharedConnection;
    } else {
      // Create connection (but don't connect yet)
      this.connections[database] = mongoose.createConnection(mongoOption.mongoBaseAddress, {
        ...baseConnectOptions,
        dbName: (mongoOption.dbPrefix || '') + database,
      });
    }

    return this.connections[database];
  }

  /**
   * Get a model by database and collection name
   * @param {string} database - Database name
   * @param {string} collection - Collection name
   * @returns {Model<any> | null} The mongoose model or null if not found
   */
  getModel(database: string, collection: string): Model<any> | null {
    if (!this.models[database] || !this.models[database][collection]) {
      return null;
    }
    return this.models[database][collection];
  }

  /**
   * Get a connection for a database
   * @param {string} database - Database name
   * @returns {Connection | null} The mongoose connection or null if not found
   */
  getConnection(database: string): Connection | null {
    return this.connections[database] || null;
  }

  /**
   * Initialize all connections and connect to databases
   * This should be called during server startup
   * @param {MongoOption} mongoOption - MongoDB connection options
   * @returns {Promise<void>} A promise that resolves when all connections are established
   */
  async initializeConnections(mongoOption: MongoOption): Promise<void> {
    this.mongoOption = mongoOption;

    // Group collection definitions by database
    const dbGroups: Record<string, CollectionDefinition[]> = {};
    this.collectionDefinitions.forEach(definition => {
      if (!dbGroups[definition.database]) {
        dbGroups[definition.database] = [];
      }
      dbGroups[definition.database].push(definition);
    });

    // Connect to each database
    const connectionPromises = Object.entries(dbGroups).map(([dbName, definitions]) => {
      return new Promise<void>((done, reject) => {
        const connection = this.getOrCreateConnection(dbName, mongoOption);

        // Create models for this database if they don't exist
        definitions.forEach(def => {
          if (!this.hasModel(dbName, def.collection)) {
            this.registerCollection(def, mongoOption);
          }
        });

        if (connection.readyState === 1) {
          // Already connected
          done();
        } else {
          connection.once('connected', () => {
            console.info(`- ${dbName} database has been connected`);
            done();
          });
          connection.once('error', err => {
            reject(err);
          });
        }
      });
    });

    await Promise.all(connectionPromises);
  }

  /**
   * Get all registered collection definitions
   * @returns {CollectionDefinition[]} Array of collection definitions
   */
  getCollectionDefinitions(): CollectionDefinition[] {
    return [...this.collectionDefinitions];
  }

  /**
   * Get all models for a specific database
   * @param {string} database - Database name
   * @returns {Record<string, Model<any>> | null} Object mapping collection names to models, or null if database not found
   */
  getModelsForDatabase(database: string): Record<string, Model<any>> | null {
    return this.models[database] || null;
  }

  /**
   * Check if a model exists
   * @param {string} database - Database name
   * @param {string} collection - Collection name
   * @returns {boolean} True if model exists, false otherwise
   */
  hasModel(database: string, collection: string): boolean {
    return !!(this.models[database] && this.models[database][collection]);
  }

  /**
   * Clear all internal state, including connections and models.
   * Useful for testing when different database prefixes are used.
   */
  async clear(): Promise<void> {
    // Close all connections first (deduplicated: in singleDatabase mode they are one)
    await Promise.all(
      [...new Set(Object.values(this.connections))].map(async connection => {
        if (connection.readyState !== 0) {
          try {
            await connection.close();
          } catch (err) {
            // Ignore close errors
          }
        }
      })
    );

    this.connections = {};
    this.models = {};
    this.collectionDefinitions = [];
    this.mongoOption = null;
    this.sharedConnection = null;
    this.physicalCollectionOwners = {};
  }
}

// Export singleton instance
export const modelRegistry = ModelRegistry.getInstance();
export default modelRegistry;
