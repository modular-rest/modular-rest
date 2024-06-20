/**
 * `CmsTrigger` is a class that defines a callback to be called on a specific database transaction.
 *
 * @class
 */
class CmsTrigger {
  /**
   * Creates a new instance of `CmsTrigger`.
   *
   * @param {'update-one' | 'insert-one' | 'remove-one' } operation - The operation to be triggered.
   * @param {function({query: any, queryResult: any}): void} [callback=(context) => {}] - The callback to be called when the operation is executed. The callback function takes an object as parameter with two properties: 'query' and 'queryResult'.
   * @constructor
   */
  constructor(operation, callback = (context) => {}) {
    this.operation = operation;
    this.callback = callback;
  }
}

module.exports = CmsTrigger;
