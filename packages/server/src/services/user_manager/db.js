var mongoose = require("mongoose");
var Schema = mongoose.Schema;

let CollectionDefinition = require("../../class/collection_definition");
let { Permission, PermissionTypes } = require("../../class/security");
const { config } = require("../../config");
const triggerOperator = require("./../../class/trigger_operator");

let authSchema = new Schema({
  permissionGroup: String,
  email: String,
  phone: String,
  password: String,
  type: { type: String, default: "user", enum: ["user", "anonymous"] },
});

authSchema.index({ email: 1 }, { unique: true });
authSchema.pre(["save", "updateOne"], function (next) {
  // Encode the password before saving
  if (this.isModified("password")) {
    this.password = Buffer.from(this.password).toString("base64");
  }
  next();
});

authSchema.post("save", function (doc, next) {
  triggerOperator.call("insert-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("findOneAndUpdate", function (doc, next) {
  triggerOperator.call("update-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("updateOne", function (result, next) {
  triggerOperator.call("update-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("findOneAndDelete", function (doc, next) {
  triggerOperator.call("remove-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post("deleteOne", function (result, next) {
  triggerOperator.call("remove-one", "cms", "auth", {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

module.exports = [
  new CollectionDefinition({
    db: "cms",
    collection: "auth",
    schema: authSchema,
    permissions: [
      new Permission({
        type: PermissionTypes.advanced_settings,
        read: true,
        write: true,
      }),
    ],
    triggers: config.authTriggers || [],
  }),
];
