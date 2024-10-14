export = validate;
/**
 * Validates an object by checking if it contains all the required fields.
 * @param {Object} obj - The object to be validated.
 * @param {string|Object} requiredFields - The list of required fields. If it's a string, it should contain keys separated by spaces. If it's an object, it should contain key-value pairs where the key is the field name and the value is a boolean indicating whether the field is required or not.
 * @returns {boolean} - Returns true if the object contains all the required fields, otherwise returns false.
 * @throws {string} - Throws an error if the requiredFields parameter is not a string or an object.
 */
declare function validate(obj: any, requiredFields: string | any): boolean;
