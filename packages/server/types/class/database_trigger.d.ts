export = DatabaseTrigger;
/**
 * `DatabaseTrigger` is a class that defines a callback to be called on a specific database transaction.
 *
 * @class
 */
declare class DatabaseTrigger {
    /**
     * Creates a new instance of `DatabaseTrigger`.
     *
     * @param {'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate'} operation - The operation to be triggered. Supported operations are: 'find', 'find-one', 'count', 'update-one', 'insert-one', 'remove-one', 'aggregate'.
     * @param {function({query: Object.<string, any>, queryResult: any | any[]}): void} [callback=(context) => {}] - The callback to be called when the operation is executed. The callback function takes an object as parameter with two properties: 'query' and 'queryResult'.
     * @constructor
     */
    constructor(operation: 'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate', callback?: (arg0: {
        query: {
            [x: string]: any;
        };
        queryResult: any | any[];
    }) => void);
    operation: "find" | "count" | "aggregate" | "find-one" | "update-one" | "insert-one" | "remove-one";
    callback: (arg0: {
        query: {
            [x: string]: any;
        };
        queryResult: any | any[];
    }) => void;
}
