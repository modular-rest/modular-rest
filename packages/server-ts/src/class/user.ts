import { config } from '../config';
import { PermissionGroup, AccessType } from './security';
import { validator as validateObject } from './validator';
import { Document, Model } from 'mongoose';

/**
 * User detail interface
 */
interface UserDetail {
  permissionGroup?: string | PermissionGroup;
  phone?: string;
  email?: string;
  password?: string;
  fullname?: string;
  type?: string;
  [key: string]: any;
}

/**
 * User class representing a user in the system
 *
 * @public
 */
export class User {
  id: string;
  permissionGroup: string;
  phone: string;
  email: string;
  password: string;
  type: string;
  dbModel: any;

  /**
   * Create a user
   * @param id - User ID
   * @param permissionGroup - Permission group name
   * @param phone - User phone
   * @param email - User email
   * @param password - User password
   * @param type - User type
   * @param model - Database model
   *
   * @hidden
   */
  constructor(
    id: string,
    permissionGroup: string,
    phone: string,
    email: string,
    password: string,
    type: string,
    model: any
  ) {
    this.id = id;
    this.permissionGroup = permissionGroup;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.type = type;
    this.dbModel = model;
  }

  /**
   * Get brief user information
   * @returns Brief user info object
   */
  getBrief(): UserDetail {
    const permissionGroup = config.permissionGroups?.find(
      group => group.title === this.permissionGroup
    );

    if (!permissionGroup) {
      throw new Error('Permission group not found on user object');
    }

    const brief: UserDetail = {
      id: this.id,
      permissionGroup: permissionGroup,
      phone: this.phone,
      email: this.email,
      type: this.type,
    };

    return brief;
  }

  /**
   * Update user details
   * @param detail - Object containing user details to update
   */
  setNewDetail(detail: UserDetail): void {
    if (detail.phone) this.phone = detail.phone;
    if (detail.email) this.email = detail.email;
    if (detail.password) this.password = detail.password;
  }

  /**
   * Check if user has a specific permission
   * @param accessType - Permission to check
   * @returns True if user has permission, false otherwise
   */
  hasPermission(accessType: string): boolean {
    const permissionGroup = config.permissionGroups?.find(
      group => group.title === this.permissionGroup
    );

    if (permissionGroup == null) return false;

    let key = false;

    if (permissionGroup.allowedAccessTypes) {
      for (let i = 0; i < permissionGroup.allowedAccessTypes.length; i++) {
        const userPermissionType = permissionGroup.allowedAccessTypes[i];

        if (userPermissionType === accessType) {
          key = true;
          break;
        }
      }
    }

    return key;
  }

  /**
   * Save user to database
   */
  async save(): Promise<void> {
    if (!this.dbModel) {
      throw new Error('User model is not initialized');
    }

    this.dbModel['permissionGroup'] = this.permissionGroup;
    this.dbModel['phone'] = this.phone;
    this.dbModel['email'] = this.email;
    this.dbModel['password'] = this.password;

    await this.dbModel.save();
  }

  /**
   * Load user from database model
   * @param model - Database model
   * @returns Promise resolving to User instance
   */
  static loadFromModel(model: any): Promise<User> {
    return new Promise((done, reject) => {
      // check required fields
      const isValidData = validateObject(model, 'fullname email password permission');

      if (!isValidData.isValid) {
        return reject(User.notValid(model));
      }

      const id = model.id;
      const permissionGroup = model.permissionGroup;
      const phone = model.phone;
      const email = model.email;
      const password = model.password;
      const type = model.type;

      //create user
      const newUser = new User(id, permissionGroup, phone, email, password, type, model);
      done(newUser);
    });
  }

  /**
   * Create user from model and details
   * @param model - Mongoose model
   * @param detail - User details
   * @returns Promise resolving to User instance
   */
  static createFromModel(model: Model<any>, detail: UserDetail): Promise<User> {
    return new Promise(async (done, reject) => {
      //create user
      try {
        const newUserDoc = await new model(detail).save();
        const newUser = await User.loadFromModel(newUserDoc);
        done(newUser);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create error for invalid user
   * @param object - Invalid user object
   * @returns Error message
   */
  static notValid(object: any): string {
    const error = `user detail are not valid ${JSON.stringify(object)}`;
    console.error(error);
    return error;
  }
}

export default User;
