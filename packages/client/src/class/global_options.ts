import { join } from "../helper/url";

interface Options {
  host: string;
}

class GlobalOptions {
  private static instance: GlobalOptions;
  private options: Options;

  private constructor(options: Options) {
    this.options = options;
  }

  static getInstance() {
    if (GlobalOptions.instance) return GlobalOptions.instance;

    GlobalOptions.instance = new GlobalOptions({ host: "" });
    return GlobalOptions.instance;
  }

  set(options: Options) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  get host() {
    return this.options.host;
  }

  getUrl(path: string, overrideUrl?: string) {
    if (!path) throw new Error("Path is required to build URL");

    if (path.startsWith("http")) return path;

    return join([overrideUrl || this.host, path]);
  }
}

export default GlobalOptions.getInstance();
