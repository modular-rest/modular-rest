/**
 * Type for database operations that can trigger a callback
 */
export type DatabaseOperation =
  | "find"
  | "find-one"
  | "count"
  | "update-one"
  | "insert-one"
  | "remove-one"
  | "aggregate";

/**
 * Context interface for database trigger callbacks
 */
export interface DatabaseTriggerContext {
  query: Record<string, any>;
  queryResult: any | any[];
}

/**
 * `DatabaseTrigger` is a class that defines a callback to be called on a specific database transaction.
 */
export class DatabaseTrigger {
  operation: DatabaseOperation;
  callback: (context: DatabaseTriggerContext) => void;

  /**
   * Creates a new instance of `DatabaseTrigger`.
   *
   * @param operation - The operation to be triggered. Supported operations are: 'find', 'find-one', 'count', 'update-one', 'insert-one', 'remove-one', 'aggregate'.
   * @param callback - The callback to be called when the operation is executed. The callback function takes an object as parameter with two properties: 'query' and 'queryResult'.
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
