import mongoose, { Connection, Model, PopulateOptions, Query } from 'mongoose';
import { AccessTypes, AccessDefinition } from '../../class/security';
import triggerOperator from '../../class/trigger_operator';
import TypeCasters from './typeCasters';
import { config } from '../../config';
import { CollectionDefinition } from '../../class/collection_definition';
import { User } from '../../class/user';

export const name = 'dataProvider';

// Set mongoose options
mongoose.set('useCreateIndex', true);

// Database connections and collections storage
const connections: Record<string, Connection> = {};
const collections: Record<string, Record<string, Model<any>>> = {};
const permissionDefinitions: Record<string, Record<string, AccessDefinition>> = {};

export interface MongoOption {
  dbPrefix?: string;
  mongoBaseAddress: string;
}

interface CollectionDefinitionOption {
  list: CollectionDefinition[];
  mongoOption: MongoOption;
}

/**
 * Connect to database using collection definitions
 */
function connectToDatabaseByCollectionDefinitionList(
  dbName: string,
  collectionDefinitionList: CollectionDefinition[] = [],
  mongoOption: MongoOption
): Promise<void> {
  return new Promise((done, reject) => {
    // Create db connection
    const fullDbName = (mongoOption.dbPrefix || '') + dbName;
    const connectionString = mongoOption.mongoBaseAddress;

    console.info(`- Connecting to database: ${fullDbName}`);

    const connection = mongoose.createConnection(connectionString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      dbName: fullDbName,
    });

    // Store connection
    connections[dbName] = connection;

    // add db models from schemas
    collectionDefinitionList.forEach(collectionDefinition => {
      const collection = collectionDefinition.collection;
      const schema = collectionDefinition.schema;

      if (collections[dbName] == undefined) collections[dbName] = {};

      if (permissionDefinitions[dbName] == undefined) permissionDefinitions[dbName] = {};

      // create model from schema
      // and store in on global collection object
      const model = connection.model(collection, schema);
      collections[dbName][collection] = model;

      // define Access Definition from component permissions
      // and store it on global access definition object
      permissionDefinitions[dbName][collection] = new AccessDefinition({
        database: dbName,
        collection: collection,
        permissionList: collectionDefinition.permissions,
      });

      // add trigger
      if (collectionDefinition.triggers != undefined) {
        if (!Array.isArray(collectionDefinition.triggers)) {
          throw new Error('Triggers must be an array');
        }

        collectionDefinition.triggers.forEach(trigger => {
          triggerOperator.addTrigger({
            ...trigger,
            database: collectionDefinition.database,
            collection: collectionDefinition.collection,
          });
        });
      }
    });

    connection.on('connected', () => {
      console.info(`- ${fullDbName} database has been connected`);
      done();
    });
  });
}

/**
 * Add collection definitions by list
 */
export async function addCollectionDefinitionByList({
  list,
  mongoOption,
}: CollectionDefinitionOption): Promise<void> {
  const clusteredByDBName: Record<string, CollectionDefinition[]> = {};

  // cluster list by their database name.
  list.forEach(collectionDefinition => {
    const database = collectionDefinition.database;
    if (!clusteredByDBName[database]) clusteredByDBName[database] = [];
    clusteredByDBName[database].push(collectionDefinition);
  });

  // connect to databases
  for (const dbName in clusteredByDBName) {
    if (clusteredByDBName.hasOwnProperty(dbName)) {
      const collectionDefinitionList = clusteredByDBName[dbName];
      await connectToDatabaseByCollectionDefinitionList(
        dbName,
        collectionDefinitionList,
        mongoOption
      );
    }
  }
}

/**
 * Get a collection from a database.
 */
export function getCollection<T>(db: string, collection: string): Model<T> {
  let foundCollection;

  if (collections.hasOwnProperty(db)) {
    if (collections[db].hasOwnProperty(collection)) foundCollection = collections[db][collection];
  }

  return foundCollection as Model<T>;
}

/**
 * Get permission list for a collection
 */
function _getPermissionList(db: string, collection: string, operationType: string): any[] {
  const permissionList: any[] = [];
  let permissionDefinition;

  if (!permissionDefinitions.hasOwnProperty(db)) return permissionList;

  try {
    permissionDefinition = permissionDefinitions[db][collection];
  } catch (error) {
    return permissionList;
  }

  permissionDefinition.permissionList.forEach(permission => {
    if (permission.onlyOwnData == true) {
      permissionList.push(permission);
    } else if (operationType == AccessTypes.read && permission.read == true) {
      permissionList.push(permission);
    } else if (operationType == AccessTypes.write && permission.write == true) {
      permissionList.push(permission);
    }
  });

  return permissionList;
}

/**
 * Check access to a collection.
 */
export function checkAccess(
  db: string,
  collection: string,
  operationType: string,
  queryOrDoc: Record<string, any>,
  user: User
): boolean {
  let key = false;

  const collectionPermissionList = _getPermissionList(db, collection, operationType);

  collectionPermissionList.forEach(permission => {
    const collectionPermissionType = permission.type;

    if (permission.onlyOwnData == true) {
      const userId = user.id;

      try {
        key = queryOrDoc[permission.ownerIdField].toString() === userId.toString();
      } catch (error) {
        key = false;
      }
    } else if (operationType == AccessTypes.read && permission.read) {
      key = user.hasPermission(collectionPermissionType);
    } else if (operationType == AccessTypes.write && permission.write) {
      key = user.hasPermission(collectionPermissionType);
    }
  });

  return key;
}

/**
 * Convert string ID to MongoDB ObjectId
 */
export function getAsID(strId: string): mongoose.Types.ObjectId | undefined {
  let id;
  try {
    id = mongoose.Types.ObjectId(strId);
  } catch (e) {
    console.log('strId did not cast objectId', e);
  }

  return id;
}

/**
 * Perform populate operation on query object
 */
export function performPopulateToQueryObject<T = any>(
  queryObj: Query<T, any>,
  popArr: PopulateOptions[] = []
): Query<T, any> {
  /*
      https://mongoosejs.com/docs/populate.html
      popArr must be contains this objects
      { 
        path: 'fans',
        select: 'name -_id',
      }
    */
  popArr.forEach(pop => queryObj.populate(pop));
  return queryObj;
}

/**
 * Apply additional options to query object
 */
export function performAdditionalOptionsToQueryObject<T = any>(
  queryObj: Query<T, any>,
  options: Record<string, any>
): Query<T, any> {
  /**
   * https://mongoosejs.com/docs/api/query.html#query_Query-sort
   *
   * Options must be contain a method name and an argument of above methods.
   * {
   *  sort: '-_id',
   *  limit: 10,
   * }
   */
  Object.keys(options).forEach(method => {
    // @ts-ignore: Dynamically calling methods on queryObj
    queryObj = queryObj[method](options[method]);
  });

  return queryObj;
}

export { TypeCasters };
