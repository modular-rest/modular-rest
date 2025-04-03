import { Context, Next } from 'koa';
import { validator as validateObject } from './class/validator';
import * as userManager from './services/user_manager/service';
import User from './class/user';

/**
 * Authentication middleware that secures routes by validating user tokens and managing access control.
 *
 * This middleware performs several key functions:
 * 1. Validates that the incoming request contains an authorization token in the header
 * 2. Verifies the token is valid by checking against the user management service
 * 3. Retrieves the associated user object if the token is valid
 * 4. Attaches the authenticated {@link User} object on ctx.state.user for use in subsequent middleware/routes
 * 5. Throws appropriate HTTP errors (401, 412) if authentication fails
 *
 * The middleware integrates with the permission system to enable role-based access control.
 * The attached user object provides methods like hasPermission() to check specific permissions.
 *
 * Common usage patterns:
 * - Protecting sensitive API endpoints
 * - Implementing role-based access control
 * - Getting the current authenticated user
 * - Validating user permissions before allowing actions
 *
 * @throws {Error} 401 - If no authorization header is present
 * @throws {Error} 412 - If token validation fails
 * @param ctx - Koa Context object containing request/response data
 * @param next - Function to invoke next middleware
 *
 * @example
 * ```typescript
 * // Inside the router.ts file
 * import { auth } from '@modular-rest/server';
 * import { Router } from 'koa-router';
 *
 * const name = 'flowers';
 *
 * const flowerRouter = new Router();
 *
 * flowerRouter.get('/list', auth, (ctx) => {
 *  // Get the authenticated user
 *  const user = ctx.state.user;
 *
 *  // Then you can check the user's role and permission
 *  if(user.hasPermission('get_flower')) {
 *    ctx.body = 'This is a list of flowers: Rose, Lily, Tulip';
 *  } else {
 *    ctx.status = 403;
 *    ctx.body = 'You are not authorized to access this resource';
 *  }
 * });
 *
 * module.exports.name = name;
 * module.exports.main = flowerRouter;
 * ```
 */
export async function auth(ctx: Context, next: Next): Promise<void> {
  const headers = ctx.header;
  const headersValidated = validateObject(headers, 'authorization');

  if (!headersValidated.isValid) ctx.throw(401, 'authentication is required');

  const token = headers.authorization as string;

  await userManager.main
    .getUserByToken(token)
    .then(async (user: User) => {
      ctx.state.user = user;
      await next();
    })
    .catch(err => {
      console.log(err);
      ctx.throw(err.status || 412, err.message);
    });
}
