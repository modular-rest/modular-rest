/**
 * Type for database operations that can trigger a callback
 */
export type DatabaseOperation =
  | 'find'
  | 'find-one'
  | 'count'
  | 'update-one'
  | 'insert-one'
  | 'remove-one'
  | 'aggregate';

/**
 * Context interface for database trigger callbacks
 * @interface DatabaseTriggerContext
 * @property {Record<string, any>} doc - The document data for insert/update operations
 * @property {Record<string, any>} query - The query data for find/find-one operations
 * @property {Record<string, any>} update - The update data for update operations
 * @property {Record<string, any>[]} pipelines - The aggregation pipelines for aggregate operations
 * @property {Record<string, any> } queryResult - The result of the database operation
 */
export interface DatabaseTriggerContext {
  doc?: Record<string, any>;
  query?: Record<string, any>;
  update?: Record<string, any>;
  pipelines?: Record<string, any>[];
  queryResult: Record<string, any>;
}

/**
 * The callback function to be executed on specific database operations
 * @param {DatabaseTriggerContext} context - The context of the database operation
 * @example
 * ```typescript
 * const trigger = new DatabaseTrigger('insert-one', (context) => {
 *   console.log('New document inserted:', context.queryResult);
 * });
 * ```
 */
type DatabaseTriggerCallback = (context: DatabaseTriggerContext) => void;

/**
 * in a complex application, you may need to perform additional actions after a database operation.
 * this is where DatabaseTrigger comes in. so you can define a callback to be executed on specific database operations for a collection.
 *
 * Supported triggers are:
 *
 * | Trigger      | Description                                                  |
 * | ------------ | ------------------------------------------------------------ |
 * | `find`       | Triggered when a find query is executed on collection.       |
 * | `find-one`   | Triggered when a find one query is executed on collection.   |
 * | `count`      | Triggered when a count query is executed on collection.      |
 * | `update-one` | Triggered when a update one query is executed on collection. |
 * | `insert-one` | Triggered when a insert one query is executed on collection. |
 * | `remove-one` | Triggered when a remove one query is executed on collection. |
 * | `aggregate`  | Triggered when a aggregate query is executed on collection.  |
 *
 * @property {DatabaseOperation} operation - The database operation that triggers the callback
 * @property {DatabaseTriggerCallback} callback - The callback function to be executed
 *
 * @example
 * ```typescript
 * import { DatabaseTrigger } from '@server-ts/database';
 *
 * const trigger = new DatabaseTrigger('insert-one', ({ query, queryResult }) => {
 *   console.log('New document inserted:', queryResult);
 *
 *   try {
 *     // Perform additional actions after document insertion
 *   } catch (error) {
 *     console.error('Error performing additional actions:', error);
 *   }
 * });
 *
 * // Use the trigger in a collection definition
 * const collection = new CollectionDefinition({
 *   triggers: [trigger]
 * });
 * ```
 */
export class DatabaseTrigger {
  operation: DatabaseOperation;
  callback: (context: DatabaseTriggerContext) => void;

  /**
   * @hidden
   *
   * Creates a new DatabaseTrigger instance
   * @param {DatabaseOperation} operation - The database operation to trigger on
   * @param {DatabaseTriggerCallback} [callback=() => {}] - The callback function to execute
   *
   * @example
   * ```typescript
   * const trigger = new DatabaseTrigger('insert-one', (context) => {
   *   console.log('New document inserted:', context.queryResult);
   * });
   *
   */
  constructor(operation: DatabaseOperation, callback: DatabaseTriggerCallback = () => {}) {
    this.operation = operation;
    this.callback = callback;
  }
}

export default DatabaseTrigger;
