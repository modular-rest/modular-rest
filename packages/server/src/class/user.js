const { config } = require("../config");
let validateObject = require("./validator");

module.exports = class User {
  constructor(id, permissionGroup, phone, email, password, type, model) {
    this.id = id;
    this.permissionGroup = permissionGroup;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.type = type;
    this.dbModel = model;
  }

  getBrief() {
    const permissionGroup = config.permissionGroups.find(
      (group) => group.title == this.permissionGroup
    );

    const brief = {
      id: this.id,
      permissionGroup: permissionGroup,
      phone: this.phone,
      email: this.email,
      type: this.type,
    };

    return brief;
  }

  setNewDetail(detail) {
    if (detail.phone) this.phone = detail.phone;
    if (detail.email) this.email = detail.email;
    if (detail.password) this.password = detail.password;
  }

  hasPermission(permissionField) {
    const permissionGroup = config.permissionGroups.find(
      (group) => group.title == this.permissionGroup
    );

    if (permissionGroup == null) return false;

    let key = false;

    for (let i = 0; i < permissionGroup.validPermissionTypes.length; i++) {
      const userPermissionType = permissionGroup.validPermissionTypes[i];

      if (userPermissionType == permissionField) {
        key = true;
        break;
      }
    }

    return key;
  }

  async save() {
    this.mode["permissionGroup"] = this.permissionGroup;
    this.mode["phone"] = this.phone;
    this.mode["email"] = this.email;
    this.mode["password"] = this.password;

    await mode.save();
  }

  static loadFromModel(model) {
    return new Promise((done, reject) => {
      // check required fields
      let isValidData = validateObject(
        model,
        "fullname email password permission"
      );
      if (!isValidData) reject(User.notValid(detail));

      let id = model.id;
      let permissionGroup = model.permissionGroup;
      let phone = model.phone;
      let email = model.email;
      let password = model.password;
      let type = model.type;

      //create user
      let newUser = new User(
        id,
        permissionGroup,
        phone,
        email,
        password,
        type,
        model
      );
      done(newUser);
    });
  }

  static createFromModel(model, detail) {
    return new Promise(async (done, reject) => {
      //create user
      await new model(detail)
        .save()
        .then((newUser) => done(User.loadFromModel(newUser)))
        .catch(reject);
    });
  }

  static notValid(object) {
    let error = `user detail are not valid ${object}`;
    console.error(error);
    return error;
  }
};
