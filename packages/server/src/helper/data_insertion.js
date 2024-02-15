const DataProvider = require("../services/data_provider/service");
const {
  getDefaultAnonymousPermissionGroup,
  getDefaultAdministratorPermissionGroup,
} = require("../services/user_manager/permissionManager");

async function createAdminUser({ email, password }) {
  let authModel = DataProvider.getCollection("cms", "auth");

  try {
    const isAnonymousExisted = await authModel
      .countDocuments({ type: "anonymous" })
      .exec();

    const isAdministratorExisted = await authModel
      .countDocuments({ type: "user", email: email })
      .exec();

    if (isAnonymousExisted == 0) {
      await new authModel({
        permission: getDefaultAnonymousPermissionGroup().title,
        email: "",
        phone: "",
        password: "",
        type: "anonymous",
      }).save();
    }

    if (isAdministratorExisted == 0) {
      if (!email || !password) {
        return Promise.reject("Invalid email or password for admin user.");
      }

      await new authModel({
        permission: getDefaultAdministratorPermissionGroup().title,
        email: email,
        password: password,
        type: "user",
      }).save();
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

module.exports = {
  createAdminUser,
};
