/**
 * Validates an object by checking if it contains all the required fields.
 * @param {Object} obj - The object to be validated.
 * @param {string|Object} requiredFields - The list of required fields. If it's a string, it should contain keys separated by spaces. If it's an object, it should contain key-value pairs where the key is the field name and the value is a boolean indicating whether the field is required or not.
 * @returns {boolean} - Returns true if the object contains all the required fields, otherwise returns false.
 * @throws {string} - Throws an error if the requiredFields parameter is not a string or an object.
 */
function validate(obj, requiredFields) {
    /*
        this method could validate an Object by given field's name list and return bool.
        - requiredFields: is a string that contains keys being spareted by " ".
    */
    let type = typeof requiredFields;
    let result;

    if (type == 'string')
        result = ckeckSimple(obj, requiredFields);
    else if (type == 'object')
        result = checkComplex(obj, requiredFields);

    else throw ('requiredFields has wrong form, it must be string or object');

    return result;
}

module.exports = validate;

function ckeckSimple(obj, requiredFields = '') {
    let isValide = false;
    let requires = requiredFields.split(' ');

    let validMembers = 0;
    let notValidKeys = [];

    // return if obj is null
    if (obj == null) return _returnResult(isValide, requires);

    requires.forEach(key => {
        if (obj[key])
            validMembers++;
        else notValidKeys.push(key);
    });

    // check validation
    isValide = (requires.length == validMembers) ? true : false;
    return _returnResult(isValide, notValidKeys);
}

function checkComplex(obj, requiredFields = {}) {
    let isValide = false;
    let requireKeys = Object.keys(requiredFields);

    let validMembers = 0;
    let notValidKeys = [];

    // return if obj is null
    if (obj == null) return _returnResult(isValide, requireKeys);

    for (let i = 0; i < requireKeys.length; i++) {
        const key = requireKeys[i];
        let isValidField = false;

        // if field has specific values
        if (requiredFields[key].length > 0) {
            let expectedValues = requiredFields[key].split(' ');

            if (typeof expectedValues != 'object')
                throw (`${key} must be array of strings`);

            expectedValues.forEach(value => {
                if (obj[key] == value) isValidField = true;
            })
        }
        // else does not has specific value
        else if (obj[key] != null) isValidField = true;

        if (isValidField) validMembers++;
        else notValidKeys.push(key);
    }

    // check validation
    isValide = (requireKeys.length == validMembers) ? true : false;
    return _returnResult(isValide, notValidKeys);
}

function _returnResult(isValide, notValidKeys) {
    return {
        'isValid': isValide,
        'requires': notValidKeys
    };
}