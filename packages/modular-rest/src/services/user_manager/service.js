let User = require('../../class/user');
const DataProvider = require('../data_provider/service')
const JWT = require('../jwt/service')

class UserManager {

    constructor() {
        this.tempIds = {};
    }

    /**
     * Get a user by its Id.
     * 
     * @param {string} id userid
     */
    getUserById(id) {
        return new Promise(async (done, reject) => {
            let userModel = DataProvider.getCollection('cms', 'auth');

            let userDoc = await userModel.findOne({ '_id': id }).select({ password: 0 })
                .populate('permission').exec().catch(reject);

            if (!userDoc) reject('user not found');

            let user = User.loadFromModel(userDoc);
            done(user);
        })
    }

    /**
     * Get user by token.
     * 
     * @param {string} token auth token
     */
    getUserByToken(token) {
        return JWT.main.verify(token)
            .then(async payload => {
                let user = payload;
                let permission = await DataProvider.getCollection('cms', 'permission')
                    .findOne({ _id: user.permission }).exec().then();

                if (!permission) throw ('user has a wrong permission');

                user.permission = permission;
                return user;
            });
    }

    /**
     * Define whether or not verification code is valid.
     * 
     * @param {string} id auth id phone|email
     * @param {string} serial verification code
     */
    isSerialValid(id, serial) {
        let key = false;

        if (this.tempIds.hasOwnProperty(id) && this.tempIds[id].serial.toString() === serial.toString())
            key = true;

        return key;
    }

    /**
     * Login and return user token.
     * 
     * @param {string} id auth id phone|email
     * @param {string} idType auth type phone|email
     * @param {string} password 
     */
    loginUser(id = '', idType = '', password = '') {
        let token;

        return new Promise(async (done, reject) => {

            // Get user model
            let userModel = DataProvider.getCollection('cms', 'auth');

            /**
             * Setup query to find by phone or email
             */
            let query = { 'password': password };

            if (idType == 'phone') query['phone'] = id;
            else if (idType == 'email') query['email'] = id;

            // Get from database
            let gottenFromDB = await userModel
                .findOne(query).populate('permission')
                .exec().catch(reject);

            if (!gottenFromDB) reject('user not found');

            // Token
            else {

                // Load user
                let user = await User.loadFromModel(gottenFromDB)
                    .then().catch(reject);

                // Get token payload
                // This is some information about the user.
                let payload = user.getBrief();

                // Generate json web token
                token = await JWT.main.sign(payload)
                    .then().catch(reject);

                done(token);
            }
        });
    }

    /**
     * Login as anonymous user
     */
    loginAnonymous() {
        let token;

        return new Promise(async (done, reject) => {

            // Get user model
            let userModel = DataProvider.getCollection('cms', 'auth');

            // Setup query
            let query = { 'type': 'anonymous' };

            // Get from database
            let gottenFromDB = await userModel
                .findOne(query).populate('permission')
                .exec().then().catch(reject);

            // Create a new anonymous user if it doesn't exist.
            // There are only one anonymous user in the database
            // and every guest token being generated from it.
            if (!gottenFromDB) {
                let newUserId = await this.registerUser({ 'type': 'anonymous' }).catch(reject);
                gottenFromDB = await this.getUserById(newUserId).catch(reject);
            }

            // load User
            let user = await User.loadFromModel(gottenFromDB)
                .then().catch(reject);

            // Get token payload
            // This is some information about the user.
            let payload = user.getBrief();

            // Generate json web token
            token = await JWT.main.sign(payload)
                .then().catch(reject);

            done(token);
        });
    }

    /**
     * Store user email|phone temporarily in memory.
     *  
     * @param {string} id id is username or phone number
     * @param {string} type type is the type of id
     * @param {string} serial serial is a string being sent to user and he/she must return it back.
     */
    registerTemporaryID(id, type, serial) {
        this.tempIds[id] = { 'id': id, 'type': type, 'serial': serial };
    }

    async submitPasswordForTemporaryID(id, password, serial) {
        let key = false;

        // If user email|phone has already stored
        // a new user being created 
        if (
            this.tempIds.hasOwnProperty(id) &&
            this.tempIds[id].serial.toString() == serial.toString()
        ) {

            let authDetail = { 'password': password };

            if (this.tempIds[id].type == 'phone')
                authDetail['phone'] = id;
            else if (this.tempIds[id].type == 'email')
                authDetail['email'] = id;

            await this.registerUser(authDetail)
                .then(() => key = true)
                .catch((e) => console.log(e));
        }

        delete this.tempIds[id];
        return key;
    }

    async changePasswordForTemporaryID(id, password, serial) {
        let key = false;

        if (this.tempIds.hasOwnProperty(id)
            && this.tempIds[id].serial == serial) {
            let query = {};

            if (this.tempIds[id].type == 'phone')
                query['phone'] = id;
            else if (this.tempIds[id].type == 'email')
                query['email'] = id;

            await this.changePassword(query, password)
                .then(() => key = true)
                .catch((e) => console.log(e));
        }

        delete this.tempIds[id];
        return key;
    }

    registerUser(detail) {
        return new Promise(async (done, reject) => {
            // get default permission
            let permissionId;
            let perM = DataProvider.getCollection('cms', 'permission');

            let pQuery = { isDefault: true };

            if (detail.type == 'anonymous')
                pQuery = { isAnonymous: true };

            await perM.findOne(pQuery, '_id').exec()
                .then((doc) => permissionId = doc._id)
                .catch(reject);

            detail.permission = permissionId;

            let authM = DataProvider.getCollection('cms', 'auth');
            return User.createFromModel(authM, detail)
                .then(newUser => {
                    DataProvider.triggers
                        .call('insertOne', 'cms', 'auth', { 'input': detail, 'output': newUser.dbModel });

                    done(newUser.id);
                })
                .catch(reject);
        });
    }

    changePassword(query, newPass) {
        let update = { '$set': { 'password': newPass } };
        let authM = DataProvider.getCollection('cms', 'auth');
        return authM.updateOne(query, update).exec().then();
    }
}

UserManager.instance = new UserManager()
module.exports.name = 'userManager';
module.exports.main = UserManager.instance;