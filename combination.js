let Router = require('koa-router');
let walker = require('./lib/directory_walker.js');

module.exports.combinRoutes = (rootDirectory, app) => 
{
    return new Promise( async (done, reject) => 
    {
        // find route pathes
        let option = {name: 'router', filter: ['.js']}
        let routerPaths = await walker.find(rootDirectory, option).then()
            .catch(e => { reject(e); });

        // create and combine routes into the app
        for (let i = 0; i < routerPaths.length; i++) 
        {
            let service = require(routerPaths[i]);
            let name = service.name;

            
            var serviceRouter = new Router();
            serviceRouter.use(`/${name}`, service.main.routes());

            app.use(serviceRouter.routes());
        }

        done();
    });
}


// custom combination
module.exports.Custom = (rootDirectory, rootObject, filename) => 
{
    return new Promise( async (done, reject) => 
    {
        // find route pathes
        let option = {name: filename.name, filter: [filename.extension]}
        let modulesPath = await walker.find(rootDirectory, option).then()
            .catch(e => { reject(e); });

        // create and combine routes into the app
        for (let i = 0; i < modulesPath.length; i++) 
        {
            let moduleObject = require(modulesPath[i]);
            let name = moduleObject.name;

            rootObject[name] = moduleObject;
        }

        done();
    });
}