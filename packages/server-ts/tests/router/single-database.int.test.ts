import { Schema } from 'mongoose';
import { TestAppContext, createIntegrationTestApp } from '../helpers/test-app';
import { defineCollection } from '../../src/class/collection_definition';
import { Permission } from '../../src/class/security';
import * as service from '../../src/services/data_provider/service';
import { modelRegistry } from '../../src/services/data_provider/model_registry';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const physicalDb = `mrest_single_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const ignoredPrefix = `mrest_ignored_${Date.now()}_`;

const openPermissions = [
  new Permission({ accessType: 'god_access', read: true, write: true }),
  new Permission({ accessType: 'user_access', read: true, write: true }),
];

describe('singleDatabase mode: connection string validation', () => {
  afterEach(async () => {
    await modelRegistry.clear();
  });

  it.each(['mongodb://127.0.0.1:27017', 'mongodb://127.0.0.1:27017/', 'mongodb://127.0.0.1:27017/?tls=false'])(
    'refuses %s because it names no database',
    mongoBaseAddress => {
      expect(() =>
        modelRegistry.getOrCreateConnection('cms', { mongoBaseAddress, singleDatabase: true })
      ).toThrow(/requires the database name/);
    }
  );
});

describe('singleDatabase mode', () => {
  let ctx: TestAppContext;
  let noteDefinition: ReturnType<typeof defineCollection>;

  beforeAll(async () => {
    ctx = await createIntegrationTestApp({
      mongo: {
        mongoBaseAddress: `${mongoUrl}/${physicalDb}?serverSelectionTimeoutMS=10000`,
        dbPrefix: ignoredPrefix,
        singleDatabase: true,
      },
    });

    // A second logical database whose documents reference cms.auth.
    noteDefinition = defineCollection({
      database: 'user_content',
      collection: 'note',
      schema: new Schema({ text: String, owner: { type: Schema.Types.ObjectId, ref: 'auth' } }),
      permissions: openPermissions,
    });
    await service.addCollectionDefinitionByList({
      list: [noteDefinition],
      mongoOption: ctx.mongoOption as service.MongoOption,
    });
  });

  afterAll(async () => {
    await modelRegistry
      .getConnection('cms')
      ?.dropDatabase()
      .catch(() => undefined);
    if (ctx) {
      await ctx.cleanup();
    }
  });

  it('resolves every logical database to one connection on the database named in the URI', async () => {
    const connection = modelRegistry.getConnection('cms');
    expect(connection).toBeTruthy();
    expect(modelRegistry.getConnection('user_content')).toBe(connection);
    expect(service.getCollection('cms', 'auth').db).toBe(connection);
    expect(service.getCollection('user_content', 'note').db).toBe(connection);
    expect(connection!.db!.databaseName).toBe(physicalDb);

    await noteDefinition.model.create({ text: 'probe' });

    const collectionNames = (await connection!.db!.listCollections().toArray()).map(c => c.name);
    expect(collectionNames).toEqual(expect.arrayContaining(['auths', 'files', 'notes']));

    // dbPrefix is ignored: nothing was written to prefixed per-logical-database databases.
    const { databases } = await connection!.db!.admin().listDatabases();
    expect(databases.map((d: { name: string }) => d.name).filter(n => n.startsWith(ignoredPrefix))).toEqual([]);
  });

  it('serves data-provider requests for several logical databases from the one database', async () => {
    const insertRes = await ctx.request
      .post('/data-provider/insert-one')
      .set('authorization', ctx.adminToken)
      .send({ database: 'user_content', collection: 'note', doc: { text: 'via api' } });
    expect(insertRes.status).toBe(200);

    const countRes = await ctx.request
      .post('/data-provider/count')
      .set('authorization', ctx.adminToken)
      .send({ database: 'user_content', collection: 'note', query: { text: 'via api' } });
    expect(countRes.body.data).toBe(1);

    const authRes = await ctx.request
      .post('/data-provider/count')
      .set('authorization', ctx.adminToken)
      .send({ database: 'cms', collection: 'auth', query: { email: 'admin@email.com' } });
    expect(authRes.body.data).toBe(1);
  });

  it('populates references across logical databases without an explicit model', async () => {
    const admin = await service.getCollection('cms', 'auth').findOne({ email: 'admin@email.com' });
    await noteDefinition.model.create({ text: 'owned', owner: admin!._id });

    const res = await ctx.request
      .post('/data-provider/find')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'user_content',
        collection: 'note',
        query: { text: 'owned' },
        populates: [{ path: 'owner', select: 'email' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.data[0].owner.email).toBe('admin@email.com');
  });

  it('refuses a collection name that another logical database already uses', () => {
    expect(() =>
      defineCollection({
        database: 'other_content',
        collection: 'note',
        schema: new Schema({ text: String }),
        permissions: openPermissions,
      })
    ).toThrow(/"note" is defined in both "user_content" and "other_content"/);
  });

  it('refuses two collection names that pluralize to the same physical collection', () => {
    expect(() =>
      defineCollection({
        database: 'other_content',
        collection: 'notes',
        schema: new Schema({ text: String }),
        permissions: openPermissions,
      })
    ).toThrow(/physical collection "notes"/);
  });
});
