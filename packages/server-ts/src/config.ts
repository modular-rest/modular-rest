import Koa from 'koa';
import koaStatic from 'koa-static';
import { Options as CorsOptions } from '@koa/cors';
import { CollectionDefinition } from './class/collection_definition';
import { PermissionGroup } from './class/security';
import { CmsTrigger } from './class/cms_trigger';
import { DatabaseTrigger } from './class/database_trigger';

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
 * JWT keypair configuration
 * @interface KeyPair
 * @property {string} private - Private key for JWT signing
 * @property {string} public - Public key for JWT verification
 */
interface KeyPair {
  private: string;
  public: string;
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
 * Global configuration interface for the REST API
 * @interface Config
 * @property {CorsOptions} [cors] - CORS configuration options
 * @property {string} [modulesPath] - Path to custom modules directory
 * @property {string} [uploadDirectory] - Directory for file uploads
 * @property {any} [koaBodyOptions] - Options for koa-body middleware
 * @property {StaticPathOptions} [staticPath] - Static file serving options
 * @property {Function} [onBeforeInit] - Hook called before initialization
 * @property {Function} [onAfterInit] - Hook called after initialization
 * @property {number} [port] - Port to listen on
 * @property {boolean} [dontListen] - Don't start the server
 * @property {MongoOptions} [mongo] - MongoDB connection options
 * @property {KeyPair} [keypair] - JWT keypair for authentication
 * @property {AdminUser} [adminUser] - Admin user configuration
 * @property {Function} [verificationCodeGeneratorMethod] - Custom verification code generator
 * @property {CollectionDefinition[]} [collectionDefinitions] - Custom collection definitions
 * @property {PermissionGroup[]} [permissionGroups] - Custom permission groups
 * @property {DatabaseTrigger[]} [authTriggers] - Authentication triggers
 * @property {CmsTrigger[]} [fileTriggers] - File handling triggers
 * @property {any[]} [functions] - Custom API functions
 */
export interface Config {
  cors?: CorsOptions;
  modulesPath?: string;
  uploadDirectory?: string;
  koaBodyOptions?: any;
  staticPath?: StaticPathOptions;
  onBeforeInit?: (koaApp: Koa) => void;
  onAfterInit?: (koaApp: Koa) => void;
  port?: number;
  dontListen?: boolean;
  mongo?: MongoOptions;
  keypair?: KeyPair;
  adminUser?: AdminUser;
  verificationCodeGeneratorMethod?: () => string;
  collectionDefinitions?: CollectionDefinition[];
  permissionGroups?: PermissionGroup[];
  authTriggers?: DatabaseTrigger[];
  fileTriggers?: CmsTrigger[];
  functions?: any[];
}

/**
 * Global configuration object
 * @type {Config}
 */
export const config: Config = {};

/**
 * Updates the global configuration with new options
 * @param {Config} options - New configuration options to merge
 * @example
 * ```typescript
 * setConfig({
 *   port: 3000,
 *   mongo: {
 *     mongoBaseAddress: 'mongodb://localhost:27017',
 *     dbPrefix: 'myapp_'
 *   }
 * });
 * ```
 */
export function setConfig(options: Config): void {
  Object.assign(config, options);
}
