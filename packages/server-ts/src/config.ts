import Koa from 'koa';

import { CollectionDefinition } from './class/collection_definition';
import { PermissionGroup } from './class/security';
import { CmsTrigger } from './class/cms_trigger';
import { DefinedFunction } from './services/functions/service';
import { Options as KoaCorsOptions } from '@koa/cors';
import { Options as KoaStaticOptionsBase } from 'koa-static';

/**
 * The options for the static file server, it's a combination of modular-rest and [koa-static options](https://github.com/koajs/static?tab=readme-ov-file#options)
 */
export interface StaticPathOptions extends KoaStaticOptionsBase {
  /**
   * The actual path of the static files on your server
   */
  actualPath: string;
  /**
   * The path you want to serve the static files from
   */
  path: string;
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
 * @property {KoaCorsOptions} [cors] - CORS configuration [options](https://github.com/koajs/cors?tab=readme-ov-file#corsoptions)
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
export interface RestOptions {
  cors?: KoaCorsOptions;
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
  authTriggers?: CmsTrigger[];
  fileTriggers?: CmsTrigger[];
  functions?: DefinedFunction[];
}

/**
 * Global configuration object
 * @type {RestOptions}
 */
export const config: RestOptions = {};

/**
 * Updates the global configuration with new options
 * @param {RestOptions} options - New configuration options to merge
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
export function setConfig(options: RestOptions): void {
  Object.assign(config, options);
}
