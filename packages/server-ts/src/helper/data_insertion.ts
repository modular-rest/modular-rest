import * as DataProvider from '../services/data_provider/service';
import {
  getDefaultAnonymousPermissionGroup,
  getDefaultAdministratorPermissionGroup,
} from '../services/user_manager/permissionManager';
import * as userManager from '../services/user_manager/service';

/**
 * Admin user credentials interface
 */
interface AdminCredentials {
  email: string;
  password: string;
}

/**
 * Creates an admin user if one doesn't exist already
 * Also creates an anonymous user if one doesn't exist
 * @param credentials - Admin user credentials
 */
export async function createAdminUser({ email, password }: AdminCredentials): Promise<void> {
  const authModel = DataProvider.getCollection('cms', 'auth');

  try {
    const isAnonymousExisted = await authModel.countDocuments({ type: 'anonymous' }).exec();

    const isAdministratorExisted = await authModel
      .countDocuments({ type: 'user', email: email })
      .exec();

    if (isAnonymousExisted === 0) {
      await userManager.main.registerUser({
        permissionGroup: getDefaultAnonymousPermissionGroup().title,
        email: '',
        phone: '',
        password: '',
        type: 'anonymous',
      });
      // await new authModel({
      //   permission: getDefaultAnonymousPermissionGroup().title,
      //   email: "",
      //   phone: "",
      //   password: "",
      //   type: "anonymous",
      // }).save();
    }

    if (isAdministratorExisted === 0) {
      if (!email || !password) {
        return Promise.reject('Invalid email or password for admin user.');
      }

      await userManager.main.registerUser({
        permissionGroup: getDefaultAdministratorPermissionGroup().title,
        email: email,
        password: password,
        type: 'user',
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
