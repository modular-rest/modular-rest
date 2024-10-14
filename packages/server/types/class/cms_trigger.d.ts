export = CmsTrigger;
/**
 * `CmsTrigger` is a class that defines a callback to be called on a specific database transaction.
 *
 * @class
 */
declare class CmsTrigger {
    /**
     * Creates a new instance of `CmsTrigger`.
     *
     * @param {'update-one' | 'insert-one' | 'remove-one' } operation - The operation to be triggered.
     * @param {function({query: any, queryResult: any}): void} [callback=(context) => {}] - The callback to be called when the operation is executed. The callback function takes an object as parameter with two properties: 'query' and 'queryResult'.
     * @constructor
     */
    constructor(operation: 'update-one' | 'insert-one' | 'remove-one', callback?: (arg0: {
        query: any;
        queryResult: any;
    }) => void);
    operation: "update-one" | "insert-one" | "remove-one";
    callback: (arg0: {
        query: any;
        queryResult: any;
    }) => void;
}
