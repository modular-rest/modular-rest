const DataProvider = require("../services/data_provider/service");
const {
  getDefaultAnonymousPermissionGroup,
  getDefaultAdministratorPermissionGroup,
} = require("../services/user_manager/permissionManager");

const userManager = require("../services/user_manager/service");

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
      await userManager.main.registerUser({
        permissionGroup: getDefaultAnonymousPermissionGroup().title,
        email: "",
        phone: "",
        password: "",
        type: "anonymous",
      });
      // await new authModel({
      //   permission: getDefaultAnonymousPermissionGroup().title,
      //   email: "",
      //   phone: "",
      //   password: "",
      //   type: "anonymous",
      // }).save();
    }

    if (isAdministratorExisted == 0) {
      if (!email || !password) {
        return Promise.reject("Invalid email or password for admin user.");
      }

      await userManager.main.registerUser({
        permissionGroup: getDefaultAdministratorPermissionGroup().title,
        email: email,
        password: password,
        type: "user",
      });

      // await new authModel({
      //   permission: getDefaultAdministratorPermissionGroup().title,
      //   email: email,
      //   password: password,
      //   type: "user",
      // }).save();
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

module.exports = {
  createAdminUser,
};
