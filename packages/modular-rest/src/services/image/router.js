let Router = require('koa-router');
let validateObject = require('./../../class/validator');
let reply = require('./../../class/reply');
let name = 'image';

let {PermissionTypes} = require('./../../class/security_definition');

let service = require('./service');
let middleware = require('./../../middlewares');
let photos = new Router();

photos.use('/', middleware.auth, async (ctx, next) => 
{
    let body = ctx.request.body;
    // console.log(ctx.state.user);
    let key = ctx.state.user.permission[PermissionTypes.archive_manager];
			
    if(key == false && body.type == 'user')
        key = user.hasPermission(PermissionTypes.customer_access);
    
    if(key == false) ctx.throw(403, "you don't have permission");
    else await next();
});

photos.post('/upload', async (ctx) => 
{
    let body = ctx.request.body;
    let file = ctx.request.files;

    // validate
    let bodyValidate = validateObject(body, 'type id database');

    let result;

    if(!bodyValidate.isValid) {
        ctx.status = 412;
        result = reply('f',  {'m': 'some fileds required.', 'e': bodyValidate.requires});
    }
    
    else  {
        await service.storePhoto(body.database, body.type, body.id, file.image, body.options)
            .then((stamp) => {
                result = reply('s', {'stamp': stamp});
            })
            .catch((e) => {
                ctx.status = 412;
                result = reply('e', {'e': e});
            }); 
    }

    ctx.body = result;
});

photos.post('/remove', async (ctx) => 
{
    let body = ctx.request.body;

    // validate
    let bodyValidate = validateObject(body, 'type id database');

    let result;

    if(!bodyValidate.isValid) {
        ctx.status = 412;
        result = reply('f',  {'m': 'some fileds required.', 'e': bodyValidate.requires});
    }
    
    else  {
        await service.removePhoto(body.database, body.type, body.id, body.options)
            .then(() => {
                result = reply('s');
            })
            .catch((e) => {
                ctx.status = 412;
                result = reply('e', {'e': e});
            }); 
    }

    console.log('remove', result);
    ctx.body = result;
});

module.exports.name = name;
module.exports.main = photos;