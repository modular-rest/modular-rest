/**
 * Permission type string literal type
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
 * Class representing an access definition.
 */
export class AccessDefinition {
  database: string;
  collection: string;
  permissionList: Permission[];

  /**
   * Create an access definition.
   * @param options - The options for the access definition.
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
 * Class representing a permission.
 */
export class Permission {
  type: PermissionType;
  read: boolean;
  write: boolean;
  onlyOwnData: boolean;
  ownerIdField: string;

  /**
   * Create a permission.
   * @param options - The options for the permission.
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
 * Class representing different types of permissions.
 * Each static getter returns a string that represents a specific type of permission.
 */
export class PermissionTypes {
  /**
   * Get the string representing god access permission type.
   * @return The god access permission type.
   */
  static get god_access(): string {
    return 'god_access';
  }

  /**
   * Get the string representing advanced settings permission type.
   * @return The advanced settings permission type.
   */
  static get advanced_settings(): string {
    return 'advanced_settings';
  }

  /**
   * Get the string representing user access permission type.
   * @return The user access permission type.
   */
  static get user_access(): string {
    return 'user_access';
  }

  /**
   * Get the string representing upload file access permission type.
   * @return The upload file access permission type.
   */
  static get upload_file_access(): string {
    return 'upload_file_access';
  }

  /**
   * Get the string representing remove file access permission type.
   * @return The remove file access permission type.
   */
  static get remove_file_access(): string {
    return 'remove_file_access';
  }
}

/**
 * Class representing a permission group.
 */
export class PermissionGroup {
  title: string;
  isDefault: boolean;
  isAnonymous: boolean;
  validPermissionTypes: PermissionType[];

  /**
   * Create a permission group.
   * @param options - The options for the permission group.
   * @return The created permission group.
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
 * Class representing access types.
 */
export class AccessTypes {
  static get read(): string {
    return 'read';
  }

  static get write(): string {
    return 'write';
  }
}
