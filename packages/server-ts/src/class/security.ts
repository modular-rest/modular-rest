/**
 * Permission type string literal type that defines various access levels and capabilities
 
 * @inline
 */
export type AccessType =
  | 'god_access'
  | 'user_access'
  | 'upload_file_access'
  | 'remove_file_access'
  | 'anonymous_access'
  | 'advanced_settings'
  | string;

/**
 * Defines access control for a specific database collection
 *
 * @internal
 */
export class AccessDefinition {
  /** @hidden */
  database: string;
  /** @hidden */
  collection: string;
  /** @hidden */
  permissionList: Permission[];

  /**
   * Creates a new AccessDefinition instance
   * @param {Object} options - Configuration options
   * @param {string} options.database - The name of the database
   * @param {string} options.collection - The name of the collection
   * @param {Permission[]} options.permissionList - List of permissions
   */
  constructor({
    database,
    collection,
    permissionList,
  }: {
    database: string;
    collection: string;
    permissionList: Permission[];
  }) {
    this.database = database;
    this.collection = collection;
    this.permissionList = permissionList;
  }
}

/**
 * Defines a permission for accessing data within the system. This class is a fundamental component used in both the {@link defineCollection} method and {@link CollectionDefinition} class
 * by specifying which permission types can interact with them. The permission system matches a user's assigned permission types against
 * the collection's permissions to determine access levels. For example, a collection can allow read access for 'user_access' while
 * restricting writes to 'advanced_settings' permissions.
 *
 * @remark
 * {@include ../../docs/system-access-type.md}
 *
 * @example
 * ```typescript
 * import { Permission } from '@modular-rest/server';
 *
 * const permission = new Permission({
 *   type: 'user_access',
 *   read: true,
 *   write: true,
 *   onlyOwnData: true,
 *   ownerIdField: 'userId'
 * });
 * ```
 */
export class Permission {
  /** @hidden */
  accessType: AccessType;
  /** @hidden */
  read: boolean;
  /** @hidden */
  write: boolean;
  /** @hidden */
  onlyOwnData: boolean;
  /** @hidden */
  ownerIdField: string;

  /**
   * Creates a new Permission instance
   * @param {Object} options - Configuration options
   *
   * @param {AccessType} options.type - The type of permission,system defined or custom. check the **Remarks section** for more information.
   *
   * @param {boolean} [options.read=false] - Whether read access is granted
   * @param {boolean} [options.write=false] - Whether write access is granted
   * @param {boolean} [options.onlyOwnData=false] - Whether access is limited to own data
   * @param {string} [options.ownerIdField='refId'] - Field name for owner identification
   */
  constructor({
    accessType: type,
    read = false,
    write = false,
    onlyOwnData = false,
    ownerIdField = 'refId',
  }: {
    accessType: AccessType;
    read?: boolean;
    write?: boolean;
    onlyOwnData?: boolean;
    ownerIdField?: string;
  }) {
    this.accessType = type;
    this.read = read;
    this.write = write;
    this.onlyOwnData = onlyOwnData;
    this.ownerIdField = ownerIdField;
  }
}

/**
 * A comprehensive access control mechanism that manages user permissions through grouped access types.
 *
 * Permission groups are a fundamental security concept that define and enforce what actions users
 * can perform within the system. They provide a flexible and maintainable way to handle authorization
 * by grouping related access types together.
 *
 * These groups enable users to:
 * 1. Read and write data from collections that match their access types, allowing granular control
 *    over database operations
 * 2. Execute specific functions that require matching access types, ensuring that sensitive
 *    operations are only performed by authorized users
 * 3. Perform custom developer-defined actions by validating against the user's access types,
 *    enabling extensible permission-based features
 *
 * Permission groups can be configured as default groups for new users or anonymous groups for
 * unauthenticated access, providing a complete authorization framework.
 *
 * @class PermissionGroup
 * @property {string} title - The title of the permission group
 * @property {boolean} isDefault - This is a default group, on `true` this permission group will be given to any new user automatically.
 * @property {boolean} isAnonymous - This is a anonymous group, on `true` will be used for anonymous users.
 * @property {AccessType[]} allowedAccessTypes - List of valid access types.
 * @example
 * ```typescript
 * const group = new PermissionGroup({
 *   title: 'Admin',
 *   isDefault: true,
 *   allowedAccessTypes: ['god_access', 'advanced_settings']
 * });
 * ```
 */
export class PermissionGroup {
  /** @hidden */
  title: string;
  /** @hidden */
  isDefault: boolean;
  /** @hidden */
  isAnonymous: boolean;
  /** @hidden */
  allowedAccessTypes: AccessType[];

  /**
   * Creates a new PermissionGroup instance
   * @param {Object} options - Configuration options
   * @param {string} options.title - The title of the group
   * @param {boolean} [options.isDefault=false] - Whether this is a default group
   * @param {boolean} [options.isAnonymous=false] - Whether this group is for anonymous users
   * @param {AccessType[]} [options.allowedAccessTypes=[]] - List of valid permission types
   */
  constructor({
    title,
    isDefault = false,
    isAnonymous = false,
    allowedAccessTypes = [],
  }: {
    title: string;
    isDefault?: boolean;
    isAnonymous?: boolean;
    allowedAccessTypes?: AccessType[];
  }) {
    this.title = title;
    this.isDefault = isDefault;
    this.isAnonymous = isAnonymous;
    this.allowedAccessTypes = allowedAccessTypes;
  }
}

/**
 * Provides static access to access type constants
 * @class AccessTypes
 */
export class AccessTypes {
  /**
   * Get the string representing read access type
   * @returns {string} The read access type
   */
  static get read(): string {
    return 'read';
  }

  /**
   * Get the string representing write access type
   * @returns {string} The write access type
   */
  static get write(): string {
    return 'write';
  }
}

/**
 * Provides static access to permission type constants
 * @class PermissionTypes
 */
export class PermissionTypes {
  /**
   * Get the string representing god access permission type
   * @returns {string} The god access permission type
   */
  static get god_access(): AccessType {
    return 'god_access';
  }

  /**
   * Get the string representing advanced settings permission type
   * @returns {string} The advanced settings permission type
   */
  static get advanced_settings(): AccessType {
    return 'advanced_settings';
  }

  /**
   * Get the string representing user access permission type
   * @returns {string} The user access permission type
   */
  static get user_access(): AccessType {
    return 'user_access';
  }

  /**
   * Get the string representing upload file access permission type
   * @returns {string} The upload file access permission type
   */
  static get upload_file_access(): AccessType {
    return 'upload_file_access';
  }

  /**
   * Get the string representing remove file access permission type
   * @returns {string} The remove file access permission type
   */
  static get remove_file_access(): AccessType {
    return 'remove_file_access';
  }
}
