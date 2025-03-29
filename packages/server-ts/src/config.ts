import Koa from 'koa';
import koaStatic from 'koa-static';
import { Options as CorsOptions } from '@koa/cors';
import { CollectionDefinition } from './class/collection_definition';
import { PermissionGroup } from './class/security';
import { CmsTrigger } from './class/cms_trigger';
import { DatabaseTrigger } from './class/database_trigger';

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

interface MongoOptions {
  dbPrefix: string;
  mongoBaseAddress: string;
  addressMap?: string;
}

interface KeyPair {
  private: string;
  public: string;
}

interface AdminUser {
  email: string;
  password: string;
}

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

export const config: Config = {};

export function setConfig(options: Config): void {
  Object.assign(config, options);
}
