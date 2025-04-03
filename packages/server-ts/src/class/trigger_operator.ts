import { DatabaseOperation } from './database_trigger';

/**
 * Interface defining a database trigger
 * @interface Trigger
 * @property {DatabaseOperation} operation - The database operation that triggers this callback
 * @property {string} database - The database name to monitor
 * @property {string} collection - The collection name to monitor
 * @property {(data: any) => void} callback - Function to execute when trigger conditions are met
 * @example
 * ```typescript
 * const trigger: Trigger = {
 *   operation: 'insert',
 *   database: 'myDB',
 *   collection: 'users',
 *   callback: (data) => {
 *     console.log('New user inserted:', data);
 *   }
 * };
 * ```
 */
interface Trigger {
  operation: DatabaseOperation;
  database: string;
  collection: string;
  callback: (data: any) => void;
}

/**
 * Singleton class for managing database triggers
 * Provides functionality to add and execute triggers based on database operations
 * @class TriggerOperator
 * @example
 * ```typescript
 * // Add a trigger for user insertions
 * TriggerOperator.instance.addTrigger({
 *   operation: 'insert',
 *   database: 'myDB',
 *   collection: 'users',
 *   callback: (data) => {
 *     console.log('New user inserted:', data);
 *   }
 * });
 * ```
 */
class TriggerOperator {
  private triggers: Trigger[] = [];
  private static _instance: TriggerOperator | null = null;

  private constructor() {}

  /**
   * Gets the singleton instance of TriggerOperator
   * @static
   * @returns {TriggerOperator} The singleton instance
   */
  static get instance(): TriggerOperator {
    if (!TriggerOperator._instance) {
      TriggerOperator._instance = new TriggerOperator();
    }
    return TriggerOperator._instance;
  }

  /**
   * Adds a new trigger to the registry
   * @param {Trigger} trigger - The trigger configuration to add
   * @throws {Error} If trigger is invalid or already exists
   * @example
   * ```typescript
   * // Add a trigger for document updates
   * TriggerOperator.instance.addTrigger({
   *   operation: 'update',
   *   database: 'myDB',
   *   collection: 'documents',
   *   callback: (data) => {
   *     console.log('Document updated:', data);
   *   }
   * });
   * ```
   */
  addTrigger(trigger: Trigger): void {
    // Validate trigger
    if (!trigger.operation || !trigger.database || !trigger.collection || !trigger.callback) {
      throw new Error('Invalid trigger configuration');
    }

    // Check for duplicate triggers
    const exists = this.triggers.some(
      t =>
        t.operation === trigger.operation &&
        t.database === trigger.database &&
        t.collection === trigger.collection
    );

    if (exists) {
      throw new Error(
        `Trigger already exists for operation ${trigger.operation} on ${trigger.database}.${trigger.collection}`
      );
    }

    this.triggers.push(trigger);
  }

  /**
   * Executes all matching triggers for a given database operation
   * @param {DatabaseOperation} operation - The database operation that occurred
   * @param {string} database - The database where the operation occurred
   * @param {string} collection - The collection where the operation occurred
   * @param {any} data - The data associated with the operation
   * @example
   * ```typescript
   * // This would typically be called by the database layer
   * TriggerOperator.instance.call(
   *   'insert',
   *   'myDB',
   *   'users',
   *   { id: 1, name: 'John' }
   * );
   * ```
   */
  call(operation: DatabaseOperation, database: string, collection: string, data: any): void {
    this.triggers.forEach(trigger => {
      if (
        operation === trigger.operation &&
        database === trigger.database &&
        collection === trigger.collection &&
        trigger.callback
      ) {
        try {
          trigger.callback(data);
        } catch (error) {
          console.error(
            `Error executing trigger for ${operation} on ${database}.${collection}:`,
            error
          );
        }
      }
    });
  }
}

export = TriggerOperator.instance;
