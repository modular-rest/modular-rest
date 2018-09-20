let Router = require('koa-router');
let walker = require('./lib/directory_walker.js');

module.exports.combinRoutes = async (root, app) => 
{
    // find route pathes
    let option = {name: 'router', filter: ['.js']}
    let routerPaths = await walker.find(root, option).then()
        .catch(e => {console.log(e)});

    // create and combine routes into the app
    for (let i = 0; i < routerPaths.length; i++) 
    {
        let service = require(routerPaths[i]);
        let name = service.name;

        
        var serviceRouter = new Router();
        serviceRouter.use(`/${name}`, service.main.routes());

        app.use(serviceRouter.routes());
    }
}