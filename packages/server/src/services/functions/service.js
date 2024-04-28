const functions = [];

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
function defineFunction({ name, permissionTypes, callback }) {
  // Check if the function already exists
  const existingFunction = functions.find((f) => f.name === name);
  if (existingFunction) {
    throw new Error(`Function with name ${name} already exists`);
  }

  // Check if the permission types provided
  if (!permissionTypes || !permissionTypes.length) {
    throw new Error(`Permission types not provided for function ${name}`);
  }

  // Check if the callback is a function
  if (typeof callback !== "function") {
    throw new Error(`Callback is not a function for function ${name}`);
  }

  // Add the function to the list of functions
  return { name, permissionTypes, callback };
}

function runFunction(name, args, user) {
  return new Promise((resolve, reject) => {
    const func = functions.find((f) => f.name === name);
    if (!func) {
      reject(new Error(`Function with name ${name} not found`));
    }

    const hasPermission = func.permissionTypes.some((permissionType) =>
      user.hasPermission(permissionType)
    );

    if (!hasPermission) {
      reject(
        new Error(`User does not have permission to run function ${name}`)
      );
    }

    try {
      resolve(func.callback(args));
    } catch (e) {
      reject(e);
    }
  });
}

function addFunction(func) {
  functions.push(func);
}

module.exports = {
  defineFunction,
  runFunction,
  addFunction,
};
