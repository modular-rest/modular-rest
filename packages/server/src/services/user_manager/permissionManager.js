const { config } = require("../../config");

function getDefaultPermissionGroups() {
  const defaultPermissionGroups = config.permissionGroups.find(
    (group) => group.isDefault
  );

  if (defaultPermissionGroups == null) {
    throw new Error("Default permission group not found");
  }

  return defaultPermissionGroups;
}

function getDefaultAnonymousPermissionGroup() {
  const anonymousPermission = config.permissionGroups.find(
    (group) => group.isAnonymous
  );

  if (anonymousPermission == null) {
    throw new Error("Anonymous permission group not found");
  }

  return anonymousPermission;
}

function getDefaultAdministratorPermissionGroup() {
  const administratorPermission = config.permissionGroups.find(
    (group) => group.title.toString() == "administrator"
  );

  if (administratorPermission == null) {
    throw new Error("Administrator permission group not found");
  }

  return administratorPermission;
}

module.exports = {
  getDefaultPermissionGroups,
  getDefaultAnonymousPermissionGroup,
  getDefaultAdministratorPermissionGroup,
};
