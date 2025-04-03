import * as DataInsertion from './data_insertion';
import * as JWT from '../services/jwt/service';
import * as FileService from '../services/file/service';
import generateKeypair from 'keypair';

/**
 * Setup options interface for initializing required services
 * @interface SetupOptions
 * @property {Object} [keypair] - JWT keypair configuration
 * @property {string} keypair.private - Private key for JWT signing
 * @property {string} keypair.public - Public key for JWT verification
 * @property {Object} adminUser - Admin user configuration
 * @property {string} adminUser.email - Admin user email address
 * @property {string} adminUser.password - Admin user password
 * @property {string} [uploadDirectory] - Directory for file uploads
 */
interface SetupOptions {
  keypair?: {
    private: string;
    public: string;
  };
  adminUser: {
    email: string;
    password: string;
  };
  uploadDirectory?: string;
}

/**
 * Sets up required services for the application to run
 * @function setup
 * @param {SetupOptions} options - Setup configuration options
 * @returns {Promise<void>} A promise that resolves when setup is complete
 * @throws {Error} If admin user configuration is missing or if setup fails
 * @description
 * This function performs the following setup operations:
 * 1. Configures JWT with provided or generated keypair
 * 2. Creates default system users (admin and anonymous)
 * 3. Configures file upload directory if specified
 *
 * @example
 * ```typescript
 * // Setup with custom keypair
 * await setup({
 *   keypair: {
 *     private: 'your-private-key',
 *     public: 'your-public-key'
 *   },
 *   adminUser: {
 *     email: 'admin@example.com',
 *     password: 'secure-password'
 *   },
 *   uploadDirectory: './uploads'
 * });
 *
 * // Setup with auto-generated keypair
 * await setup({
 *   adminUser: {
 *     email: 'admin@example.com',
 *     password: 'secure-password'
 *   }
 * });
 * ```
 */
export async function setup({ keypair, adminUser, uploadDirectory }: SetupOptions): Promise<void> {
  /**
   * Json web Token
   *
   * Setup private and public keys for JWT module
   */
  let keyPairToUse = keypair;
  if (!keyPairToUse) {
    // generate new keypair
    keyPairToUse = generateKeypair();
  }

  JWT.main.setKies(keyPairToUse.private, keyPairToUse.public);

  if (!adminUser) {
    throw new Error('Admin user is not supported in TypeScript version');
  }
  /**
   * Data Insertion
   *
   * Insert admin user
   * for the first time
   */
  await DataInsertion.createAdminUser(adminUser);

  /**
   * File Service
   */
  if (uploadDirectory) {
    FileService.main.setUploadDirectory(uploadDirectory);
  }
}
