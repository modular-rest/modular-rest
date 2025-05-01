import { Schema } from 'mongoose';
import { Permission } from './security';
import { DatabaseTrigger } from './database_trigger';

/**
 * Configuration options for creating a collection definition.
 * This interface defines the structure for configuring MongoDB collections with their associated
 * schemas, permissions, and triggers.
 *
 * @inline
 *
 */
interface CollectionDefinitionOptions {
  /** The name of the database where the collection resides */
  database: string;
  /** The name of the collection to be configured */
  collection: string;
  /** List of permissions controlling access to the collection */
  permissions: Permission[];
  /** Optional database triggers for custom operations */
  triggers?: DatabaseTrigger[];

  /**
   * Mongoose schema definition for the collection
   * @type {Schema}
   * @see https://mongoosejs.com/docs/5.x/docs/guide.html
   */
  schema: Schema<any>;
}

/**
 * To have define any collection in your database you haveto use below method in your `db.[js|ts]` file and export an array of CollectionDefinition instances.
 *
 * @param {CollectionDefinitionOptions} options - The options for the collection
 * @expandType CollectionDefinitionOptions
 *
 * @returns A new instance of CollectionDefinition
 *
 * @public
 *
 * @example
 * ```typescript
 * import { defineCollection } from '@modular-rest/server';
 *
 * export default [
 *   defineCollection({
 *     database: 'users',
 *     collection: 'info',
 *     // schema: Schema,
 *     // permissions: Permission[]
 *     // trigger: DatabaseTrigger[]
 *   })
 * ]
 * ```
 */
export function defineCollection(options: CollectionDefinitionOptions) {
  return new CollectionDefinition(options);
}

/**
 * A class that represents a MongoDB collection configuration. Provides full support for schema validation, access control through permissions,
 * and custom triggers for various database operations.
 *
 * @hideconstructor
 *
 * @deprecated Use `defineCollection` instead.
 *
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
 *
 * @private
 */
export class CollectionDefinition {
  /** @readonly The name of the database */
  database: string;

  /** @readonly The name of the collection */
  collection: string;

  /** @readonly Mongoose schema definition */
  schema: Schema<any>;

  /** @readonly List of permissions for the collection */
  permissions: Permission[];

  /** @readonly Optional database triggers */
  triggers?: DatabaseTrigger[];

  /**
   * Creates a new CollectionDefinition instance
   *
   * @param options - Configuration options for the collection
   * @returns A new instance of CollectionDefinition
   *
   * @beta
   */
  constructor({
    database,
    collection,
    schema,
    permissions,
    triggers,
  }: CollectionDefinitionOptions) {
    this.database = database;
    this.collection = collection;
    this.schema = schema;
    this.permissions = permissions;
    this.triggers = triggers;
  }
}
