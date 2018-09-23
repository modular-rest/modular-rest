const koa = require('koa');
var router = require('koa-router');
var path = require('path');
var combination = require('./combination');

module.exports = async function(option={}) 
{
    var app = new koa();

    var root = (option.root) ? option.root : null;
    var onInit = (option.onInit) ? option.onInit : null;
    var onAfterInit = (option.onAfterInit) ? option.onAfterInit : null;
    var port = (option.port) ? option.port : 3000;
    var otherSrvice = (option.otherSrvice) ? option.otherSrvice : [];

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

    // combine routes
    if(root) await combination.combinRoutes(option.root, app).then();

    // do service combination
    if(otherSrvice.length)
    {
        for (let index = 0; index < otherSrvice.length; index++) 
        {
            const service = otherSrvice[index];
            await combination.Custom(
                service.rootDirectory, 
                service.rootObject,
                service.filename
                ).then();
        }
    }

    return new Promise((done, reject) => 
    {
        if(onInit) onInit(app);

        app.listen(port);
        console.log('\x1b[35m', `KOAS has been launched on: localhost:${port}`);
        
    
        // on affter init
        console.log('\x1b[0m', 'begin to onAfterInit');
        if(onAfterInit) onAfterInit();

        //done
        done();
    });
}