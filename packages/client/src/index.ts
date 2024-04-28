import DataProvider from "./services/data-provider";
import FileProvider from "./services/file-provider";
import Authentication from "./services/authentication";
import GlobalOptions from "./class/global_options";
import FunctionProvider from "./services/function-provider";

export * as Types from "./types/types";

export { createPagination } from "./helper/list";

const authentication = Authentication.getInstance();
const dataProvider = DataProvider.getInstance();
const fileProvider = FileProvider.getInstance();
const functionProvider = FunctionProvider.getInstance();

export {
  GlobalOptions,
  authentication,
  dataProvider,
  fileProvider,
  functionProvider,
};
