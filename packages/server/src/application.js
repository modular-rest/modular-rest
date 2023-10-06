let koa = require("koa");
const cors = require("@koa/cors");
const koaBody = require("koa-body");
const koaStatic = require("koa-static-server");
var path = require("path");
var Combination = require("./class/combinator");
let DataProvider = require("./services/data_provider/service");
let UserService = require("./services/user_manager/service");

let defaultServiceRoot = __dirname + "/services";

// staticOptions = {
//     /**
//          * directory that is to be served
//          */
// rootDir?: string | undefined;
// /**
//  * optional rewrite path
//  */
// rootPath?: string | undefined;
// /**
//  * optional default file to serve if requested static is missing
//  */
// notFoundFile?: string | undefined;
// /**
//  * request access log to console
//  */
// log?: boolean | undefined;
// /**
//  * don't execute any downstream middleware. defaults to true
//  */
// last?: boolean | undefined;
// /**
//  * Browser cache max-age in milliseconds. defaults to 0
//  */
// maxage?: number | undefined;
// /**
//  * Allow transfer of hidden files. defaults to false
//  */
// hidden?: boolean | undefined;
// /**
//  * Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested
//  */
// gzip?: boolean | undefined;
// /**
//  * Try to serve the brotli version of a file automatically when brotli is supported by a client and in the requested
//  */
// brotli?: boolean | undefined;
// index?: string | undefined;
// }

/**
 * @param {{
 *   cors: any; // Options for @koa/cors middleware.
 *   modulesPath: string; // Root directory of your router.js/db.js files.
 *   static: {
 *      rootDir: string; // Root directory of your static files.
 *      rootPath: string; // Root path of your static files.
 *      notFoundFile: string; // Not found file.
 *      log: boolean; // Log requests to console.
 *      last: boolean; // Don't execute any downstream middleware.
 *      maxage: number; // Browser cache max-age in milliseconds.
 *      hidden: boolean; // Allow transfer of hidden files.
 *      gzip: boolean; // Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested
 *      brotli: boolean; // Try to serve the brotli version of a file automatically when brotli is supported by a client and in the requested
 *      index: string; // Index file.
 *   };
 *   onBeforeInit: (koaApp) => void; // A callback called before initializing the Koa server.
 *   onAfterInit: (koaApp) => void; // A callback called after server initialization.
 *   port: number; // Server port.
 *   dontListen: boolean; // If true, the server will not run and will only return the Koa app object.
 *   mongo: {
 *     dbPrefix: string; // A prefix for your database name.
 *     mongoBaseAddress: string; // The address of your MongoDB server without any database specification.
 *     addressMap: string; // Specific addresses for each database.
 *   };
 *   keypair: {
 *     private: string; // Private key for RSA authentication.
 *     public: string; // Public key for RSA authentication.
 *   };
 *   adminUser: {
 *     email: string; // Admin user email.
 *     password: string; // Admin user password.
 *   };
 *   verificationCodeGeneratorMethod: () => string; // A method to return a verification code when registering a new user.
 *   collectionDefinitions: CollectionDefinition[]; // An array of additional collection definitions.
 * }} options
 */
module.exports = async function createRest(options) {
  options = {
    port: 3000,
    dontListen: false,
    mongo: {
      atlas: false,
      mongoBaseAddress: "mongodb://localhost:27017",
      dbPrefix: "mrest_",
    },
    adminUser: {
      email: "admin@email.com",
      password: "@dmin",
    },

    ...options,
  };

  let app = new koa();

  /**
   * Plug in Cors
   */
  app.use(cors(options.cors || {}));

  /**
   * Plug in BodyParser
   */
  let bodyParserOptions = {
    multipart: true,
  };
  app.use(koaBody(bodyParserOptions));

  /**
   * Plug In KoaStatic
   */
  if (options.static) {
    app.use(koaStatic(options.static));
  }

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
  await Combination.combineRoutesByFilePath(path.join(defaultServiceRoot), app);

  // Collect default databaseDefinitions
  let defaultDatabaseDefinitionList =
    await Combination.combineModulesByFilePath({
      rootDirectory: defaultServiceRoot,
      filename: {
        name: "db",
        extension: ".js",
      },
      combineWithRoot: true,
    });

  // Plug in default databaseDefinitions
  await DataProvider.addCollectionDefinitionByList({
    list: defaultDatabaseDefinitionList,
    mongoOption: options.mongo,
  });

  // Setting up default services
  await require("./helper/presetup_services").setup(options);

  /**
   * User Services
   *
   * Plug in routes and database
   */
  if (options.modulesPath) {
    // Plug in user routes
    await Combination.combineRoutesByFilePath(options.modulesPath, app);

    // Collect user CollectionDefinitions (db.js files)
    let userDatabaseDetail = [];
    userDatabaseDetail = await Combination.combineModulesByFilePath({
      rootDirectory: options.modulesPath,
      filename: {
        name: "db",
        extension: ".js",
      },
      combineWithRoot: true,
    });

    // combine additional CollectionDefinitions
    if (options.collectionDefinitions) {
      userDatabaseDetail.concat(options.collectionDefinitions);
    }

    // Plug in user CollectionDefinitions
    await DataProvider.addCollectionDefinitionByList({
      list: userDatabaseDetail || [],
      mongoOption: options.mongo,
    });

    // Plug in Verification method
    if (typeof options.verificationCodeGeneratorMethod == "function") {
      UserService.main.setCustomVerificationCodeGeneratorMethod(
        options.verificationCodeGeneratorMethod
      );
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
      console.log(
        "\x1b[35m",
        `KOAS has been launched on: localhost:${options.port}`
      );
    }

    // on after init
    if (options.onAfterInit) options.onAfterInit(app);

    //done
    done({
      app,
      server,
    });
  });
};
