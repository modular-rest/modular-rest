import { Schema } from 'mongoose';
import { TestAppContext, createIntegrationTestApp } from '../helpers/test-app';
import { defineCollection } from '../../src/class/collection_definition';
import { Permission } from '../../src/class/security';
import * as service from '../../src/services/data_provider/service';

const DB = 'ownership';

// Each user reads and writes only their own notes.
const noteDefinition = defineCollection({
  database: DB,
  collection: 'note',
  schema: new Schema({
    refId: String,
    text: String,
    links: [{ type: Schema.Types.ObjectId, ref: 'note' }],
    secret: { type: Schema.Types.ObjectId, ref: 'vault' },
  }),
  permissions: [new Permission({ accessType: 'user_access', read: true, write: true, onlyOwnData: true })],
});

// Users read their own entries; only the server writes them. The owner is an ObjectId.
const ledgerDefinition = defineCollection({
  database: DB,
  collection: 'ledger',
  schema: new Schema({ user_id: Schema.Types.ObjectId, credits: Number }),
  permissions: [
    new Permission({ accessType: 'user_access', read: true, write: false, onlyOwnData: true, ownerIdField: 'user_id' }),
  ],
});

// Shared by every user.
const boardDefinition = defineCollection({
  database: DB,
  collection: 'board',
  schema: new Schema({ title: String, note: { type: Schema.Types.ObjectId, ref: 'note' } }),
  permissions: [new Permission({ accessType: 'user_access', read: true, write: true })],
});

// Closed to users.
const vaultDefinition = defineCollection({
  database: DB,
  collection: 'vault',
  schema: new Schema({ code: String }),
  permissions: [new Permission({ accessType: 'advanced_settings', read: true, write: true })],
});

interface TestUser {
  id: string;
  token: string;
}

describe('data-provider ownership (onlyOwnData)', () => {
  let ctx: TestAppContext;
  let A: TestUser;
  let B: TestUser;
  let bNoteIds: string[];
  let vaultId: string;

  async function register(email: string): Promise<TestUser> {
    await ctx.request.post('/user/register_id').send({ id: email, idType: 'email' });
    await ctx.request.post('/user/submit_password').send({ id: email, password: 'pass', code: '123' });
    const login = await ctx.request.post('/user/login').send({ id: email, idType: 'email', password: 'pass' });
    const user = await service.getCollection<any>('cms', 'auth').findOne({ email });
    return { id: String(user!._id), token: login.body.token };
  }

  function post(op: string, user: TestUser | null, body: Record<string, unknown>) {
    const request = ctx.request.post(`/data-provider/${op}`);
    if (user) request.set('authorization', user.token);
    return request.send({ database: DB, ...body });
  }

  beforeAll(async () => {
    ctx = await createIntegrationTestApp();
    await service.addCollectionDefinitionByList({
      list: [noteDefinition, ledgerDefinition, boardDefinition, vaultDefinition],
      mongoOption: ctx.mongoOption as service.MongoOption,
    });

    A = await register('a@ownership.test');
    B = await register('b@ownership.test');

    const notes = await noteDefinition.model.create([
      { refId: A.id, text: 'a1' },
      { refId: B.id, text: 'b1' },
      { refId: B.id, text: 'b2' },
    ]);
    bNoteIds = [String(notes[1]._id), String(notes[2]._id)];
    await ledgerDefinition.model.create([
      { user_id: A.id, credits: 5 },
      { user_id: B.id, credits: 500 },
    ]);
    vaultId = String((await vaultDefinition.model.create({ code: 'hidden' }))._id);
  });

  afterAll(async () => {
    if (ctx) await ctx.cleanup();
  });

  describe('reads', () => {
    it.each(['find', 'find-one', 'count'])('%s only reaches the caller’s documents', async op => {
      const res = await post(op, A, { collection: 'note', query: { refId: B.id } });
      expect(res.status).toBe(200);
      if (op === 'find') expect(res.body.data.every((d: any) => d.refId === A.id)).toBe(true);
      if (op === 'find-one') expect(res.body.data.refId).toBe(A.id);
      if (op === 'count') expect(res.body.data).toBe(1);
    });

    it('can’t widen the match with $or', async () => {
      const res = await post('find', A, { collection: 'note', query: { $or: [{ refId: B.id }, { text: 'b1' }] } });
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('findByIds drops other users’ documents', async () => {
      const res = await post('findByIds', A, { collection: 'note', ids: bNoteIds, accessQuery: {} });
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('matches ObjectId owner fields', async () => {
      const res = await post('find', A, { collection: 'ledger', query: {} });
      expect(res.body.data.map((d: any) => d.credits)).toEqual([5]);
    });

    it('leaves collections without onlyOwnData shared', async () => {
      await boardDefinition.model.create({ title: 'shared' });
      const res = await post('find', B, { collection: 'board', query: {} });
      expect(res.body.data.map((d: any) => d.title)).toContain('shared');
    });
  });

  describe('writes', () => {
    it('honours write: false', async () => {
      expect((await post('insert-one', A, { collection: 'ledger', doc: { credits: 1 } })).status).toBe(403);
      const update = await post('update-one', A, { collection: 'ledger', query: {}, update: { $set: { credits: 1e9 } } });
      expect(update.status).toBe(403);
      expect((await post('remove-one', A, { collection: 'ledger', query: {} })).status).toBe(403);
    });

    it('insert-one stores the document as the caller’s', async () => {
      const res = await post('insert-one', A, { collection: 'note', doc: { refId: B.id, text: 'planted' } });
      expect(res.status).toBe(200);
      expect(res.body.data.refId).toBe(A.id);
    });

    it('update-one can’t reach another user’s document', async () => {
      const res = await post('update-one', A, { collection: 'note', query: { _id: bNoteIds[0] }, update: { text: 'pwned' } });
      expect(res.status).toBe(200);
      expect(res.body.data.n).toBe(0);
      expect((await noteDefinition.model.findById(bNoteIds[0]))!.text).toBe('b1');
    });

    it.each([
      { refId: 'x' },
      { $set: { refId: 'x' } },
      { $unset: { refId: '' } },
      { $rename: { text: 'refId' } },
      { $setOnInsert: { 'refId.0': 'x' } },
    ])('update-one refuses %j, which touches the owner field', async update => {
      expect((await post('update-one', A, { collection: 'note', query: {}, update })).status).toBe(403);
    });

    it('update-one refuses update pipelines', async () => {
      const res = await post('update-one', A, { collection: 'note', query: {}, update: [{ $set: { refId: B.id } }] });
      expect(res.status).toBe(412);
    });

    it('remove-one can’t reach another user’s document', async () => {
      const res = await post('remove-one', A, { collection: 'note', query: { _id: bNoteIds[1] } });
      expect(res.status).toBe(200);
      expect(await noteDefinition.model.findById(bNoteIds[1])).not.toBeNull();
    });
  });

  describe('options', () => {
    it.each([{ setQuery: {} }, { deleteMany: {} }, { merge: {} }, { populate: 'links' }])(
      'refuses %j, a query method that isn’t paging',
      async options => {
        expect((await post('find', A, { collection: 'note', query: {}, options })).status).toBe(403);
        expect((await post('find-one', A, { collection: 'note', query: {}, options })).status).toBe(403);
      }
    );

    it('allows paging and sorting', async () => {
      const res = await post('find', A, { collection: 'note', query: {}, options: { sort: '-_id', limit: 5, skip: 0 } });
      expect(res.status).toBe(200);
    });
  });

  describe('populates', () => {
    it('only populates the caller’s documents', async () => {
      const own = await post('insert-one', A, { collection: 'note', doc: { text: 'a2' } });
      const trap = await post('insert-one', A, {
        collection: 'note',
        doc: { text: 'trap', links: [...bNoteIds, own.body.data._id] },
      });
      const res = await post('find-one', A, { collection: 'note', query: { _id: trap.body.data._id }, populates: ['links'] });
      expect(res.status).toBe(200);
      expect(res.body.data.links.map((d: any) => d.text)).toEqual(['a2']);
    });

    it('applies the target’s permissions from a shared collection', async () => {
      await boardDefinition.model.create({ title: 'pinned', note: bNoteIds[0] });
      const res = await post('find', A, { collection: 'board', query: { title: 'pinned' }, populates: ['note'] });
      expect(res.status).toBe(200);
      expect(res.body.data[0].note).toBeNull();
    });

    it('refuses collections the caller can’t read and populate options that reach elsewhere', async () => {
      await noteDefinition.model.create({ refId: A.id, text: 'vaulted', secret: vaultId });
      expect((await post('find', A, { collection: 'note', query: {}, populates: ['secret'] })).status).toBe(403);
      expect((await post('find', A, { collection: 'note', query: {}, populates: ['text'] })).status).toBe(403);
      const withModel = [{ path: 'links', model: 'vault' }];
      expect((await post('find', A, { collection: 'note', query: {}, populates: withModel })).status).toBe(403);
    });
  });

  describe('aggregate', () => {
    it('starts from the caller’s documents', async () => {
      const res = await post('aggregate', A, {
        collection: 'note',
        pipelines: [{ $group: { _id: '$refId', n: { $sum: 1 } } }],
        accessQuery: {},
      });
      expect(res.status).toBe(200);
      expect(res.body.data.map((g: any) => g._id)).toEqual([A.id]);
    });

    it('casts the caller’s id for ObjectId owner fields', async () => {
      const res = await post('aggregate', A, { collection: 'ledger', pipelines: [], accessQuery: {} });
      expect(res.body.data.map((d: any) => d.credits)).toEqual([5]);
    });

    it.each([
      { $lookup: { from: 'board', localField: 'x', foreignField: 'y', as: 'z' } },
      { $unionWith: 'board' },
      { $out: 'board' },
      { $facet: { a: [{ $match: {} }], b: [{ $group: { _id: null, all: { $accumulator: {} } } }] } },
      { $documents: [{}] },
    ])('refuses %j to a caller limited to their own documents', async stage => {
      expect((await post('aggregate', A, { collection: 'note', pipelines: [stage], accessQuery: {} })).status).toBe(403);
    });

    it('checks the collections a pipeline on shared data reaches', async () => {
      const lookup = (from: string) => [{ $lookup: { from, localField: 'note', foreignField: '_id', as: 'n' } }];
      expect((await post('aggregate', A, { collection: 'board', pipelines: lookup('note'), accessQuery: {} })).status).toBe(403);
      expect((await post('aggregate', A, { collection: 'board', pipelines: lookup('vault'), accessQuery: {} })).status).toBe(403);
      expect((await post('aggregate', A, { collection: 'board', pipelines: lookup('board'), accessQuery: {} })).status).toBe(200);
      const nested = [{ $facet: { x: [{ $unionWith: { coll: 'ledger' } }] } }];
      expect((await post('aggregate', A, { collection: 'board', pipelines: nested, accessQuery: {} })).status).toBe(403);
      const out = [{ $out: 'note' }];
      expect((await post('aggregate', A, { collection: 'board', pipelines: out, accessQuery: {} })).status).toBe(403);
    });
  });

  it('refuses a database or collection that isn’t a string', async () => {
    const res = await post('find', A, { collection: ['note'], query: {} });
    expect(res.status).toBe(412);
  });
});
