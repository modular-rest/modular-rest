// generate structured respons json
module.exports = function(status, detail)
{
    /* result template
    * status : "success", "fail", "error",
    * data : {},
    * error: {},
    * message: "...",
    */

    var result = {status: ""};

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

    // defin respons detail
    if(detail['d']) result['data'] = detail['d'];
    if(detail['e']) result['error'] = detail['e'];
    if(detail['m']) result['message'] = detail['m'];

    // return
    return result;
}