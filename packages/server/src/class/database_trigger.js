/**
 * `DatabaseTrigger` is a class that defines a callback to be called on a specific database transaction.
 *
 * @class
 */
class DatabaseTrigger {
  /**
   * Creates a new instance of `DatabaseTrigger`.
   *
   * @param {string} operation - The name of the operation on which the callback should be triggered.
   * @param {function} [callback=(query, queryResult) => {}] - The callback function to be triggered. It accepts two parameters:
   * 1. `query` - The query that is being executed.
   * 2. `queryResult` - The result of the query execution.
   */
  constructor(operation, callback = (query, queryResult) => {}) {
    this.operation = operation;
    this.callback = callback;
  }
}

module.exports = DatabaseTrigger;
