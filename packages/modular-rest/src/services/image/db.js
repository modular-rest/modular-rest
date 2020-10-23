var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let CollectionDefinition = require('../../class/collection_definition');
let { Permission, PermissionTypes } = require('../../class/security');

module.exports = [
    new CollectionDefinition({
        db: 'cms',
        collection: 'slideshow',
        schema: new Schema({
            showDetail: Boolean,
            refId: String,
            local_title: Object,
            local_subtitle: Object,
            imgStamp: String,
            link: String,
        }),
        permissions: [
            new Permission({
                type: PermissionTypes.advanced_settings,
                read: true,
                write: false,
                onlyOwnData: false,
            })
        ],
    }),
]