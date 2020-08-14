let Router = require('koa-router');
let directory = require('./directory.js');

class Combinator {

    async combineRoutesByFilePath(rootDirectory, app) {
        // find route pathes
        let option = { name: 'router', filter: ['.js'] }
        let routerPaths = await directory.find(rootDirectory, option).then()
            .catch(e => { console.log(e) });

        // create and combine routes into the app
        for (let i = 0; i < routerPaths.length; i++) {
            let service = require(routerPaths[i]);
            let name = service.name;


            var serviceRouter = new Router();
            serviceRouter.use(`/${name}`, service.main.routes());

            app.use(serviceRouter.routes());
        }
    }

    combineServicesByFilePath(rootDirectory, filename, otherOption = {}) {
        // find route pathes
        let rootObject_temp = {};
        let option = { name: filename.name, filter: [filename.extension] }
        let modulesPath = await directory.find(rootDirectory, option).then()
            .catch(e => { console.log(e) });

        // create and combine routes into the app
        for (let i = 0; i < modulesPath.length; i++) {
            let moduleObject = require(modulesPath[i]);

            //act by otherOption
            if (otherOption.combineWithRoot) {
                delete moduleObject.name;
                rootObject_temp = this.extendObj(rootObject_temp, moduleObject);
            }
            // default act
            else {
                let name = moduleObject.name;
                rootObject_temp[name] = moduleObject;
            }
        }

        // options 
        // convertToArray
        if (otherOption.convertToArray) {
            rootObject_temp = Object.values(rootObject_temp);
        }

        // set result to main rootObject
        return rootObject_temp;
    }

    extendObj(obj, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key))
                obj[key] = src[key];
        }
        return obj;
    }
}

Combinator.instance = new Combinator();
module.exports = Combinator.instance;
