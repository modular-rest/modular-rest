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

  // Wait for connection to be ready for queries
  const connection = authModel.db;
  if (connection) {
    if (connection.readyState !== 1) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout - connection not ready after 10s'));
        }, 10000);

        if (connection.readyState === 1) {
          clearTimeout(timeout);
          resolve();
        } else {
          connection.once('connected', () => {
            clearTimeout(timeout);
            resolve();
          });
          connection.once('error', err => {
            clearTimeout(timeout);
            reject(err);
          });
        }
      });
    }

    // Test if database is actually ready by doing a simple operation
    // This ensures the connection is fully initialized
    let retries = 5;
    let lastError: Error | null = null;
    while (retries > 0) {
      try {
        await authModel.findOne({}).limit(1).maxTimeMS(3000).lean().exec();
        // Additional small delay to ensure write operations will work
        await new Promise(resolve => setTimeout(resolve, 100));
        break; // Success, connection is ready
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    if (retries === 0 && lastError) {
      throw new Error(`Database not ready for queries: ${lastError.message}`);
    }
  }

  try {
    // Execute queries with explicit timeout handling
    const queryOptions = { maxTimeMS: 5000 }; // 5 second timeout

    const isAnonymousExisted = await authModel
      .countDocuments({ type: 'anonymous' })
      .maxTimeMS(5000)
      .exec();

    const isAdministratorExisted = await authModel
      .countDocuments({ type: 'user', email: email })
      .maxTimeMS(5000)
      .exec();

    if (isAnonymousExisted === 0) {
      // Wrap registerUser with timeout to prevent hanging
      try {
        let timeoutId: NodeJS.Timeout;
        await Promise.race([
          userManager.main.registerUser({
            permissionGroup: getDefaultAnonymousPermissionGroup().title,
            email: '',
            phone: '',
            password: '',
            type: 'anonymous',
          }),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error('registerUser timeout for anonymous user after 15s')),
              15000
            );
          }),
        ]).finally(() => {
          if (timeoutId!) clearTimeout(timeoutId);
        });
      } catch (err) {
        // If anonymous user creation fails, log but don't fail completely
        // It might already exist from a previous attempt
        console.warn(
          'Failed to create anonymous user:',
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    if (isAdministratorExisted === 0) {
      if (!email || !password) {
        return Promise.reject('Invalid email or password for admin user.');
      }

      // Wrap registerUser with timeout to prevent hanging
      let timeoutId: NodeJS.Timeout;
      await Promise.race([
        userManager.main.registerUser({
          permissionGroup: getDefaultAdministratorPermissionGroup().title,
          email: email,
          password: password,
          type: 'user',
        }),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error('registerUser timeout for admin user after 15s')),
            15000
          );
        }),
      ]).finally(() => {
        if (timeoutId!) clearTimeout(timeoutId);
      });
    }
  } catch (e) {
    return Promise.reject(e);
  }
}
