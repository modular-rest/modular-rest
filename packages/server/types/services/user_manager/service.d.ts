export const name: "userManager";
export { instance as main };
/**
 * import user type
 */
export type User = import('../../class/user');
declare var instance: UserManager;
/**
 * import user type
 * @typedef {import('../../class/user')} User
 */
declare class UserManager {
    static get instance(): UserManager;
    tempIds: {};
    /**
     * Sets a custom method for generating verification codes.
     *
     * @param {Function} generatorMethod - A function that returns a random verification code.
     * @returns {void}
     */
    setCustomVerificationCodeGeneratorMethod(generatorMethod: Function): void;
    verificationCodeGeneratorMethod: Function;
    /**
     * Get a user by their ID.
     *
     * @param {string} id - The ID of the user.
     * @returns {Promise<User>} A promise that resolves to the user.
     * @throws {Error} If the user is not found.
     */
    generateVerificationCode(id: string, idType: any): Promise<User>;
    /**
     * Get a user by their ID.
     *
     * @param {string} id - The ID of the user.
     * @returns {Promise<User>} A promise that resolves to the user.
     * @throws {string} If the user is not found.
     */
    getUserById(id: string): Promise<User>;
    /**
     * Get a user by their identity.
     *
     * @param {string} id - The identity of the user.
     * @param {string} idType - The type of the identity (phone or email).
     * @returns {Promise<User>} A promise that resolves to the user.
     * @throws {string} If the user is not found.
     */
    getUserByIdentity(id: string, idType: string): Promise<User>;
    /**
     * Get a user by their token.
     *
     * @param {string} token - The token of the user.
     * @returns {Promise<User>} A promise that resolves to the user.
     */
    getUserByToken(token: string): Promise<User>;
    /**
     * Check if a verification code is valid.
     *
     * @param {string} id - The ID of the user.
     * @param {string} code - The verification code.
     * @returns {boolean} Whether the verification code is valid.
     */
    isCodeValid(id: string, code: string): boolean;
    /**
     * Login a user and return their token.
     *
     * @param {string} id - The ID of the user.
     * @param {string} idType - The type of the ID (phone or email).
     * @param {string} password - The password of the user.
     * @returns {Promise<string>} A promise that resolves to the token of the user.
     * @throws {string} If the user is not found.
     */
    loginUser(id?: string, idType?: string, password?: string): Promise<string>;
    /**
     * Issue a token for a user.
     *
     * @param {string} email - The email of the user.
     * @returns {Promise<string>} A promise that resolves to the token of the user.
     * @throws {string} If the user is not found.
     */
    issueTokenForUser(email: string): Promise<string>;
    /**
     * Login as an anonymous user.
     *
     * @returns {Promise<string>} A promise that resolves to the token of the anonymous user.
     * @throws {string} If the anonymous user is not found.
     */
    loginAnonymous(): Promise<string>;
    /**
     * Register a temporary ID.
     *
     * @param {string} id - The ID to register.
     * @param {string} type - The type of the ID.
     * @param {string} code - The verification code.
     */
    registerTemporaryID(id: string, type: string, code: string): void;
    /**
     * Submit a password for a temporary ID.
     *
     * @param {string} id - The ID.
     * @param {string} password - The password.
     * @param {string} code - The verification code.
     * @returns {Promise<boolean>} A promise that resolves to whether the operation was successful.
     */
    submitPasswordForTemporaryID(id: string, password: string, code: string): Promise<boolean>;
    /**
     * Change the password for a temporary ID.
     *
     * @param {string} id - The ID.
     * @param {string} password - The new password.
     * @param {string} code - The verification code.
     * @returns {Promise<boolean>} A promise that resolves to whether the operation was successful.
     */
    changePasswordForTemporaryID(id: string, password: string, code: string): Promise<boolean>;
    /**
     * Register a user.
     *
     * @param {Object} detail - The details of the user.
     * @returns {Promise<string>} A promise that resolves to the ID of the new user.
     * @throws {string} If the user could not be registered.
     */
    registerUser(detail: any): Promise<string>;
    /**
     * Change the password of a user.
     *
     * @param {Object} query - The query to find the user.
     * @param {string} newPass - The new password.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    changePassword(query: any, newPass: string): Promise<void>;
}
import User = require("../../class/user");
