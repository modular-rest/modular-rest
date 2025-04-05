import { PermissionGroup } from './class/security';

export const permissionGroups = [
  new PermissionGroup({
    title: 'anonymous',
    isAnonymous: true,
    allowedAccessTypes: ['anonymous_access'],
  }),

  new PermissionGroup({
    title: 'end-user',
    isDefault: true,
    allowedAccessTypes: [
      'user_access',
      'anonymous_access',
      'upload_file_access',
      'remove_file_access',
    ],
  }),

  new PermissionGroup({
    title: 'administrator',
    allowedAccessTypes: [
      'user_access',
      'anonymous_access',
      'upload_file_access',
      'remove_file_access',
      'advanced_settings',
    ],
  }),
];
