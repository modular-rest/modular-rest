import Router from 'koa-router';
import { validateObject } from '../../class/validator';
import { create as reply } from '../../class/reply';
import { Context } from 'koa';
import * as service from './service';

const name = 'verify';
const verify = new Router();

verify.post('/token', async (ctx: Context) => {
  const body = ctx.request.body;

  // validate result
  const bodyValidate = validateObject(body, 'token');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', {
      e: bodyValidate.requires,
    });
    return;
  }

  await service.main
    .verify(body.token)
    .then(payload => (ctx.body = reply('s', { user: payload })))
    .catch(err => {
      ctx.status = 412;
      ctx.body = reply('e', { e: err });
    });
});

verify.post('/checkAccess', async (ctx: Context) => {
  const body = ctx.request.body;

  // validate result
  const bodyValidate = validateObject(body, 'token permissionField');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', {
      e: bodyValidate.requires,
    });
    return;
  }

  const payload = await service.main.verify(body.token).catch(err => {
    console.log(err);
    ctx.throw(412, err.message);
  });

  const userid = payload.id;

  await (global as any).services.userManager.main
    .getUserById(userid)
    .then((user: any) => {
      const key = user.hasPermission(body.permissionField);
      ctx.body = reply('s', { access: key });
    })
    .catch((err: any) => {
      ctx.status = 412;
      ctx.body = reply('e', { e: err });
    });
});

verify.get('/ready', async (ctx: Context) => {
  // it's health check, so return success
  ctx.body = reply('s', {});
});

export { name, verify as main };
