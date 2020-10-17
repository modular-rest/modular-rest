class AccessDefinition
{
    constructor({database, collection, permissionList})
    {
        this.database = database;
        this.collection = collection;
        this.permissionList = permissionList;
    }
}

class Permission
{
    constructor({type, read=true, write=false, onlyOwnData=false})
    {
        this.type = type;
        this.read = read;
        this.write = write;
        /**
         * If true users can perform CRUD on documents that they created already.
         */
        this.onlyOwnData = onlyOwnData;
    }
}

class PermissionTypes
{
    static get customer_access    () { return 'customer_access' };
    static get anonymous_access   () { return 'anonymous_access' };
    static get advanced_settings  () { return 'advanced_settings' };
    static get content_producer   () { return 'content_producer' };
    static get user_manager       () { return 'user_manager' };
}

class operationTypes 
{
    static get read() { return 'read' };
    static get write() { return 'write' };
}

module.exports = {
    AccessDefinition, Permission, PermissionTypes, operationTypes
}