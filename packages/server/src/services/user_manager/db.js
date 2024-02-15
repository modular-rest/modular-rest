var mongoose = require("mongoose");
var Schema = mongoose.Schema;

let CollectionDefinition = require("../../class/collection_definition");
let { Permission, PermissionTypes } = require("../../class/security");

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
  }),
];
