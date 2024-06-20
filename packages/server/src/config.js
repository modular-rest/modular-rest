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
 *   staticPath?: {
 *      rootDir?: string; // Root directory of your static files.
 *      rootPath?: string; // Root path of your static files.
 *      notFoundFile?: string; // Not found file.
 *      log?: boolean; // Log requests to console.
 *      last?: boolean; // Don't execute any downstream middleware.
 *      maxage?: number; // Browser cache max-age in milliseconds.
 *      hidden?: boolean; // Allow transfer of hidden files.
 *      gzip?: boolean; // Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested file exists.
 *      brotli?: boolean; // Try to serve the brotli version of a file automatically when brotli is supported by a client and if the requested file exists.
 *      index?: string; // Index file.
 *   };
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
