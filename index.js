const koa = require('koa');
var router = require('koa-router');
var path = require('path');
var combination = require('./combination');

module.exports = function(option={}) 
{
    var app = new koa();

    var root = (option.root) ? option.root : null;
    var onInit = (option.onInit) ? option.onInit : null;
    var onAfterInit = (option.onAfterInit) ? option.onAfterInit : null;
    var port = (option.port) ? option.port : 3000;
    var serviceCombination = (option.serviceCombination) ? option.serviceCombination : [];

    let option = {
        root: require('path').join(__dirname, 'routers'),
        onInit: Init,
        onAfterInit: AfterInit,
        port: 80,
        serviceCombination: [
            {
                rootDirectory: '',
                rootObject: {}
            }
        ]
    };

    // combine routes
    if(root) combination.combinRoutes(option.root, app);

    // do service combination
    if(serviceCombination.length)
    {
        for (let index = 0; index < serviceCombination.length; index++) 
        {
            const service = serviceCombination[index];
            combination.Custom(service.rootDirectory, service.rootObject);
        }
    }

    // 
    if(onInit) onInit(app);

    app.listen(port);
    console.log('\x1b[35m', `KOAS has been launched on: localhost:${port}`);
    

    // on affter init
    console.log('\x1b[0m', 'begin to onAfterInit');
    if(onAfterInit) onAfterInit();
}