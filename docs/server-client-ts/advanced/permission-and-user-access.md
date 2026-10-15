# Concept

The permission system in this framework provides a robust way to control access to your application's resources. It works by matching permission types that users have against those required by different parts of the system.

### How It Works?

At its core, the permission system uses access types - special flags like `user_access`, `advanced_settings`, or custom types you define. These access types are used in two key places:

1. **Permission**: When defining collections or functions, you provide a list of Permission instances that specify which access types are required. Each Permission instance defines what operations (read/write) are allowed for a specific access type. For example, one Permission might allow read access for `user_access`, while another Permission enables write access for `advanced_settings`.

2. **Permission Group**: Each user is assigned certain access types through their permission group. When they try to access a resource, the system checks if they have the required permission types.

The system only allows an operation when there's a match between the permission types required by the resource and those assigned to the user making the request.

### Own data only

A collection permission with `onlyOwnData: true` grants its operations on the user's own documents only: those whose `ownerIdField` (default `refId`) holds the user's id. The data provider enforces it on every route:

- `find`, `find-one`, `count`, `update-one` and `remove-one` get the owner field set to the caller in their query, replacing any value the client sent. `findByIds` and `aggregate` match it in their first stage.
- `insert-one` stores the document with the owner field set to the caller.
- `update-one` refuses updates that change the owner field, in any form, and update pipelines.
- `aggregate` may only use stages that work on the matched documents (`$match`, `$project`, `$group`, `$sort`, `$facet`, …), and no JavaScript operators.

When several permissions grant an operation, the widest wins: one without `onlyOwnData` gives full access. A permission grants only the operations its `read` and `write` flags allow.

For every caller, the data provider also checks:

- `options` on `find` and `find-one`: only `sort`, `limit`, `skip`, `select`, `lean`, `collation`, `hint`, `maxTimeMS`, `comment`, `batchSize` and `allowDiskUse`.
- `populates`: each path must reference a registered collection the caller may read, and gets the owner match of that collection when the caller may only read their own documents there.
- Aggregate stages that reach another collection (`$lookup`, `$graphLookup`, `$unionWith`, `$out`, `$merge`) need full read (or, for `$out` and `$merge`, write) access to it.

## Permission
<!-- @include: @/server-client-ts/generative/classes/permission.md -->

## Permission Types
<!-- @include: @/server-client-ts/generative/classes/permissionTypes.md -->

## Access Types
<!-- @include: @/server-client-ts/generative/classes/accessTypes.md -->

## Access Definition
<!-- @include: @/server-client-ts/generative/classes/accessDefinition.md -->

## Permission Group
<!-- @include: @/server-client-ts/generative/classes/permissionGroup.md -->

