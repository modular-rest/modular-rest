export = CollectionDefinition;
/**
 * @typedef {import('./security.js').Permission} Permission
 * @typedef {import('./database_trigger.js')} DatabaseTrigger
 */
declare class CollectionDefinition {
    /**
     * This class helps to create a mongoose collection
     * associated with permissions and triggers.
     *
     * @class
     * @param {Object} option
     * @param {string} option.db - Database name
     * @param {string} option.collection - Collection name
     * @param {Object} option.schema - Mongoose schema
     * @param {Array<Permission>} option.permissions - A list of permissions for this collection
     * @param {Array<DatabaseTrigger>=} option.triggers - A database trigger
     */
    constructor({ db, collection, schema, permissions, triggers }: {
        db: string;
        collection: string;
        schema: any;
        permissions: Array<Permission>;
        triggers?: Array<DatabaseTrigger> | undefined;
    });
    database: string;
    collection: string;
    schema: any;
    permissions: import("./security.js").Permission[];
    triggers: import("./database_trigger.js")[];
}
declare namespace CollectionDefinition {
    export { Permission, DatabaseTrigger };
}
type Permission = import('./security.js').Permission;
type DatabaseTrigger = import('./database_trigger.js');
