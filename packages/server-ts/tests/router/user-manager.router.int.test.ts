import { TestAppContext, createIntegrationTestApp } from '../helpers/test-app';
import * as userManager from '../../src/services/user_manager/service';

describe('user-manager router integration', () => {
  let ctx: TestAppContext;

  beforeAll(async () => {
    ctx = await createIntegrationTestApp();
  });

  afterAll(async () => {
    if (ctx) {
      await ctx.cleanup();
    }
  });

  it('POST /user/login fails with wrong credentials', async () => {
    const res = await ctx.request.post('/user/login').send({
      id: 'admin@email.com',
      idType: 'email',
      password: 'wrong-password',
    });
    expect(res.status).toBe(412);
    expect(res.body.status).toBe('error');
  });

  it('POST /user/login succeeds with admin credentials', async () => {
    const res = await ctx.request.post('/user/login').send({
      id: 'admin@email.com',
      idType: 'email',
      password: '@dmin',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  it('GET /user/loginAnonymous succeeds', async () => {
    const res = await ctx.request.get('/user/loginAnonymous');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  it('handles registration flow', async () => {
    const email = 'new-user@email.com';
    const password = 'new-password';

    // 1. Register ID
    const regRes = await ctx.request.post('/user/register_id').send({
      id: email,
      idType: 'email',
    });
    expect(regRes.status).toBe(200);
    expect(regRes.body.status).toBe('success');

    // 2. Validate Code (default is '123')
    const valRes = await ctx.request.post('/user/validateCode').send({
      id: email,
      code: '123',
    });
    expect(valRes.status).toBe(200);
    expect(valRes.body.status).toBe('success');
    expect(valRes.body.isValid).toBe(true);

    // 3. Submit Password
    const subRes = await ctx.request.post('/user/submit_password').send({
      id: email,
      password: password,
      code: '123',
    });
    expect(subRes.status).toBe(200);
    expect(subRes.body.status).toBe('success');

    // 4. Login with new credentials
    const loginRes = await ctx.request.post('/user/login').send({
      id: email,
      idType: 'email',
      password: password,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.status).toBe('success');
    expect(loginRes.body.token).toBeDefined();
  });
});
