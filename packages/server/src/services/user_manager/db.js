var mongoose = require("mongoose");
var Schema = mongoose.Schema;

let CollectionDefinition = require("../../class/collection_definition");
let { Permission, PermissionTypes } = require("../../class/security");

/**
 * Permission schema
 *
 * This schema is generated dynamically
 * by combining default & custom permissions.
 */
let permissionSchemaConstructorOption = {
  title: String,
  isAnonymous: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
};
Object.keys(new PermissionTypes()).forEach((key) => {
  let fieldOption = { type: Boolean, default: false };
  permissionSchemaConstructorOption[key] = fieldOption;
});

let permissionSchema = new Schema(permissionSchemaConstructorOption);
permissionSchema.index({ title: 1 }, { unique: true });

let authSchema = new Schema({
  permission: {
    type: Schema.Types.ObjectId,
    ref: "permission",
    required: false,
  },
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

  new CollectionDefinition({
    db: "cms",
    collection: "permission",
    schema: permissionSchema,
    permissions: [
      new Permission({
        type: PermissionTypes.advanced_settings,
        read: true,
        write: true,
      }),
    ],
  }),
];
