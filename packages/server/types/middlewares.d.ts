/**
 * Authentication middleware
 * It checks if incoming request has a valid token in header.authorization
 * Then attaches the user object to ctx.state.user
 *
 * @param {Object} ctx - Koa context
 * @param {Function} next - Koa next function
 * @returns {Promise<void>}
 */
export function auth(ctx: any, next: Function): Promise<void>;
