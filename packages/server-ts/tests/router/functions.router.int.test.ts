import { TestAppContext, createIntegrationTestApp } from '../helpers/test-app';
import { defineFunction } from '../../src/services/functions/service';

describe('functions router integration', () => {
  let ctx: TestAppContext;

  const testFunction = defineFunction({
    name: 'testAdd',
    permissionTypes: ['user_access'],
    callback: (args: { a: number; b: number }) => args.a + args.b,
  });

  beforeAll(async () => {
    // Pass the test function to createRest via overrides
    ctx = await createIntegrationTestApp({
      functions: [testFunction],
    });
  });

  afterAll(async () => {
    if (ctx) {
      await ctx.cleanup();
    }
  });

  it('rejects execution without authorization', async () => {
    const res = await ctx.request.post('/function/run').send({
      name: 'testAdd',
      args: { a: 1, b: 2 },
    });
    expect(res.status).toBe(401);
  });

  it('fails with missing fields', async () => {
    const res = await ctx.request.post('/function/run').set('authorization', ctx.adminToken).send({
      name: 'testAdd',
    });
    expect(res.status).toBe(412);
    const body = JSON.parse(res.text);
    expect(body.status).toBe('error');
  });

  it('runs a defined function successfully', async () => {
    const res = await ctx.request
      .post('/function/run')
      .set('authorization', ctx.adminToken)
      .send({
        name: 'testAdd',
        args: { a: 5, b: 10 },
      });

    if (res.status !== 200) {
      console.error('Run Function Error:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toBe(15);
  });

  it('fails when function not found', async () => {
    const res = await ctx.request.post('/function/run').set('authorization', ctx.adminToken).send({
      name: 'nonExistent',
      args: {},
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('not found');
  });

  it('fails when user lacks permission', async () => {
    // 1. Get anonymous token
    const loginRes = await ctx.request.get('/user/loginAnonymous');
    expect(loginRes.status).toBe(200);
    const anonToken = loginRes.body.token;

    // 2. Try to run testAdd (requires user_access) with anonymous token
    const res = await ctx.request
      .post('/function/run')
      .set('authorization', anonToken)
      .send({
        name: 'testAdd',
        args: { a: 1, b: 2 },
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('does not have permission');
  });
});
