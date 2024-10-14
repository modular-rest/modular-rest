export = Combinator.instance;
declare var instance: Combinator;
declare class Combinator {
    static get instance(): Combinator;
    combineRoutesByFilePath(rootDirectory: any, app: any): Promise<void>;
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
    combineModulesByFilePath({ rootDirectory, filename, combineWithRoot, convertToArray, }: {
        rootDirectory: string;
        filename: {
            name: string;
            extension: string;
        };
        combineWithRoot: boolean;
        convertToArray: boolean;
    }): Promise<any>;
    combineFunctionsByFilePath({ rootDirectory, filename }: {
        rootDirectory: any;
        filename: any;
    }): Promise<void>;
    extendObj(obj: any, src: any): any;
}
