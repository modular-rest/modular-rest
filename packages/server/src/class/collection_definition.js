/**
 * @typedef {import('./security.js').Permission} Permission
 * @typedef {import('./database_trigger.js')} DatabaseTrigger
 */

class CollectionDefinition {
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
  constructor({ db, collection, schema, permissions, triggers }) {
    // string
    this.database = db;
    // string
    this.collection = collection;
    // schema object of mongoose
    this.schema = schema;
    // a list of Permission for this collection
    this.permissions = permissions;

    this.triggers = triggers;
  }
}

module.exports = CollectionDefinition;
