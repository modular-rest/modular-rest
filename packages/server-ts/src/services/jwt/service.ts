import jwt from 'jsonwebtoken';

/**
 * Service name constant
 * @constant {string}
 */
export const name = 'jwt';

/**
 * JWT service class for handling JSON Web Token operations
 * @class JWT
 * @description
 * This class provides methods for signing and verifying JSON Web Tokens using RS256 algorithm.
 * It requires both private and public keys to be set before use.
 *
 * @example
 * ```typescript
 * // Set up keys
 * main.setKies(privateKey, publicKey);
 *
 * // Sign a token
 * const token = await main.sign({ userId: '123', role: 'admin' });
 *
 * // Verify a token
 * const decoded = await main.verify(token);
 * console.log(decoded.userId); // '123'
 * ```
 */
class JWT {
  private privateKey?: string;
  private publicKey?: string;

  /**
   * Sets the private and public keys for JWT operations
   * @param {string} privateKey - Private key for signing tokens (PEM format)
   * @param {string} publicKey - Public key for verifying tokens (PEM format)
   * @throws {Error} If either key is invalid
   * @example
   * ```typescript
   * // Using PEM format keys
   * const privateKey = `-----BEGIN PRIVATE KEY-----
   * MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSnAgEAAoIBAQC9QFi67s...
   * -----END PRIVATE KEY-----`;
   *
   * const publicKey = `-----BEGIN PUBLIC KEY-----
   * MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvUBYuu7...
   * -----END PUBLIC KEY-----`;
   *
   * main.setKies(privateKey, publicKey);
   * ```
   */
  setKies(privateKey: string, publicKey: string): void {
    if (!privateKey || !publicKey) {
      throw new Error('Both private and public keys are required');
    }
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  /**
   * Signs a payload and creates a JWT token using RS256 algorithm
   * @param {Record<string, any>} payload - Data to be encoded in the token
   * @returns {Promise<string>} A promise that resolves to the signed JWT token
   * @throws {Error} If private key is not set or signing fails
   * @example
   * ```typescript
   * // Sign a token with user data
   * const token = await main.sign({
   *   userId: '123',
   *   role: 'admin',
   *   exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
   * });
   *
   * // Sign a token with custom claims
   * const token = await main.sign({
   *   sub: 'user123',
   *   iss: 'myapp.com',
   *   aud: 'myapp.com',
   *   iat: Math.floor(Date.now() / 1000)
   * });
   * ```
   */
  sign(payload: Record<string, any>): Promise<string> {
    return new Promise((done, reject) => {
      const option = { algorithm: 'RS256' as const };

      if (!this.privateKey) {
        return reject(new Error('Private key is not set. Call setKies() first.'));
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
   * Verifies a JWT token and returns its decoded payload
   * @param {string} token - JWT token to verify
   * @returns {Promise<Record<string, any>>} A promise that resolves to the decoded payload
   * @throws {Error} If public key is not set, token is invalid, or verification fails
   * @example
   * ```typescript
   * try {
   *   const decoded = await main.verify(token);
   *   console.log('Token is valid:', decoded);
   *   // Access decoded data
   *   const { userId, role } = decoded;
   * } catch (error) {
   *   console.error('Token verification failed:', error);
   * }
   * ```
   */
  verify(token: string): Promise<Record<string, any>> {
    return new Promise((done, reject) => {
      const option = { algorithm: 'RS256' as const } as jwt.VerifyOptions;

      if (!this.publicKey) {
        return reject(new Error('Public key is not set. Call setKies() first.'));
      }

      try {
        const decoded = jwt.verify(token, this.publicKey, option);
        done(decoded as Record<string, any>);
      } catch (error) {
        reject(error instanceof Error ? error.message : String(error));
      }
    });
  }
}

/**
 * Main JWT service instance
 * @constant {JWT}
 */
export const main = new JWT();
