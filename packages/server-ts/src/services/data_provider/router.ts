import { AccessTypes } from '../../class/security';
import Router from 'koa-router';
import { validateObject } from '../../class/validator';
import { create as reply } from '../../class/reply';
import nestedProperty from 'nested-property';
import * as service from './service';
import * as middleware from '../../middlewares';
import { Context, Next } from 'koa';

const name = 'data-provider';

const dataProvider = new Router();

dataProvider.use('/', middleware.auth, async (ctx: Context, next: Next) => {
  const body = ctx.request.body;
  const bodyValidated = validateObject(body, 'database collection');

  // fields validation
  if (!bodyValidated.isValid) {
    ctx.throw(412, JSON.stringify(reply('e', { error: bodyValidated.requires })));
  }

  // type caster
  if (body.types && body.hasOwnProperty(body.bodyKey || '.')) {
    const bodyKey = body.bodyKey;
    for (const key in body.types) {
      if (body.types.hasOwnProperty(key) && typeof body.types[key] == 'object') {
        const typeDetail = body.types[key];

        try {
          const value = nestedProperty.get(body[bodyKey], typeDetail.path);
          const newProperty =
            service.TypeCasters[typeDetail.type as keyof typeof service.TypeCasters](value);
          nestedProperty.set(body[bodyKey], typeDetail.path, newProperty);
          console.log('newProperty', newProperty, JSON.stringify(body[bodyKey]));
        } catch (e) {
          console.log('type caster error', e);
        }
      }
    }
  }

  await next();
});

dataProvider.post('/find', async (ctx: Context) => {
  const body = ctx.request.body;
  const bodyValidate = validateObject(body, 'database collection query');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(412, JSON.stringify(reply('e', { error: bodyValidate.requires })));
  }

  // access validation
  const hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) {
    console.log(body);
    console.log(ctx.state.user.permission);
    ctx.throw(403, 'access denied');
  }

  // collection validation
  const collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(412, JSON.stringify(reply('e', { error: 'wrong database or collection' })));
  }

  // operate on db
  let queryRequest = collection.find(body.query, body.projection);

  if (body.options) {
    queryRequest = service.performAdditionalOptionsToQueryObject(queryRequest, body.options);
  }

  if (body.populates) {
    try {
      queryRequest = service.performPopulateToQueryObject(queryRequest, body.populates);
    } catch (err) {
      ctx.status = 412;
      ctx.body = err;
    }
  }

  await queryRequest
    .exec()
    .then(async docs => {
      ctx.body = { data: docs };
    })
    .catch(err => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post('/find-one', async (ctx: Context) => {
  const body = ctx.request.body;
  const bodyValidate = validateObject(body, 'database collection query');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(412, JSON.stringify(reply('e', { error: bodyValidate.requires })));
  }

  // access validation
  const hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, 'access denied');

  // collection validation
  const collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(412, JSON.stringify(reply('e', { error: 'wrong database or collection' })));
  }

  // operate on db
  let queryRequest = collection.findOne(body.query, body.projection, body.options);

  if (body.options) {
    queryRequest = service.performAdditionalOptionsToQueryObject(queryRequest, body.options);
  }

  if (body.populates) {
    try {
      queryRequest = service.performPopulateToQueryObject(queryRequest, body.populates);
    } catch (err) {
      ctx.status = 412;
      ctx.body = err;
    }
  }

  // operate on db
  await queryRequest
    .exec()
    .then(async doc => {
      ctx.body = { data: doc };
    })
    .catch(err => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

dataProvider.post('/count', async (ctx: Context) => {
  const body = ctx.request.body;
  const bodyValidate = validateObject(body, 'database collection query');

  // fields validation
  if (!bodyValidate.isValid) {
    ctx.throw(412, JSON.stringify(reply('e', { error: bodyValidate.requires })));
  }

  // access validation
  const hasAccess = service.checkAccess(
    body.database,
    body.collection,
    AccessTypes.read,
    body.query,
    ctx.state.user
  );
  if (!hasAccess) ctx.throw(403, 'access denied');

  // collection validation
  const collection = service.getCollection(body.database, body.collection);
  if (collection == null) {
    ctx.throw(412, JSON.stringify(reply('e', { error: 'wrong database or collection' })));
  }

  await collection
    .countDocuments(body.query)
    .then(count => {
      ctx.body = { data: count };
    })
    .catch(err => {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    });
});

export { name, dataProvider as main };
