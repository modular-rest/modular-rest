/**
 * Type for CMS operations that can trigger a callback
 */
export type CmsOperation = "update-one" | "insert-one" | "remove-one";

/**
 * Context interface for CMS trigger callbacks
 */
export interface CmsTriggerContext {
  query: Record<string, any>;
  queryResult: any;
}

/**
 * `CmsTrigger` is a class that defines a callback to be called on a specific database transaction.
 */
export class CmsTrigger {
  operation: CmsOperation;
  callback: (context: CmsTriggerContext) => void;

  /**
   * Creates a new instance of `CmsTrigger`.
   *
   * @param operation - The operation to be triggered.
   * @param callback - The callback to be called when the operation is executed. The callback function takes an object as parameter with two properties: 'query' and 'queryResult'.
   */
  constructor(
    operation: CmsOperation,
    callback: (context: CmsTriggerContext) => void = () => {}
  ) {
    this.operation = operation;
    this.callback = callback;
  }
}

export default CmsTrigger;
