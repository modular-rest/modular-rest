const koa = require('koa');
var router = require('koa-router');
var path = require('path');
var combination = require('./lib/combination');

module.exports = async function(option={}) 
{
    var app = new koa();

    var root = (option.root) ? option.root : null;
    var onBeforInit = (option.onBeforInit) ? option.onBeforInit : null;
    var onInit = (option.onInit) ? option.onInit : null;
    var onAfterInit = (option.onAfterInit) ? option.onAfterInit : null;
    var port = (option.port) ? option.port : 3000;
    var otherSrvice = (option.otherSrvice) ? option.otherSrvice : [];
    var dontlisten = (option.dontlisten) ? option.dontlisten : false;

    // let option = {
    //     root: require('path').join(__dirname, 'routers'),
    //     onInit: Init,
    //     onAfterInit: AfterInit,
    //     port: 80,
    //     otherSrvice: [
    //         {
    //             rootDirectory: '',
    //             rootObject: {}
    //         }
    //     ]
    // };

    if(onBeforInit) onBeforInit(app);

    // combine routes
    if(root) await combination.combinRoutes(option.root, app);

    // do service combination
    if(otherSrvice.length)
    {
        for (let index = 0; index < otherSrvice.length; index++) 
        {
            const service = otherSrvice[index];
            await combination.Custom(
                service.rootDirectory, 
                service.rootObject,
                service.filename,
                service.option,
                );
        }
    }

    return new Promise((done, reject) => 
    {
        if(onInit) onInit(app);

        if(!dontlisten) {
            app.listen(port);
            console.log('\x1b[35m', `KOAS has been launched on: localhost:${port}`);
        }
        
    
        // on affter init
        if(onAfterInit) onAfterInit();

        //done
        done(app);
    });
}