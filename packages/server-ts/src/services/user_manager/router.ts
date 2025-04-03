import Router from 'koa-router';
import { validateObject } from '../../class/validator';
import { create as reply } from '../../class/reply';
import { Context } from 'koa';
import * as service from './service';

const name = 'user';
const userManager = new Router();

userManager.post('/register_id', async (ctx: Context) => {
  const body = ctx.request.body;

  const validateOption = {
    id: '',
    idType: 'phone email',
  };

  // validate result
  const bodyValidate = validateObject(body, validateOption);

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', { e: bodyValidate.requires });
    return;
  }

  const serial = service.main.generateVerificationCode(body.id, body.idType);

  if (serial) {
    service.main.registerTemporaryID(body.id, body.idType, serial);
    ctx.body = reply('s');
  } else {
    ctx.status = 412;
    ctx.body = reply('e', { e: 'Could not generate verification code.' });
  }
});

userManager.post('/validateCode', async (ctx: Context) => {
  const body = ctx.request.body;

  // validate result
  const bodyValidate = validateObject(body, 'id code');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', { e: bodyValidate.requires });
    return;
  }

  const isValid = service.main.isCodeValid(body.id, body.code);

  if (!isValid) {
    ctx.status = 412;
    ctx.body = reply('e', {
      e: 'Verification code is wrong',
      isValid: isValid,
    });
    return;
  }

  ctx.body = reply('s', { isValid: isValid });
});

userManager.post('/submit_password', async (ctx: Context) => {
  const body = ctx.request.body;

  // validate result
  const bodyValidate = validateObject(body, 'id password code');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', { e: bodyValidate.requires });
    return;
  }

  try {
    const userId = await service.main.submitPasswordForTemporaryID(
      body.id,
      body.password,
      body.code
    );
    if (userId) {
      ctx.body = reply('s');
    } else {
      ctx.status = 412;
      ctx.body = reply('f');
    }
  } catch (error) {
    ctx.status = 412;
    ctx.body = reply('f');
  }
});

userManager.post('/change_password', async (ctx: Context) => {
  const body = ctx.request.body;

  // validate result
  const bodyValidate = validateObject(body, 'id password code');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', { e: bodyValidate.requires });
    return;
  }

  try {
    const userId = await service.main.changePasswordForTemporaryID(
      body.id,
      body.password,
      body.code
    );
    if (userId) {
      ctx.body = reply('s');
    } else {
      ctx.status = 412;
      ctx.body = reply('f');
    }
  } catch (error) {
    ctx.status = 412;
    ctx.body = reply('f');
  }
});

userManager.post('/login', async (ctx: Context) => {
  const body = ctx.request.body;

  const validateOption = {
    id: '',
    password: '',
    idType: 'phone email',
  };

  // validate result
  const bodyValidate = validateObject(body, validateOption);

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', { e: bodyValidate.requires });
    return;
  }

  await service.main
    .loginUser(body.id, body.idType, body.password)
    .then(token => (ctx.body = reply('s', { token: token })))
    .catch(err => {
      ctx.status = 412;
      ctx.body = reply('e', { e: err });
    });
});

userManager.get('/loginAnonymous', async (ctx: Context) => {
  await service.main
    .loginAnonymous()
    .then(token => (ctx.body = reply('s', { token: token })))
    .catch(err => {
      ctx.status = 412;
      ctx.body = reply('e', { e: err });
    });
});

userManager.post('/getPermission', async (ctx: Context) => {
  const body = ctx.request.body;

  // validate result
  const bodyValidate = validateObject(body, 'id');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.status = 412;
    ctx.body = reply('e', { e: bodyValidate.requires });
    return;
  }

  const query = { _id: body.id };

  const dataProvider = (global as any).services.dataProvider;
  const permission = await dataProvider
    .getCollection('cms', 'permission')
    .findOne(query)
    .catch((err: any) => {
      ctx.status = 412;
      ctx.body = reply('e', { e: err });
    });

  ctx.body = reply('s', { permission: permission });
});

export { name, userManager as main };
