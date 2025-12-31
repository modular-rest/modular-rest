import { User } from '../../class/user';
import * as DataProvider from '../data_provider/service';
import * as JWT from '../jwt/service';
import {
  getDefaultPermissionGroups,
  getDefaultAnonymousPermissionGroup,
} from './permissionManager';

/**
 * Service name constant
 * @constant {string}
 */
export const name = 'userManager';

/**
 * Interface for temporary IDs storage
 * @interface TemporaryId
 * @property {string} type - Type of temporary ID (e.g., 'password_reset', 'verification')
 * @property {string} code - Verification code
 * @property {number} timestamp - Unix timestamp when the ID was created
 */
interface TemporaryId {
  type: string;
  code: string;
  timestamp: number;
}

/**
 * User registration details
 * @interface UserRegistrationDetail
 * @property {string} [permissionGroup] - User's permission group
 * @property {string} [phone] - User's phone number
 * @property {string} [email] - User's email address
 * @property {string} [password] - User's password (base64 encoded)
 * @property {'user' | 'anonymous'} [type='user'] - User type
 * @property {any} [key: string] - Additional user properties
 */
interface UserRegistrationDetail {
  permissionGroup?: string;
  phone?: string;
  email?: string;
  password?: string;
  type?: 'user' | 'anonymous';
  [key: string]: any;
}

/**
 * User manager class for handling user operations

 * This service provides functionality for managing users, including:
 * - User registration and authentication
 * - Password management
 * - Token generation and verification
 * - Temporary ID handling for password reset and verification
 * 
 */
class UserManager {
  /**
   * @hidden
   */
  private tempIds: Record<string, TemporaryId> = {};

  /**
   * @hidden
   */
  private verificationCodeGeneratorMethod?: (id: string, idType: string) => string;

  /**
   * @hidden
   */
  constructor() {}

  /**
   * Sets a custom method for generating verification codes
   * @param {Function} generatorMethod - Function that generates verification codes
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * userManager.setCustomVerificationCodeGeneratorMethod((id, type) => {
   *   return Math.random().toString(36).substring(2, 8).toUpperCase();
   * });
   * ```
   */
  setCustomVerificationCodeGeneratorMethod(
    generatorMethod: (id: string, idType: string) => string
  ): void {
    this.verificationCodeGeneratorMethod = generatorMethod;
  }

  /**
   * Generates a verification code for a user
   * @param {string} id - User ID or identifier
   * @param {string} idType - Type of ID (email, phone)
   * @returns {string} Verification code
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * const code = userManager.generateVerificationCode('user@example.com', 'email');
   * // Returns: '123' (default) or custom generated code
   * ```
   */
  generateVerificationCode(id: string, idType: string): string {
    if (this.verificationCodeGeneratorMethod)
      return this.verificationCodeGeneratorMethod(id, idType);

    // this is default code
    return '123';
  }

  /**
   * Gets a user by their ID
   * @param {string} id - The ID of the user
   * @returns {Promise<User>} Promise resolving to the user
   * @throws {Error} If user model is not found or user is not found
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   const user = await userManager.getUserById('user123');
   *   console.log('User details:', user);
   * } catch (error) {
   *   console.error('Failed to get user:', error);
   * }
   * ```
   */
  getUserById(id: string): Promise<User> {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      let userDoc;
      try {
        userDoc = await userModel.findOne({ _id: id }).select({ password: 0 }).exec();
      } catch (error) {
        return reject(error);
      }

      if (!userDoc) {
        return reject(new Error('User not found'));
      }

      try {
        const user = await User.loadFromModel(userDoc);
        done(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gets a user by their identity (email or phone)
   * @param {string} id - The identity of the user
   * @param {string} idType - The type of the identity (phone or email)
   * @returns {Promise<User>} Promise resolving to the user
   * @throws {Error} If user model is not found or user is not found
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * // Get user by email
   * const user = await userManager.getUserByIdentity('user@example.com', 'email');
   *
   * // Get user by phone
   * const user = await userManager.getUserByIdentity('+1234567890', 'phone');
   * ```
   */
  getUserByIdentity(id: string, idType: string): Promise<User> {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      const query: Record<string, any> = {};

      if (idType === 'phone') query['phone'] = id;
      else if (idType === 'email') query['email'] = id;

      let userDoc;
      try {
        userDoc = await userModel.findOne(query).select({ password: 0 }).exec();
      } catch (error) {
        return reject(error);
      }

      if (!userDoc) {
        return reject(new Error('User not found'));
      }

      try {
        const user = await User.loadFromModel(userDoc);
        done(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gets a user by their JWT token
   * @param {string} token - The JWT token of the user
   * @returns {Promise<User>} Promise resolving to the user
   * @throws {Error} If token is invalid or user is not found
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   const user = await userManager.getUserByToken('jwt.token.here');
   *   console.log('Authenticated user:', user);
   * } catch (error) {
   *   console.error('Invalid token:', error);
   * }
   * ```
   */
  async getUserByToken(token: string): Promise<User> {
    const decoded = await JWT.main.verify(token);
    return this.getUserById(decoded.id);
  }

  /**
   * Checks if a verification code is valid
   * @param {string} id - The ID of the user
   * @param {string} code - The verification code
   * @returns {boolean} Whether the verification code is valid
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * const isValid = userManager.isCodeValid('user123', '123');
   * if (isValid) {
   *   // Proceed with verification
   * }
   * ```
   */
  isCodeValid(id: string, code: string): boolean {
    return this.tempIds.hasOwnProperty(id) && this.tempIds[id].code.toString() === code.toString();
  }

  /**
   * Logs in a user and returns their JWT token
   * @param {string} [id=''] - The ID of the user (email or phone)
   * @param {string} [idType=''] - The type of the ID (phone or email)
   * @param {string} [password=''] - The password of the user
   * @returns {Promise<string>} Promise resolving to the JWT token
   * @throws {Error} If user is not found or credentials are invalid
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   // Login with email
   *   const token = await userManager.loginUser('user@example.com', 'email', 'password123');
   *
   *   // Login with phone
   *   const token = await userManager.loginUser('+1234567890', 'phone', 'password123');
   * } catch (error) {
   *   console.error('Login failed:', error);
   * }
   * ```
   */
  loginUser(id: string = '', idType: string = '', password: string = ''): Promise<string> {
    return new Promise(async (done, reject) => {
      // Get user model
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      /**
       * Setup query to find by phone or email
       */
      const query: Record<string, any> = {
        password: Buffer.from(password).toString('base64'),
        type: 'user',
      };

      if (idType === 'phone') query['phone'] = id;
      else if (idType === 'email') query['email'] = id;

      // Get from database
      let gottenFromDB;
      try {
        gottenFromDB = await userModel.findOne(query).exec();
      } catch (error) {
        return reject(error);
      }

      if (!gottenFromDB) {
        return reject(new Error('User not found'));
      }

      try {
        // Load user
        const user = await User.loadFromModel(gottenFromDB);

        // Get token payload
        // This is some information about the user.
        const payload = user.getBrief();

        // Generate json web token
        const token = await JWT.main.sign(payload);
        done(token);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Issues a JWT token for a user by email
   * @param {string} email - The email of the user
   * @returns {Promise<string>} Promise resolving to the JWT token
   * @throws {Error} If user is not found
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   const token = await userManager.issueTokenForUser('user@example.com');
   *   console.log('Issued token:', token);
   * } catch (error) {
   *   console.error('Failed to issue token:', error);
   * }
   * ```
   */
  issueTokenForUser(email: string): Promise<string> {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      const query = { email: email };

      // Get from database
      let gottenFromDB;
      try {
        gottenFromDB = await userModel.findOne(query).exec();
      } catch (error) {
        return reject(error);
      }

      if (!gottenFromDB) {
        return reject(new Error('User not found'));
      }

      try {
        // Load user
        const user = await User.loadFromModel(gottenFromDB);

        // Get token payload
        const payload = user.getBrief();

        // Generate json web token
        const token = await JWT.main.sign(payload);
        done(token);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Logs in an anonymous user and returns their JWT token
   * @returns {Promise<string>} Promise resolving to the JWT token
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * const token = await userManager.loginAnonymous();
   * console.log('Anonymous token:', token);
   * ```
   */
  loginAnonymous(): Promise<string> {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      try {
        // Check if anonymous user already exists
        let anonymousUser = await userModel.findOne({ type: 'anonymous' }).exec();

        if (!anonymousUser) {
          // Create anonymous user document
          anonymousUser = await userModel.create({
            type: 'anonymous',
            permissionGroup: getDefaultAnonymousPermissionGroup().title,
            phone: '',
            email: 'anonymous',
            password: '',
          });
        }

        // Load user from document
        const user = await User.loadFromModel(anonymousUser);

        // Get token payload
        const payload = user.getBrief();

        // Generate json web token
        const token = await JWT.main.sign(payload);
        done(token);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Registers a temporary ID for verification or password reset
   * @param {string} id - The ID to register
   * @param {string} type - The type of temporary ID
   * @param {string} code - The verification code
   * @returns {string} The registered ID
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * const tempId = userManager.registerTemporaryID('user@example.com', 'password_reset', '123456');
   * ```
   */
  registerTemporaryID(id: string, type: string, code: string): string {
    this.tempIds[id] = {
      type,
      code,
      timestamp: Date.now(),
    };
    return id;
  }

  /**
   * Submits a password for a temporary ID
   * @param {string} id - The temporary ID
   * @param {string} password - The new password
   * @param {string} code - The verification code
   * @returns {Promise<string>} Promise resolving to the JWT token
   * @throws {Error} If verification code is invalid or user is not found
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   const token = await userManager.submitPasswordForTemporaryID(
   *     'user@example.com',
   *     'newpassword123',
   *     '123456'
   *   );
   *   console.log('Password set successfully');
   * } catch (error) {
   *   console.error('Failed to set password:', error);
   * }
   * ```
   */
  async submitPasswordForTemporaryID(id: string, password: string, code: string): Promise<string> {
    if (!this.isCodeValid(id, code)) {
      throw new Error('Invalid verification code');
    }

    const userModel = DataProvider.getCollection('cms', 'auth');

    if (!userModel) {
      throw new Error('User model not found');
    }

    const query = { email: id };

    // Get from database
    let gottenFromDB;
    try {
      gottenFromDB = await userModel.findOne(query).exec();
    } catch (error) {
      throw error;
    }

    if (!gottenFromDB) {
      throw new Error('User not found');
    }

    try {
      // Load user
      const user = await User.loadFromModel(gottenFromDB);

      // Update password
      user.password = password;

      // Save to database
      await user.save();

      // Get token payload
      const payload = user.getBrief();

      // Generate json web token
      const token = await JWT.main.sign(payload);

      // Remove temporary ID
      delete this.tempIds[id];

      return token;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Changes password for a temporary ID
   * @param {string} id - The temporary ID
   * @param {string} password - The new password
   * @param {string} code - The verification code
   * @returns {Promise<string>} Promise resolving to the JWT token
   * @throws {Error} If verification code is invalid or user is not found
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   const token = await userManager.changePasswordForTemporaryID(
   *     'user@example.com',
   *     'newpassword123',
   *     '123456'
   *   );
   *   console.log('Password changed successfully');
   * } catch (error) {
   *   console.error('Failed to change password:', error);
   * }
   * ```
   */
  async changePasswordForTemporaryID(id: string, password: string, code: string): Promise<string> {
    if (!this.isCodeValid(id, code)) {
      throw new Error('Invalid verification code');
    }

    const userModel = DataProvider.getCollection('cms', 'auth');

    if (!userModel) {
      throw new Error('User model not found');
    }

    const query = { email: id };

    // Get from database
    let gottenFromDB;
    try {
      gottenFromDB = await userModel.findOne(query).exec();
    } catch (error) {
      throw error;
    }

    if (!gottenFromDB) {
      throw new Error('User not found');
    }

    try {
      // Load user
      const user = await User.loadFromModel(gottenFromDB);

      // Update password
      user.password = password;

      // Save to database
      await user.save();

      // Get token payload
      const payload = user.getBrief();

      // Generate json web token
      const token = await JWT.main.sign(payload);

      // Remove temporary ID
      delete this.tempIds[id];

      return token;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registers a new user
   * @param {UserRegistrationDetail} detail - User registration details
   * @returns {Promise<string>} Promise resolving to the JWT token
   * @throws {Error} If user model is not found or registration fails
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   const token = await userManager.registerUser({
   *     email: 'user@example.com',
   *     password: 'secure123',
   *     permissionGroup: 'user',
   *     phone: '+1234567890'
   *   });
   *   console.log('User registered successfully');
   * } catch (error) {
   *   console.error('Registration failed:', error);
   * }
   * ```
   */
  registerUser(detail: UserRegistrationDetail): Promise<string> {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      try {
        // Create user document
        const userDoc = await userModel.create({
          ...detail,
          type: detail.type || 'user',
          permissionGroup: detail.permissionGroup || getDefaultPermissionGroups().title,
          phone: detail.phone || undefined,
          email: detail.email || undefined,
          password: detail.password || undefined,
        });

        // Load user from document
        const user = await User.loadFromModel(userDoc);

        // Get token payload
        const payload = user.getBrief();

        // Generate json web token
        const token = await JWT.main.sign(payload);
        done(token);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Changes a user's password
   * @param {Record<string, any>} query - Query to find the user
   * @param {string} newPass - The new password
   * @returns {Promise<void>} Promise resolving when password is changed
   * @throws {Error} If user is not found or password change fails
   * @example
   * ```typescript
   * import { userManager } from '@modular-rest/server';
   *
   * try {
   *   await userManager.changePassword(
   *     { email: 'user@example.com' },
   *     'newpassword123'
   *   );
   *   console.log('Password changed successfully');
   * } catch (error) {
   *   console.error('Failed to change password:', error);
   * }
   * ```
   */
  async changePassword(query: Record<string, any>, newPass: string): Promise<void> {
    const userModel = DataProvider.getCollection('cms', 'auth');

    if (!userModel) {
      throw new Error('User model not found');
    }

    const userDoc = await userModel.findOne(query).exec();

    if (!userDoc) {
      throw new Error('User not found');
    }

    const user = await User.loadFromModel(userDoc);
    user.password = newPass;
    await user.save();
  }

  /**
   * Gets the singleton instance of UserManager
   * @returns {UserManager} The UserManager instance
   * @hidden
   */
  static get instance(): UserManager {
    if (!(this as any)._instance) {
      (this as any)._instance = new UserManager();
    }
    return (this as any)._instance;
  }
}

/**
 * Main user manager instance
 * @constant {UserManager}
 */
export const main = UserManager.instance;
