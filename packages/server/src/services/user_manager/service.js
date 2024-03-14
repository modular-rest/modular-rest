const User = require("../../class/user");
const DataProvider = require("../data_provider/service");
const JWT = require("../jwt/service");
const { getDefaultPermissionGroups } = require("./permissionManager");

/**
 * import user type
 * @typedef {import('../../class/user')} User
 */

class UserManager {
  constructor() {
    this.tempIds = {};
  }

  /**
   * Set a custom method for generating verification codes.
   * @param {function} method - A method that returns a random verification code.
   */
  setCustomVerificationCodeGeneratorMethod(method) {
    this.verificationCodeGeneratorMethod = method;
  }

  /**
   * Generate a verification code.
   * @param {string} id - The ID for which to generate the verification code.
   * @param {string} idType - The type of the ID.
   * @returns {string} The generated verification code.
   */
  generateVerificationCode(id, idType) {
    if (this.verificationCodeGeneratorMethod)
      return this.verificationCodeGeneratorMethod(id, idType);

    // this is default code
    return "123";
  }

  /**
   * Get a user by their ID.
   * @param {string} id - The ID of the user.
   * @returns {Promise<User>} A promise that resolves to the user.
   * @throws {string} If the user is not found.
   */
  getUserById(id) {
    return new Promise(async (done, reject) => {
      let userModel = DataProvider.getCollection("cms", "auth");

      let userDoc = await userModel
        .findOne({ _id: id })
        .select({ password: 0 })
        .exec()
        .catch(reject);

      if (!userDoc) {
        reject("user not found");
        return;
      }

      let user = User.loadFromModel(userDoc);
      done(user);
    });
  }

  /**
   * Get a user by their identity.
   * @param {string} id - The identity of the user.
   * @param {string} idType - The type of the identity (phone or email).
   * @returns {Promise<User>} A promise that resolves to the user.
   * @throws {string} If the user is not found.
   */
  getUserByIdentity(id, idType) {
    return new Promise(async (done, reject) => {
      let userModel = DataProvider.getCollection("cms", "auth");

      let query = {};

      if (idType == "phone") query["phone"] = id;
      else if (idType == "email") query["email"] = id;

      let userDoc = await userModel
        .findOne(query)
        .select({ password: 0 })
        .exec()
        .catch(reject);

      if (!userDoc) {
        reject("user not found");
        return;
      }

      let user = User.loadFromModel(userDoc);
      done(user);
    });
  }

  /**
   * Get a user by their token.
   * @param {string} token - The token of the user.
   * @returns {Promise<User>} A promise that resolves to the user.
   */
  async getUserByToken(token) {
    const { id } = await JWT.main.verify(token);
    return this.getUserById(id);
  }

  /**
   * Check if a verification code is valid.
   * @param {string} id - The ID of the user.
   * @param {string} code - The verification code.
   * @returns {boolean} Whether the verification code is valid.
   */
  isCodeValid(id, code) {
    let key = false;

    if (
      this.tempIds.hasOwnProperty(id) &&
      this.tempIds[id].code.toString() === code.toString()
    )
      key = true;

    return key;
  }

  /**
   * Login a user and return their token.
   * @param {string} id - The ID of the user.
   * @param {string} idType - The type of the ID (phone or email).
   * @param {string} password - The password of the user.
   * @returns {Promise<string>} A promise that resolves to the token of the user.
   * @throws {string} If the user is not found.
   */
  loginUser(id = "", idType = "", password = "") {
    let token;

    return new Promise(async (done, reject) => {
      // Get user model
      const userModel = DataProvider.getCollection("cms", "auth");

      /**
       * Setup query to find by phone or email
       */
      const query = {
        password: Buffer.from(password).toString("base64"),
        type: "user",
      };

      if (idType == "phone") query["phone"] = id;
      else if (idType == "email") query["email"] = id;

      // Get from database
      const gottenFromDB = await userModel.findOne(query).exec().catch(reject);

      if (!gottenFromDB) reject("user not found");
      // Token
      else {
        // Load user
        const user = await User.loadFromModel(gottenFromDB)
          .then()
          .catch(reject);

        // Get token payload
        // This is some information about the user.
        const payload = user.getBrief();

        // Generate json web token
        token = await JWT.main.sign(payload).then().catch(reject);

        done(token);
      }
    });
  }

  /**
   * Issue a token for a user.
   * @param {string} email - The email of the user.
   * @returns {Promise<string>} A promise that resolves to the token of the user.
   * @throws {string} If the user is not found.
   */
  issueTokenForUser(email) {
    return new Promise(async (done, reject) => {
      const userModel = DataProvider.getCollection("cms", "auth");
      const query = { email: email };

      // Get from database
      const gottenFromDB = await userModel.findOne(query).exec().catch(reject);

      if (!gottenFromDB) reject("user not found");

      const user = await User.loadFromModel(gottenFromDB).then().catch(reject);

      // Get token payload
      // This is some information about the user.
      const payload = user.getBrief();

      // Generate json web token
      await JWT.main.sign(payload).then(done).catch(reject);
    });
  }

  /**
   * Login as an anonymous user.
   * @returns {Promise<string>} A promise that resolves to the token of the anonymous user.
   * @throws {string} If the anonymous user is not found.
   */
  loginAnonymous() {
    let token;

    return new Promise(async (done, reject) => {
      // Get user model
      let userModel = DataProvider.getCollection("cms", "auth");

      // Setup query
      let query = { type: "anonymous" };

      // Get from database
      let gottenFromDB = await userModel
        .findOne(query)
        .exec()
        .then()
        .catch(reject);

      // Create a new anonymous user if it doesn't exist.
      // There are only one anonymous user in the database
      // and every guest token being generated from it.
      if (!gottenFromDB) {
        let newUserId = await this.registerUser({ type: "anonymous" }).catch(
          reject
        );
        gottenFromDB = await this.getUserById(newUserId).catch(reject);
      }

      // load User
      let user = await User.loadFromModel(gottenFromDB).then().catch(reject);

      // Get token payload
      // This is some information about the user.
      let payload = user.getBrief();

      // Generate json web token
      token = await JWT.main.sign(payload).then().catch(reject);

      done(token);
    });
  }

  /**
   * Register a temporary ID.
   * @param {string} id - The ID to register.
   * @param {string} type - The type of the ID.
   * @param {string} code - The verification code.
   */
  registerTemporaryID(id, type, code) {
    this.tempIds[id] = { id: id, type: type, code: code };
  }

  /**
   * Submit a password for a temporary ID.
   * @param {string} id - The ID.
   * @param {string} password - The password.
   * @param {string} code - The verification code.
   * @returns {Promise<boolean>} A promise that resolves to whether the operation was successful.
   */
  async submitPasswordForTemporaryID(id, password, code) {
    let key = false;

    // If user email|phone has already stored
    // a new user being created
    if (
      this.tempIds.hasOwnProperty(id) &&
      this.tempIds[id].code.toString() == code.toString()
    ) {
      let authDetail = { password: password };

      if (this.tempIds[id].type == "phone") authDetail["phone"] = id;
      else if (this.tempIds[id].type == "email") authDetail["email"] = id;

      await this.registerUser(authDetail)
        .then(() => (key = true))
        .catch((e) => console.log(e));
    }

    delete this.tempIds[id];
    return key;
  }

  /**
   * Change the password for a temporary ID.
   * @param {string} id - The ID.
   * @param {string} password - The new password.
   * @param {string} code - The verification code.
   * @returns {Promise<boolean>} A promise that resolves to whether the operation was successful.
   */
  async changePasswordForTemporaryID(id, password, code) {
    let key = false;

    if (this.tempIds.hasOwnProperty(id) && this.tempIds[id].code == code) {
      let query = {};

      if (this.tempIds[id].type == "phone") query["phone"] = id;
      else if (this.tempIds[id].type == "email") query["email"] = id;

      await this.changePassword(query, password)
        .then(() => (key = true))
        .catch((e) => console.log(e));
    }

    delete this.tempIds[id];
    return key;
  }

  /**
   * Register a user.
   * @param {Object} detail - The details of the user.
   * @returns {Promise<string>} A promise that resolves to the ID of the new user.
   * @throws {string} If the user could not be registered.
   */
  registerUser(detail) {
    return new Promise(async (done, reject) => {
      // get default permission
      if (!detail.permissionGroup) {
        detail.permissionGroup = getDefaultPermissionGroups().title;
      }

      if (!detail.permissionGroup) {
        reject("default permission group not found");
        return;
      }

      let authM = DataProvider.getCollection("cms", "auth");
      return User.createFromModel(authM, detail)
        .then((newUser) => {
          DataProvider.triggers.call("insertOne", "cms", "auth", {
            input: detail,
            output: newUser.dbModel,
          });

          done(newUser.id);
        })
        .catch(reject);
    });
  }

  /**
   * Change the password of a user.
   * @param {Object} query - The query to find the user.
   * @param {string} newPass - The new password.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  changePassword(query, newPass) {
    let update = { $set: { password: newPass } };
    let authM = DataProvider.getCollection("cms", "auth");
    return authM.updateOne(query, update).exec().then();
  }

  static get instance() {
    return instance;
  }
}

const instance = new UserManager();
module.exports.name = "userManager";
module.exports.main = UserManager.instance;
