import { config } from '../../config';
import { PermissionGroup } from '../../class/security';

/**
 * Get the default permission group
 * @returns Default permission group
 * @throws Error if default permission group not found
 */
export function getDefaultPermissionGroups(): PermissionGroup {
  const defaultPermissionGroups = config.permissionGroups?.find(group => group.isDefault);

  if (defaultPermissionGroups == null) {
    throw new Error('Default permission group not found');
  }

  return defaultPermissionGroups;
}

/**
 * Get the anonymous permission group
 * @returns Anonymous permission group
 * @throws Error if anonymous permission group not found
 */
export function getDefaultAnonymousPermissionGroup(): PermissionGroup {
  const anonymousPermission = config.permissionGroups?.find(group => group.isAnonymous);

  if (anonymousPermission == null) {
    throw new Error('Anonymous permission group not found');
  }

  return anonymousPermission;
}

/**
 * Get the administrator permission group
 * @returns Administrator permission group
 * @throws Error if administrator permission group not found
 */
export function getDefaultAdministratorPermissionGroup(): PermissionGroup {
  const administratorPermission = config.permissionGroups?.find(
    group => group.title.toString() === 'administrator'
  );

  if (administratorPermission == null) {
    throw new Error('Administrator permission group not found');
  }

  return administratorPermission;
}
