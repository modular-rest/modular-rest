/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  requires: string[];
}

/**
 * Validates an object by checking if it contains all the required fields.
 * @param obj - The object to be validated.
 * @param requiredFields - The list of required fields. If it's a string, it should contain keys separated by spaces. If it's an object, it should contain key-value pairs where the key is the field name and the value is a boolean indicating whether the field is required or not.
 * @returns Returns a ValidationResult object with validation status and missing fields.
 * @throws Throws an error if the requiredFields parameter is not a string or an object.
 */
export function validator(
  obj: Record<string, any> | null,
  requiredFields: string | Record<string, string>
): ValidationResult {
  /*
      this method could validate an Object by given field's name list and return bool.
      - requiredFields: is a string that contains keys being spared by " ".
  */
  const type = typeof requiredFields;
  let result: ValidationResult;

  if (type === 'string') result = checkSimple(obj, requiredFields as string);
  else if (type === 'object') result = checkComplex(obj, requiredFields as Record<string, string>);
  else throw 'requiredFields has wrong form, it must be string or object';

  return result;
}

/**
 * Check simple validation with space-separated string of keys
 */
function checkSimple(
  obj: Record<string, any> | null,
  requiredFields: string = ''
): ValidationResult {
  let isValid = false;
  const requires = requiredFields.split(' ');

  const validMembers = [];
  const notValidKeys = [];

  // return if obj is null
  if (obj == null) return _returnResult(isValid, requires);

  // Filter empty strings that might result from extra spaces
  const requiredKeys = requires.filter(key => key !== '');

  for (const key of requiredKeys) {
    if (obj[key] !== undefined && obj[key] !== null) validMembers.push(key);
    else notValidKeys.push(key);
  }

  // check validation
  isValid = requiredKeys.length === validMembers.length;
  return _returnResult(isValid, notValidKeys);
}

/**
 * Check complex validation with object containing expected values
 */
function checkComplex(
  obj: Record<string, any> | null,
  requiredFields: Record<string, string> = {}
): ValidationResult {
  let isValid = false;
  const requireKeys = Object.keys(requiredFields);

  let validMembers = 0;
  const notValidKeys: string[] = [];

  // return if obj is null
  if (obj == null) return _returnResult(isValid, requireKeys);

  for (let i = 0; i < requireKeys.length; i++) {
    const key = requireKeys[i];
    let isValidField = false;

    // if field has specific values
    if (requiredFields[key].length > 0) {
      const expectedValues = requiredFields[key].split(' ');

      if (typeof expectedValues !== 'object') throw `${key} must be array of strings`;

      for (const value of expectedValues) {
        if (obj[key] === value) {
          isValidField = true;
          break;
        }
      }
    }
    // else does not have specific value
    else if (obj[key] != null) {
      isValidField = true;
    }

    if (isValidField) validMembers++;
    else notValidKeys.push(key);
  }

  // check validation
  isValid = requireKeys.length === validMembers;
  return _returnResult(isValid, notValidKeys);
}

/**
 * Create a validation result object
 */
function _returnResult(isValid: boolean, notValidKeys: string[]): ValidationResult {
  return {
    isValid: isValid,
    requires: notValidKeys,
  };
}

/**
 * Return the validator function to maintain compatibility with the JavaScript version
 */
export const validateObject = validator;
