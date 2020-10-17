module.exports = class ComponentCollection
{
    /**
     * a constructor for create a mongodb collection.
     * 
     * @param {object} option
     * @param {string} option.db database name
     * @param {string} option.collection collection name
     * @param {object} option.schema mongoose schema
     * @param {array} option.permissions a list of Permission for this collection 
     */
    constructor({db, collection, schema, permissions})
    {
        // string
        this.database = db;
        // string
        this.collection = collection;
        // schema object of mongoose
        this.schema = schema;
        // a list of Permission for this collection
        this.permissions = permissions;
    }
}