import { Schema } from 'mongoose';
import { Permission } from './security';
import { DatabaseTrigger } from './database_trigger';

/**
 * Configuration options for creating a collection definition.
 *
 * @remarks
 * This interface defines the structure for configuring MongoDB collections with their associated
 * schemas, permissions, and triggers.
 *
 * @param database - The name of the database where the collection resides
 * @param collection - The name of the collection to be configured
 * @param schema - Mongoose schema definition for the collection
 * @param permissions - List of permissions controlling access to the collection
 * @param triggers - Optional database triggers for custom operations
 *
 * @beta
 */
interface CollectionDefinitionOptions {
  database: string;
  collection: string;
  schema: Schema;
  permissions: Permission[];
  triggers?: DatabaseTrigger[];
}

/**
 * A class that represents a MongoDB collection configuration.
 *
 * @remarks
 * Provides full support for schema validation, access control through permissions,
 * and custom triggers for various database operations.
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
 * @public
 */
export class CollectionDefinition {
  /** @readonly The name of the database */
  database: string;

  /** @readonly The name of the collection */
  collection: string;

  /** @readonly Mongoose schema definition */
  schema: Schema;

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

export default CollectionDefinition;
