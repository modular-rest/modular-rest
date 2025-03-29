import { DatabaseOperation } from './database_trigger';

/**
 * Trigger interface for internal use
 */
interface Trigger {
  operation: DatabaseOperation;
  database: string;
  collection: string;
  callback: (data: any) => void;
}

/**
 * Class for operating with database triggers
 */
class TriggerOperator {
  private triggers: Trigger[] = [];

  constructor() {}

  /**
   * Add a collection trigger
   * @param trigger - Database trigger object
   */
  addTrigger(trigger: Trigger): void {
    this.triggers.push(trigger);
  }

  /**
   * Call a trigger
   * @param operation - Operation name
   * @param database - Database name
   * @param collection - Collection name
   * @param data - Data to pass to trigger callback
   */
  call(operation: DatabaseOperation, database: string, collection: string, data: any): void {
    this.triggers.forEach(trigger => {
      if (
        operation === trigger.operation &&
        database === trigger.database &&
        collection === trigger.collection &&
        trigger.callback
      )
        trigger.callback(data);
    });
  }

  static get instance(): TriggerOperator {
    return instance;
  }
}

const instance = new TriggerOperator();
export = instance;
