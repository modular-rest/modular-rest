import mongoose, { Connection, Model } from 'mongoose';
import { CollectionDefinition } from '../../class/collection_definition';
import { MongoOption } from './service';

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
    let connection = this.connections[database];
    if (!connection) {
      const fullDbName = (mongoOption.dbPrefix || '') + database;
      const connectionString = mongoOption.mongoBaseAddress;

      // Create connection (but don't connect yet)
      connection = mongoose.createConnection(connectionString, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        dbName: fullDbName,
      });

      this.connections[database] = connection;
    }

    // Create model on the connection
    // Mongoose allows creating models before connection is established
    const model = connection.model(collection, schema);
    this.models[database][collection] = model;

    return model;
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
    const connectionPromises = Object.entries(dbGroups).map(([dbName]) => {
      return new Promise<void>((done, reject) => {
        const connection = this.connections[dbName];
        if (!connection) {
          // If connection doesn't exist, create it
          const fullDbName = (mongoOption.dbPrefix || '') + dbName;
          const connectionString = mongoOption.mongoBaseAddress;

          const newConnection = mongoose.createConnection(connectionString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            dbName: fullDbName,
          });

          this.connections[dbName] = newConnection;

          // Create models for this database if they don't exist
          const definitions = dbGroups[dbName];
          definitions.forEach(def => {
            if (!this.models[dbName]) {
              this.models[dbName] = {};
            }
            if (!this.models[dbName][def.collection]) {
              this.models[dbName][def.collection] = newConnection.model(def.collection, def.schema);
            }
          });

          newConnection.on('connected', () => {
            console.info(`- ${fullDbName} database has been connected`);
            done();
          });

          newConnection.on('error', err => {
            reject(err);
          });
        } else {
          // Connection already exists, just wait for it to be ready
          if (connection.readyState === 1) {
            // Already connected
            done();
          } else {
            connection.once('connected', () => {
              done();
            });
            connection.once('error', err => {
              reject(err);
            });
          }
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
}

// Export singleton instance
export const modelRegistry = ModelRegistry.getInstance();
export default modelRegistry;
