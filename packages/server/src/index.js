// Application
const createRest = require("./application");
const Schema = require("mongoose").Schema;

// Utilities
const paginator = require("./class/paginator");
const reply = require("./class/reply");
const validator = require("./class/validator");
const { getCollection } = require("./services/data_provider/service");
const { defineFunction } = require("./services/functions/service");
const TypeCasters = require("./services/data_provider/typeCasters");
const userManager = require("./services/user_manager/service");
const {
  getFile,
  getFileLink,
  getFilePath,
  removeFile,
  storeFile,
} = require("./services/file/service");

// Base class
const CollectionDefinition = require("./class/collection_definition");
const Schemas = require("./class/db_schemas");
const DatabaseTrigger = require("./class/database_trigger");
const CmsTrigger = require("./class/cms_trigger");
const SecurityClass = require("./class/security");
const middleware = require("./middlewares");

module.exports = {
  createRest,

  // Database
  CollectionDefinition,
  Schemas,
  Schema,
  DatabaseTrigger,
  CmsTrigger,
  ...SecurityClass,

  // Function
  defineFunction,

  // Private utilities
  TypeCasters,
  validator,

  // Route utilities
  reply,
  paginator,

  // Database utilities
  getCollection,

  // File Utilities
  getFile,
  getFileLink,
  getFilePath,
  removeFile,
  storeFile,

  // Middleware utilities
  middleware,

  // User utilities
  userManager: userManager.main,
};
