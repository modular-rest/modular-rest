let name = "dataProvider";
const colog = require("colog");
let { AccessTypes, AccessDefinition } = require("../../class/security");

const Mongoose = require("mongoose");
Mongoose.set("useCreateIndex", true);

let connections = {};
let collections = {};
let permissionDefinitions = {};

let triggers = require("../../class/trigger_operator");
let TypeCasters = require("./typeCasters");
const { config } = require("../../config");

/**
 *
 * @param {string} dbName database name
 * @param {array} CollectionDefinitionList an array of CollectionDefinition instance
 * @param {object} mongoOption
 * @param {string} mongoOption.dbPrefix
 * @param {string} mongoOption.mongoBaseAddress
 */
function connectToDatabaseByCollectionDefinitionList(
  dbName,
  collectionDefinitionList = [],
  mongoOption
) {
  return new Promise((done, reject) => {
    // Create db connection
    //
    const fullDbName = (mongoOption.dbPrefix || "") + dbName;
    const connectionString = mongoOption.mongoBaseAddress + "/" + fullDbName;

    colog.info(`- Connecting to database ${connectionString}`);

    let connection = Mongoose.createConnection(connectionString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    // Store connection
    connections[dbName] = connection;

    // add db models from schemas
    collectionDefinitionList.forEach((collectionDefinition) => {
      let collection = collectionDefinition.collection;
      let schema = collectionDefinition.schema;

      if (collections[dbName] == undefined) collections[dbName] = {};

      if (permissionDefinitions[dbName] == undefined)
        permissionDefinitions[dbName] = {};

      // create model from schema
      // and store in on global collection object
      let model = connection.model(collection, schema);
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
          throw "Triggers must be an array";
        }

        collectionDefinition.triggers.forEach((trigger) => {
          trigger.database = collectionDefinition.database;
          trigger.collection = collectionDefinition.collection;
          triggers.addTrigger(trigger);
        });
      }
    });

    connection.on("connected", () => {
      colog.success(`- ${fullDbName} database has been connected`);
      done();
    });
  });
}

/**
 *
 * @param {object} option
 * @param {array} option.list an array of CollectionDefinition instance
 * @param {object} option.mongoOption
 * @param {string} option.mongoOption.dbPrefix
 * @param {string} option.mongoOption.mongoBaseAddress
 */
async function addCollectionDefinitionByList({ list, mongoOption }) {
  let clusteredByDBName = {};

  // cluster list by their database name.
  list.forEach((collectionDefinition) => {
    let database = collectionDefinition.database;
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
 * @param {string} db - The database name.
 * @param {string} collection - The collection name.
 * @returns {import('mongoose').Model} The found collection.
 */
function getCollection(db, collection) {
  let fountCollection;

  if (collections.hasOwnProperty(db)) {
    if (collections[db].hasOwnProperty(collection))
      fountCollection = collections[db][collection];
  }

  return fountCollection;
}

function _getPermissionList(db, collection, operationType) {
  let permissionList = [];
  let permissionDefinition;

  if (!permissionDefinitions.hasOwnProperty(db)) return permissionList;

  try {
    permissionDefinition = permissionDefinitions[db][collection];
  } catch (error) {
    return permissionList;
  }

  permissionDefinition.permissionList.forEach((permission) => {
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
 * @param {string} db - The database name.
 * @param {string} collection - The collection name.
 * @param {string} operationType - The operation type.
 * @param {object} queryOrDoc - The query or document.
 * @param {import('../../class/user')} user - The user.
 * @returns {boolean} The access result.
 */
function checkAccess(db, collection, operationType, queryOrDoc, user) {
  let key = false;

  const collectionPermissionList = _getPermissionList(
    db,
    collection,
    operationType
  );

  collectionPermissionList.forEach((permission) => {
    const collectionPermissionType = permission.type;

    if (permission.onlyOwnData == true) {
      const userId = user.id;

      try {
        key =
          queryOrDoc[permission.ownerIdField].toString() === userId.toString();
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

function getAsID(strId) {
  let id;
  try {
    id = Mongoose.Types.ObjectId(strId);
  } catch (e) {
    console.log("strId did not cast objectId", e);
  }

  return id;
}

function performPopulateToQueryObject(queryObj, popArr = []) {
  /*
      https://mongoosejs.com/docs/populate.html
      popArr must be contains this objects
      { 
        path: 'fans',
        select: 'name -_id',
      }
    */
  popArr.forEach((pop) => queryObj.populate(pop));
  return queryObj;
}

function performAdditionalOptionsToQueryObject(queryObj, options) {
  /**
   * https://mongoosejs.com/docs/api/query.html#query_Query-sort
   *
   * Options must be contain a method name and an argument of above methods.
   * {
   *  sort: '-_id',
   *  limit: 10,
   * }
   */
  Object.keys(options).forEach((method) => {
    queryObj = queryObj[method](options[method]);
  });

  return queryObj;
}

module.exports = {
  name,
  getCollection,
  addCollectionDefinitionByList,
  checkAccess,
  getAsID,
  performPopulateToQueryObject,
  performAdditionalOptionsToQueryObject,
  triggers,
  TypeCasters,
};
