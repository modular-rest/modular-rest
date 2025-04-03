import mongoose from 'mongoose';
import schemas from '../../class/db_schemas';
import { CollectionDefinition } from '../../class/collection_definition';
import { Permission, PermissionTypes } from '../../class/security';
import { config } from '../../config';
import { Schema } from 'mongoose';

module.exports = [
  new CollectionDefinition({
    database: 'cms',
    collection: 'file',
    schema: schemas.file as unknown as Schema,
    permissions: [
      new Permission({
        accessType: PermissionTypes.upload_file_access,
        read: true,
        write: true,
        onlyOwnData: false,
      }),
      new Permission({
        accessType: PermissionTypes.remove_file_access,
        read: true,
        write: true,
        onlyOwnData: false,
      }),
    ],
    triggers: config.fileTriggers || [],
  }),
];
