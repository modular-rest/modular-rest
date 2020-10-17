let name = 'contentProvider';
var colog = require('colog');
let { operationTypes, AccessDefinition } = require('../../class/security_definition');

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
 * Connect to mongodb by mongoose 
 * and creates databases if they doesn't exists.
 */
function prepareToConnect() {
    for (let i = 0; i < list_dbs.length; i++) {
        const dbmodule = list_dbs[i];
        let prefix = global.config.db_prefix;
        let name = dbmodule.name;

        let databaseDetail = require(dbmodule['path']);

        // connecting to database
        let connectionString = global.config.mongo + `/${prefix + name}`;
        let connection = Mongoose.createConnection(connectionString, { useUnifiedTopology: true, useNewUrlParser: true, });
        connection.on('connected', () => colog.info(`- ${prefix + name} database has been connected`));

        // get models
        collections[name] = databaseDetail.getModels(connection);

        // store connection
        connections[name] = connection;

        // get Access Definitions
        AccessDefinitions[name] = databaseDetail.accessDefinitions;
    }
}

// function connectByConnectionString({connectionString='', models={}}) {
//     return new Promise((done, reject) => {
//         let connection = Mongoose.createConnection(connectionString, { useUnifiedTopology: true, useNewUrlParser: true, });
//         connection.on('connected', done);
//     }) 
// }

/**
 * 
 * @param {string} dbName database name
 * @param {array} ComponentCollectionList an array of ComponentCollection instance
 * @param {object} mongoOption
 * @param {string} mongoOption.dbPrefix
 * @param {string} mongoOption.mongoBaseAddress
 */
function connectToDatabaseByComponentCollectionList(dbName, ComponentCollectionList = [], mongoOption) {

    return new Promise((done, reject) => {
        // create db connection
        let connectionString = mongoOption.mongoBaseAddress + `/${mongoOption.dbPrefix + name}`;
        let connection = Mongoose.createConnection(connectionString, { useUnifiedTopology: true, useNewUrlParser: true, });
        // store connection
        connections[dbName] = connection;

        // add db models from schemas
        ComponentCollectionList.forEach(componentCollection => {

            // create model from schema
            // and store in on global collection object
            collections[dbName] = connection.model(
                componentCollection.collection,
                componentCollection.schema)

            // define Access Definition from component permissions
            // and store it on global access definition object
            AccessDefinitions[dbName] = new AccessDefinition({
                database: dbName,
                collection: componentCollection.collection,
                permissionList: componentCollection.permissions
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
 * @param {array} option.list an array of ComponentCollection instance
 * @param {object} option.mongoOption
 * @param {string} option.mongoOption.dbPrefix
 * @param {string} option.mongoOption.mongoBaseAddress
 */
async function addComponentCollectionByList({ list, mongoOption }) {
    let clusteredByDBName = {};

    // cluster list by their database name.
    list.forEach(componentCollection => {
        let database = componentCollection.database;
        if (!clusteredByDBName[database]) clusteredByDBName[database] = [];
        clusteredByDBName[database].push(componentCollection);
    })

    // connect to databases
    for (const dbName in clusteredByDBName) {
        if (clusteredByDBName.hasOwnProperty(dbName)) {
            const componentCollectionList = clusteredByDBName[dbName];
            await connectToDatabaseByComponentCollectionList(dbName, componentCollectionList, mongoOption);
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
    name, addComponentCollectionByList, getCollection,
    checkAccess, getAsID,
    triggers,
    TypeCasters,
}

