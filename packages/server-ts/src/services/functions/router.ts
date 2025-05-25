import Router from 'koa-router';
import * as service from './service';
import * as middleware from '../../middlewares';
import { validateObject } from '../../class/validator';
import { create as reply } from '../../class/reply';
import { Context, Next } from 'koa';

const functionRouter = new Router();
const name = 'function';

functionRouter.use('/', middleware.auth, async (ctx: Context, next: Next) => {
  const body = ctx.request.body;
  const bodyValidated = validateObject(body, 'name args');

  // fields validation
  if (!bodyValidated.isValid) {
    ctx.throw(412, JSON.stringify(reply('e', { error: bodyValidated.requires })));
  }

  await next();
});

functionRouter.post('/run', middleware.auth, async (ctx: Context) => {
  const { name, args } = ctx.request.body;

  try {
    const result = await service.runFunction(name, args, ctx.state.user);
    ctx.body = reply('s', { data: result });
  } catch (e) {
    ctx.status = 400;
    ctx.body = reply('e', { message: (e as Error).message });
  }
});

export { name, functionRouter as main };
