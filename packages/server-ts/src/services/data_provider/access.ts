import mongoose, { Model } from 'mongoose';
import { AccessTypes } from '../../class/security';
import { User } from '../../class/user';
import { AccessGrant, findCollectionOfModel, resolveAccess } from './service';

/**
 * Shapes data-provider requests to what the caller's {@link AccessGrant} allows.
 *
 * When a user may only reach their own documents (an `onlyOwnData` permission), every
 * query, document, pipeline and populate is pinned to the owner field, and the parts of a
 * request that could reach past it are refused: changing the owner field, update
 * pipelines, aggregate stages that read other collections or run JavaScript.
 *
 * For every caller, populates and aggregate stages that reach another collection are
 * checked against that collection's own permissions.
 */

/**
 * A refused request: the router answers with `status` and `message`.
 */
export class AccessError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const forbid = (message: string) => new AccessError(403, message);
const malformed = (message: string) => new AccessError(412, message);

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOwnOnly(grant: AccessGrant): grant is Required<AccessGrant> {
  return Boolean(grant.ownerIdField);
}

/**
 * Returns the query with the owner field pinned to the caller. Top-level filter fields are
 * ANDed, so nothing else in the query (`$or`, `$and`, `$expr`, …) can widen the match.
 */
export function ownQuery(query: unknown, grant: AccessGrant): any {
  if (!isOwnOnly(grant)) return query;
  if (query !== undefined && query !== null && !isPlainObject(query)) {
    throw malformed('query must be an object');
  }
  return { ...(query || {}), [grant.ownerIdField]: grant.ownerId };
}

/**
 * Returns the document with the owner field set to the caller.
 */
export function ownDoc(doc: unknown, grant: AccessGrant): any {
  if (!isOwnOnly(grant)) return doc;
  if (!isPlainObject(doc)) throw malformed('doc must be an object');
  return { ...doc, [grant.ownerIdField]: grant.ownerId };
}

/** Every field path an update document writes, across operators and replacement form. */
function updatedFields(update: Record<string, any>): string[] {
  const fields: string[] = [];
  for (const [key, value] of Object.entries(update)) {
    if (!key.startsWith('$')) {
      fields.push(key);
      continue;
    }
    if (!isPlainObject(value)) throw malformed(`${key} must be an object`);
    fields.push(...Object.keys(value));
    // $rename writes the new name as well as removing the old one.
    if (key === '$rename') fields.push(...Object.values(value).map(String));
  }
  return fields;
}

/**
 * Refuses an update that could move a document out of the caller's ownership: one that
 * touches the owner field in any form, or an update pipeline, which can compute any field.
 */
export function assertOwnUpdate(update: unknown, grant: AccessGrant): void {
  if (!isOwnOnly(grant)) return;
  if (!isPlainObject(update)) throw malformed('update must be an object');
  const touchesOwner = updatedFields(update).some(field => field.split('.')[0] === grant.ownerIdField);
  if (touchesOwner) throw forbid(`${grant.ownerIdField} can't be changed`);
}

/** The value to match the owner field with in a pipeline, where Mongoose does not cast. */
export function ownerValue(model: Model<any>, grant: Required<AccessGrant>): unknown {
  const type = (model.schema.path(grant.ownerIdField) as any)?.instance;
  if (type !== 'ObjectId') return grant.ownerId;
  try {
    return new mongoose.Types.ObjectId(grant.ownerId);
  } catch {
    throw forbid("the caller's id is not a valid owner id");
  }
}

/** Returns the `$match` filter that pins a pipeline to the caller, if any. */
export function ownMatch(model: Model<any>, grant: AccessGrant): Record<string, unknown> {
  if (!isOwnOnly(grant)) return {};
  return { [grant.ownerIdField]: ownerValue(model, grant) };
}

// Stages a caller limited to their own documents may use in an aggregate.
const OWN_DATA_STAGES = [
  '$match',
  '$project',
  '$addFields',
  '$set',
  '$unset',
  '$group',
  '$sort',
  '$limit',
  '$skip',
  '$count',
  '$unwind',
  '$sortByCount',
  '$bucket',
  '$bucketAuto',
  '$facet',
  '$replaceRoot',
  '$replaceWith',
  '$sample',
];

// Operators that run JavaScript on the database server, refused to callers limited to
// their own documents.
const JAVASCRIPT_OPERATORS = ['$function', '$accumulator', '$where'];

/** Calls `visit` for every key/value pair in a pipeline, at any depth. */
function walk(value: unknown, visit: (key: string, inner: any) => void): void {
  if (Array.isArray(value)) {
    value.forEach(item => walk(item, visit));
  } else if (isPlainObject(value)) {
    for (const [key, inner] of Object.entries(value)) {
      visit(key, inner);
      walk(inner, visit);
    }
  }
}

/** The collection a cross-collection stage names, or the reason it can't be checked. */
function stageTarget(key: string, spec: any): string | AccessError | undefined {
  if (key === '$lookup' || key === '$graphLookup') {
    if (spec?.from === undefined) return undefined; // a $lookup on $documents reads nothing
    return typeof spec.from === 'string' ? spec.from : malformed(`${key}.from must be a collection name`);
  }
  if (key === '$unionWith') {
    const coll = typeof spec === 'string' ? spec : spec?.coll;
    return typeof coll === 'string' ? coll : malformed('$unionWith must name a collection');
  }
  if (key === '$out' || key === '$merge') {
    const into = key === '$merge' && isPlainObject(spec) ? spec.into : spec;
    // `{ db, coll }` targets name physical databases, which permissions don't cover.
    return typeof into === 'string' ? into : forbid(`${key} may only name a collection of this database`);
  }
  return undefined;
}

/**
 * Checks a client's aggregate pipeline and returns the one to run.
 *
 * Stages that read or write another collection (`$lookup`, `$graphLookup`, `$unionWith`,
 * `$out`, `$merge`) need full access to it, for reads or writes respectively. A caller
 * limited to their own documents gets a `$match` on the owner field as the first stage and
 * may only use stages that work on the documents that match.
 */
export function ownPipeline(
  pipeline: unknown,
  request: { database: string; model: Model<any>; grant: AccessGrant; user: User }
): any[] {
  if (!Array.isArray(pipeline)) throw malformed('pipelines must be an array');
  const { database, model, grant, user } = request;

  walk(pipeline, (key, spec) => {
    const target = stageTarget(key, spec);
    if (target instanceof AccessError) throw target;
    if (target === undefined) return;
    const operation = key === '$out' || key === '$merge' ? AccessTypes.write : AccessTypes.read;
    const targetGrant = resolveAccess(database, target, operation, user);
    if (!targetGrant || isOwnOnly(targetGrant)) throw forbid(`${key} needs full ${operation} access to ${target}`);
  });

  if (!isOwnOnly(grant)) return pipeline;

  for (const stage of pipeline) {
    const keys = isPlainObject(stage) ? Object.keys(stage) : [];
    if (keys.length !== 1) throw malformed('each pipeline stage must be an object with one stage operator');
    if (!OWN_DATA_STAGES.includes(keys[0])) throw forbid(`aggregate stage ${keys[0]} is not allowed`);
  }
  walk(pipeline, key => {
    if (JAVASCRIPT_OPERATORS.includes(key)) throw forbid(`aggregate operator ${key} is not allowed`);
  });

  return [{ $match: ownMatch(model, grant) }, ...pipeline];
}

// The keys a client's populate entry may hold. `model` and nested `populate` would reach
// collections the checks below never saw.
const POPULATE_KEYS = ['path', 'select', 'match'];

/** The registered collection a schema path references, if any. */
function referencedCollection(
  model: Model<any>,
  path: string
): { database: string; collection: string } | undefined {
  const type: any = model.schema.path(path);
  const ref = type?.options?.ref ?? type?.caster?.options?.ref ?? type?.options?.type?.[0]?.ref;
  // A model reference (cross-database populate), or a model name, which Mongoose looks up on
  // the referencing model's connection (shared by every logical database in singleDatabase mode).
  if (typeof ref === 'function') return findCollectionOfModel(ref);
  if (typeof ref !== 'string') return undefined;
  const target = model.db.models[ref];
  return target ? findCollectionOfModel(target) : undefined;
}

/**
 * Checks a client's populates and returns the ones to apply.
 *
 * Each path must reference a registered collection the caller may read. When the caller
 * may only read their own documents there, the populate gets a `match` on the owner field,
 * so ids stored in the caller's documents can't pull in anyone else's.
 */
export function ownPopulates(
  populates: unknown,
  request: { model: Model<any>; user: User }
): any[] {
  if (!Array.isArray(populates)) throw malformed('populates must be an array');
  const { model, user } = request;

  return populates.flatMap(entry => {
    const spec = typeof entry === 'string' ? { path: entry } : entry;
    if (!isPlainObject(spec) || typeof spec.path !== 'string') throw malformed('each populate needs a path');
    const refused = Object.keys(spec).filter(key => !POPULATE_KEYS.includes(key));
    if (refused.length > 0) throw forbid(`populate options not allowed: ${refused.join(', ')}`);
    if (spec.match !== undefined && !isPlainObject(spec.match)) throw malformed('populate match must be an object');

    // Mongoose reads "a b" as two paths.
    return spec.path
      .split(/\s+/)
      .filter(Boolean)
      .map((path: string) => {
        const target = referencedCollection(model, path);
        const grant = target && resolveAccess(target.database, target.collection, AccessTypes.read, user);
        if (!grant) throw forbid(`${path} can't be populated`);
        const match = isOwnOnly(grant) ? { ...(spec.match || {}), [grant.ownerIdField]: grant.ownerId } : spec.match;
        return {
          path,
          ...(spec.select !== undefined ? { select: spec.select } : {}),
          ...(match !== undefined ? { match } : {}),
        };
      });
  });
}

// update-one options a caller limited to their own documents may send.
const OWN_UPDATE_OPTION_KEYS = ['upsert', 'arrayFilters', 'runValidators'];

/** Refuses update-one options outside the short list, for callers limited to their own documents. */
export function assertOwnUpdateOptions(options: unknown, grant: AccessGrant): void {
  if (!isOwnOnly(grant) || options === undefined || options === null) return;
  if (!isPlainObject(options)) throw malformed('options must be an object');
  const refused = Object.keys(options).filter(key => !OWN_UPDATE_OPTION_KEYS.includes(key));
  if (refused.length > 0) throw forbid(`options not allowed: ${refused.join(', ')}`);
}
