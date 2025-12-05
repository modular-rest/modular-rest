import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { CollectionDefinition } from '../../class/collection_definition';
import { Permission, PermissionTypes } from '../../class/security';
import { config } from '../../config';
import triggerOperator from '../../class/trigger_operator';

interface AuthDocument extends mongoose.Document {
  password: string;
  isModified(path: string): boolean;
}

const authSchema = new Schema(
  {
    permissionGroup: { type: String, required: true },
    type: { type: String, required: true, default: 'user', enum: ['user', 'anonymous'] },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    password: { type: String, required: false },
  },
  { timestamps: true }
);

authSchema.index({ email: 1 }, { unique: true });
authSchema.pre(['save', 'updateOne'], function (this: AuthDocument, next) {
  // Encode the password before saving
  if (this.isModified && this.isModified('password') && this.password) {
    this.password = Buffer.from(this.password).toString('base64');
  }
  next();
});

authSchema.post('save', function (doc: any, next) {
  triggerOperator.call('insert-one', 'cms', 'auth', {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post('findOneAndUpdate', function (doc: any, next) {
  triggerOperator.call('update-one', 'cms', 'auth', {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post('updateOne', function (result: any, next) {
  triggerOperator.call('update-one', 'cms', 'auth', {
    query: null,
    queryResult: result,
  });
  next();
});

authSchema.post('findOneAndDelete', function (doc: any, next) {
  triggerOperator.call('remove-one', 'cms', 'auth', {
    query: null,
    queryResult: doc._doc,
  });
  next();
});

authSchema.post('deleteOne', function (result: any, next) {
  triggerOperator.call('remove-one', 'cms', 'auth', {
    query: null,
    queryResult: result,
  });
  next();
});

module.exports = [
  new CollectionDefinition({
    database: 'cms',
    collection: 'auth',
    schema: authSchema,
    permissions: [
      new Permission({
        accessType: PermissionTypes.advanced_settings,
        read: true,
        write: true,
      }),
    ],
    triggers: config.authTriggers || [],
  }),
];
