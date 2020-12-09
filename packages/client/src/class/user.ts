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
    type: string;
    private permission: any;

    constructor(detail: { email?: string, phone?: string, id: string, permission: any }) {
        if (detail.email)
            this.email = detail.email;
        if (detail.phone)
            this.phone = detail.phone;

        this.id = detail.id;
        this.permission = detail.permission;
        this.type = detail.permission.title;
    }

    /**
     * Check whether or not the user has access to an specific permission.
     * @param permissionName permission name
     */
    hasAccess(permissionName: string) {
        if (this.permission[permissionName] != undefined)
            return this.permission[permissionName];
        else return false;
    }
}

export default User;