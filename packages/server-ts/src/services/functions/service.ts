import { PermissionType } from '../../class/security';
import { User } from '../../class/user';

/**
 * Service name constant
 * @constant {string}
 */
export const name = 'functions';

/**
 * Interface for defined functions
 * @interface DefinedFunction
 * @property {string} name - Unique name of the function
 * @property {PermissionType[]} permissionTypes - List of permission types required to run the function
 * @property {(args: any) => any} callback - The actual function implementation
 * @example
 * ```typescript
 * const myFunction: DefinedFunction = {
 *   name: 'calculateTotal',
 *   permissionTypes: ['user_access'],
 *   callback: (args) => args.items.reduce((sum, item) => sum + item.price, 0)
 * };
 * ```
 */
export interface DefinedFunction {
  name: string;
  permissionTypes: PermissionType[];
  callback: (args: any) => any;
}

/**
 * Storage for registered functions
 * @private
 */
const functions: DefinedFunction[] = [];

/**
 * Defines a function with a given name, permission types, and callback
 * @param {Object} params - Function definition parameters
 * @param {string} params.name - Unique name for the function
 * @param {PermissionType[]} params.permissionTypes - List of required permission types
 * @param {(args: any) => any} params.callback - Function implementation
 * @returns {DefinedFunction} The defined function object
 * @throws {Error} If function name already exists, permission types are missing, or callback is invalid
 * @example
 * ```typescript
 * const calculateTotal = defineFunction({
 *   name: 'calculateTotal',
 *   permissionTypes: ['user_access'],
 *   callback: (args) => {
 *     if (!Array.isArray(args.items)) {
 *       throw new Error('Items must be an array');
 *     }
 *     return args.items.reduce((sum, item) => sum + item.price, 0);
 *   }
 * });
 *
 * // Add to registry
 * addFunction(calculateTotal);
 * ```
 */
export function defineFunction({
  name,
  permissionTypes,
  callback,
}: {
  name: string;
  permissionTypes: PermissionType[];
  callback: (args: any) => any;
}): DefinedFunction {
  // Check if the function already exists
  const existingFunction = functions.find(f => f.name === name);
  if (existingFunction) {
    throw new Error(`Function with name ${name} already exists`);
  }

  // Check if the permission types provided
  if (!permissionTypes || !permissionTypes.length) {
    throw new Error(`Permission types not provided for function ${name}`);
  }

  // Check if the callback is a function
  if (typeof callback !== 'function') {
    throw new Error(`Callback is not a function for function ${name}`);
  }

  // Add the function to the list of functions
  return {
    name,
    permissionTypes,
    callback,
  };
}

/**
 * Runs a function by name with arguments and user context
 * @param {string} name - Name of the function to run
 * @param {any} args - Arguments to pass to the function
 * @param {User} user - User attempting to run the function
 * @returns {Promise<any>} Promise resolving to function result
 * @throws {Error} If function not found or user lacks required permissions
 * @example
 * ```typescript
 * try {
 *   const result = await runFunction('calculateTotal', {
 *     items: [
 *       { price: 10 },
 *       { price: 20 }
 *     ]
 *   }, currentUser);
 *   console.log('Total:', result); // 30
 * } catch (error) {
 *   console.error('Function execution failed:', error);
 * }
 * ```
 */
export function runFunction(name: string, args: any, user: User): Promise<any> {
  return new Promise((resolve, reject) => {
    const func = functions.find(f => f.name === name);
    if (!func) {
      return reject(new Error(`Function with name ${name} not found`));
    }

    const hasPermission = func.permissionTypes.some(permissionType =>
      user.hasPermission(permissionType)
    );

    if (!hasPermission) {
      const userBrief = user.getBrief();
      const userPermissions =
        typeof userBrief.permissionGroup === 'object' && userBrief.permissionGroup
          ? userBrief.permissionGroup.validPermissionTypes
          : 'none';

      reject(
        new Error(`User does not have permission to run function ${name}:
        Function permissions: ${func.permissionTypes}
        User permissions: ${userPermissions}
        `)
      );
    } else {
      try {
        resolve(func.callback(args));
      } catch (e) {
        reject(e);
      }
    }
  });
}

/**
 * Adds a function to the registry
 * @param {DefinedFunction} func - Function to add
 * @throws {Error} If function name already exists
 * @example
 * ```typescript
 * const myFunction = defineFunction({
 *   name: 'myFunction',
 *   permissionTypes: ['user_access'],
 *   callback: (args) => args.value * 2
 * });
 *
 * addFunction(myFunction);
 * ```
 */
export function addFunction(func: DefinedFunction): void {
  // Check if the function already exists
  const existingFunction = functions.find(f => f.name === func.name);
  if (existingFunction) {
    throw new Error(`Function with name ${func.name} already exists`);
  }

  functions.push(func);
}
