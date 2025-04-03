import * as DataProvider from '../services/data_provider/service';
import {
  getDefaultAnonymousPermissionGroup,
  getDefaultAdministratorPermissionGroup,
} from '../services/user_manager/permissionManager';
import * as userManager from '../services/user_manager/service';

/**
 * Admin user credentials interface
 * @interface AdminCredentials
 * @property {string} email - Admin user email address
 * @property {string} password - Admin user password
 */
interface AdminCredentials {
  email: string;
  password: string;
}

/**
 * Creates default system users if they don't exist
 * @function createAdminUser
 * @param {AdminCredentials} credentials - Admin user credentials
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 * @throws {Error} If admin credentials are invalid or if the operation fails
 * @description
 * This function performs the following operations:
 * 1. Checks if an anonymous user exists, creates one if it doesn't
 * 2. Checks if an administrator user exists, creates one if it doesn't
 * 3. Uses the provided credentials for the administrator user
 *
 * @example
 * ```typescript
 * // Create default system users
 * await createAdminUser({
 *   email: 'admin@example.com',
 *   password: 'secure-password'
 * });
 *
 * // The function will:
 * // 1. Create an anonymous user if it doesn't exist
 * // 2. Create an admin user with the provided credentials if it doesn't exist
 * // 3. Do nothing if both users already exist
 * ```
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
