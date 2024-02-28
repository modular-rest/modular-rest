class TriggerOperator {
  constructor() {
    this.triggers = [];
  }

  /**
   * add a collection trigger
   * @param {object} trigger DatabaseTrigger object
   */
  addTrigger(trigger) {
    this.triggers.push(trigger);
  }

  /**
   * Call a trigger
   * @param {'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate'} operation operation name
   * @param {string} database database name
   * @param {string} collection collection name
   * @param {string} data
   */
  call(operation, database, collection, data) {
    this.triggers.forEach((trigger) => {
      if (
        operation == trigger.operation &&
        database == trigger.database &&
        collection == trigger.collection &&
        trigger.callback
      )
        trigger.callback(data);
    });
  }

  static get instance() {
    return instance;
  }
}

const instance = new TriggerOperator();
module.exports = TriggerOperator.instance;
