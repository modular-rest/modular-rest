import * as DataInsertion from './data_insertion';
import * as JWT from '../services/jwt/service';
import * as FileService from '../services/file/service';
import generateKeypair from 'keypair';

/**
 * Setup options interface
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
 * @param options - Setup options
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
    FileService.setUploadDirectory(uploadDirectory);
  }
}
