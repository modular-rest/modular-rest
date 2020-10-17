var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let ComponentCollection = require('../../class/component_collection');
let { Permission, PermissionTypes } = require('../../class/security_definition');

module.exports = [
    new ComponentCollection({
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