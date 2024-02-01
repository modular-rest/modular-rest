// Application
const createRest = require("./application");
const Schema = require("mongoose").Schema;

// Utilities
const paginator = require("./class/paginator");
const reply = require("./class/reply");
const validator = require("./class/validator");
const { getCollection } = require("./services/data_provider/service");
const TypeCasters = require("./services/data_provider/typeCasters");

// Base class
const CollectionDefinition = require("./class/collection_definition");
const Schemas = require("./class/db_schemas");
const DatabaseTrigger = require("./class/database_trigger");
const SecurityClass = require("./class/security");
const middleware = require("./middlewares");
const userManager = require("./services/user_manager/service");

module.exports = {
  createRest,

  // Route utilities
  reply,
  TypeCasters,
  paginator,
  validator,

  // Service utilities
  getCollection,

  // Database
  CollectionDefinition,
  Schemas,
  Schema,
  DatabaseTrigger,
  ...SecurityClass,

  // Middlewares
  middleware,
  userManager: userManager.main,
};
