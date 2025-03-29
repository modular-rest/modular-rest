import Router from 'koa-router';
import { validateObject } from '../../class/validator';
import { create as reply } from '../../class/reply';
import { Context, Next } from 'koa';
import { AccessTypes } from './../../class/security';
import * as DataService from './../data_provider/service';
import * as service from './service';
import * as middleware from '../../middlewares';

const name = 'file';
const fileRouter = new Router();

fileRouter.use('/', middleware.auth, async (ctx: Context, next: Next) => {
  await next();
});

fileRouter.post('/', async (ctx: Context) => {
  const body = ctx.request.body;

  // validate result
  const bodyValidate = validateObject(body, 'tag');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', { e: bodyValidate.requires });
    return;
  }

  // Access validation
  const hasAccess = DataService.checkAccess('cms', 'file', AccessTypes.write, body, ctx.state.user);
  if (!hasAccess) {
    ctx.throw(403, 'access denied');
    return;
  }

  const files = ctx.request.files;
  const file = files && files.file;
  let result;

  if (!file) {
    ctx.status = 412;
    result = reply('f', { message: 'file field required' });
  } else {
    await service
      .storeFile({
        file: file as any,
        ownerId: ctx.state.user.id,
        tag: body.tag,
      })
      .then(file => {
        result = reply('s', { file });
      })
      .catch(error => {
        ctx.status = 412;
        result = reply('e', error);
      });
  }

  ctx.body = result;
});

fileRouter.delete('/', async (ctx: Context) => {
  const body = ctx.request.query;
  // validate
  const bodyValidate = validateObject(body as Record<string, any>, 'id');

  let result;

  if (!bodyValidate.isValid) {
    ctx.status = 412;
    result = reply('f', { message: 'some fields required.', error: bodyValidate.requires });
  } else {
    await service
      .removeFile(body.id as string)
      .then(() => {
        result = reply('s');
      })
      .catch(e => {
        ctx.status = 412;
        result = reply('e', { error: e });
      });
  }

  ctx.body = result;
});

export { name, fileRouter as main };
