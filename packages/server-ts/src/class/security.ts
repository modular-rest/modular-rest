/**
 * Permission type string literal type
 * @typedef {('god_access' | 'user_access' | 'upload_file_access' | 'remove_file_access' | 'anonymous_access' | 'advanced_settings' | string)} PermissionType
 */
export type PermissionType =
  | 'god_access'
  | 'user_access'
  | 'upload_file_access'
  | 'remove_file_access'
  | 'anonymous_access'
  | 'advanced_settings'
  | string;

/**
 * Defines access control for a specific database collection
 * @class AccessDefinition
 * @property {string} database - The name of the database
 * @property {string} collection - The name of the collection
 * @property {Permission[]} permissionList - List of permissions for the collection
 * @example
 * ```typescript
 * const access = new AccessDefinition({
 *   database: 'myapp',
 *   collection: 'users',
 *   permissionList: [
 *     new Permission({
 *       type: 'user_access',
 *       read: true,
 *       write: true
 *     })
 *   ]
 * });
 * ```
 */
export class AccessDefinition {
  database: string;
  collection: string;
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
 * Defines a permission for accessing data
 * @class Permission
 * @property {PermissionType} type - The type of permission
 * @property {boolean} read - Whether read access is granted
 * @property {boolean} write - Whether write access is granted
 * @property {boolean} onlyOwnData - Whether access is limited to own data
 * @property {string} ownerIdField - Field name for owner identification
 * @example
 * ```typescript
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
  type: PermissionType;
  read: boolean;
  write: boolean;
  onlyOwnData: boolean;
  ownerIdField: string;

  /**
   * Creates a new Permission instance
   * @param {Object} options - Configuration options
   * @param {PermissionType} options.type - The type of permission
   * @param {boolean} [options.read=false] - Whether read access is granted
   * @param {boolean} [options.write=false] - Whether write access is granted
   * @param {boolean} [options.onlyOwnData=false] - Whether access is limited to own data
   * @param {string} [options.ownerIdField='refId'] - Field name for owner identification
   */
  constructor({
    type,
    read = false,
    write = false,
    onlyOwnData = false,
    ownerIdField = 'refId',
  }: {
    type: PermissionType;
    read?: boolean;
    write?: boolean;
    onlyOwnData?: boolean;
    ownerIdField?: string;
  }) {
    this.type = type;
    this.read = read;
    this.write = write;
    this.onlyOwnData = onlyOwnData;
    this.ownerIdField = ownerIdField;
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
  static get god_access(): string {
    return 'god_access';
  }

  /**
   * Get the string representing advanced settings permission type
   * @returns {string} The advanced settings permission type
   */
  static get advanced_settings(): string {
    return 'advanced_settings';
  }

  /**
   * Get the string representing user access permission type
   * @returns {string} The user access permission type
   */
  static get user_access(): string {
    return 'user_access';
  }

  /**
   * Get the string representing upload file access permission type
   * @returns {string} The upload file access permission type
   */
  static get upload_file_access(): string {
    return 'upload_file_access';
  }

  /**
   * Get the string representing remove file access permission type
   * @returns {string} The remove file access permission type
   */
  static get remove_file_access(): string {
    return 'remove_file_access';
  }
}

/**
 * Defines a group of permissions with common characteristics
 * @class PermissionGroup
 * @property {string} title - The title of the permission group
 * @property {boolean} isDefault - Whether this is a default group
 * @property {boolean} isAnonymous - Whether this group is for anonymous users
 * @property {PermissionType[]} validPermissionTypes - List of valid permission types
 * @example
 * ```typescript
 * const group = new PermissionGroup({
 *   title: 'Admin',
 *   isDefault: true,
 *   validPermissionTypes: ['god_access', 'advanced_settings']
 * });
 * ```
 */
export class PermissionGroup {
  title: string;
  isDefault: boolean;
  isAnonymous: boolean;
  validPermissionTypes: PermissionType[];

  /**
   * Creates a new PermissionGroup instance
   * @param {Object} options - Configuration options
   * @param {string} options.title - The title of the group
   * @param {boolean} [options.isDefault=false] - Whether this is a default group
   * @param {boolean} [options.isAnonymous=false] - Whether this group is for anonymous users
   * @param {PermissionType[]} [options.validPermissionTypes=[]] - List of valid permission types
   */
  constructor({
    title,
    isDefault = false,
    isAnonymous = false,
    validPermissionTypes = [],
  }: {
    title: string;
    isDefault?: boolean;
    isAnonymous?: boolean;
    validPermissionTypes?: PermissionType[];
  }) {
    this.title = title;
    this.isDefault = isDefault;
    this.isAnonymous = isAnonymous;
    this.validPermissionTypes = validPermissionTypes;
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
