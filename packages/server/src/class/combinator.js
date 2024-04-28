const Router = require("koa-router");
const directory = require("./directory.js");
const { addFunction } = require("./../services/functions/service.js");

class Combinator {
  async combineRoutesByFilePath(rootDirectory, app) {
    // find route paths
    let option = { name: "router", filter: [".js"] };
    let routerPaths = await directory
      .find(rootDirectory, option)
      .then()
      .catch((e) => {
        console.log(e);
      });

    // create and combine routes into the app
    for (let i = 0; i < routerPaths.length; i++) {
      let service = require(routerPaths[i]);
      let name = service.name;

      var serviceRouter = new Router();
      serviceRouter.use(`/${name}`, service.main.routes());

      app.use(serviceRouter.routes());
    }
  }

  /**
   *
   * @param {object} option
   * @param {string} option.rootDirectory root directory of files
   * @param {object} option.filename an object of {name, extension}
   * @param {string} option.filename.name name of file
   * @param {string} option.filename.extension the extension of the file
   * @param {boolean} option.combineWithRoot combine all file content and return theme as a object
   * @param {boolean} option.convertToArray return file content as an array instead an object
   */
  async combineModulesByFilePath({
    rootDirectory,
    filename,
    combineWithRoot,
    convertToArray,
  }) {
    // find route paths
    let rootObject_temp;
    const option = { name: filename.name, filter: [filename.extension] };
    const modulesPath = await directory
      .find(rootDirectory, option)
      .then()
      .catch((e) => {
        console.log(e);
      });

    // create and combine routes into the app
    for (let i = 0; i < modulesPath.length; i++) {
      const moduleObject = require(modulesPath[i]);

      // act by otherOption
      if (combineWithRoot) {
        if (moduleObject.name) delete moduleObject.name;

        if (moduleObject.length) {
          if (!rootObject_temp) rootObject_temp = [];

          rootObject_temp = [...rootObject_temp, ...moduleObject];
        } else {
          rootObject_temp = this.extendObj(rootObject_temp, moduleObject);
        }
        // else if (typeof)
      }
      // default act
      else {
        const name = moduleObject.name;
        rootObject_temp[name] = moduleObject;
      }
    }

    // options
    // convertToArray
    if (convertToArray) {
      rootObject_temp = Object.values(rootObject_temp);
    }

    // set result to main rootObject
    return rootObject_temp;
  }

  async combineFunctionsByFilePath({ rootDirectory, filename }) {
    // find route paths
    const option = { name: filename.name, filter: [filename.extension] };
    const functionsPaths = await directory
      .find(rootDirectory, option)
      .then()
      .catch((e) => {
        console.log(e);
      });

    // create and combine routes into the app
    for (let i = 0; i < functionsPaths.length; i++) {
      const modularFunctions = require(functionsPaths[i]);

      if (!modularFunctions.functions) {
        throw new Error(
          `Module file ${functionsPaths[i]} does not have functions property.`
        );
      }

      // if array
      if (modularFunctions.functions.length) {
        for (const moduleFunction of modularFunctions.functions) {
          addFunction(moduleFunction);
        }
      } else {
        addFunction(modularFunctions.functions);
      }
    }
  }

  extendObj(obj, src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
  }

  static get instance() {
    return instance;
  }
}

const instance = new Combinator();

module.exports = Combinator.instance;
