let DataInsertion = require('./data_insertion');
let JWT = require('../services/jwt/service');

module.exports.setup = async ({ keypair, adminUser }) => {

    /**
     * Json web Token
     * 
     * Setup private and public keys for JWT module 
     */
    if (!keypair) {
        // generate new keypair
        var generateRSAKeypair = require('generate-rsa-keypair')
        keypair = generateRSAKeypair()
    }

    JWT.main.setKies(keypair.private, keypair.public);

    /**
     * Data Insertion
     * 
     * Insert permissions and admin user
     * for the first time
     */
    await DataInsertion.createPermissions();
    await DataInsertion.createAdminUser(adminUser)

}