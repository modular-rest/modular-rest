export = TriggerOperator.instance;
declare var instance: TriggerOperator;
declare class TriggerOperator {
    static get instance(): TriggerOperator;
    triggers: any[];
    /**
     * add a collection trigger
     * @param {object} trigger DatabaseTrigger object
     */
    addTrigger(trigger: object): void;
    /**
     * Call a trigger
     * @param {'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate'} operation operation name
     * @param {string} database database name
     * @param {string} collection collection name
     * @param {string} data
     */
    call(operation: 'find' | 'find-one' | 'count' | 'update-one' | 'insert-one' | 'remove-one' | 'aggregate', database: string, collection: string, data: string): void;
}
