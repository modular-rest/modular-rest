export type PermissionType = import('../../class/security.js').PermissionType;
/**
 * @typedef {import('../../class/security.js').PermissionType} PermissionType
 */
/**
 * Defines a function with a given name, permission types, and callback.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.name - The name of the function.
 * @param {[PermissionType]} params.permissionTypes - The permission types for the function.
 * @param {Function} params.callback - The callback to be executed by the function.
 */
export function defineFunction({ name, permissionTypes, callback }: {
    name: string;
    permissionTypes: [PermissionType];
    callback: Function;
}): {
    name: string;
    permissionTypes: [string];
    callback: Function;
};
export function runFunction(name: any, args: any, user: any): Promise<any>;
export function addFunction(func: any): void;
