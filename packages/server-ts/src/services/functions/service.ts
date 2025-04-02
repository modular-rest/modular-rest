import { PermissionType } from '../../class/security';
import { User } from '../../class/user';

/**
 * Service name constant
 * @constant {string}
 */
export const name = 'functions';

/**
 * Storage for registered functions
 * @private
 */
const functions: DefinedFunction[] = [];

/**
 * Interface for defined functions.
 *
 * @interface DefinedFunction
 * @inline
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
  /**
   * Unique name of the function
   * @type {string}
   */
  name: string;
  /**
   * List of permission types required to run the function
   * @type {PermissionType[]}
   */
  permissionTypes: PermissionType[];

  /**
   * The actual function implementation
   * @type {(args: any) => any}
   */
  callback: (args: any) => any;
}

/**
 * To define a function you need to create a `functions.[js|ts]` in each module of your app and return am array called `functions`, and then define all your functions with calling the `defineFunction` method.
 *
 * The `defineFunction` method serves as a core utility for creating custom functions dynamically. This method allows you to specify various parameters, including the name of the function, the permissions required for access, and the corresponding logic that should be executed when the function is invoked.
 *
 * @summary
 * Define a server function to be called by clients.
 *
 * @param {DefinedFunction} options - The function definition options. See {@link DefinedFunction} for detailed parameter descriptions.
 * @expandType DefinedFunction
 *
 * @returns {Object} The defined function object which system will use to generate a router for the function, generall the client library will use the router to call the function.
 * @throws {Error} If function name already exists, permission types are missing, or callback is invalid
 *
 * @example
 * Here is an example illustrating how to use the `defineFunction` method effectively:
 * ```typescript
 * // /modules/myModule/functions.ts
 *
 * import { defineFunction } from "@modular-rest/server";
 *
 * const getServerTime = defineFunction({
 *   name: "getServerTime",
 *   permissionTypes: ["anonymous_access"],
 *   callback: (params) => {
 *     // return your data only
 *     return `
 *       Welcome, ${params.username}!
 *       The current server time is ${new Date().toLocaleString()}.
 *     `;
 *
 *     // error handling,
 *     // client gets error code 400, and the message
 *     // throw new Error('An error occurred');
 *   },
 * });
 *
 * module.exports.functions = [getServerTime];
 * ```
 * In this example, we define a function named `getServerTime` that requires the `user` permission type to access. When the function is called, it will return a message containing the current server time and the username of the user who invoked the function.
 *
 * ---
 *
 * By utilizing the `defineFunction` method, developers are empowered to create custom functionality effortlessly within the Modular REST framework, enhancing both the versatility and security of their applications.
 */
export function defineFunction(options: DefinedFunction): DefinedFunction {
  // Check if the function already exists
  const existingFunction = functions.find(f => f.name === name);
  if (existingFunction) {
    throw new Error(`Function with name ${name} already exists`);
  }

  // Check if the permission types provided
  if (!options.permissionTypes || !options.permissionTypes.length) {
    throw new Error(`Permission types not provided for function ${name}`);
  }

  // Check if the callback is a function
  if (typeof options.callback !== 'function') {
    throw new Error(`Callback is not a function for function ${name}`);
  }

  // Add the function to the list of functions
  return options;
}

/**
 * Runs a function by name with arguments and user context
 *
 * @param {string} name - Name of the function to run
 * @param {any} args - Arguments to pass to the function
 * @param {User} user - User attempting to run the function
 * @returns {Promise<any>} Promise resolving to function result
 * @throws {Error} If function not found or user lacks required permissions
 *
 * @private
 *
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
 * Adds a function to the registry, this method is used for internal use only,
 * it will add all defined functions to the registry.
 *
 * @param {DefinedFunction} func - Function to add
 * @throws {Error} If function name already exists
 *
 * @private
 *
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
