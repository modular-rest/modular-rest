export interface PermissionGroup {
  /** @hidden */
  title: string;
  /** @hidden */
  isDefault: boolean;
  /** @hidden */
  isAnonymous: boolean;
  /** @hidden */
  allowedAccessTypes: string[];
}

class User {
  /**
   * Registered email
   */
  email?: string;
  /**
   * Registered phone
   */
  phone?: string;
  /**
   * Unique generated id for the user
   */
  id: string;
  /**
   * permission type
   */
  type: "user" | "anonymous";
  private permissionGroup: PermissionGroup;

  constructor(detail: {
    email?: string;
    phone?: string;
    id: string;
    permissionGroup: any;
    type: string;
  }) {
    if (detail.email) this.email = detail.email;
    if (detail.phone) this.phone = detail.phone;

    this.id = detail.id;
    this.permissionGroup = detail.permissionGroup;
    this.type = detail.type;
  }

  /**
   * Check whether or not the user has access to an specific permission.
   * @param permissionField permission name
   */
  hasAccess(permissionField: string) {
    if (this.permissionGroup == null) return false;

    let key = false;

    for (let i = 0; i < this.permissionGroup.validPermissionTypes.length; i++) {
      const userPermissionType = this.permissionGroup.validPermissionTypes[i];

      if (userPermissionType == permissionField) {
        key = true;
        break;
      }
    }

    return key;
  }
}

export default User;
