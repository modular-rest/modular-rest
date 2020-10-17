let koa = require('koa');
var router = require('koa-router');
var path = require('path');
var combination = require('./src/class/combinator');
let dataBaseService = require('./src/services/content_provider/service');

/**
 * 
 * @param {object} option
 * @param {string} option.root root directory of your router.js/db.js files.
 * @param {string} option.dbPrefix a prefix for your database name.
 * @param {string} option.mongoBaseAddress the address of your mongo server without any database specification on it.
 * @param {function} option.onBeforeInit a callback being called before init koa server.
 * @param {function} option.onAfterInit a callback being called after server initialization.
 * @param {number} option.port server port
 * @param {boolean} option.dontListen server will not being run if it was true and just return koa app object.
 */
async function createRest(
    {
        root,
        dbPrefix,
        mongoBaseAddress,
        onBeforeInit,
        onAfterInit,
        port,
        plugins,
        dontListen,
    } = {
            root: null,
            dbPrefix: 'mrest_',
            mongoBaseAddress: 'mongodb://localhost:27017',
            onBeforeInit: null,
            onAfterInit: null,
            port: 3000,
            plugins: [],
            dontListen: false,
        }) {

    let app = new koa();

    if (onBeforeInit) onBeforeInit(app);

    // combine plugins
    if (plugins != null || !isNaN(plugins.length)) {

    }

    let defaultServiceRoot = __dirname + '/src/services';

    // Plug in default routes
    await combination.combineRoutesByFilePath(
        path.join(defaultServiceRoot), app);

    // Plug in user routes
    if (root)
        await combination.combineRoutesByFilePath(root, app);

    // Default databases
    let defaultDatabaseDetail = await combination.combineModulesByFilePath({
        rootDirectory: defaultServiceRoot,
        filename: { name: 'db', extension: '.js' },
        combineWithRoot: true
    });

    let userDatabaseDetail = [];

    if (root) {
        userDatabaseDetail = await combination.combineModulesByFilePath({
            rootDirectory: root,
            filename: { name: 'db', extension: '.js' },
            combineWithRoot: true
        });
    }

    dataBaseService.addComponentCollectionByList({
        list: [...defaultDatabaseDetail, ...(userDatabaseDetail || [])],
        mongoOption: { dbPrefix, mongoBaseAddress }
    })


    // combine routes
    if (root) await combination.combineRoutesByFilePath(option.root, app);

    return new Promise((done, reject) => {

        if (!dontListen) {
            app.listen(port);
            console.log('\x1b[35m', `KOAS has been launched on: localhost:${port}`);
        }


        // on after init
        if (onAfterInit) onAfterInit(app);

        //done
        done(app);
    });
}

module.exports = createRest;