import { TestAppContext, createIntegrationTestApp } from '../helpers/test-app';

describe('data-provider router integration', () => {
  let ctx: TestAppContext;
  let createdId: string;

  beforeAll(async () => {
    ctx = await createIntegrationTestApp();
  });

  afterAll(async () => {
    if (ctx) {
      await ctx.cleanup();
    }
  });

  it('rejects request without authorization', async () => {
    const res = await ctx.request.post('/data-provider/find').send({
      database: 'cms',
      collection: 'file',
      query: {},
    });
    expect(res.status).toBe(401);
  });

  it('fails when database or collection is missing', async () => {
    const res = await ctx.request
      .post('/data-provider/find')
      .set('authorization', ctx.adminToken)
      .send({
        query: {},
      });
    expect(res.status).toBe(412);
    const body = JSON.parse(res.text);
    expect(body.status).toBe('error');
  });

  it('inserts a document using /insert-one', async () => {
    const res = await ctx.request
      .post('/data-provider/insert-one')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        doc: {
          originalName: 'test-file.txt',
          fileName: 'test-uuid.txt',
          format: 'text',
          tag: 'test-tag',
          size: 1024,
          owner: 'admin-id',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.originalName).toBe('test-file.txt');
    createdId = res.body.data._id;
  });

  it('finds the inserted document using /find-one', async () => {
    const res = await ctx.request
      .post('/data-provider/find-one')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        query: { _id: createdId },
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data._id).toBe(createdId);
  });

  it('updates the document using /update-one', async () => {
    const res = await ctx.request
      .post('/data-provider/update-one')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        query: { _id: createdId },
        update: { $set: { originalName: 'updated-name.txt' } },
      });

    expect(res.status).toBe(200);
    // Mongoose updateOne returns { n, nModified, ok }
    expect(res.body.data.ok).toBe(1);

    // Verify update
    const verifyRes = await ctx.request
      .post('/data-provider/find-one')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        query: { _id: createdId },
      });
    expect(verifyRes.body.data.originalName).toBe('updated-name.txt');
  });

  it('counts documents using /count', async () => {
    const res = await ctx.request
      .post('/data-provider/count')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        query: { _id: createdId },
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toBe(1);
  });

  it('finds multiple documents using /find', async () => {
    const res = await ctx.request
      .post('/data-provider/find')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        query: { _id: createdId },
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('finds by ids using /findByIds', async () => {
    const res = await ctx.request
      .post('/data-provider/findByIds')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        ids: [createdId],
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]._id).toBe(createdId);
  });

  it('aggregates documents using /aggregate', async () => {
    const res = await ctx.request
      .post('/data-provider/aggregate')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        accessQuery: {},
        pipelines: [{ $match: { tag: 'test-tag' } }], // Use string field to avoid ID casting issues for now
      });

    if (res.status !== 200) {
      console.error('Aggregate Error:', res.text);
    }

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('removes the document using /remove-one', async () => {
    const res = await ctx.request
      .post('/data-provider/remove-one')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        query: { _id: createdId },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.n).toBe(1);

    // Verify removal
    const verifyRes = await ctx.request
      .post('/data-provider/find-one')
      .set('authorization', ctx.adminToken)
      .send({
        database: 'cms',
        collection: 'file',
        query: { _id: createdId },
      });
    expect(verifyRes.body.data).toBeNull();
  });
});
