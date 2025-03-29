import { User } from '../../class/user';
import * as DataProvider from '../data_provider/service';
import * as JWT from '../jwt/service';
import { getDefaultPermissionGroups } from './permissionManager';

/**
 * Interface for temporary IDs storage
 */
interface TemporaryId {
  type: string;
  code: string;
  timestamp: number;
}

/**
 * User registration details
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
 */
class UserManager {
  private tempIds: Record<string, TemporaryId> = {};
  private verificationCodeGeneratorMethod?: (id: string, idType: string) => string;

  constructor() {}

  /**
   * Sets a custom method for generating verification codes.
   *
   * @param generatorMethod - A function that returns a random verification code.
   */
  setCustomVerificationCodeGeneratorMethod(
    generatorMethod: (id: string, idType: string) => string
  ): void {
    this.verificationCodeGeneratorMethod = generatorMethod;
  }

  /**
   * Generate a verification code for a user
   *
   * @param id - User ID or identifier
   * @param idType - Type of ID (email, phone)
   * @returns Verification code
   */
  generateVerificationCode(id: string, idType: string): string {
    if (this.verificationCodeGeneratorMethod)
      return this.verificationCodeGeneratorMethod(id, idType);

    // this is default code
    return '123';
  }

  /**
   * Get a user by their ID.
   *
   * @param id - The ID of the user.
   * @returns Promise resolving to the user.
   * @throws Error if the user is not found.
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
   * Get a user by their identity.
   *
   * @param id - The identity of the user.
   * @param idType - The type of the identity (phone or email).
   * @returns Promise resolving to the user.
   * @throws Error if the user is not found.
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
   * Get a user by their token.
   *
   * @param token - The token of the user.
   * @returns Promise resolving to the user.
   */
  async getUserByToken(token: string): Promise<User> {
    const decoded = await JWT.main.verify(token);
    return this.getUserById(decoded.id);
  }

  /**
   * Check if a verification code is valid.
   *
   * @param id - The ID of the user.
   * @param code - The verification code.
   * @returns Whether the verification code is valid.
   */
  isCodeValid(id: string, code: string): boolean {
    let key = false;

    if (this.tempIds.hasOwnProperty(id) && this.tempIds[id].code.toString() === code.toString())
      key = true;

    return key;
  }

  /**
   * Login a user and return their token.
   *
   * @param id - The ID of the user.
   * @param idType - The type of the ID (phone or email).
   * @param password - The password of the user.
   * @returns Promise resolving to the token of the user.
   * @throws Error if the user is not found.
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
   * Issue a token for a user.
   *
   * @param email - The email of the user.
   * @returns Promise resolving to the token of the user.
   * @throws Error if the user is not found.
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
   * Login as an anonymous user.
   *
   * @returns Promise resolving to the token of the anonymous user.
   * @throws Error if the anonymous user is not found.
   */
  loginAnonymous(): Promise<string> {
    return new Promise(async (done, reject) => {
      // Get user model
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      // Setup query
      const query = { type: 'anonymous' };

      // Get from database
      let gottenFromDB;
      try {
        gottenFromDB = await userModel.findOne(query).exec();
      } catch (error) {
        return reject(error);
      }

      // Create a new anonymous user if it doesn't exist.
      // There are only one anonymous user in the database
      // and every guest token being generated from it.
      if (!gottenFromDB) {
        try {
          const newUserId = await this.registerUser({ type: 'anonymous' });
          gottenFromDB = await this.getUserById(newUserId);
        } catch (error) {
          return reject(error);
        }
      }

      try {
        // load User
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
   * Register a temporary ID
   * @param id - User identifier
   * @param type - ID type
   * @param code - Verification code
   * @returns The verification code
   */
  registerTemporaryID(id: string, type: string, code: string): string {
    this.tempIds[id] = {
      type: type,
      code: code,
      timestamp: Date.now(),
    };
    return code;
  }

  /**
   * Submit password for a temporary ID
   * @param id - User identifier
   * @param password - User password
   * @param code - Verification code
   * @returns Promise resolving to user ID
   */
  async submitPasswordForTemporaryID(id: string, password: string, code: string): Promise<string> {
    return new Promise(async (done, reject) => {
      // Check validation
      if (!this.isCodeValid(id, code)) {
        return reject(new Error('Verification code is not valid'));
      }

      const idType = this.tempIds[id].type;
      delete this.tempIds[id];

      // Create document
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      // Preparing document
      const detail: Record<string, any> = {
        permissionGroup: getDefaultPermissionGroups().title,
        password: Buffer.from(password).toString('base64'),
        type: 'user',
      };

      if (idType === 'email') detail.email = id;
      else if (idType === 'phone') detail.phone = id;

      try {
        // Check user existence
        const existingUser = await userModel
          .findOne({
            [idType]: id,
          })
          .exec();

        if (existingUser) {
          return reject(new Error('User already exists'));
        }

        // Register user
        const newUserId = await this.registerUser(detail);
        done(newUserId);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Change password for a temporary ID
   * @param id - User identifier
   * @param password - New password
   * @param code - Verification code
   * @returns Promise resolving to user ID
   */
  async changePasswordForTemporaryID(id: string, password: string, code: string): Promise<string> {
    return new Promise(async (done, reject) => {
      // Check validation
      if (!this.isCodeValid(id, code)) {
        return reject(new Error('Verification code is not valid'));
      }

      const idType = this.tempIds[id].type;
      delete this.tempIds[id];

      // Create query
      const query: Record<string, any> = {};
      query[idType] = id;

      try {
        await this.changePassword(query, password);
        const userModel = DataProvider.getCollection('cms', 'auth');

        if (!userModel) {
          return reject(new Error('User model not found'));
        }

        const userDoc = await userModel.findOne(query).exec();

        if (!userDoc) {
          return reject(new Error('User not found'));
        }

        done(userDoc._id);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register a new user
   * @param detail - User registration details
   * @returns Promise resolving to user ID
   */
  registerUser(detail: UserRegistrationDetail): Promise<string> {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection('cms', 'auth');

      if (!userModel) {
        return reject(new Error('User model not found'));
      }

      try {
        // Check if it's an anonymous user
        if (detail.type === 'anonymous') {
          detail.permissionGroup = getDefaultPermissionGroups().title;
        }

        // Encrypt password
        if (detail.password) {
          detail.password = Buffer.from(detail.password).toString('base64');
        }

        // Create user
        const userDoc = await userModel.create(detail);
        done(userDoc._id);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Change user password
   * @param query - Query to find user
   * @param newPass - New password
   * @returns Promise resolving when password is changed
   */
  async changePassword(query: Record<string, any>, newPass: string): Promise<void> {
    const userModel = DataProvider.getCollection('cms', 'auth');

    if (!userModel) {
      throw new Error('User model not found');
    }

    await userModel.updateOne(query, { password: Buffer.from(newPass).toString('base64') }).exec();
  }

  /**
   * Get the singleton instance
   */
  static get instance(): UserManager {
    return userManagerInstance;
  }
}

const userManagerInstance = new UserManager();

export const main = userManagerInstance;
export const name = 'UserManager';
