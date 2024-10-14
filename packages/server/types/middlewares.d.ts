/**
 * Authentication middleware
 * It checks if incoming request has a valid token in header.authorization
 *
 * @param {Object} ctx - Koa context
 * @param {Function} next - Koa next function
 * @returns {Promise<void>}
 */
export function auth(ctx: any, next: Function): Promise<void>;
