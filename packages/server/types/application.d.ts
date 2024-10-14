export = createRest;
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
declare function createRest(options: {
    cors?: Cors;
    modulesPath?: string;
    uploadDirectory?: string;
    koaBodyOptions?: object;
    staticPath?: {
        rootDir: string;
        rootPath: string;
        maxage?: number;
        hidden?: boolean;
        index?: string;
        defer?: boolean;
        gzip?: boolean;
        br?: boolean;
        setHeaders?: Function;
        extensions?: boolean | any[];
    };
    onBeforeInit?: (koaApp: Koa) => void;
    onAfterInit?: (koaApp: Koa) => void;
    port?: number;
    dontListen?: boolean;
    mongo?: {
        dbPrefix: string;
        mongoBaseAddress: string;
        addressMap?: string;
    };
    keypair?: {
        private: string;
        public: string;
    };
    adminUser?: {
        email: string;
        password: string;
    };
    verificationCodeGeneratorMethod: () => string;
    collectionDefinitions?: CollectionDefinition[];
    permissionGroups?: PermissionGroup[];
    authTriggers?: CmsTrigger[];
    fileTriggers?: CmsTrigger[];
}): Promise<{
    app: Koa;
    server: Server;
}>;
declare namespace createRest {
    export { Koa, server, Cors, PermissionGroup, CmsTrigger };
}
import cors = require("@koa/cors");
type Cors = import('@koa/cors').Options;
type Koa = import('koa');
type PermissionGroup = import('./class/security.js').PermissionGroup;
type CmsTrigger = import('./class/cms_trigger.js');
type server = import('http').Server;
