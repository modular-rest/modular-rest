import { PermissionType } from '../../class/security';
import { User } from '../../class/user';

/**
 * Defined function interface
 */
export interface DefinedFunction {
  name: string;
  permissionTypes: PermissionType[];
  callback: (args: any) => any;
}

/**
 * Storage for registered functions
 */
const functions: DefinedFunction[] = [];

/**
 * Defines a function with a given name, permission types, and callback.
 *
 * @param params - The parameters for the function.
 * @returns The defined function object
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
 * Run a function by name with arguments and user
 *
 * @param name - Function name
 * @param args - Arguments to pass to the function
 * @param user - User attempting to run the function
 * @returns Promise resolving to function result
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
 * Add a function to the registry
 * @param func - Function to add
 */
export function addFunction(func: DefinedFunction): void {
  functions.push(func);
}
