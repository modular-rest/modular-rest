/**
 * `DatabaseTrigger` is a class that defines a callback to be called on a specific database transaction.
 *
 * @class
 */
class DatabaseTrigger {
  /**
   * Creates a new instance of `DatabaseTrigger`.
   *
   * @param {'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate'} operation - The operation to be triggered. Supported operations are:
   * @param {function(query, queryResult)} callback - The callback to be called when the operation is executed.
   */
  constructor(operation, callback = (query, queryResult) => {}) {
    this.operation = operation;
    this.callback = callback;
  }
}

module.exports = DatabaseTrigger;
