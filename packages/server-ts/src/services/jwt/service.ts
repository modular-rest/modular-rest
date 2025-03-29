import jwt from 'jsonwebtoken';

/**
 * JWT service class for handling JSON Web Token operations
 */
class JWT {
  private privateKey?: string;
  private publicKey?: string;

  /**
   * Set the private and public keys for JWT operations
   * @param privateKey - Private key for signing
   * @param publicKey - Public key for verification
   */
  setKies(privateKey: string, publicKey: string): void {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  /**
   * Sign a payload and create a JWT token
   * @param payload - Data to sign
   * @returns Promise resolving to JWT token
   */
  sign(payload: Record<string, any>): Promise<string> {
    return new Promise((done, reject) => {
      const option = { algorithm: 'RS256' as const };

      if (!this.privateKey) {
        return reject('Private key is not set');
      }

      try {
        const token = jwt.sign(payload, this.privateKey, option);
        done(token);
      } catch (error) {
        reject(error instanceof Error ? error.message : String(error));
      }
    });
  }

  /**
   * Verify a JWT token
   * @param token - JWT token to verify
   * @returns Promise resolving to decoded payload
   */
  verify(token: string): Promise<Record<string, any>> {
    return new Promise((done, reject) => {
      const option = { algorithm: 'RS256' as const } as jwt.VerifyOptions;

      if (!this.publicKey) {
        return reject('Public key is not set');
      }

      try {
        const decoded = jwt.verify(token, this.publicKey, option);
        done(decoded as Record<string, any>);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const name = 'jwt';
export const main = new JWT();
