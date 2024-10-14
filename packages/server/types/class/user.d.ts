export = User;
declare class User {
    static loadFromModel(model: any): Promise<any>;
    static createFromModel(model: any, detail: any): Promise<any>;
    static notValid(object: any): string;
    constructor(id: any, permissionGroup: any, phone: any, email: any, password: any, type: any, model: any);
    id: any;
    permissionGroup: any;
    email: any;
    phone: any;
    password: any;
    type: any;
    dbModel: any;
    getBrief(): {
        id: any;
        permissionGroup: import("./security").PermissionGroup;
        phone: any;
        email: any;
        type: any;
    };
    setNewDetail(detail: any): void;
    hasPermission(permissionField: any): boolean;
    save(): Promise<void>;
}
