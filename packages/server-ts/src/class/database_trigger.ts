/**
 * Type for database operations that can trigger a callback
 * @typedef {('find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate')} DatabaseOperation
 * @description Supported database operations:
 * - 'find': Triggered when finding multiple documents
 * - 'find-one': Triggered when finding a single document
 * - 'count': Triggered when counting documents
 * - 'update-one': Triggered when updating a single document
 * - 'insert-one': Triggered when inserting a new document
 * - 'remove-one': Triggered when removing a document
 * - 'aggregate': Triggered when performing aggregation
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
 * @property {Record<string, any>} query - The query parameters used in the database operation
 * @property {any | any[]} queryResult - The result of the database operation
 */
export interface DatabaseTriggerContext {
  query: Record<string, any>;
  queryResult: any | any[];
}

/**
 * Defines a callback to be executed on specific database operations
 * @class DatabaseTrigger
 * @property {DatabaseOperation} operation - The database operation that triggers the callback
 * @property {Function} callback - The callback function to be executed
 * @example
 * ```typescript
 * const trigger = new DatabaseTrigger('insert-one', (context) => {
 *   console.log('New document inserted:', context.queryResult);
 *   // Perform additional actions after document insertion
 * });
 *
 * // Use the trigger in a collection definition
 * const collection = new CollectionDefinition({
 *   database: 'myapp',
 *   collection: 'users',
 *   schema: userSchema,
 *   triggers: [trigger]
 * });
 * ```
 */
export class DatabaseTrigger {
  operation: DatabaseOperation;
  callback: (context: DatabaseTriggerContext) => void;

  /**
   * Creates a new DatabaseTrigger instance
   * @param {DatabaseOperation} operation - The database operation to trigger on
   * @param {Function} [callback=() => {}] - The callback function to execute
   * @example
   * ```typescript
   * // Log all find operations
   * const findTrigger = new DatabaseTrigger('find', (context) => {
   *   console.log('Find query:', context.query);
   *   console.log('Find results:', context.queryResult);
   * });
   *
   * // Track document updates
   * const updateTrigger = new DatabaseTrigger('update-one', (context) => {
   *   console.log('Document updated:', context.queryResult);
   * });
   * ```
   */
  constructor(
    operation: DatabaseOperation,
    callback: (context: DatabaseTriggerContext) => void = () => {}
  ) {
    this.operation = operation;
    this.callback = callback;
  }
}

export default DatabaseTrigger;
