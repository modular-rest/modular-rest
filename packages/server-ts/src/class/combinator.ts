import Router from 'koa-router';
import Koa from 'koa';
import * as directory from './directory';
import { addFunction } from '../services/functions/service';

interface FilenameOption {
  name: string;
  extension: string;
}

interface ModuleOptions {
  rootDirectory: string;
  filename: FilenameOption;
  combineWithRoot?: boolean;
  convertToArray?: boolean;
}

interface FunctionOptions {
  rootDirectory: string;
  filename: FilenameOption;
}

class Combinator {
  async combineRoutesByFilePath(rootDirectory: string, app: Koa): Promise<void> {
    // find route paths
    const option = {
      name: 'router',
      filter: ['.js'],
    };

    let routerPaths: string[] = [];
    try {
      routerPaths = await directory.find(rootDirectory, option);
    } catch (e) {
      console.log(e);
    }

    // create and combine routes into the app
    for (let i = 0; i < routerPaths.length; i++) {
      const service = require(routerPaths[i]);
      const name = service.name;

      const serviceRouter = new Router();
      serviceRouter.use(`/${name}`, service.main.routes());

      app.use(serviceRouter.routes());
    }
  }

  /**
   * Combine modules from files in a directory
   * @param options - Configuration options
   */
  async combineModulesByFilePath({
    rootDirectory,
    filename,
    combineWithRoot,
    convertToArray,
  }: ModuleOptions): Promise<any> {
    // find route paths
    let rootObject_temp: any;

    const option = {
      name: filename.name,
      filter: [filename.extension],
    };

    let modulesPath: string[] = [];
    try {
      modulesPath = await directory.find(rootDirectory, option);
    } catch (e) {
      console.log(e);
    }

    // create and combine routes into the app
    for (let i = 0; i < modulesPath.length; i++) {
      const moduleObject = require(modulesPath[i]);

      // act by otherOption
      if (combineWithRoot) {
        if (moduleObject.name) delete moduleObject.name;

        if (Array.isArray(moduleObject)) {
          if (!rootObject_temp) rootObject_temp = [];

          rootObject_temp = [...rootObject_temp, ...moduleObject];
        } else {
          rootObject_temp = this.extendObj(rootObject_temp, moduleObject);
        }
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

  /**
   * Combine functions from files in a directory
   * @param options - Function options
   */
  async combineFunctionsByFilePath({ rootDirectory, filename }: FunctionOptions): Promise<void> {
    // find route paths
    const option = {
      name: filename.name,
      filter: [filename.extension],
    };

    let functionsPaths: string[] = [];
    try {
      functionsPaths = await directory.find(rootDirectory, option);
    } catch (e) {
      console.log(e);
    }

    // create and combine routes into the app
    for (let i = 0; i < functionsPaths.length; i++) {
      const modularFunctions = require(functionsPaths[i]);

      if (!modularFunctions.functions) {
        throw new Error(`Module file ${functionsPaths[i]} does not have functions property.`);
      }

      // if array
      if (Array.isArray(modularFunctions.functions)) {
        for (const moduleFunction of modularFunctions.functions) {
          addFunction(moduleFunction);
        }
      } else {
        addFunction(modularFunctions.functions);
      }
    }
  }

  /**
   * Add functions from an array
   * @param functionList - List of functions to add
   */
  addFunctionsByArray(functionList: any[]): void {
    for (const functionItem of functionList) {
      addFunction(functionItem);
    }
  }

  /**
   * Extend an object with properties from another
   * @param obj - Target object
   * @param src - Source object
   * @returns Extended object
   */
  extendObj(obj: any, src: any): any {
    obj = obj || {};
    for (const key in src) {
      if (Object.prototype.hasOwnProperty.call(src, key)) obj[key] = src[key];
    }
    return obj;
  }

  static get instance(): Combinator {
    return instance;
  }
}

const instance = new Combinator();

export = instance;
