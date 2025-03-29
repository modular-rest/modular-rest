import { PermissionGroup } from './index';

export const permissionGroups = [
  new PermissionGroup({
    title: 'anonymous',
    isAnonymous: true,
    validPermissionTypes: ['anonymous_access'],
  }),

  new PermissionGroup({
    title: 'end-user',
    isDefault: true,
    validPermissionTypes: [
      'user_access',
      'anonymous_access',
      'upload_file_access',
      'remove_file_access',
    ],
  }),

  new PermissionGroup({
    title: 'administrator',
    validPermissionTypes: [
      'user_access',
      'anonymous_access',
      'upload_file_access',
      'remove_file_access',
      'advanced_settings',
    ],
  }),
];
