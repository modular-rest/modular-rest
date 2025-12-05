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
import { config, setConfig, RestOptions, StaticPathOptions } from './config';
import { permissionGroups as defaultPermissionGroups } from './defult-permissions';

const defaultServiceRoot = __dirname + '/services';

/**
 * Create a modular REST instance with Koa and MongoDB support.
 *
 * @param {RestOptions} options - Options for the REST instance
 * @expandType RestOptions
 *
 * @returns {Promise<{ app: Koa; server?: Server }>} - A promise that resolves to the Koa app and server
 *
 * @example
 * import { createRest } from '@modular-rest/server';
 *
 * const app = createRest({
 *   port: '80',
 *   mongo: {
 *     mongoBaseAddress: 'mongodb://localhost:27017',
 *     dbPrefix: 'mrest_'
 *   },
 *   onBeforeInit: (koaApp) => {
 *     // do something before init with the koa app
 *   }
 * })
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
  // Collect static paths from new property or fallback to old property
  let staticPathsToMount: StaticPathOptions[] = [];

  if (config.staticPaths && config.staticPaths.length > 0) {
    // Use new staticPaths property
    staticPathsToMount = config.staticPaths;
  } else if (config.staticPath) {
    // Backward compatibility: use old staticPath property with deprecation warning
    console.warn(
      '\x1b[33m%s\x1b[0m',
      "Warning: 'staticPath' is deprecated and will be removed in a future version. Please use 'staticPaths' (array) instead."
    );
    staticPathsToMount = Array.isArray(config.staticPath) ? config.staticPath : [config.staticPath];
  }

  // Mount all static paths
  for (const staticPathConfig of staticPathsToMount) {
    const directory = staticPathConfig.directory || '';
    const urlPath = staticPathConfig.urlPath || '/assets';

    const staticOptions: Partial<StaticPathOptions> = { ...staticPathConfig, defer: true };

    delete staticOptions.directory;
    delete staticOptions.urlPath;

    app.use(mount(urlPath, koaStatic(directory, staticOptions)));
  }

  // Auto-mount uploadDirectoryConfig if staticPaths (new property) is configured
  if (config.staticPaths && config.staticPaths.length > 0 && config.uploadDirectoryConfig) {
    const uploadDirectory = config.uploadDirectoryConfig.directory || '';
    const uploadUrlPath = config.uploadDirectoryConfig.urlPath || '/assets';

    const uploadStaticOptions: Partial<StaticPathOptions> = {
      ...config.uploadDirectoryConfig,
      defer: true,
    };

    delete uploadStaticOptions.directory;
    delete uploadStaticOptions.urlPath;

    app.use(mount(uploadUrlPath, koaStatic(uploadDirectory, uploadStaticOptions)));
  }

  // Show deprecation warning for old uploadDirectory property
  if (config.uploadDirectory) {
    console.warn(
      '\x1b[33m%s\x1b[0m',
      "Warning: 'uploadDirectory' is deprecated and will be removed in a future version. Please use 'uploadDirectoryConfig' (StaticPathOptions) instead."
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
