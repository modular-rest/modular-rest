let koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const koaStatic = require('koa-static-server');
var path = require('path');
var Combination = require('./class/combinator');
let DataProvider = require('./services/data_provider/service');
let UserService = require('./services/user_manager/service')

let defaultServiceRoot = __dirname + '/services';

/**
 * @param {object} options
 * @param {object} options.cors Options for koa-cors middleware
 * @param {string} options.componentDirectory Root directory of your router.js/db.js files.
 * @param {string} options.uploadDirectory Root directory for uploaded files.
 * @param {function} options.onBeforeInit A callback called before initializing the Koa server.
 * @param {function} options.onAfterInit A callback called after server initialization.
 * @param {number} options.port Server port.
 * @param {boolean} options.dontListen If true, the server will not run and will only return the Koa app object.
 * @param {string} options.mongo MongoDB options.
 * @param {string} options.mongo.dbPrefix A prefix for your database name.
 * @param {string} options.mongo.mongoBaseAddress The address of your MongoDB server without any database specification.
 * @param {string} options.mongo.addressMap Specific addresses for each database.
 * @param {object} options.keypair RSA keypair for the authentication module.
 * @param {string} options.keypair.private Private key.
 * @param {string} options.keypair.public Public key.
 * @param {object} options.adminUser Super admin user to be created as the first user of the system.
 * @param {string} options.adminUser.email Admin user email.
 * @param {string} options.adminUser.password Admin user password.
 * @param {function} options.verificationCodeGeneratorMethod A method to return a verification code when someone wants to register a new user.
 * @param {array} options.CollectionDefinitions An array of additional collection definitions.
 * @returns {Promise<{app: Koa, server: http.Server}>} Returns a promise that resolves to an object containing the Koa app object and the server object.
 */
module.exports = async function createRest(options) {

    options = {
        port: 3000,
        dontListen: false,
        mongo: {
            atlas: false,
            mongoBaseAddress: 'mongodb://localhost:27017',
            dbPrefix: 'mrest_',
        },
        adminUser: {
            email: 'admin@email.com',
            password: '@dmin',
        },

        ...options,
    }

    let app = new koa();

    /**
     * Plug in Cors
     */
    app.use(cors(options.cors || {}));

    /**
     * Plug in BodyParser
     */
    let bodyParserOptions = {
        multipart: true
    };
    app.use(koaBody(bodyParserOptions));

    /**
     * Plug In KoaStatic
     */
    if (options.uploadDirectory)
        app.use(koaStatic({
            rootDir: options.uploadDirectory,
            rootPath: '/assets/',

        }));

    /**
     * Run before hook
     */
    if (options.onBeforeInit) options.onBeforeInit(app);

    /**
     * Setup default services
     * 
     * - Collect and plug in router.js/db.js of default services
     * - Setting up default services 
     */

    // Plug in default routes
    await Combination.combineRoutesByFilePath(
        path.join(defaultServiceRoot), app);

    // Collect default databaseDefinitions
    let defaultDatabaseDefinitionList = await Combination.combineModulesByFilePath({
        rootDirectory: defaultServiceRoot,
        filename: {
            name: 'db',
            extension: '.js'
        },
        combineWithRoot: true
    });

    // Plug in default databaseDefinitions
    await DataProvider.addCollectionDefinitionByList({
        list: defaultDatabaseDefinitionList,
        mongoOption: options.mongo
    })

    // Setting up default services
    await require('./helper/presetup_services').setup(options);

    /**
     * User Services
     * 
     * Plug in routes and database
     */
    if (options.componentDirectory) {

        // Plug in user routes
        await Combination.combineRoutesByFilePath(options.componentDirectory, app);

        // Collect user CollectionDefinitions (db.js files)
        let userDatabaseDetail = [];
        userDatabaseDetail = await Combination.combineModulesByFilePath({
            rootDirectory: options.componentDirectory,
            filename: {
                name: 'db',
                extension: '.js'
            },
            combineWithRoot: true
        });

        // combine additional CollectionDefinitions
        if (options.CollectionDefinitions) {
            userDatabaseDetail.concat(options.CollectionDefinitions)
        }

        // Plug in user CollectionDefinitions
        await DataProvider.addCollectionDefinitionByList({
            list: userDatabaseDetail || [],
            mongoOption: options.mongo
        })

        // Plug in Verification method
        if (typeof options.verificationCodeGeneratorMethod == 'function') {
            UserService.main.setCustomVerificationCodeGeneratorMethod(
                options.verificationCodeGeneratorMethod
            )
        }
    }

    /**
     * Run the server
     * 
     * return KOA app object 
     */
    return new Promise((done, reject) => {

        let server;

        if (!options.dontListen) {
            server = app.listen(options.port);
            console.log('\x1b[35m', `KOAS has been launched on: localhost:${options.port}`);
        }


        // on after init
        if (options.onAfterInit) options.onAfterInit(app);

        //done
        done({
            app,
            server
        });
    });
}