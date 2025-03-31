import Koa from 'koa';
import cors from '@koa/cors';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import mount from 'koa-mount';
import path from 'path';
import { Server } from 'http';
import Combination from './class/combinator';
import * as DataProvider from './services/data_provider/service';
import { MongoOption } from './services/data_provider/service';
import * as UserService from './services/user_manager/service';
import { CollectionDefinition } from './class/collection_definition';
import { PermissionGroup } from './class/security';
import { CmsTrigger } from './class/cms_trigger';
import { DefinedFunction } from './services/functions/service';
import { config, setConfig } from './config';
import { permissionGroups as defaultPermissionGroups } from './defult-permissions';

const defaultServiceRoot = __dirname + '/services';

/**
 * Options for configuring static file serving
 * @interface StaticPathOptions
 * @property {string} rootDir - The root directory to serve static files from
 * @property {string} [rootPath] - The URL path to serve static files from
 * @property {number} [maxage] - Cache control max-age in milliseconds
 * @property {boolean} [hidden] - Allow transfer of hidden files
 * @property {string} [index] - Default file name, defaults to 'index.html'
 * @property {boolean} [defer] - If true, serves after return next()
 * @property {boolean} [gzip] - Try to serve the gzipped version of a file
 * @property {boolean} [br] - Try to serve the brotli version of a file
 * @property {Function} [setHeaders] - Set custom headers on response
 * @property {string[]} [extensions] - Try to match extensions from passed array to search for file
 */
interface StaticPathOptions {
  rootDir: string;
  rootPath?: string;
  maxage?: number;
  hidden?: boolean;
  index?: string;
  defer?: boolean;
  gzip?: boolean;
  br?: boolean;
  setHeaders?: (res: any, path: string, stats: any) => void;
  extensions?: false | string[];
}

/**
 * MongoDB connection options
 * @interface MongoOptions
 * @property {string} dbPrefix - Prefix for database names
 * @property {string} mongoBaseAddress - MongoDB connection URL
 * @property {string} [addressMap] - Optional address mapping configuration
 */
interface MongoOptions {
  dbPrefix: string;
  mongoBaseAddress: string;
  addressMap?: string;
}

/**
 * Admin user configuration
 * @interface AdminUser
 * @property {string} email - Admin user email
 * @property {string} password - Admin user password
 */
interface AdminUser {
  email: string;
  password: string;
}

/**
 * Configuration options for creating a REST API instance
 * @interface RestOptions
 * @property {cors.Options} [cors] - CORS configuration options
 * @property {string} [modulesPath] - Path to custom modules directory
 * @property {string} [uploadDirectory] - Directory for file uploads
 * @property {any} [koaBodyOptions] - Options for koa-body middleware
 * @property {StaticPathOptions} [staticPath] - Static file serving options
 * @property {Function} [onBeforeInit] - Hook called before initialization
 * @property {Function} [onAfterInit] - Hook called after initialization
 * @property {number} [port] - Port to listen on
 * @property {boolean} [dontListen] - Don't start the server
 * @property {MongoOptions} [mongo] - MongoDB connection options
 * @property {Object} [keypair] - JWT keypair for authentication
 * @property {AdminUser} [adminUser] - Admin user configuration
 * @property {Function} [verificationCodeGeneratorMethod] - Custom verification code generator
 * @property {CollectionDefinition[]} [collectionDefinitions] - Custom collection definitions
 * @property {PermissionGroup[]} [permissionGroups] - Custom permission groups
 * @property {CmsTrigger[]} [authTriggers] - Authentication triggers
 * @property {CmsTrigger[]} [fileTriggers] - File handling triggers
 * @property {DefinedFunction[]} [functions] - Custom API functions
 */
interface RestOptions {
  cors?: cors.Options;
  modulesPath?: string;
  uploadDirectory?: string;
  koaBodyOptions?: any;
  staticPath?: StaticPathOptions;
  onBeforeInit?: (koaApp: Koa) => void;
  onAfterInit?: (koaApp: Koa) => void;
  port?: number;
  dontListen?: boolean;
  mongo?: MongoOptions;
  keypair?: {
    private: string;
    public: string;
  };
  adminUser?: AdminUser;
  verificationCodeGeneratorMethod?: () => string;
  collectionDefinitions?: CollectionDefinition[];
  permissionGroups?: PermissionGroup[];
  authTriggers?: CmsTrigger[];
  fileTriggers?: CmsTrigger[];
  functions?: DefinedFunction[];
}

/**
 * Create a modular REST instance with Koa and MongoDB support.
 */
export async function createRest(options: RestOptions): Promise<{ app: Koa; server?: Server }> {
  setConfig({
    port: 3000,
    dontListen: false,
    mongo: {
      mongoBaseAddress: 'mongodb://localhost:27017',
      dbPrefix: 'mrest_',
    },
    adminUser: {
      email: 'admin@email.com',
      password: '@dmin',
    },
    ...options,
  });

  if (config.permissionGroups === undefined) {
    config.permissionGroups = defaultPermissionGroups;
  }

  const app = new Koa();

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
    const defaultStaticPath = config.staticPath.rootDir || '';
    const defaultStaticRootPath = config.staticPath.rootPath || '/assets';

    const staticOptions = { ...config.staticPath };
    // @ts-ignore
    delete staticOptions.rootDir;
    delete staticOptions.rootPath;

    app.use(mount(defaultStaticRootPath, koaStatic(defaultStaticPath, staticOptions)));
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
  const defaultDatabaseDefinitionList = await Combination.combineModulesByFilePath({
    rootDirectory: defaultServiceRoot,
    filename: {
      name: 'db',
      extension: '.js',
    },
    combineWithRoot: true,
  });

  // 2. Plug in default databaseDefinitions
  await DataProvider.addCollectionDefinitionByList({
    list: defaultDatabaseDefinitionList,
    mongoOption: config.mongo as MongoOption,
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
    let userDatabaseDetail: any[] = [];
    userDatabaseDetail = await Combination.combineModulesByFilePath({
      rootDirectory: config.modulesPath,
      filename: {
        name: 'db',
        extension: '.js',
      },
      combineWithRoot: true,
    });

    // Combine additional CollectionDefinitions
    if (config.collectionDefinitions) {
      userDatabaseDetail = userDatabaseDetail.concat(config.collectionDefinitions);
    }

    // Plug in user CollectionDefinitions
    await DataProvider.addCollectionDefinitionByList({
      list: userDatabaseDetail || [],
      mongoOption: config.mongo as MongoOption,
    });

    // Plug in Verification method
    if (typeof config.verificationCodeGeneratorMethod === 'function') {
      UserService.main.setCustomVerificationCodeGeneratorMethod(
        config.verificationCodeGeneratorMethod
      );
    }

    // 4. plug in modular functions
    await Combination.combineFunctionsByFilePath({
      rootDirectory: config.modulesPath,
      filename: {
        name: 'functions',
        extension: '.js',
      },
    });

    // 5. Plug in additional defined functions
    if (config.functions) {
      Combination.addFunctionsByArray(config.functions);
    }
  }

  // 4. Setting up default services
  try {
    await require('./helper/presetup_services').setup(options);
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
      let server: Server | undefined;

      if (!config.dontListen) {
        server = app.listen(config.port);

        console.log('\x1b[35m', `KOAS has been launched on: localhost:${config.port}`);
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
