import DataProvider from "./services/data-provider";
import FileProvider from "./services/file-provider";
import Authentication from "./services/authentication";
import GlobalOptions from "./class/global_options";

export * as Types from "./types/types";

const authentication = Authentication.getInstance();
const dataProvider = DataProvider.getInstance();
const fileProvider = FileProvider.getInstance();

export { GlobalOptions, authentication, dataProvider, fileProvider };
