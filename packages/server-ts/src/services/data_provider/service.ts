import mongoose, { Connection, Model, PopulateOptions, Query } from 'mongoose';
import { AccessTypes, AccessDefinition, Permission } from '../../class/security';

import TypeCasters from './typeCasters';
import { config } from '../../config';
import { CollectionDefinition } from '../../class/collection_definition';
import { User } from '../../class/user';
import modelRegistry from './model_registry';

/**
 * Service name constant
 * @constant {string}
 */
export const name = 'dataProvider';

// Database connections and collections storage
const connections: Record<string, Connection> = {};
const collections: Record<string, Record<string, Model<any>>> = {};
const permissionDefinitions: Record<string, Record<string, AccessDefinition>> = {};

/**
 * MongoDB connection options
 * @interface MongoOption
 * @property {string} [dbPrefix] - Prefix for database names
 * @property {string} mongoBaseAddress - MongoDB connection URL
 * @property {boolean} [singleDatabase] - One physical database for all logical ones (see RestOptions.mongo)
 */
export interface MongoOption {
  dbPrefix?: string;
  mongoBaseAddress: string;
  singleDatabase?: boolean;
}

/**
 * Database name for connection logs: the physical name, or the logical one when every
 * logical database shares the single physical database.
 */
function databaseLabel(dbName: string, mongoOption: MongoOption): string {
  return mongoOption.singleDatabase
    ? `${dbName} (single database)`
    : (mongoOption.dbPrefix || '') + dbName;
}

/**
 * Collection definition options
 * @interface CollectionDefinitionOption
 * @property {CollectionDefinition[]} list - List of collection definitions
 * @property {MongoOption} mongoOption - MongoDB connection options
 */
interface CollectionDefinitionListOption {
  list: CollectionDefinition[];
  mongoOption: MongoOption;
}

/**
 * Connects to a database and sets up collections based on collection definitions
 * @function connectToDatabaseByCollectionDefinitionList
 * @param {string} dbName - Name of the database to connect to
 * @param {CollectionDefinition[]} [collectionDefinitionList=[]] - List of collection definitions
 * @param {MongoOption} mongoOption - MongoDB connection options
 * @returns {Promise<void>} A promise that resolves when the connection is established
 * @throws {Error} If triggers are not properly configured
 * @private
 */
async function connectToDatabaseByCollectionDefinitionList(
  dbName: string,
  collectionDefinitionList: CollectionDefinition[] = [],
  mongoOption: MongoOption
): Promise<void> {
  const fullDbName = databaseLabel(dbName, mongoOption);

  // Check if connection already exists in registry
  let connection = modelRegistry.getConnection(dbName);

  // Create db connection if it doesn't exist
  if (!connection) {
    console.info(`- Connecting to database: ${fullDbName}`);
    connection = modelRegistry.getOrCreateConnection(dbName, mongoOption);
  } else {
    console.info(`- Using existing connection for database: ${fullDbName}`);
  }

  // Store connection
  connections[dbName] = connection;

  // add db models from schemas
  collectionDefinitionList.forEach(collectionDefinition => {
    const collection = collectionDefinition.collection;

    if (collections[dbName] == undefined) collections[dbName] = {};

    if (permissionDefinitions[dbName] == undefined) permissionDefinitions[dbName] = {};

    // Check if model already exists in registry (pre-created)
    let model = modelRegistry.getModel(dbName, collection);

    if (!model) {
      // Model doesn't exist in registry, create it on the connection
      // This can happen if defineCollection was called without mongoOption
      model = modelRegistry.registerCollection(collectionDefinition, mongoOption);
    } else {
      // Model exists in registry, verify it's using the same connection
      // Mongoose models are bound to their connection, so we should use the registry model
      // But we need to ensure the connection matches
      const registryConnection = modelRegistry.getConnection(dbName);
      if (registryConnection && registryConnection !== connection) {
        // Connections don't match, but this shouldn't happen in normal flow
        // Use the model from registry as it's already created
        model = modelRegistry.getModel(dbName, collection)!;
      }
    }

    // Store model in global collections object
    collections[dbName][collection] = model;

    // Also update the CollectionDefinition with the model if it has a setModel method
    if (collectionDefinition.setModel) {
      collectionDefinition.setModel(model);
    }

    // define Access Definition from component permissions
    // and store it on global access definition object
    permissionDefinitions[dbName][collection] = new AccessDefinition({
      database: dbName,
      collection: collection,
      permissionList: collectionDefinition.permissions,
    });


  });

  // Resolves at once if already connected. Unlike listening for 'error', it also rejects
  // when the initial connection failed before this point: Mongoose 8 only emits 'error'
  // to listeners that exist at failure time, which would leave startup waiting forever.
  await connection.asPromise();
  console.info(`- ${fullDbName} database has been connected`);
}

/**
 * Adds collection definitions and connects to their respective databases
 * @function addCollectionDefinitionByList
 * @param {CollectionDefinitionListOption} options - Collection definition options
 * @returns {Promise<void>} A promise that resolves when all collections are set up
 * @example
 * ```typescript
 * await addCollectionDefinitionByList({
 *   list: [
 *     new CollectionDefinition({
 *       database: 'myapp',
 *       collection: 'users',
 *       schema: userSchema,
 *       permissions: [new Permission({ type: 'user_access', read: true })]
 *     })
 *   ],
 *   mongoOption: {
 *     mongoBaseAddress: 'mongodb://localhost:27017',
 *     dbPrefix: 'myapp_'
 *   }
 * });
 * ```
 */
export async function addCollectionDefinitionByList({
  list,
  mongoOption,
}: CollectionDefinitionListOption): Promise<void> {
  // First, ensure all collections are registered in the ModelRegistry
  // This pre-creates models before connections are established
  list.forEach(collectionDefinition => {
    // Check if model already exists in registry
    if (!modelRegistry.hasModel(collectionDefinition.database, collectionDefinition.collection)) {
      // Register the collection and create its model
      modelRegistry.registerCollection(collectionDefinition, mongoOption);
    }
  });

  // Group collection definitions by database
  const dbGroups: Record<string, CollectionDefinition[]> = {};
  list.forEach(collectionDefinition => {
    if (!dbGroups[collectionDefinition.database]) {
      dbGroups[collectionDefinition.database] = [];
    }
    dbGroups[collectionDefinition.database].push(collectionDefinition);
  });

  // Connect to each database
  // Models are already pre-created, so connections will use existing models
  const connectionPromises = Object.entries(dbGroups).map(([dbName, collectionDefinitionList]) =>
    connectToDatabaseByCollectionDefinitionList(dbName, collectionDefinitionList, mongoOption)
  );

  await Promise.all(connectionPromises);
}

/**
 * Gets a Mongoose model for a specific collection
 * @function getCollection
 * @param {string} db - Database name
 * @param {string} collection - Collection name
 * @returns {Model<T>} Mongoose model for the collection
 * @throws {Error} If the collection doesn't exist
 * @example
 * ```typescript
 * const userModel = getCollection('myapp', 'users');
 * const users = await userModel.find();
 * ```
 */
export function getCollection<T>(db: string, collection: string): Model<T> {
  if (!collections[db] || !collections[db][collection]) {
    throw new Error(`Collection ${collection} not found in database ${db}`);
  }
  return collections[db][collection];
}

/**
 * Gets the permission list for a specific operation on a collection
 * @function _getPermissionList
 * @param {string} db - Database name
 * @param {string} collection - Collection name
 * @param {string} operationType - Type of operation (read/write)
 * @returns {any[]} List of permissions
 * @private
 */
function _getPermissionList(db: string, collection: string, operationType: string): Permission[] {
  if (!permissionDefinitions[db] || !permissionDefinitions[db][collection]) {
    return [];
  }
  return permissionDefinitions[db][collection].permissionList;
}

/**
 * What a user may reach in a collection for one kind of operation.
 * @interface AccessGrant
 * @property {string} [ownerIdField] - Set when the user may only reach documents whose
 * `ownerIdField` holds their own id (an `onlyOwnData` permission); absent for full access
 * @property {string} [ownerId] - The user's id, to match against `ownerIdField`
 */
export interface AccessGrant {
  ownerIdField?: string;
  ownerId?: string;
}

/**
 * Whether a permission applies to a user, before its read/write flags are considered.
 * @private
 */
function _permissionAppliesTo(permission: Permission, user: User): boolean {
  // A god_access permission opens the collection to every caller.
  if (permission.accessType === 'god_access') return true;
  if (permission.accessType === 'anonymous_access' && user.type === 'anonymous') return true;
  if (permission.accessType === 'user_access' && user.type === 'user') return true;
  return typeof (user as any).hasPermission === 'function' && user.hasPermission(permission.accessType);
}

/**
 * Works out what a user may reach in a collection for a read or a write.
 *
 * A permission grants an operation when it applies to the user and allows that operation
 * (`read` / `write`). A permission with `onlyOwnData` grants it on the user's own documents
 * only: those whose `ownerIdField` holds the user's id. When several permissions grant the
 * operation, the widest wins: any one without `onlyOwnData` gives full access.
 *
 * `god_access` permissions keep their historical meaning and grant every operation to
 * every caller, whatever their read/write flags.
 *
 * @function resolveAccess
 * @param {string} db - Database name
 * @param {string} collection - Collection name
 * @param {string} operationType - Type of operation (read/write)
 * @param {User} user - User performing the operation
 * @returns {AccessGrant | null} What the user may reach, or null when access is denied
 * @example
 * ```typescript
 * const grant = resolveAccess('myapp', 'posts', AccessTypes.read, currentUser);
 * if (grant?.ownerIdField) query[grant.ownerIdField] = grant.ownerId;
 * ```
 */
export function resolveAccess(
  db: string,
  collection: string,
  operationType: string,
  user: User
): AccessGrant | null {
  const permissionList = _getPermissionList(db, collection, operationType);
  const granting = permissionList.filter(permission => {
    if (!_permissionAppliesTo(permission, user)) return false;
    if (permission.accessType === 'god_access') return true;
    if (operationType === AccessTypes.read) return permission.read;
    if (operationType === AccessTypes.write) return permission.write;
    return false;
  });

  if (granting.length === 0) return null;

  const ownOnly = granting.filter(permission => permission.onlyOwnData && permission.accessType !== 'god_access');
  if (ownOnly.length < granting.length) return {};

  return { ownerIdField: ownOnly[0].ownerIdField || 'refId', ownerId: String(user.id) };
}

/**
 * Checks if a user has access to perform an operation on a collection.
 *
 * True when {@link resolveAccess} grants the operation, which includes access limited to the
 * user's own documents. Callers that act on documents must apply that limit themselves;
 * use resolveAccess to get it.
 *
 * @function checkAccess
 * @param {string} db - Database name
 * @param {string} collection - Collection name
 * @param {string} operationType - Type of operation (read/write)
 * @param {Record<string, any>} queryOrDoc - Query or document being accessed (unused)
 * @param {User} user - User performing the operation
 * @returns {boolean} Whether the user has access
 * @example
 * ```typescript
 * const hasAccess = checkAccess('myapp', 'users', 'read', {}, currentUser);
 * if (hasAccess) {
 *   const users = await getCollection('myapp', 'users').find();
 * }
 * ```
 */
export function checkAccess(
  db: string,
  collection: string,
  operationType: string,
  queryOrDoc: Record<string, any>,
  user: User
): boolean {
  return resolveAccess(db, collection, operationType, user) !== null;
}

/**
 * Finds the database and collection a registered model belongs to.
 * @function findCollectionOfModel
 * @param {Model<any>} model - A model returned by getCollection
 * @returns {{ database: string; collection: string } | undefined} Its names, if registered
 */
export function findCollectionOfModel(model: unknown): { database: string; collection: string } | undefined {
  for (const [database, models] of Object.entries(collections)) {
    for (const [collection, registered] of Object.entries(models)) {
      if (registered === model) return { database, collection };
    }
  }
  return undefined;
}

/**
 * Converts a string ID to a MongoDB ObjectId
 * @function getAsID
 * @param {string} strId - String ID to convert
 * @returns {mongoose.Types.ObjectId | undefined} MongoDB ObjectId or undefined if invalid
 * @example
 * ```typescript
 * const id = getAsID('507f1f77bcf86cd799439011');
 * if (id) {
 *   const doc = await collection.findById(id);
 * }
 * ```
 */
export function getAsID(strId: string): mongoose.Types.ObjectId | undefined {
  try {
    return new mongoose.Types.ObjectId(strId);
  } catch (e) {
    return undefined;
  }
}

/**
 * Applies populate options to a Mongoose query
 * @function performPopulateToQueryObject
 * @param {Query<T, any>} queryObj - Mongoose query object
 * @param {PopulateOptions[]} [popArr=[]] - Array of populate options
 * @returns {Query<T, any>} Query with populate options applied
 * @example
 * ```typescript
 * const query = collection.find();
 * const populatedQuery = performPopulateToQueryObject(query, [
 *   { path: 'author', select: 'name email' }
 * ]);
 * ```
 */
export function performPopulateToQueryObject<T = any>(
  queryObj: Query<T, any>,
  popArr: PopulateOptions[] = []
): Query<T, any> {
  popArr.forEach(pop => {
    queryObj.populate(pop);
  });
  return queryObj;
}

/**
 * Applies additional options to a Mongoose query.
 *
 * Each key is called as a query method, so only the keys in {@link QUERY_OPTION_KEYS} are
 * accepted: methods like `setQuery`, `merge` or `deleteMany` would replace the filter or
 * turn a read into a write.
 * @function performAdditionalOptionsToQueryObject
 * @param {Query<T, any>} queryObj - Mongoose query object
 * @param {Record<string, any>} options - Additional query options
 * @returns {Query<T, any>} Query with additional options applied
 * @example
 * ```typescript
 * const query = collection.find();
 * const queryWithOptions = performAdditionalOptionsToQueryObject(query, {
 *   sort: { createdAt: -1 },
 *   limit: 10
 * });
 * ```
 */
export function performAdditionalOptionsToQueryObject<T = any>(
  queryObj: Query<T, any>,
  options: Record<string, any>
): Query<T, any> {
  assertQueryOptions(options);
  Object.entries(options).forEach(([key, value]) => {
    // @ts-ignore
    queryObj[key](value);
  });
  return queryObj;
}

/**
 * Query options a client may send with find and find-one. Each is a Mongoose query method
 * that only shapes or pages the result.
 * @constant {string[]}
 */
export const QUERY_OPTION_KEYS = [
  'sort',
  'limit',
  'skip',
  'select',
  'lean',
  'collation',
  'hint',
  'maxTimeMS',
  'comment',
  'batchSize',
  'allowDiskUse',
];

/**
 * Throws when `options` holds a key outside {@link QUERY_OPTION_KEYS}.
 * @function assertQueryOptions
 * @param {unknown} options - The options a client sent
 * @throws {Error} With `status` 403 for a key that isn't allowed, 412 for a non-object
 */
export function assertQueryOptions(options: unknown): void {
  if (options === undefined || options === null) return;
  if (typeof options !== 'object' || Array.isArray(options)) {
    throw Object.assign(new Error('options must be an object'), { status: 412 });
  }
  const refused = Object.keys(options).filter(key => !QUERY_OPTION_KEYS.includes(key));
  if (refused.length > 0) {
    throw Object.assign(new Error(`options not allowed: ${refused.join(', ')}`), { status: 403 });
  }
}

// Instead, export TypeCasters
export { TypeCasters };
