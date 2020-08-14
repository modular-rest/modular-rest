const koa = require('koa');
// var router = require('koa-router');
// var path = require('path');
var combination = require('./lib/core/combinator');

module.exports = async function (option = {}) {
    let app = new koa();

    let root = (option.root) ? option.root : null;
    let onBeforInit = (option.onBeforInit) ? option.onBeforInit : null;
    let onInit = (option.onInit) ? option.onInit : null;
    let onAfterInit = (option.onAfterInit) ? option.onAfterInit : null;
    let port = (option.port) ? option.port : 3000;
    let plugins = (option.plugins) ? option.plugins : [];
    let otherSrvice = (option.otherSrvice) ? option.otherSrvice : [];
    let dontlisten = (option.dontlisten) ? option.dontlisten : false;
    let rootObjects = {};

    // let option = {
    //     root: require('path').join(__dirname, 'routers'),
    //     onInit: Init,
    //     onAfterInit: AfterInit,
    //     port: 80,
    //     otherSrvice: [
    //         {
    //             rootDirectory: '',
    //             option: {
    //                 combineWithRoot: true,
    //                 convertToArray: true,
    //             }
    //         }
    //     ]
    // };

    if (onBeforInit) onBeforInit(app);

    // combine plugins
    if (plugins != null || !isNaN(plugins.length)) {
        
    }

    // combine routes
    if (root) await combination.combineRoutesByFilePath(option.root, app);

    // do service combination
    if (otherSrvice.length) {
        for (let index = 0; index < otherSrvice.length; index++) {
            const service = otherSrvice[index];
            let rootObject = await combination.combineServicesByFilePath(
                service.rootDirectory,
                service.filename,
                service.option);

            rootObjects[service.filename.name] = rootObject;
        }
    }

    return new Promise((done, reject) => {
        if (onInit) onInit(app, rootObjects);

        if (!dontlisten) {
            app.listen(port);
            console.log('\x1b[35m', `KOAS has been launched on: localhost:${port}`);
        }


        // on affter init
        if (onAfterInit) onAfterInit(app, rootObjects);

        //done
        done(app);
    });
}