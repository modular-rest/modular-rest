import { Schema } from "mongoose";
import { Permission } from "./security";
import { DatabaseTrigger } from "./database_trigger";

interface CollectionDefinitionOptions {
  db: string;
  collection: string;
  schema: Schema;
  permissions: Permission[];
  triggers?: DatabaseTrigger[];
}

/**
 * This class helps to create a mongoose collection
 * associated with permissions and triggers.
 */
export class CollectionDefinition {
  database: string;
  collection: string;
  schema: Schema;
  permissions: Permission[];
  triggers?: DatabaseTrigger[];

  /**
   * Creates a new CollectionDefinition instance
   *
   * @param options - Configuration options
   */
  constructor({
    db,
    collection,
    schema,
    permissions,
    triggers,
  }: CollectionDefinitionOptions) {
    // string
    this.database = db;
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
