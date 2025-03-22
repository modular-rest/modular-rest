const koa = require("koa");
const cors = require("@koa/cors");
const koaBody = require("koa-body");
const koaStatic = require("koa-static");
const mount = require("koa-mount");
const path = require("path");
const Combination = require("./class/combinator");
const DataProvider = require("./services/data_provider/service");
const UserService = require("./services/user_manager/service");

const defaultServiceRoot = __dirname + "/services";

/**
 * @typedef {import('koa')} Koa
 * @typedef {import('http').Server} server
 * @typedef {import('@koa/cors').Options} Cors
 * @typedef {import('./class/security.js').PermissionGroup} PermissionGroup
 * @typedef {import('./class/cms_trigger.js')} CmsTrigger
 */

const {
  config,
  setConfig
} = require("./config");

/**
 * Create a modular REST instance with Koa and MongoDB support.
 * @param {{
 *   cors?: Cors; // CORS options.
 *   modulesPath?: string; // Root directory of your router.js/db.js files.
 *   uploadDirectory?: string; // Root directory of your uploaded files.
 *   koaBodyOptions?: object; // Options for koa-body.
 *    staticPath?: {
 *        rootDir: string; // Root directory of your static files.
 *        rootPath: string; // Root path of your static files, defaults to '/assets'.
 *        maxage?: number; // Browser cache max-age in milliseconds. Defaults to 0.
 *        hidden?: boolean; // Allow transfer of hidden files. Defaults to false.
 *        index?: string; // Default file name. Defaults to 'index.html'.
 *        defer?: boolean; // If true, serves after return next(), allowing any downstream middleware to respond first. Defaults to false.
 *        gzip?: boolean; // Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested file with .gz extension exists. Defaults to true.
 *        br?: boolean; // Try to serve the brotli version of a file automatically when brotli is supported by a client and if the requested file with .br extension exists. Note that brotli is only accepted over https. Defaults to false.
 *        setHeaders?: Function; // Function to set custom headers on response.
 *        extensions?: boolean|Array; // Try to match extensions from passed array to search for file when no extension is suffixed in URL. First found is served. Defaults to false.
 *    };
 *   onBeforeInit?: (koaApp:Koa) => void; // A callback called before initializing the Koa server.
 *   onAfterInit?: (koaApp:Koa) => void; // A callback called after server initialization.
 *   port?: number; // Server port.
 *   dontListen?: boolean; // If true, the server will not run and will only return the Koa app object.
 *   mongo?: {
 *     dbPrefix: string; // A prefix for your database name.
 *     mongoBaseAddress: string; // The address of your MongoDB server without any database specification.
 *     addressMap?: string; // Specific addresses for each database.
 *   };
 *   keypair?: {
 *     private: string; // Private key for RSA authentication.
 *     public: string; // Public key for RSA authentication.
 *   };
 *   adminUser?: {
 *     email: string; // Admin user email.
 *     password: string; // Admin user password.
 *   };
 *   verificationCodeGeneratorMethod: () => string; // A method to return a verification code when registering a new user.
 *   collectionDefinitions?: CollectionDefinition[]; // An array of additional collection definitions.
 *   permissionGroups?: PermissionGroup[]; // An array of additional permission groups.
 *   authTriggers?: CmsTrigger[]; // An array of additional database triggers for the auth collection.
 *   fileTriggers?: CmsTrigger[]; // An array of additional database triggers for the auth collection.
 * }} options
 * @returns {Promise<{app: Koa, server: Server}>}
 */
async function createRest(options) {
  setConfig({
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
  });

  const app = new koa();

  /**
   * Plug in Cors
   */
  app.use(cors(config.cors || {}));

  /**
   * Plug in BodyParser
   */
  const bodyParserOptions = {
    multipart: true,
    ...(config.koaBodyOptions || {}),
  };
  app.use(koaBody(bodyParserOptions));

  /**
   * Plug In KoaStatic
   */
  if (config.staticPath) {
    const defaultStaticPath = config.staticPath.rootDir;
    const defaultStaticRootPath = config.staticPath.rootPath || "/assets";

    delete config.staticPath.rootDir;
    delete config.staticPath.rootPath;

    app.use(
      mount(
        defaultStaticRootPath,
        koaStatic(defaultStaticPath, config.staticPath)
      )
    );
  }

  /**
   * Run before hook
   */
  if (config.onBeforeInit) config.onBeforeInit(app);

  /**
   * Setup default services
   *
   * - Collect and plug in router.js/db.js of default services
   * - Setting up default services
   */

  // 1. Plug in default routes
  await Combination.combineRoutesByFilePath(path.join(defaultServiceRoot), app);

  // Collect default databaseDefinitions
  const defaultDatabaseDefinitionList =
    await Combination.combineModulesByFilePath({
      rootDirectory: defaultServiceRoot,
      filename: {
        name: "db",
        extension: ".js",
      },
      combineWithRoot: true,
    });

  // 2. Plug in default databaseDefinitions
  await DataProvider.addCollectionDefinitionByList({
    list: defaultDatabaseDefinitionList,
    mongoOption: config.mongo,
  });

  /**
   * User Services
   *
   * 3. Plug in routes and database
   */
  if (config.modulesPath) {
    // Plug in user routes
    await Combination.combineRoutesByFilePath(config.modulesPath, app);

    // Collect user CollectionDefinitions (db.js files)
    let userDatabaseDetail = [];
    userDatabaseDetail = await Combination.combineModulesByFilePath({
      rootDirectory: config.modulesPath,
      filename: {
        name: "db",
        extension: ".js",
      },
      combineWithRoot: true,
    });

    // Combine additional CollectionDefinitions
    if (config.collectionDefinitions) {
      userDatabaseDetail.concat(config.collectionDefinitions);
    }

    // Plug in user CollectionDefinitions
    await DataProvider.addCollectionDefinitionByList({
      list: userDatabaseDetail || [],
      mongoOption: config.mongo,
    });

    // Plug in Verification method
    if (typeof config.verificationCodeGeneratorMethod == "function") {
      UserService.main.setCustomVerificationCodeGeneratorMethod(
        config.verificationCodeGeneratorMethod
      );
    }

    // 4. plug in modular functions
    await Combination.combineFunctionsByFilePath({
      rootDirectory: config.modulesPath,
      filename: {
        name: "functions",
        extension: ".js",
      },
    });
  }

  // 4. Setting up default services
  try {
    await require("./helper/presetup_services").setup(options);
  } catch (e) {
    return Promise.reject(e);
  }

  /**
   * Run the server
   *
   * return KOA app object
   */
  return new Promise((done, reject) => {
    try {
      let server;

      if (!config.dontListen) {
        server = app.listen(config.port);

        console.log(
          "\x1b[35m",
          `KOAS has been launched on: localhost:${config.port}`
        );
      }

      // on after init
      if (config.onAfterInit) config.onAfterInit(app);

      done({
        app,
        server,
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = createRest;