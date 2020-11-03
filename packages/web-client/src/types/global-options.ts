

class GlobalOptions {

    private static instance: GlobalOptions;
    baseUrl: string;

    private constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }


    public static getInstance(baseUrl: string): GlobalOptions {


        if (!GlobalOptions.instance) {
            GlobalOptions.instance = new GlobalOptions(baseUrl);
        }

        return GlobalOptions.instance;
    }
}

export default GlobalOptions;