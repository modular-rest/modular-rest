export type PermissionType = ('god_access' | 'user_access' | 'upload_file_access' | 'remove_file_access' | 'anonymous_access' | 'advanced_settings' | string);
/**
 * Class representing an access definition.
 */
export class AccessDefinition {
    /**
     * Create an access definition.
     * @param {Object} options - The options for the access definition.
     * @param {string} options.database - The name of the database.
     * @param {string} options.collection - The name of the collection.
     * @param {Array.<Permission>} options.permissionList - The list of permissions.
     */
    constructor({ database, collection, permissionList }: {
        database: string;
        collection: string;
        permissionList: Array<Permission>;
    });
    database: string;
    collection: string;
    permissionList: Permission[];
}
/**
 * @typedef {('god_access'|'user_access'|'upload_file_access'|'remove_file_access'|'anonymous_access'|'advanced_settings'|string)} PermissionType
 */
/**
 * Class representing a permission.
 */
export class Permission {
    /**
     * Create a permission.
     * @param {Object} options - The options for the permission.
     * @param {PermissionType} options.type - The type of the permission.
     * @param {boolean} [options.read=false] - The read access of the permission.
     * @param {boolean} [options.write=false] - The write access of the permission.
     * @param {boolean} [options.onlyOwnData=false] - If true, users can perform CRUD on documents that they created already.
     * @param {string} [options.ownerIdField='refId'] - The name of the field that contains the owner's id of the document.
     */
    constructor({ type, read, write, onlyOwnData, ownerIdField, }: {
        type: PermissionType;
        read?: boolean;
        write?: boolean;
        onlyOwnData?: boolean;
        ownerIdField?: string;
    });
    type: string;
    read: boolean;
    write: boolean;
    onlyOwnData: boolean;
    ownerIdField: string;
}
/**
 * Class representing different types of permissions.
 * Each static getter returns a string that represents a specific type of permission.
 */
export class PermissionTypes {
    /**
     * Get the string representing god access permission type.
     * @return {string} The god access permission type.
     */
    static get god_access(): string;
    /**
     * Get the string representing advanced settings permission type.
     * @return {string} The advanced settings permission type.
     */
    static get advanced_settings(): string;
    /**
     * Get the string representing user access permission type.
     * @return {string} The user access permission type.
     */
    static get user_access(): string;
    /**
     * Get the string representing upload file access permission type.
     * @return {string} The upload file access permission type.
     */
    static get upload_file_access(): string;
    /**
     * Get the string representing remove file access permission type.
     * @return {string} The remove file access permission type.
     */
    static get remove_file_access(): string;
}
export class PermissionGroup {
    /**
     * Create a permission group.
     * @param {Object} options - The options for the permission group.
     * @param {string} options.title - The title of the permission group.
     * @param {boolean} [options.isDefault=false] - If true, the permission group is the default permission group.
     * @param {boolean} [options.isAnonymous=false] - If true, the permission group is the anonymous permission group.
     * @param {Array.<PermissionType>} [options.validPermissionTypes=[]] - The valid permission types of the permission group.
     * @return {PermissionGroup} The created permission group.
     */
    constructor({ title, isDefault, isAnonymous, validPermissionTypes, }: {
        title: string;
        isDefault?: boolean;
        isAnonymous?: boolean;
        validPermissionTypes?: Array<PermissionType>;
    });
    title: string;
    isDefault: boolean;
    isAnonymous: boolean;
    validPermissionTypes: string[];
}
/**
 * Class representing access types.
 */
export class AccessTypes {
    static get read(): string;
    static get write(): string;
}
