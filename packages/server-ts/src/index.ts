// Application
import { createRest } from './application';
import { Schema } from 'mongoose';

// Utilities
import * as paginator from './class/paginator';
import * as reply from './class/reply';
import { main as userManager } from './services/user_manager/service';
import { validator } from './class/validator';
import { getCollection } from './services/data_provider/service';
import { defineFunction } from './services/functions/service';
import TypeCasters from './services/data_provider/typeCasters';

import { getFile, getFileLink, getFilePath, removeFile, storeFile } from './services/file/service';

// Base class
import CollectionDefinition from './class/collection_definition';
import Schemas from './class/db_schemas';
import DatabaseTrigger from './class/database_trigger';
import CmsTrigger from './class/cms_trigger';
import {
  AccessDefinition,
  Permission,
  PermissionTypes,
  PermissionGroup,
  AccessTypes,
} from './class/security';
import * as middleware from './middlewares';

export {
  createRest,

  // Database
  CollectionDefinition,
  Schemas,
  Schema,
  DatabaseTrigger,
  CmsTrigger,

  // Security
  AccessDefinition,
  Permission,
  PermissionTypes,
  PermissionGroup,
  AccessTypes,

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
  userManager,
};
