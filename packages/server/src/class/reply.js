/**
 * Creates a response object with the given status and detail.
 *
 * @param {string} status - The status of the response. Can be "s" for success, "f" for fail, or "e" for error.
 * @param {Object} [detail={}] - The detail of the response. Can contain any additional information about the response.
 * @returns {Object} - The response object with the given status and detail.
 */
function create(status, detail = {}) {

    let result = detail || {};

    // defin status
    switch (status) {
        case 's':
            result['status'] = 'success';
            break;

        case 'f':
            result['status'] = 'fail';
            break;

        case 'e':
            result['status'] = 'error';
            break;

        default:
            result['status'] = 'success';
            break;
    }

    // return
    return result;
}

module.exports = {
    create
}