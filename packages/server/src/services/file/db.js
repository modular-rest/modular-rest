var mongoose = require('mongoose');
var Schemas = require('../../class/db_schemas');

let CollectionDefinition = require('../../class/collection_definition');
let { Permission, PermissionTypes } = require('../../class/security');

module.exports = [
    new CollectionDefinition({
        db: 'cms',
        collection: 'file',
        schema: Schemas.file,
        permissions: [
            new Permission({
                type: PermissionTypes.upload_file_access,
                read: true,
                write: true,
                onlyOwnData: false,
            }),
            new Permission({
                type: PermissionTypes.remove_file_access,
                read: true,
                write: true,
                onlyOwnData: false,
            }),
        ],
    }),
]