import { Schema } from 'mongoose';
import { Permission } from './security';
import { DatabaseTrigger } from './database_trigger';

/**
 * Configuration options for creating a collection definition
 * @interface CollectionDefinitionOptions
 * @property {string} database - The name of the database
 * @property {string} collection - The name of the collection
 * @property {Schema} schema - Mongoose schema definition
 * @property {Permission[]} permissions - List of permissions for the collection
 * @property {DatabaseTrigger[]} [triggers] - Optional database triggers
 */
interface CollectionDefinitionOptions {
  database: string;
  collection: string;
  schema: Schema;
  permissions: Permission[];
  triggers?: DatabaseTrigger[];
}

/**
 * Defines a MongoDB collection with associated permissions and triggers
 * @class CollectionDefinition
 * @property {string} database - The name of the database
 * @property {string} collection - The name of the collection
 * @property {Schema} schema - Mongoose schema definition
 * @property {Permission[]} permissions - List of permissions for the collection
 * @property {DatabaseTrigger[]} [triggers] - Optional database triggers
 * @example
 * ```typescript
 * const userSchema = new Schema({
 *   name: String,
 *   email: String,
 *   age: Number
 * });
 *
 * const collection = new CollectionDefinition({
 *   database: 'myapp',
 *   collection: 'users',
 *   schema: userSchema,
 *   permissions: [
 *     new Permission({
 *       type: 'user_access',
 *       read: true,
 *       write: true
 *     })
 *   ],
 *   triggers: [
 *     new DatabaseTrigger('insert-one', (data) => {
 *       console.log('New user created:', data);
 *     })
 *   ]
 * });
 * ```
 */
export class CollectionDefinition {
  database: string;
  collection: string;
  schema: Schema;
  permissions: Permission[];
  triggers?: DatabaseTrigger[];

  /**
   * Creates a new CollectionDefinition instance
   * @param {CollectionDefinitionOptions} options - Configuration options
   */
  constructor({
    database,
    collection,
    schema,
    permissions,
    triggers,
  }: CollectionDefinitionOptions) {
    // string
    this.database = database;
    // string
    this.collection = collection;
    // schema object of mongoose
    this.schema = schema;
    // a list of Permission for this collection
    this.permissions = permissions;
    // optional database triggers
    this.triggers = triggers;
  }
}

export default CollectionDefinition;
