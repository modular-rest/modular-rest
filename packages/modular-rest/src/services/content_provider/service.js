let name = 'contentProvider';
var colog = require('colog');
let { operationTypes, AccessDefinition } = require('../../class/security');

const Mongoose = require('mongoose');
Mongoose.set('useCreateIndex', true);

let list_dbs = [
    { name: 'cms', path: './database/cms.js' },
    { name: 'user', path: './database/user.js' },
];

let connections = {};
let collections = {};
let AccessDefinitions = {};

let triggers = require('./triggers');
let TypeCasters = require('./typeCasters');

/**
 * 
 * @param {string} dbName database name
 * @param {array} CollectionDefinitionList an array of CollectionDefinition instance
 * @param {object} mongoOption
 * @param {string} mongoOption.dbPrefix
 * @param {string} mongoOption.mongoBaseAddress
 */
function connectToDatabaseByCollectionDefinitionList(dbName, CollectionDefinitionList = [], mongoOption) {

    return new Promise((done, reject) => {
        // create db connection
        let connectionString = mongoOption.mongoBaseAddress + `/${mongoOption.dbPrefix + dbName}`;
        let connection = Mongoose.createConnection(connectionString, { useUnifiedTopology: true, useNewUrlParser: true, });
        // store connection
        connections[dbName] = connection;

        // add db models from schemas
        CollectionDefinitionList.forEach(collectionDefinition => {

            let collection = collectionDefinition.collection;
            let schema = collectionDefinition.schema;

            if (collections[dbName] == undefined)
                collections[dbName] = {};

            // create model from schema
            // and store in on global collection object
            collections[dbName][collection] = connection.model(collection, schema);

            // define Access Definition from component permissions
            // and store it on global access definition object
            AccessDefinitions[dbName] = new AccessDefinition({
                database: dbName,
                collection: collectionDefinition.collection,
                permissionList: collectionDefinition.permissions
            });

        })

        connection.on('connected', () => {
            colog.success(`- ${mongoOption.dbPrefix + dbName} database has been connected`)
            done()
        });
    })
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
    list.forEach(collectionDefinition => {
        let database = collectionDefinition.database;
        if (!clusteredByDBName[database]) clusteredByDBName[database] = [];
        clusteredByDBName[database].push(collectionDefinition);
    })

    // connect to databases
    for (const dbName in clusteredByDBName) {
        if (clusteredByDBName.hasOwnProperty(dbName)) {
            const collectionDefinitionList = clusteredByDBName[dbName];
            await connectToDatabaseByCollectionDefinitionList(dbName, collectionDefinitionList, mongoOption);
        }
    }
}

function getCollection(db, collection) {
    let fountCollection;
    // let prefix = global.config.db_prefix;
    // let dbNameWithPrefix = prefix + db;

    if (collections.hasOwnProperty(db)) {
        if (collections[db].hasOwnProperty(collection))
            fountCollection = collections[db][collection];
    }

    return fountCollection;
}

function _getPermissionAccessList(db, collection, operationType) {
    let permissionAccessList = [];
    let AD;

    if (!AccessDefinitions.hasOwnProperty(db))
        return permissionAccessList;

    AccessDefinitions[db].forEach(accessDefinitions => {
        if (accessDefinitions.collection == collection)
            AD = accessDefinitions;
    })

    if (AD) {
        AD.permissionAccessList.forEach(permissionAccess => {
            if (permissionAccess.onlyOwnData == true) {
                permissionAccessList.push(permissionAccess);
            }

            else if (operationType == operationTypes.read &&
                permissionAccess.read == true) {
                permissionAccessList.push(permissionAccess);
            }

            else if (operationType == operationTypes.write &&
                permissionAccess.write == true) {
                permissionAccessList.push(permissionAccess);
            }
        });
    }

    return permissionAccessList;
}

function checkAccess(db, collection, operationType, queryOrDoc, user) {
    let key = false;
    let permissionAccessList = _getPermissionAccessList(db, collection, operationType);

    permissionAccessList.forEach(permissionAccess => {
        let permissionField = permissionAccess.name;

        if (permissionAccess.onlyOwnData) {
            let refId = queryOrDoc.refId;
            let userId = user.id;

            try {
                if (refId.toString() == userId.toString())
                    key = true;
            } catch (error) {
                key = false;
            }
        }

        else if (operationType == operationTypes.read) {
            if (permissionAccess.read &&
                user.permission[permissionField] == true)
                key = true;
        }

        else if (operationType == operationTypes.write) {

            if (permissionAccess.write &&
                user.permission[permissionField] == true)
                key = true;
        }
    });

    return key;
}

function getAsID(strId) {
    let id;
    try {
        id = Mongoose.Types.ObjectId(strId);
    } catch (e) {
        console.log('strId did not cast objectId', e);
    }

    return id;
}

// connectToAllDatabases();

module.exports = {
    name, addCollectionDefinitionByList, getCollection,
    checkAccess, getAsID,
    triggers,
    TypeCasters,
}

