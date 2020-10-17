var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let ComponentCollection = require('../../class/component_collection');
let { Permission, PermissionTypes } = require('../../class/security_definition');

let ImageSchema = new Schema({
    type: String,
    imgStamp: String
});

let permissionSchema = new Schema({
    advanced_settings: { type: Boolean, default: false },
    content_producer: { type: Boolean, default: false },
    customer_access: { type: Boolean, default: false },
    anonymous_access: { type: Boolean, default: false },
    user_manager: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    title: String,
});
permissionSchema.index({ title: 1 }, { unique: true });

let authSchema = new Schema({
    permission: { type: Schema.Types.ObjectId, ref: 'permission', required: false },
    email: String,
    phone: String,
    password: String,
    type: { type: String, default: 'user', enum: ['user', 'anonymous'] }
});
authSchema.index({ email: 1 }, { unique: true });

let detailSchema = new Schema({
    refId: { type: Schema.Types.ObjectId, ref: 'auth', required: true },
    fullname: String,
    imgStamp: String,
});
detailSchema.index({ refId: 1 }, { unique: true });

module.exports = [
    new ComponentCollection({
        db: 'cms',
        collection: 'auth',
        schema: authSchema,
        permissions: [
            new Permission({
                type: PermissionTypes.advanced_settings,
                read: true,
                write: true
            }),
        ]
    }),

    new ComponentCollection({
        db: 'cms',
        collection: 'permission',
        schema: permissionSchema,
        permissions: [
            new Permission({
                type: PermissionTypes.advanced_settings,
                read: true,
                write: true
            }),
        ],
    }),

    new ComponentCollection({
        db: 'cms',
        collection: 'user',
        schema: detailSchema,
        permissions: [
            new Permission({
                type: PermissionTypes.customer_access,
                read: true,
                write: true,
                onlyOwnData: true
            }),
            new Permission({
                type: PermissionTypes.user_manager,
                read: true,
                write: true
            }),
        ]
    })
]