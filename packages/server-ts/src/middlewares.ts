import { Context, Next } from 'koa';
import { validator as validateObject } from './class/validator';
import * as userManager from './services/user_manager/service';

/**
 * Authentication middleware
 * It checks if incoming request has a valid token in header.authorization
 * Then attaches the user object to ctx.state.user
 */
export async function auth(ctx: Context, next: Next): Promise<void> {
  const headers = ctx.header;
  const headersValidated = validateObject(headers, 'authorization');

  if (!headersValidated.isValid) ctx.throw(401, 'authentication is required');

  const token = headers.authorization as string;

  await userManager.main
    .getUserByToken(token)
    .then(async user => {
      ctx.state.user = user;
      await next();
    })
    .catch(err => {
      console.log(err);
      ctx.throw(err.status || 412, err.message);
    });
}
