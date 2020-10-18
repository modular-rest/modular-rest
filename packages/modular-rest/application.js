let koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
var path = require('path');
var Combination = require('./src/class/combinator');
let ContentProvider = require('./src/services/content_provider/service');
let DataInsertion = require('./src/helper/data_insertion');
let JWT = require('./src/services/jwt/service')

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
        dontListen,
        adminEmail,
        adminPass,
        privateKey,
        publicKey,
    } = {
            root: null,
            dbPrefix: 'mrest_',
            mongoBaseAddress: 'mongodb://localhost:27017',
            onBeforeInit: null,
            onAfterInit: null,
            port: 3000,
            dontListen: false,
            adminEmail: 'admin@email,com',
            adminPass: '@dmin',
        }) {

    let app = new koa();

    /**
     * Body Parser
     */
    let options = { multipart: true };
    app.use(koaBody(options));

    if (onBeforeInit) onBeforeInit(app);

    let defaultServiceRoot = __dirname + '/src/services';

    // Plug in default routes
    await Combination.combineRoutesByFilePath(
        path.join(defaultServiceRoot), app);

    // Plug in user routes
    if (root)
        await Combination.combineRoutesByFilePath(root, app);

    // Default databases
    let defaultDatabaseDetail = await Combination.combineModulesByFilePath({
        rootDirectory: defaultServiceRoot,
        filename: { name: 'db', extension: '.js' },
        combineWithRoot: true
    });

    let userDatabaseDetail = [];

    if (root) {
        userDatabaseDetail = await Combination.combineModulesByFilePath({
            rootDirectory: root,
            filename: { name: 'db', extension: '.js' },
            combineWithRoot: true
        });
    }

    await ContentProvider.addComponentCollectionByList({
        list: [...defaultDatabaseDetail, ...(userDatabaseDetail || [])],
        mongoOption: { dbPrefix, mongoBaseAddress }
    })

    /**
     * Data Insertion
     * 
     * Insert permissions and admin user 
     */
    await DataInsertion.createPermissions();
    await DataInsertion.createAdminUser({ adminEmail, adminPass })

    /**
     * Json web Token
     * 
     * Setup private and public keys for JWT module 
     */
    if (!privateKey || !publicKey) {
        let privateKeyPath = path.join(__dirname, 'sample_private_key.txt');
        let publicKeyPath = path.join(__dirname, 'sample_public_key.txt');
        privateKey = require('fs').readFileSync(privateKeyPath);
        publicKey = require('fs').readFileSync(publicKeyPath);
    }

    JWT.main.setKies(privateKey, publicKey);

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