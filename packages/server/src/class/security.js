/**
 * Class representing an access definition.
 */
class AccessDefinition {
  /**
   * Create an access definition.
   * @param {Object} options - The options for the access definition.
   * @param {string} options.database - The name of the database.
   * @param {string} options.collection - The name of the collection.
   * @param {Array.<Permission>} options.permissionList - The list of permissions.
   */
  constructor({ database, collection, permissionList }) {
    this.database = database;
    this.collection = collection;
    this.permissionList = permissionList;
  }
}

/**
 * @typedef {('god_access'|'user_access'|'upload_file_access'|'remove_file_access'|'anonymous_access')} PermissionType
 */

/**
 * Class representing a permission.
 */
class Permission {
  /**
   * Create a permission.
   * @param {Object} options - The options for the permission.
   * @param {PermissionType} options.type - The type of the permission.
   * @param {boolean} [options.read=false] - The read access of the permission.
   * @param {boolean} [options.write=false] - The write access of the permission.
   * @param {boolean} [options.onlyOwnData=false] - If true, users can perform CRUD on documents that they created already.
   */
  constructor({ type, read = false, write = false, onlyOwnData = false }) {
    this.type = type;
    this.read = read;
    this.write = write;
    this.onlyOwnData = onlyOwnData;
  }
}

/**
 * Class representing different types of permissions.
 * Each static getter returns a string that represents a specific type of permission.
 */
class PermissionTypes {
  /**
   * Create permission types.
   * Each property represents a specific type of permission.
   */
  constructor() {
    this.god_access = "god_access"; // Represents god access permission type
    this.user_access = "user_access"; // Represents user access permission type
    this.upload_file_access = "upload_file_access"; // Represents upload file access permission type
    this.remove_file_access = "remove_file_access"; // Represents remove file access permission type
    this.anonymous_access = "anonymous_access"; // Represents anonymous access permission type
  }

  /**
   * Get the string representing god access permission type.
   * @return {string} The god access permission type.
   */
  static get god_access() {
    return "god_access";
  }

  /**
   * Get the string representing user access permission type.
   * @return {string} The user access permission type.
   */
  static get user_access() {
    return "user_access";
  }

  /**
   * Get the string representing upload file access permission type.
   * @return {string} The upload file access permission type.
   */
  static get upload_file_access() {
    return "upload_file_access";
  }

  /**
   * Get the string representing remove file access permission type.
   * @return {string} The remove file access permission type.
   */
  static get remove_file_access() {
    return "remove_file_access";
  }

  /**
   * Get the string representing anonymous access permission type.
   * @return {string} The anonymous access permission type.
   */
  static get anonymous_access() {
    return "anonymous_access";
  }
}

/**
 * Class representing access types.
 */
class AccessTypes {
  static get read() {
    return "read";
  }
  static get write() {
    return "write";
  }
}

module.exports = {
  AccessDefinition,
  Permission,
  PermissionTypes,
  AccessTypes,
};
