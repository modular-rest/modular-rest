let DataInsertion = require("./data_insertion");
let JWT = require("../services/jwt/service");
let FileService = require("../services/file/service");

module.exports.setup = async ({ keypair, adminUser, uploadDirectory }) => {
  /**
   * Json web Token
   *
   * Setup private and public keys for JWT module
   */
  if (!keypair) {
    // generate new keypair
    const generateKeypair = require("keypair");
    keypair = generateKeypair();
  }

  JWT.main.setKies(keypair.private, keypair.public);

  /**
   * Data Insertion
   *
   * Insert permissions and admin user
   * for the first time
   */
  await DataInsertion.createPermissions().catch((err) => {
    console.log(
      "Error while creating permissions, it seems data is already inserted.",
      err
    );
  });

  await DataInsertion.createAdminUser(adminUser).catch((err) => {
    console.log(
      "Error while creating admin user, it seems data is already inserted.",
      err
    );
  });

  /**
   * File Service
   */
  FileService.setUploadDirectory(uploadDirectory);
};
