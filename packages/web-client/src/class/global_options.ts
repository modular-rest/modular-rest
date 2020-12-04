interface Options {
    host: string;
}

class GlobalOptions {

    private static instance: GlobalOptions;
    private options: Options;

    private constructor(options: Options) {
        this.options = options
    }

    static getInstance() {

        if (GlobalOptions.instance)
            return GlobalOptions.instance;

        GlobalOptions.instance = new GlobalOptions({ host: ''});
        return GlobalOptions.instance;
    }

    set(options: Options) {

        this.options = {
            ...this.options,
            ...options
        }
    }

    get host() {
        return this.options.host
    }
}

export default GlobalOptions.getInstance();