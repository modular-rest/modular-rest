

# package.json

```json
{
  "name": "@modular-rest/server",
  "version": "1.11.5",
  "description": "a nodejs module based on KOAJS for developing Rest-APIs in a modular solution.",
  "main": "src/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "generate:types": "tsc"
  },
  "types": "./types/index.d.ts",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/navidshad/modular-rest.git"
  },
  "keywords": [
    "app",
    "rest",
    "api",
    "koa"
  ],
  "author": "Navid Shad <navidshad72@gmail.com> (http://navid-shad.ir)",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/navidshad/modular-rest/issues"
  },
  "homepage": "https://github.com/navidshad/modular-rest#readme",
  "dependencies": {
    "@koa/cors": "^3.1.0",
    "colog": "^1.0.4",
    "file-system": "^2.2.2",
    "jsonwebtoken": "^8.5.1",
    "keypair": "^1.0.4",
    "koa": "^2.5.3",
    "koa-body": "^4.2.0",
    "koa-mount": "^4.0.0",
    "koa-router": "^7.4.0",
    "koa-static": "^5.0.0",
    "mongoose": "^5.10.9",
    "nested-property": "^4.0.0"
  },
  "devDependencies": {
    "@types/bson": "4.2.0",
    "@types/koa": "^2.14.0",
    "@types/koa__cors": "^5.0.0",
    "typescript": "^5.3.3"
  }
}

```



# src/events.js

```javascript
const eventCallbacks = [];
/**
 * onBeforeInit: (koaApp:Koa) => void; // A callback called before initializing the Koa server.
 * onAfterInit: (koaApp:Koa) => void; // A callback called after server initialization.
 * onNewUser:
 */

function registerEventCallback(event, callback) {
  if (typeof event !== "string") throw new Error("Event must be a string");

  if (typeof callback !== "function")
    throw new Error("Callback must be a function");

  eventCallbacks.push({ event, callback });
}

```



# src/index.js

```javascript
// Application
const createRest = require("./application");
const Schema = require("mongoose").Schema;

// Utilities
const paginator = require("./class/paginator");
const reply = require("./class/reply");
const validator = require("./class/validator");
const { getCollection } = require("./services/data_provider/service");
const { defineFunction } = require("./services/functions/service");
const TypeCasters = require("./services/data_provider/typeCasters");
const userManager = require("./services/user_manager/service");
const {
  getFile,
  getFileLink,
  getFilePath,
  removeFile,
  storeFile,
} = require("./services/file/service");

// Base class
const CollectionDefinition = require("./class/collection_definition");
const Schemas = require("./class/db_schemas");
const DatabaseTrigger = require("./class/database_trigger");
const CmsTrigger = require("./class/cms_trigger");
const SecurityClass = require("./class/security");
const middleware = require("./middlewares");

module.exports = {
  createRest,

  // Database
  CollectionDefinition,
  Schemas,
  Schema,
  DatabaseTrigger,
  CmsTrigger,
  ...SecurityClass,

  // Function
  defineFunction,

  // Private utilities
  TypeCasters,
  validator,

  // Route utilities
  reply,
  paginator,

  // Database utilities
  getCollection,

  // File Utilities
  getFile,
  getFileLink,
  getFilePath,
  removeFile,
  storeFile,

  // Middleware utilities
  middleware,

  // User utilities
  userManager: userManager.main,
};

```



# src/config.js

```javascript
/**
 * @typedef {import('koa')} Koa
 * @typedef {import('@koa/cors').Options} Cors
 * @typedef {import('./class/collection_definition.js')} CollectionDefinition
 * @typedef {import('./class/security.js').PermissionGroup} PermissionGroup
 * @typedef {import('./class/cms_trigger.js')} CmsTrigger
 */

/**
 * @typedef {{
 *   cors?: Cors; // CORS options.
 *   modulesPath?: string; // Root directory of your router.js/db.js files.
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
 *   authTriggers?: DatabaseTrigger[]; // An array of additional database triggers for the auth collection.
 *   fileTriggers?: CmsTrigger[]; // An array of additional database triggers for the auth collection.
 * }} Config
 * @exports Config
 */

/**
 * @type {Config}
 */
const config = {};

/**
 * @param {Config} options
 */
function setConfig(options) {
  Object.assign(config, options);
}

module.exports = {
  setConfig,
  config,
};

```



# src/middlewares.js

```javascript
/**
 * Validator module
 * @module class/validator
 */
let validateObject = require("./class/validator");

/**
 * User manager service
 * @module services/user_manager/service
 */
const userManager = require("./services/user_manager/service");

/**
 * Authentication middleware
 * It checks if incoming request has a valid token in header.authorization
 *
 * @param {Object} ctx - Koa context
 * @param {Function} next - Koa next function
 * @returns {Promise<void>}
 */
async function auth(ctx, next) {
  let headers = ctx.header;
  let headersValidated = validateObject(headers, "authorization");

  if (!headersValidated.isValid) ctx.throw(401, "authentication is required");

  let token = headers.authorization;

  await userManager.main
    .getUserByToken(token)
    .then(async (user) => {
      ctx.state.user = user;
      await next();
    })
    .catch((err) => {
      console.log(err);
      ctx.throw(err.status || 412, err.message);
    });
}

module.exports = {
  auth,
};

```



# src/application.js

```javascript
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

const { config, setConfig } = require("./config");

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

  // 3. Setting up default services
  try {
    await require("./helper/presetup_services").setup(options);
  } catch (e) {
    return Promise.reject(e);
  }

  /**
   * User Services
   *
   * Plug in routes and database
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

```



# src/class/security.js

```javascript
/**
 * Class representing an access definition.
 */
class AccessDefinition {
  /**
   * Create an access definition.
   * @param {Object} options - The options for the access definition.
   * @param {string} options.database - The name of the database.
   * @param {string} options.collection - The name of the collection.
   * @param {Array.<Permission>} options.permissionList - The list of permissions.
   */
  constructor({ database, collection, permissionList }) {
    this.database = database;
    this.collection = collection;
    this.permissionList = permissionList;
  }
}

/**
 * @typedef {('user_access'|'upload_file_access'|'remove_file_access'|'anonymous_access'|'advanced_settings')} PermissionType
 */

/**
 * Class representing a permission.
 */
class Permission {
  /**
   * Create a permission.
   * @param {Object} options - The options for the permission.
   * @param {PermissionType} options.type - The type of the permission.
   * @param {boolean} [options.read=false] - The read access of the permission.
   * @param {boolean} [options.write=false] - The write access of the permission.
   * @param {boolean} [options.onlyOwnData=false] - If true, users can perform CRUD on documents that they created already.
   * @param {string} [options.ownerIdField='refId'] - The name of the field that contains the owner's id of the document.
   */
  constructor({
    type,
    read = false,
    write = false,
    onlyOwnData = false,
    ownerIdField = "refId",
  }) {
    this.type = type;
    this.read = read;
    this.write = write;
    this.onlyOwnData = onlyOwnData;
    this.ownerIdField = ownerIdField;
  }
}

/**
 * Class representing different types of permissions.
 * Each static getter returns a string that represents a specific type of permission.
 */
class PermissionTypes {
  /**
   * Get the string representing god access permission type.
   * @return {string} The god access permission type.
   */
  static get god_access() {
    return "god_access";
  }

  /**
   * Get the string representing advanced settings permission type.
   * @return {string} The advanced settings permission type.
   */
  static get advanced_settings() {
    return "advanced_settings";
  }

  /**
   * Get the string representing user access permission type.
   * @return {string} The user access permission type.
   */
  static get user_access() {
    return "user_access";
  }

  /**
   * Get the string representing upload file access permission type.
   * @return {string} The upload file access permission type.
   */
  static get upload_file_access() {
    return "upload_file_access";
  }

  /**
   * Get the string representing remove file access permission type.
   * @return {string} The remove file access permission type.
   */
  static get remove_file_access() {
    return "remove_file_access";
  }
}

class PermissionGroup {
  /**
   * Create a permission group.
   * @param {Object} options - The options for the permission group.
   * @param {string} options.title - The title of the permission group.
   * @param {boolean} [options.isDefault=false] - If true, the permission group is the default permission group.
   * @param {boolean} [options.isAnonymous=false] - If true, the permission group is the anonymous permission group.
   * @param {Array.<PermissionType>} [options.validPermissionTypes=[]] - The valid permission types of the permission group.
   * @return {PermissionGroup} The created permission group.
   */
  constructor({
    title,
    isDefault = false,
    isAnonymous = false,
    validPermissionTypes = [],
  }) {
    //
    this.title = title;

    this.isDefault = isDefault;
    this.isAnonymous = isAnonymous;

    this.validPermissionTypes = validPermissionTypes;
  }
}

/**
 * Class representing access types.
 */
class AccessTypes {
  static get read() {
    return "read";
  }
  static get write() {
    return "write";
  }
}

module.exports = {
  AccessDefinition,
  Permission,
  PermissionTypes,
  PermissionGroup,
  AccessTypes,
};

```



# src/class/database_trigger.js

```javascript
/**
 * `DatabaseTrigger` is a class that defines a callback to be called on a specific database transaction.
 *
 * @class
 */
class DatabaseTrigger {
  /**
   * Creates a new instance of `DatabaseTrigger`.
   *
   * @param {'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate'} operation - The operation to be triggered. Supported operations are: 'find', 'find-one', 'count', 'update-one', 'insert-one', 'remove-one', 'aggregate'.
   * @param {function({query: any, queryResult: any}): void} [callback=(context) => {}] - The callback to be called when the operation is executed. The callback function takes an object as parameter with two properties: 'query' and 'queryResult'.
   * @constructor
   */
  constructor(operation, callback = (context) => {}) {
    this.operation = operation;
    this.callback = callback;
  }
}

module.exports = DatabaseTrigger;

```



# src/class/cms_trigger.js

```javascript
/**
 * `CmsTrigger` is a class that defines a callback to be called on a specific database transaction.
 *
 * @class
 */
class CmsTrigger {
  /**
   * Creates a new instance of `CmsTrigger`.
   *
   * @param {'update-one' | 'insert-one' | 'remove-one' } operation - The operation to be triggered.
   * @param {function({query: any, queryResult: any}): void} [callback=(context) => {}] - The callback to be called when the operation is executed. The callback function takes an object as parameter with two properties: 'query' and 'queryResult'.
   * @constructor
   */
  constructor(operation, callback = (context) => {}) {
    this.operation = operation;
    this.callback = callback;
  }
}

module.exports = CmsTrigger;

```



# src/class/db_schemas.js

```javascript
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = {
  file: new Schema(
    {
      originalName: String,
      fileName: String,
      owner: String,
      format: String,
      // Tag being used as the parent dir for files
      // uploadDir/$format/$tag/timestamp.format
      tag: String,
      size: Number,
    },
    { timestamps: true }
  ),
};

```



# src/class/user.js

```javascript
const { config } = require("../config");
let validateObject = require("./validator");

module.exports = class User {
  constructor(id, permissionGroup, phone, email, password, type, model) {
    this.id = id;
    this.permissionGroup = permissionGroup;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.type = type;
    this.dbModel = model;
  }

  getBrief() {
    const permissionGroup = config.permissionGroups.find(
      (group) => group.title == this.permissionGroup
    );

    const brief = {
      id: this.id,
      permissionGroup: permissionGroup,
      phone: this.phone,
      email: this.email,
      type: this.type,
    };

    return brief;
  }

  setNewDetail(detail) {
    if (detail.phone) this.phone = detail.phone;
    if (detail.email) this.email = detail.email;
    if (detail.password) this.password = detail.password;
  }

  hasPermission(permissionField) {
    const permissionGroup = config.permissionGroups.find(
      (group) => group.title == this.permissionGroup
    );

    if (permissionGroup == null) return false;

    let key = false;

    for (let i = 0; i < permissionGroup.validPermissionTypes.length; i++) {
      const userPermissionType = permissionGroup.validPermissionTypes[i];

      if (userPermissionType == permissionField) {
        key = true;
        break;
      }
    }

    return key;
  }

  async save() {
    this.mode["permissionGroup"] = this.permissionGroup;
    this.mode["phone"] = this.phone;
    this.mode["email"] = this.email;
    this.mode["password"] = this.password;

    await mode.save();
  }

  static loadFromModel(model) {
    return new Promise((done, reject) => {
      // check required fields
      let isValidData = validateObject(
        model,
        "fullname email password permission"
      );
      if (!isValidData) reject(User.notValid(detail));

      let id = model.id;
      let permissionGroup = model.permissionGroup;
      let phone = model.phone;
      let email = model.email;
      let password = model.password;
      let type = model.type;

      //create user
      let newUser = new User(
        id,
        permissionGroup,
        phone,
        email,
        password,
        type,
        model
      );
      done(newUser);
    });
  }

  static createFromModel(model, detail) {
    return new Promise(async (done, reject) => {
      //create user
      await new model(detail)
        .save()
        .then((newUser) => done(User.loadFromModel(newUser)))
        .catch(reject);
    });
  }

  static notValid(object) {
    let error = `user detail are not valid ${object}`;
    console.error(error);
    return error;
  }
};

```



# src/class/validator.js

```javascript
/**
 * Validates an object by checking if it contains all the required fields.
 * @param {Object} obj - The object to be validated.
 * @param {string|Object} requiredFields - The list of required fields. If it's a string, it should contain keys separated by spaces. If it's an object, it should contain key-value pairs where the key is the field name and the value is a boolean indicating whether the field is required or not.
 * @returns {boolean} - Returns true if the object contains all the required fields, otherwise returns false.
 * @throws {string} - Throws an error if the requiredFields parameter is not a string or an object.
 */
function validate(obj, requiredFields) {
    /*
        this method could validate an Object by given field's name list and return bool.
        - requiredFields: is a string that contains keys being spared by " ".
    */
    let type = typeof requiredFields;
    let result;

    if (type == 'string')
        result = checkSimple(obj, requiredFields);
    else if (type == 'object')
        result = checkComplex(obj, requiredFields);

    else throw ('requiredFields has wrong form, it must be string or object');

    return result;
}

module.exports = validate;

function checkSimple(obj, requiredFields = '') {
    let isValide = false;
    let requires = requiredFields.split(' ');

    let validMembers = 0;
    let notValidKeys = [];

    // return if obj is null
    if (obj == null) return _returnResult(isValide, requires);

    requires.forEach(key => {
        if (obj[key])
            validMembers++;
        else notValidKeys.push(key);
    });

    // check validation
    isValide = (requires.length == validMembers) ? true : false;
    return _returnResult(isValide, notValidKeys);
}

function checkComplex(obj, requiredFields = {}) {
    let isValide = false;
    let requireKeys = Object.keys(requiredFields);

    let validMembers = 0;
    let notValidKeys = [];

    // return if obj is null
    if (obj == null) return _returnResult(isValide, requireKeys);

    for (let i = 0; i < requireKeys.length; i++) {
        const key = requireKeys[i];
        let isValidField = false;

        // if field has specific values
        if (requiredFields[key].length > 0) {
            let expectedValues = requiredFields[key].split(' ');

            if (typeof expectedValues != 'object')
                throw (`${key} must be array of strings`);

            expectedValues.forEach(value => {
                if (obj[key] == value) isValidField = true;
            })
        }
        // else does not has specific value
        else if (obj[key] != null) isValidField = true;

        if (isValidField) validMembers++;
        else notValidKeys.push(key);
    }

    // check validation
    isValide = (requireKeys.length == validMembers) ? true : false;
    return _returnResult(isValide, notValidKeys);
}

function _returnResult(isValide, notValidKeys) {
    return {
        'isValid': isValide,
        'requires': notValidKeys
    };
}
```



# src/class/combinator.js

```javascript
const Router = require("koa-router");
const directory = require("./directory.js");
const { addFunction } = require("./../services/functions/service.js");

class Combinator {
  async combineRoutesByFilePath(rootDirectory, app) {
    // find route paths
    let option = { name: "router", filter: [".js"] };
    let routerPaths = await directory
      .find(rootDirectory, option)
      .then()
      .catch((e) => {
        console.log(e);
      });

    // create and combine routes into the app
    for (let i = 0; i < routerPaths.length; i++) {
      let service = require(routerPaths[i]);
      let name = service.name;

      var serviceRouter = new Router();
      serviceRouter.use(`/${name}`, service.main.routes());

      app.use(serviceRouter.routes());
    }
  }

  /**
   *
   * @param {object} option
   * @param {string} option.rootDirectory root directory of files
   * @param {object} option.filename an object of {name, extension}
   * @param {string} option.filename.name name of file
   * @param {string} option.filename.extension the extension of the file
   * @param {boolean} option.combineWithRoot combine all file content and return theme as a object
   * @param {boolean} option.convertToArray return file content as an array instead an object
   */
  async combineModulesByFilePath({
    rootDirectory,
    filename,
    combineWithRoot,
    convertToArray,
  }) {
    // find route paths
    let rootObject_temp;
    const option = { name: filename.name, filter: [filename.extension] };
    const modulesPath = await directory
      .find(rootDirectory, option)
      .then()
      .catch((e) => {
        console.log(e);
      });

    // create and combine routes into the app
    for (let i = 0; i < modulesPath.length; i++) {
      const moduleObject = require(modulesPath[i]);

      // act by otherOption
      if (combineWithRoot) {
        if (moduleObject.name) delete moduleObject.name;

        if (moduleObject.length) {
          if (!rootObject_temp) rootObject_temp = [];

          rootObject_temp = [...rootObject_temp, ...moduleObject];
        } else {
          rootObject_temp = this.extendObj(rootObject_temp, moduleObject);
        }
        // else if (typeof)
      }
      // default act
      else {
        const name = moduleObject.name;
        rootObject_temp[name] = moduleObject;
      }
    }

    // options
    // convertToArray
    if (convertToArray) {
      rootObject_temp = Object.values(rootObject_temp);
    }

    // set result to main rootObject
    return rootObject_temp;
  }

  async combineFunctionsByFilePath({ rootDirectory, filename }) {
    // find route paths
    const option = { name: filename.name, filter: [filename.extension] };
    const functionsPaths = await directory
      .find(rootDirectory, option)
      .then()
      .catch((e) => {
        console.log(e);
      });

    // create and combine routes into the app
    for (let i = 0; i < functionsPaths.length; i++) {
      const modularFunctions = require(functionsPaths[i]);

      if (!modularFunctions.functions) {
        throw new Error(
          `Module file ${functionsPaths[i]} does not have functions property.`
        );
      }

      // if array
      if (modularFunctions.functions.length) {
        for (const moduleFunction of modularFunctions.functions) {
          addFunction(moduleFunction);
        }
      } else {
        addFunction(modularFunctions.functions);
      }
    }
  }

  extendObj(obj, src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
  }

  static get instance() {
    return instance;
  }
}

const instance = new Combinator();

module.exports = Combinator.instance;

```



# src/class/reply.js

```javascript
/**
 * Creates a response object with the given status and detail.
 *
 * @param {string} status - The status of the response. Can be "s" for success, "f" for fail, or "e" for error.
 * @param {Object} [detail={}] - The detail of the response. Can contain any additional information about the response.
 * @returns {Object} - The response object with the given status and detail.
 */
function create(status, detail = {}) {

    let result = detail || {};

    // define status
    switch (status) {
        case 's':
            result['status'] = 'success';
            break;

        case 'f':
            result['status'] = 'fail';
            break;

        case 'e':
            result['status'] = 'error';
            break;

        default:
            result['status'] = 'success';
            break;
    }

    // return
    return result;
}

module.exports = {
    create
}
```



# src/class/collection_definition.js

```javascript
/**
 * @typedef {import('./security.js').Permission} Permission
 * @typedef {import('./database_trigger.js')} DatabaseTrigger
 */

class CollectionDefinition {
  /**
   * This class helps to create a mongoose collection
   * associated with permissions and triggers.
   *
   * @class
   * @param {Object} option
   * @param {string} option.db - Database name
   * @param {string} option.collection - Collection name
   * @param {Object} option.schema - Mongoose schema
   * @param {Array<Permission>} option.permissions - A list of permissions for this collection
   * @param {Array<DatabaseTrigger>=} option.triggers - A database trigger
   */
  constructor({ db, collection, schema, permissions, triggers }) {
    // string
    this.database = db;
    // string
    this.collection = collection;
    // schema object of mongoose
    this.schema = schema;
    // a list of Permission for this collection
    this.permissions = permissions;

    this.triggers = triggers;
  }
}

module.exports = CollectionDefinition;

```



# src/class/directory.js

```javascript
const fs = require("fs");
const path = require("path");

function walk(dir, settings, done) {
  let results = [];

  // Read director file and folders
  fs.readdir(dir, function (err, list) {
    if (err) return done(err, results);

    var pending = list.length;
    if (!pending) return done(null, results);

    list.forEach(function (file) {
      file = path.join(dir, file);
      fs.stat(file, function (err, stat) {
        // If directory, execute a recursive call
        if (stat && stat.isDirectory()) {
          // Add directory to array [comment if you need to remove the directories from the array]
          // results.push(file);
          walk(file, settings, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          // file filter
          var extension = path.extname(file);
          var fileName = path.basename(file).split(".")[0];
          var fileNameKey = true;

          // name filter
          if (settings.name && settings.name === fileName) fileNameKey = true;
          else fileNameKey = false;

          // extension filter
          if (settings.filter && fileNameKey) {
            settings.filter.forEach(function (element) {
              if (element.toLowerCase() === extension.toLowerCase())
                results.push(file);
            }, this);
          }

          // push any file if no option
          else if (fileNameKey) results.push(file);

          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function find(dir, settings) {
  return new Promise((don, reject) => {
    walk(dir, settings, (err, result) => {
      if (err) reject(err);
      else don(result);
    });
  });
}

module.exports = {
  walk,
  find,
};

```



# src/class/trigger_operator.js

```javascript
class TriggerOperator {
  constructor() {
    this.triggers = [];
  }

  /**
   * add a collection trigger
   * @param {object} trigger DatabaseTrigger object
   */
  addTrigger(trigger) {
    this.triggers.push(trigger);
  }

  /**
   * Call a trigger
   * @param {'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate'} operation operation name
   * @param {string} database database name
   * @param {string} collection collection name
   * @param {string} data
   */
  call(operation, database, collection, data) {
    this.triggers.forEach((trigger) => {
      if (
        operation == trigger.operation &&
        database == trigger.database &&
        collection == trigger.collection &&
        trigger.callback
      )
        trigger.callback(data);
    });
  }

  static get instance() {
    return instance;
  }
}

const instance = new TriggerOperator();
module.exports = TriggerOperator.instance;

```



# src/class/paginator.js

```javascript
/**
 * Creates a pagination object based on the given parameters.
 * @param {number} count - The total number of items to paginate.
 * @param {number} perPage - The number of items to display per page.
 * @param {number} page - The current page number.
 * @returns {Object} - An object containing pagination information.
 */
function create(count, perPage, page) {
  const totalPages = Math.ceil(count / perPage);
  
  if (page > totalPages) page = 1;

  let from = 0;
  if (perPage == 1) from = page - 1;
  else from = (perPage * page) - perPage;

  if (page <= 1) from = 0;

  let result = {
    'pages': totalPages,
    'page': page,
    'from': from,
    'to': perPage
  };

  return result;
};

module.exports = {
  create,
}
```



# src/helper/presetup_services.js

```javascript
let DataInsertion = require("./data_insertion");
let JWT = require("../services/jwt/service");
let FileService = require("../services/file/service");

module.exports.setup = async ({ keypair, adminUser, uploadDirectory }) => {
  /**
   * Json web Token
   *
   * Setup private and public keys for JWT module
   */
  if (!keypair) {
    // generate new keypair
    const generateKeypair = require("keypair");
    keypair = generateKeypair();
  }

  JWT.main.setKies(keypair.private, keypair.public);

  /**
   * Data Insertion
   *
   * Insert admin user
   * for the first time
   */
  await DataInsertion.createAdminUser(adminUser);

  /**
   * File Service
   */
  FileService.setUploadDirectory(uploadDirectory);
};

```



# src/helper/data_insertion.js

```javascript
const DataProvider = require("../services/data_provider/service");
const {
  getDefaultAnonymousPermissionGroup,
  getDefaultAdministratorPermissionGroup,
} = require("../services/user_manager/permissionManager");

const userManager = require("../services/user_manager/service");

async function createAdminUser({ email, password }) {
  let authModel = DataProvider.getCollection("cms", "auth");

  try {
    const isAnonymousExisted = await authModel
      .countDocuments({ type: "anonymous" })
      .exec();

    const isAdministratorExisted = await authModel
      .countDocuments({ type: "user", email: email })
      .exec();

    if (isAnonymousExisted == 0) {
      await userManager.main.registerUser({
        permissionGroup: getDefaultAnonymousPermissionGroup().title,
        email: "",
        phone: "",
        password: "",
        type: "anonymous",
      });
      // await new authModel({
      //   permission: getDefaultAnonymousPermissionGroup().title,
      //   email: "",
      //   phone: "",
      //   password: "",
      //   type: "anonymous",
      // }).save();
    }

    if (isAdministratorExisted == 0) {
      if (!email || !password) {
        return Promise.reject("Invalid email or password for admin user.");
      }

      await userManager.main.registerUser({
        permissionGroup: getDefaultAdministratorPermissionGroup().title,
        email: email,
        password: password,
        type: "user",
      });

      // await new authModel({
      //   permission: getDefaultAdministratorPermissionGroup().title,
      //   email: email,
      //   password: password,
      //   type: "user",
      // }).save();
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

module.exports = {
  createAdminUser,
};

```



# src/services/jwt/service.js

```javascript
const jwt = require("jsonwebtoken");

class JWT {
  setKies(privateKey, publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  sign(payload) {
    return new Promise((done, reject) => {
      let option = { algorithm: "RS256" };

      try {
        let token = jwt.sign(payload, this.privateKey, option);
        done(token);
      } catch (error) {
        reject(error.message);
      }
    });
  }

  verify(token) {
    return new Promise((done, reject) => {
      let option = { algorithm: "RS256" };

      try {
        let decoded = jwt.verify(token, this.publicKey, option);
        done(decoded);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports.name = "jwt";
module.exports.main = new JWT();

```



# src/services/jwt/router.js

```javascript
let Router = require('koa-router');
let validateObject = require('../../class/validator')
let reply = require('../../class/reply').create;

let name = 'verify';
let verify = new Router();

let service = require('./service').main;

verify.post('/token', async (ctx) => 
{
	let body = ctx.request.body;

	// validate result
	let bodyValidate = validateObject(body, 'token');

	// fields validation
    if(!bodyValidate.isValid)
    {	
    	ctx.status = 412;
        ctx.body = reply('e', {'e': bodyValidate.requires});
        return;
    }

	await service.verify(body.token)
    	.then((payload) => ctx.body = reply('s', {'user': payload}))
    	.catch(err => {
    		ctx.status = 412;
        	ctx.body = reply('e', {'e': err});
    	});
});

verify.post('/checkAccess', async (ctx) => 
{
	let body = ctx.request.body;

	// validate result
	let bodyValidate = validateObject(body, 'token permissionField');

	// fields validation
    if(!bodyValidate.isValid)
    {	
    	ctx.status = 412;
        ctx.body = reply('e', {'e': bodyValidate.requires});
        return;
	}
	
	let payload = await service.verify(body.token)
		.catch(err => {
            console.log(err);
            ctx.throw(412, err.message);
        });
    	
		
	let userid = payload.id;
	
	await global.services.userManager.main.getUserById(userid)
		.then((user) => 
		{
			let key = user.hasPermission(body.permissionField);
			ctx.body = reply('s', {'access': key});
		})
		.catch(err => {
			ctx.status = 412;
			ctx.body = reply('e', {'e': err});
		});
});

module.exports.name = name;
module.exports.main = verify;
```



# src/services/file/service.js

```javascript
const fs = require("file-system");
const pathModule = require("path");
const DataProvider = require("./../data_provider/service");
const triggerService = require("./../../class/trigger_operator");
const { config } = require("./../../config");

class FileService {
  constructor() {
    this.directory = null;
  }

  setUploadDirectory(directory) {
    this.directory = directory;
  }

  /**
   *
   * @param {string} fileType
   * @param {string} tag
   *
   * @returns storedFile
   * @returns storedFile.fileName
   * @returns storedFile.directory
   * @returns storedFile.fullPath
   * @returns storedFile.fileFormat
   */
  createStoredDetail(fileType, tag) {
    const typeParts = fileType.split("/");
    const fileFormat = typeParts[1] || typeParts[0] || "unknown";

    const time = new Date().getTime();
    const fileName = `${time}.${fileFormat}`;

    const fullPath = pathModule.join(
      FileService.instance.directory,
      fileFormat,
      tag,
      fileName
    );

    return { fileName, fullPath, fileFormat };
  }

  /**
   * Stores a file, removes the given temporary file, and submits file details into the database.
   *
   * @param {Object} options - The options for storing the file.
   * @param {Object} options.file - The file to be stored.
   * @param {string} options.file.path - The path of the file.
   * @param {string} options.file.type - The type of the file.
   * @param {string} options.file.name - The original name of the file.
   * @param {number} options.file.size - The size of the file.
   * @param {string} options.ownerId - The ID of the owner of the file.
   * @param {string} options.tag - The tag associated with the file.
   * @param {boolean} [options.removeFileAfterStore=true] - Whether to remove the file after storing it.
   *
   * @returns {Promise} A promise that resolves with the document of the stored file.
   *
   * @throws {string} If the upload directory has not been set.
   */
  storeFile({ file, ownerId, tag, removeFileAfterStore = true }) {
    if (!FileService.instance.directory)
      throw "upload directory has not been set.";

    let storedFile;

    return (
      new Promise(async (done, reject) => /**
       * Store file and remove temp file
       */ {
        storedFile = FileService.instance.createStoredDetail(file.type, tag);

        fs.copyFile(file.path, storedFile.fullPath, {
          done: (err) => {
            if (err) reject(err);
            else done();

            // remove temp file
            if (removeFileAfterStore) fs.fs.unlinkSync(file.path);
          },
        });
      })
        /**
         * Submit file detail into database
         */
        .then(() => {
          // Get collection model for access to relative collection
          const CollectionModel = DataProvider.getCollection("cms", "file");

          const data = {
            owner: ownerId,
            fileName: storedFile.fileName,
            originalName: file.name,
            format: storedFile.fileFormat,
            tag,
            size: file.size,
          };

          // Create new document
          const doc = new CollectionModel(data);

          return doc.save().then((savedDoc) => {
            triggerService.call("insert-one", "cms", "file", {
              query: null,
              queryResult: savedDoc,
            });

            return savedDoc;
          });
        })
        .catch((err) => {
          // remove stored file
          fs.fs.unlinkSync(storedFile.fullPath);

          throw err;
        })
    );
  }

  /**
   * Removes a file from the disk.
   *
   * @param {string} path - The path of the file to be removed.
   * @returns {Promise} A promise that resolves if the file is successfully removed, and rejects if an error occurs.
   */
  removeFromDisc(path) {
    return new Promise((done, reject) => {
      fs.fs.unlink(path, (err) => {
        if (err) reject();
        else done();
      });
    });
  }

  /**
   * Removes a file from the database and the disk.
   *
   * @param {string} fileId - The ID of the file to be removed.
   * @returns {Promise} A promise that resolves if the file is successfully removed, and rejects if an error occurs.
   * @throws Will throw an error if upload directory has not been set.
   */
  removeFile(fileId) {
    if (!FileService.instance.directory)
      throw "upload directory has not been set.";

    return new Promise(async (done, reject) => {
      let CollectionModel = DataProvider.getCollection("cms", "file");
      let fileDoc = await CollectionModel.findOne({ _id: fileId }).exec();

      if (!fileDoc) {
        reject("file not found");
        return;
      }

      await CollectionModel.deleteOne({ _id: fileId })
        .exec()
        .then(() => {
          // create file path
          const filePath = pathModule.join(
            FileService.instance.directory,
            fileDoc.format,
            fileDoc.tag,
            fileDoc.fileName
          );

          // Remove file from disc
          return FileService.instance
            .removeFromDisc(filePath)
            .catch(async (err) => {
              // Recreate fileDoc if removing file operation has error
              await new CollectionModel(fileDoc).save();

              throw err;
            });
        })
        .then(() => {
          triggerService.call("remove-one", "cms", "file", {
            query: { _id: fileId },
            queryResult: null,
          });
        })
        .then(done)
        .catch(reject);
    });
  }

  /**
   * Retrieves a file from the database.
   *
   * @param {string} fileId - The ID of the file to be retrieved.
   * @returns {Promise} A promise that resolves with the file document, or rejects if an error occurs.
   */
  getFile(fileId) {
    const CollectionModel = DataProvider.getCollection("cms", "file");

    return CollectionModel.findOne({ _id: fileId }).exec();
  }

  /**
   * Retrieves the link of a file.
   *
   * @param {string} fileId - The ID of the file to get the link for.
   * @returns {Promise} A promise that resolves with the file link, or rejects if an error occurs.
   */
  async getFileLink(fileId) {
    const fileDoc = await FileService.instance.getFile(fileId);

    const link =
      config.staticPath.rootPath +
      `/${fileDoc.format}/${fileDoc.tag}/` +
      fileDoc.fileName;

    return link;
  }

  async getFilePath(fileId) {
    const { fileName, format, tag } = await FileService.instance.getFile(
      fileId
    );
    const fullPath = pathModule.join(
      FileService.instance.directory,
      format,
      tag,
      fileName
    );
    return fullPath;
  }
}

FileService.instance = new FileService();
module.exports = FileService.instance;

```



# src/services/file/db.js

```javascript
var mongoose = require("mongoose");
var Schemas = require("../../class/db_schemas");

let CollectionDefinition = require("../../class/collection_definition");
let { Permission, PermissionTypes } = require("../../class/security");
const { config } = require("../../config");

module.exports = [
  new CollectionDefinition({
    db: "cms",
    collection: "file",
    schema: Schemas.file,
    permissions: [
      new Permission({
        type: PermissionTypes.upload_file_access,
        read: true,
        write: true,
        onlyOwnData: false,
      }),
      new Permission({
        type: PermissionTypes.remove_file_access,
        read: true,
        write: true,
        onlyOwnData: false,
      }),
    ],
    triggers: config.fileTriggers || [],
  }),
];

```



# src/services/file/router.js

```javascript
let Router = require('koa-router');
let validateObject = require('../../class/validator');
let reply = require('../../class/reply').create;
let name = 'file';

let { AccessTypes } = require('./../../class/security');

let DataService = require('./../data_provider/service');
let service = require('./service');
let middleware = require('../../middlewares');
let fileRouter = new Router();

fileRouter.use('/', middleware.auth, async (ctx, next) => {
    await next();
});

fileRouter.post('/', async (ctx) => {

    let body = ctx.request.body;

    // validate result
	let bodyValidate = validateObject(body, 'tag');

	// fields validation
	if (!bodyValidate.isValid) {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': bodyValidate.requires });
		return;
	}

    // Access validation
    let hasAccess = DataService.checkAccess('cms', 'file', AccessTypes.write, body, ctx.state.user);
    if (!hasAccess) {
        ctx.throw(403, 'access denied');
        return
    }

    let file = ctx.request.files.file;
    let result;

    if (!file) {
        ctx.status = 412;
        result = reply('f',
            { 'message': 'file field required' });
    }

    else {
        await service.storeFile({
            file: file,
            ownerId: ctx.state.user.id,
            tag: body.tag
        })
            .then((file) => {
                result = reply('s', { file });
            })
            .catch((error) => {
                ctx.status = 412;
                result = reply('e', error);
            });
    }

    ctx.body = result;
});

fileRouter.delete('/', async (ctx) => {
    let body = ctx.request.query;
    // validate
    let bodyValidate = validateObject(body, 'id');

    let result;

    if (!bodyValidate.isValid) {
        ctx.status = 412;
        result = reply('f', { 'message': 'some fields required.', 'error': bodyValidate.requires });
    }

    else {
        await service.removeFile(body.id)
            .then(() => {
                result = reply('s');
            })
            .catch((e) => {
                ctx.status = 412;
                result = reply('e', { 'error': e });
            });
    }

    ctx.body = result;
});

module.exports.name = name;
module.exports.main = fileRouter;
```



# src/services/data_provider/service.js

```javascript
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

```



# src/services/data_provider/router.js

```javascript
let { AccessTypes } = require("./../../class/security");
let Router = require("koa-router");
let validateObject = require("../../class/validator");
let reply = require("../../class/reply").create;
var nestedProperty = require("nested-property");

//let Types = require('./types.js');

let name = "data-provider";

let service = require("./service");
let middleware = require("./../../middlewares");

let dataProvider = new Router();

dataProvider.use("/", middleware.auth, async (ctx, next) => {
  let body = ctx.request.body;
  let bodyValidated = validateObject(body, "database collection");

  // fields validation
  if (!bodyValidated.isValid) {
    ctx.throw(
      412,
      JSON.stringify(reply("e", { error: bodyValidated.requires }))
    );
  }

  // type caster
  if (body.types && body.hasOwnProperty(body.bodyKey || ".")) {
    let bodyKey = body.bodyKey;
    for (const key in body.types) {
      if (
        body.types.hasOwnProperty(key) &&
        typeof body.types[key] == "object"
      ) {
        let typeDetail = body.types[key];

        try {
          let value = nestedProperty.get(body[bodyKey], typeDetail.path);
          let newProperty = service.TypeCasters[typeDetail.type](value);
          nestedProperty.set(body[bodyKey], typeDetail.path, newProperty);
          console.log(
            "newProperty",
            newProperty,
            JSON.stringify(body[bodyKey])
          );
        } catch (e) {
          console.log("type caster error", e);
        }
      }
    }
  }

  await next();
});

dataProvider.post("/find", async (ctx) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection query");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      412,
      JSON.stringify(reply("e", { error: bodyValidate.requires }))
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) {
    console.log(body);
    console.log(ctx.state.user.permission);
    ctx.throw(403, "access denied");
  }

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      412,
      JSON.stringify(reply("e", { error: "wrong database or collection" }))
    );
  }

  // operate on db
  let queryRequest = collection.find(body.query, body.projection);

  if (body.options) {
    queryRequest = service.performAdditionalOptionsToQueryObject(
      queryRequest,
      body.options
    );
  }

  if (body.populates) {
    try {
      req = service.performPopulateToQueryObject(queryRequest, body.populates);
    } catch (err) {
      ctx.status = 412;
      ctx.body = err;
    }
  }

  await queryRequest
    .exec()
    .then(async (docs) => {
      // Call trigger
      service.triggers.call("find", body.database, body.collection, {
        query: body.query,
        queryResult: docs,
      });

      ctx.body = { data: docs };
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post("/find-one", async (ctx) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection query");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      JSON.stringify(reply("e", { error: bodyValidate.requires })),
      412
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, "access denied");

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      JSON.stringify(reply("e", { error: "wrong database or collection" })),
      412
    );
  }

  // operate on db
  let queryRequest = collection.findOne(
    body.query,
    body.projection,
    body.options
  );

  if (body.options) {
    queryRequest = service.performAdditionalOptionsToQueryObject(
      queryRequest,
      body.options
    );
  }

  if (body.populates) {
    try {
      req = service.performPopulateToQueryObject(queryRequest, body.populates);
    } catch (err) {
      ctx.status = 412;
      ctx.body = err;
    }
  }

  // operate on db
  await queryRequest
    .exec()
    .then(async (doc) => {
      // Call trigger
      service.triggers.call("find-one", body.database, body.collection, {
        query: body.query,
        queryResult: doc,
      });

      ctx.body = { data: doc };
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post("/count", async (ctx) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection query");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      JSON.stringify(reply("e", { error: bodyValidate.requires })),
      412
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, "access denied");

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      JSON.stringify(reply("e", { error: "wrong database or collection" })),
      412
    );
  }

  // operate on db
  await collection
    .countDocuments(body.query)
    .exec()
    .then((count) => {
      // Call trigger
      service.triggers.call("count", body.database, body.collection, {
        query: body.query,
        queryResult: count,
      });

      ctx.body = { data: count };
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post("/update-one", async (ctx) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection query update");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      JSON.stringify(reply("e", { error: bodyValidate.requires })),
      412
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.write,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, "access denied");

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      JSON.stringify(reply("e", { error: "wrong database or collection" })),
      412
    );
  }

  // get removing doc as output for triggers
  let output = await collection.findOne(body.query).exec().then();

  // operate on db
  await collection
    .updateOne(body.query, body.update, body.options)
    .exec()
    .then((writeOpResult) => {
      // Call trigger
      service.triggers.call("update-one", body.database, body.collection, {
        query: body.query,
        queryResult: writeOpResult,
      });

      ctx.body = { data: writeOpResult };
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post("/insert-one", async (ctx) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection doc");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      JSON.stringify(reply("e", { error: bodyValidate.requires })),
      412
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.write,
    body.doc,
    ctx.state.user
  );
  if (!hasAccess) {
    console.log(body);
    console.log(ctx.state.user.permission);
    ctx.throw(403, "access denied");
  }

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      JSON.stringify(reply("e", { error: "wrong database or collection" })),
      412
    );
  }

  // operate on db
  await new collection(body.doc)
    .save()
    .then(async (newDoc) => {
      // Call trigger
      service.triggers.call("insert-one", body.database, body.collection, {
        query: body.query,
        queryResult: newDoc,
      });

      ctx.body = { data: newDoc };
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post("/remove-one", async (ctx) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection query");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      JSON.stringify(reply("e", { error: bodyValidate.requires })),
      412
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.write,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, "access denied");

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      JSON.stringify(reply("e", { error: "wrong database or collection" })),
      412
    );
  }

  // get removing doc as output for triggers
  let output = await collection.findOne(body.query).exec().then();

  // operate on db
  await collection
    .deleteOne(body.query)
    .exec()
    .then(async (result) => {
      // Call trigger
      service.triggers.call("remove-one", body.database, body.collection, {
        query: body.query,
        queryResult: result,
      });

      ctx.body = { data: result };
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post("/aggregate", async (ctx) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection accessQuery");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      JSON.stringify(reply("e", { error: bodyValidate.requires })),
      412
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.accessQuery,
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, "access denied");

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      JSON.stringify(reply("e", { error: "wrong database or collection" })),
      412
    );
  }

  // operate on db
  await collection
    .aggregate(body.pipelines)
    .exec()
    .then(async (result) => {
      // Call trigger
      service.triggers.call("aggregate", body.database, body.collection, {
        query: body.query,
        queryResult: result,
      });

      ctx.body = { data: result };
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post("/findByIds", async (ctx, next) => {
  let body = ctx.request.body;
  let bodyValidate = validateObject(body, "database collection ids");

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(
      JSON.stringify(reply("e", { error: bodyValidate.requires })),
      412
    );
  }

  // access validation
  let hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.accessQuery || {},
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, "access denied");

  // collection validation
  let collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(
      JSON.stringify(reply("e", { error: "wrong database or collection" })),
      412
    );
  }

  let or = [];

  try {
    body.ids.forEach((id) => {
      let castedid = service.getAsID(id);
      or.push({ _id: castedid });
    });
  } catch (e) {
    console.log("ids.forEach", e);
  }

  let pipelines = [
    {
      $match: { $or: or },
    },
    // {
    //     $sort: body.sort || { _id: 1 }
    // }
  ];

  // operate on db
  await collection
    .aggregate(pipelines)
    .exec()
    .then(async (result) => {
      ctx.state = { data: result };
      await next();
    })
    .catch((err) => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.use("/", async (ctx, next) => {
  // this event is responsible to covert whole mongoose doc to json form
  // inclouding getters, public propertise
  // each mongoose doc must have a "toJson" method being defined on its own Schema.

  let state = ctx.state;
  //     let result;

  //     // array
  //     if(!isNaN(state.length)) {
  //         result = [];

  //         for (let index = 0; index < state.length; index++) {
  //             const element = state[index];
  //             if(element.hasOwnProperty('toJson'))
  //                 result.push(element.toJson());
  //             else result.push(element);
  //         }
  //     }
  //     // object
  //     else {
  //         result = state.toJson();
  //     }

  ctx.body = state;
});

module.exports.name = name;
module.exports.main = dataProvider;

```



# src/services/data_provider/typeCasters.js

```javascript
const Mongoose = require('mongoose');

module.exports = {
  'ObjectId': Mongoose.Types.ObjectId,
  'Date': (dateValue) => {
      const strDate = dateValue.toString();
      const mongoDateFormateInString = new Date(strDate).toISOString().split('T')[0];
      return new Date(mongoDateFormateInString);
  }
}
```



# src/services/functions/service.js

```javascript
const functions = [];

/**
 * @typedef {import('../../class/security.js').PermissionType} PermissionType
 */

/**
 * Defines a function with a given name, permission types, and callback.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.name - The name of the function.
 * @param {[PermissionType]} params.permissionTypes - The permission types for the function.
 * @param {Function} params.callback - The callback to be executed by the function.
 */
function defineFunction({ name, permissionTypes, callback }) {
  // Check if the function already exists
  const existingFunction = functions.find((f) => f.name === name);
  if (existingFunction) {
    throw new Error(`Function with name ${name} already exists`);
  }

  // Check if the permission types provided
  if (!permissionTypes || !permissionTypes.length) {
    throw new Error(`Permission types not provided for function ${name}`);
  }

  // Check if the callback is a function
  if (typeof callback !== "function") {
    throw new Error(`Callback is not a function for function ${name}`);
  }

  // Add the function to the list of functions
  return { name, permissionTypes, callback };
}

function runFunction(name, args, user) {
  return new Promise((resolve, reject) => {
    const func = functions.find((f) => f.name === name);
    if (!func) {
      reject(new Error(`Function with name ${name} not found`));
    }

    const hasPermission = func.permissionTypes.some((permissionType) =>
      user.hasPermission(permissionType)
    );

    if (hasPermission == false) {
      reject(
        new Error(`User does not have permission to run function ${name}:
        Function permissions: ${func.permissionTypes}
        User permissions: ${
          user.getBrief().permissionGroup.validPermissionTypes
        }
        `)
      );
    } else {
      try {
        resolve(func.callback(args));
      } catch (e) {
        reject(e);
      }
    }
  });
}

function addFunction(func) {
  functions.push(func);
}

module.exports = {
  defineFunction,
  runFunction,
  addFunction,
};

```



# src/services/functions/router.js

```javascript
const Router = require("koa-router");
const service = require("./service");
const middleware = require("../../middlewares");
const validateObject = require("../../class/validator");
const reply = require("../../class/reply").create;

const functionRouter = new Router();
const name = "function";

functionRouter.use("/", middleware.auth, async (ctx, next) => {
  const body = ctx.request.body;
  const bodyValidated = validateObject(body, "name args");

  // fields validation
  if (!bodyValidated.isValid) {
    ctx.throw(
      412,
      JSON.stringify(reply("e", { error: bodyValidated.requires }))
    );
  }

  await next();
});

functionRouter.post(`/run`, middleware.auth, async (ctx) => {
  const { name, args } = ctx.request.body;

  try {
    const result = await service.runFunction(name, args, ctx.state.user);
    ctx.body = JSON.stringify(reply("s", { data: result }));
  } catch (e) {
    ctx.throw(400, JSON.stringify(reply("e", { error: e.message })));
  }
});

module.exports.name = name;
module.exports.main = functionRouter;

```



# src/services/user_manager/permissionManager.js

```javascript
const { config } = require("../../config");

function getDefaultPermissionGroups() {
  const defaultPermissionGroups = config.permissionGroups.find(
    (group) => group.isDefault
  );

  if (defaultPermissionGroups == null) {
    throw new Error("Default permission group not found");
  }

  return defaultPermissionGroups;
}

function getDefaultAnonymousPermissionGroup() {
  const anonymousPermission = config.permissionGroups.find(
    (group) => group.isAnonymous
  );

  if (anonymousPermission == null) {
    throw new Error("Anonymous permission group not found");
  }

  return anonymousPermission;
}

function getDefaultAdministratorPermissionGroup() {
  const administratorPermission = config.permissionGroups.find(
    (group) => group.title.toString() == "administrator"
  );

  if (administratorPermission == null) {
    throw new Error("Administrator permission group not found");
  }

  return administratorPermission;
}

module.exports = {
  getDefaultPermissionGroups,
  getDefaultAnonymousPermissionGroup,
  getDefaultAdministratorPermissionGroup,
};

```



# src/services/user_manager/service.js

```javascript
const User = require("../../class/user");
const DataProvider = require("../data_provider/service");
const JWT = require("../jwt/service");
const { getDefaultPermissionGroups } = require("./permissionManager");

/**
 * import user type
 * @typedef {import('../../class/user')} User
 */

class UserManager {
  constructor() {
    this.tempIds = {};
  }

  /**
   * Sets a custom method for generating verification codes.
   *
   * @param {Function} generatorMethod - A function that returns a random verification code.
   * @returns {void}
   */
  setCustomVerificationCodeGeneratorMethod(generatorMethod) {
    this.verificationCodeGeneratorMethod = method;
  }

  /**
   * Get a user by their ID.
   *
   * @param {string} id - The ID of the user.
   * @returns {Promise<User>} A promise that resolves to the user.
   * @throws {Error} If the user is not found.
   */
  generateVerificationCode(id, idType) {
    if (this.verificationCodeGeneratorMethod)
      return this.verificationCodeGeneratorMethod(id, idType);

    // this is default code
    return "123";
  }

  /**
   * Get a user by their ID.
   *
   * @param {string} id - The ID of the user.
   * @returns {Promise<User>} A promise that resolves to the user.
   * @throws {string} If the user is not found.
   */
  getUserById(id) {
    return new Promise(async (done, reject) => {
      let userModel = DataProvider.getCollection("cms", "auth");

      let userDoc = await userModel
        .findOne({ _id: id })
        .select({ password: 0 })
        .exec()
        .catch(reject);

      if (!userDoc) {
        reject("user not found");
        return;
      }

      let user = User.loadFromModel(userDoc);
      done(user);
    });
  }

  /**
   * Get a user by their identity.
   *
   * @param {string} id - The identity of the user.
   * @param {string} idType - The type of the identity (phone or email).
   * @returns {Promise<User>} A promise that resolves to the user.
   * @throws {string} If the user is not found.
   */
  getUserByIdentity(id, idType) {
    return new Promise(async (done, reject) => {
      let userModel = DataProvider.getCollection("cms", "auth");

      let query = {};

      if (idType == "phone") query["phone"] = id;
      else if (idType == "email") query["email"] = id;

      let userDoc = await userModel
        .findOne(query)
        .select({ password: 0 })
        .exec()
        .catch(reject);

      if (!userDoc) {
        reject("user not found");
        return;
      }

      let user = User.loadFromModel(userDoc);
      done(user);
    });
  }

  /**
   * Get a user by their token.
   *
   * @param {string} token - The token of the user.
   * @returns {Promise<User>} A promise that resolves to the user.
   */
  async getUserByToken(token) {
    const { id } = await JWT.main.verify(token);
    return this.getUserById(id);
  }

  /**
   * Check if a verification code is valid.
   *
   * @param {string} id - The ID of the user.
   * @param {string} code - The verification code.
   * @returns {boolean} Whether the verification code is valid.
   */
  isCodeValid(id, code) {
    let key = false;

    if (
      this.tempIds.hasOwnProperty(id) &&
      this.tempIds[id].code.toString() === code.toString()
    )
      key = true;

    return key;
  }

  /**
   * Login a user and return their token.
   *
   * @param {string} id - The ID of the user.
   * @param {string} idType - The type of the ID (phone or email).
   * @param {string} password - The password of the user.
   * @returns {Promise<string>} A promise that resolves to the token of the user.
   * @throws {string} If the user is not found.
   */
  loginUser(id = "", idType = "", password = "") {
    let token;

    return new Promise(async (done, reject) => {
      // Get user model
      const userModel = DataProvider.getCollection("cms", "auth");

      /**
       * Setup query to find by phone or email
       */
      const query = {
        password: Buffer.from(password).toString("base64"),
        type: "user",
      };

      if (idType == "phone") query["phone"] = id;
      else if (idType == "email") query["email"] = id;

      // Get from database
      const gottenFromDB = await userModel.findOne(query).exec().catch(reject);

      if (!gottenFromDB) reject("user not found");
      // Token
      else {
        // Load user
        const user = await User.loadFromModel(gottenFromDB)
          .then()
          .catch(reject);

        // Get token payload
        // This is some information about the user.
        const payload = user.getBrief();

        // Generate json web token
        token = await JWT.main.sign(payload).then().catch(reject);

        done(token);
      }
    });
  }

  /**
   * Issue a token for a user.
   *
   * @param {string} email - The email of the user.
   * @returns {Promise<string>} A promise that resolves to the token of the user.
   * @throws {string} If the user is not found.
   */
  issueTokenForUser(email) {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection("cms", "auth");
      const query = { email: email };

      // Get from database
      const gottenFromDB = await userModel.findOne(query).exec().catch(reject);

      if (!gottenFromDB) reject("user not found");

      const user = await User.loadFromModel(gottenFromDB).then().catch(reject);

      // Get token payload
      // This is some information about the user.
      const payload = user.getBrief();

      // Generate json web token
      await JWT.main.sign(payload).then(done).catch(reject);
    });
  }

  /**
   * Login as an anonymous user.
   *
   * @returns {Promise<string>} A promise that resolves to the token of the anonymous user.
   * @throws {string} If the anonymous user is not found.
   */
  loginAnonymous() {
    let token;

    return new Promise(async (done, reject) => {
      // Get user model
      let userModel = DataProvider.getCollection("cms", "auth");

      // Setup query
      let query = { type: "anonymous" };

      // Get from database
      let gottenFromDB = await userModel
        .findOne(query)
        .exec()
        .then()
        .catch(reject);

      // Create a new anonymous user if it doesn't exist.
      // There are only one anonymous user in the database
      // and every guest token being generated from it.
      if (!gottenFromDB) {
        let newUserId = await this.registerUser({ type: "anonymous" }).catch(
          reject
        );
        gottenFromDB = await this.getUserById(newUserId).catch(reject);
      }

      // load User
      let user = await User.loadFromModel(gottenFromDB).then().catch(reject);

      // Get token payload
      // This is some information about the user.
      let payload = user.getBrief();

      // Generate json web token
      token = await JWT.main.sign(payload).then().catch(reject);

      done(token);
    });
  }

  /**
   * Register a temporary ID.
   *
   * @param {string} id - The ID to register.
   * @param {string} type - The type of the ID.
   * @param {string} code - The verification code.
   */
  registerTemporaryID(id, type, code) {
    this.tempIds[id] = { id: id, type: type, code: code };
  }

  /**
   * Submit a password for a temporary ID.
   *
   * @param {string} id - The ID.
   * @param {string} password - The password.
   * @param {string} code - The verification code.
   * @returns {Promise<boolean>} A promise that resolves to whether the operation was successful.
   */
  async submitPasswordForTemporaryID(id, password, code) {
    let key = false;

    // If user email|phone has already stored
    // a new user being created
    if (
      this.tempIds.hasOwnProperty(id) &&
      this.tempIds[id].code.toString() == code.toString()
    ) {
      let authDetail = { password: password };

      if (this.tempIds[id].type == "phone") authDetail["phone"] = id;
      else if (this.tempIds[id].type == "email") authDetail["email"] = id;

      await this.registerUser(authDetail)
        .then(() => (key = true))
        .catch((e) => console.log(e));
    }

    delete this.tempIds[id];
    return key;
  }

  /**
   * Change the password for a temporary ID.
   *
   * @param {string} id - The ID.
   * @param {string} password - The new password.
   * @param {string} code - The verification code.
   * @returns {Promise<boolean>} A promise that resolves to whether the operation was successful.
   */
  async changePasswordForTemporaryID(id, password, code) {
    let key = false;

    if (this.tempIds.hasOwnProperty(id) && this.tempIds[id].code == code) {
      let query = {};

      if (this.tempIds[id].type == "phone") query["phone"] = id;
      else if (this.tempIds[id].type == "email") query["email"] = id;

      await this.changePassword(query, password)
        .then(() => (key = true))
        .catch((e) => console.log(e));
    }

    delete this.tempIds[id];
    return key;
  }

  /**
   * Register a user.
   *
   * @param {Object} detail - The details of the user.
   * @returns {Promise<string>} A promise that resolves to the ID of the new user.
   * @throws {string} If the user could not be registered.
   */
  registerUser(detail) {
    return new Promise(async (done, reject) => {
      // get default permission
      if (!detail.permissionGroup) {
        detail.permissionGroup = getDefaultPermissionGroups().title;
      }

      if (!detail.permissionGroup) {
        reject("default permission group not found");
        return;
      }

      let authM = DataProvider.getCollection("cms", "auth");
      return User.createFromModel(authM, detail)
        .then((newUser) => {
          DataProvider.triggers.call("insertOne", "cms", "auth", {
            input: detail,
            output: newUser.dbModel,
          });

          done(newUser.id);
        })
        .catch(reject);
    });
  }

  /**
   * Change the password of a user.
   *
   * @param {Object} query - The query to find the user.
   * @param {string} newPass - The new password.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  changePassword(query, newPass) {
    let update = { $set: { password: newPass } };
    let authM = DataProvider.getCollection("cms", "auth");
    return authM.updateOne(query, update).exec().then();
  }

  static get instance() {
    return instance;
  }
}

const instance = new UserManager();
module.exports.name = "userManager";
module.exports.main = UserManager.instance;

```



# src/services/user_manager/db.js

```javascript
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

let CollectionDefinition = require("../../class/collection_definition");
let { Permission, PermissionTypes } = require("../../class/security");
const { config } = require("../../config");
const triggerOperator = require("./../../class/trigger_operator");

let authSchema = new Schema(
  {
    permissionGroup: String,
    email: String,
    phone: String,
    password: String,
    type: { type: String, default: "user", enum: ["user", "anonymous"] },
  },
  { timestamps: true }
);

authSchema.index({ email: 1 }, { unique: true });
authSchema.pre(["save", "updateOne"], function (next) {
  // Encode the password before saving
  if (this.isModified("password")) {
    this.password = Buffer.from(this.password).toString("base64");
  }
  next();
});

authSchema.post("save", function (doc, next) {
  triggerOperator.call("insert-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("findOneAndUpdate", function (doc, next) {
  triggerOperator.call("update-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("updateOne", function (result, next) {
  triggerOperator.call("update-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("findOneAndDelete", function (doc, next) {
  triggerOperator.call("remove-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("deleteOne", function (result, next) {
  triggerOperator.call("remove-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

module.exports = [
  new CollectionDefinition({
    db: "cms",
    collection: "auth",
    schema: authSchema,
    permissions: [
      new Permission({
        type: PermissionTypes.advanced_settings,
        read: true,
        write: true,
      }),
    ],
    triggers: config.authTriggers || [],
  }),
];

```



# src/services/user_manager/router.js

```javascript
let Router = require('koa-router');
let validateObject = require('../../class/validator')
let reply = require('../../class/reply').create;

let name = 'user';
let userManager = new Router();

let service = require('./service').main;

userManager.post('/register_id', async (ctx) => {
	let body = ctx.request.body;

	let validateOption = {
		id: '',
		idType: 'phone email'
	};

	// validate result
	let bodyValidate = validateObject(body, validateOption);

	// fields validation
	if (!bodyValidate.isValid) {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': bodyValidate.requires });
		return;
	}

	let serial = service.generateVerificationCode(body.id, body.idType);

	if (serial) {
		service.registerTemporaryID(body.id, body.idType, serial);
		ctx.body = reply('s');
	}
	else {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': 'Could not generate verification code.' });
	}

});

userManager.post('/validateCode', async (ctx) => {
	let body = ctx.request.body;

	// validate result
	let bodyValidate = validateObject(body, 'id code');

	// fields validation
	if (!bodyValidate.isValid) {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': bodyValidate.requires });
		return;
	}

	let isValid = service.isCodeValid(body.id, body.code);

	if (!isValid) {
		ctx.status = 412;
		ctx.body = reply('e', {
			'e': 'Verification code is wrong',
			'isValid': isValid
		});
		return;
	}

	ctx.body = reply('s', { 'isValid': isValid });
});

userManager.post('/submit_password', async (ctx) => {
	let body = ctx.request.body;

	// validate result
	let bodyValidate = validateObject(body, 'id password code');

	// fields validation
	if (!bodyValidate.isValid) {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': bodyValidate.requires });
		return;
	}

	let registerResult = await service
		.submitPasswordForTemporaryID(body.id, body.password, body.code).then();

	if (registerResult == true) ctx.body = reply('s');
	else {
		ctx.status = 412;
		ctx.body = reply('f');
	}
});

userManager.post('/change_password', async (ctx) => {
	let body = ctx.request.body;

	// validate result
	let bodyValidate = validateObject(body, 'id password code');

	// fields validation
	if (!bodyValidate.isValid) {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': bodyValidate.requires });
		return;
	}

	let registerResult = await service
		.changePasswordForTemporaryID(body.id, body.password, body.code).then();

	if (registerResult == true) ctx.body = reply('s');
	else {
		ctx.status = 412;
		ctx.body = reply('f');
	}
});

userManager.post('/login', async (ctx) => {
	let body = ctx.request.body;

	let validateOption = {
		id: '',
		password: '',
		idType: 'phone email'
	}

	// validate result
	let bodyValidate = validateObject(body, validateOption);

	// fields validation
	if (!bodyValidate.isValid) {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': bodyValidate.requires });
		return;
	}

	await service.loginUser(body.id, body.idType, body.password)
		.then((token) => ctx.body = reply('s', { 'token': token }))
		.catch(err => {
			ctx.status = 412;
			ctx.body = reply('e', { 'e': err });
		});
});

userManager.get('/loginAnonymous', async (ctx) => {
	await service.loginAnonymous()
		.then((token) => ctx.body = reply('s', { 'token': token }))
		.catch(err => {
			ctx.status = 412;
			ctx.body = reply('e', { 'e': err });
		});
});

userManager.post('/getPermission', async (ctx) => {
	let body = ctx.request.body;

	// validate result
	let bodyValidate = validateObject(body, 'id');

	// fields validation
	if (!bodyValidate.isValid) {
		ctx.status = 412;
		ctx.body = reply('e', { 'e': bodyValidate.requires });
		return;
	}

	let query = { _id: body.id };

	let permission = await global.services.dataProvider.getCollection('cms', 'permission')
		.findOne(query)
		.catch(err => {
			ctx.status = 412;
			ctx.body = reply('e', { 'e': err });
		});

	ctx.body = reply('s', { 'permission': permission });
});

module.exports.name = name;
module.exports.main = userManager;
```