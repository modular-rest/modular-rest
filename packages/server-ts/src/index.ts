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

/**
 * @description Creates a new REST API instance
 * @example
 * ```typescript
 * const rest = createRest();
 * ```
 * @returns A new REST API instance
 */
export { createRest };

/**
 * @description Defines collection structure and behavior
 * @example
 * ```typescript
 * const collection = new CollectionDefinition({
 *   db: 'users',
 *   name: 'info'
 * });
 * ```
 */
export { CollectionDefinition };

/**
 * @description Provides predefined database schemas
 * @example
 * ```typescript
 * const userSchema = new Schema({
 *   name: String,
 *   avatar: Schemas.file
 * });
 * ```
 */
export { Schemas };

/**
 * @description Mongoose Schema class for defining data models
 */
export { Schema };

/**
 * @description Handles database triggers and events
 * @example
 * ```typescript
 * const trigger = new DatabaseTrigger('insert-one', (data) => {
 *   // Handle insert event
 * });
 * ```
 */
export { DatabaseTrigger };

/**
 * @description Handles CMS triggers and events
 */
export { CmsTrigger };

/**
 * @description Security and access control definitions
 * @example
 * ```typescript
 * const permission = new Permission({
 *   type: 'user_access',
 *   read: true,
 *   write: true
 * });
 * ```
 */
export { AccessDefinition, Permission, PermissionTypes, PermissionGroup, AccessTypes };

/**
 * @description Defines custom functions for the API
 * @example
 * ```typescript
 * defineFunction('sendEmail', async (data) => {
 *   // Send email logic
 * });
 * ```
 */
export { defineFunction };

/**
 * @description Type casting utilities for data transformation
 */
export { TypeCasters };

/**
 * @description Input validation utilities
 */
export { validator };

/**
 * @description Response handling utilities
 */
export { reply };

/**
 * @description Pagination utilities
 */
export { paginator };

/**
 * @description Database collection access utilities
 */
export { getCollection };

/**
 * @description File handling utilities
 * @example
 * ```typescript
 * const file = await getFile('fileId');
 * const link = getFileLink('fileId');
 * ```
 */
export { getFile, getFileLink, getFilePath, removeFile, storeFile };

/**
 * @description Middleware utilities
 */
export { middleware };

/**
 * @description User management utilities
 * @example
 * ```typescript
 * const user = await userManager.getUserById('userId');
 * ```
 */
export { userManager };
