import { TestAppContext, createIntegrationTestApp } from '../helpers/test-app';
import * as JWT from '../../src/services/jwt/service';

describe('jwt router integration', () => {
  let ctx: TestAppContext;

  beforeAll(async () => {
    ctx = await createIntegrationTestApp();
  });

  afterAll(async () => {
    if (ctx) {
      await ctx.cleanup();
    }
  });

  it('GET /verify/ready returns success', async () => {
    const res = await ctx.request.get('/verify/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('POST /verify/token fails with missing token', async () => {
    const res = await ctx.request.post('/verify/token').send({});
    expect(res.status).toBe(412);
    expect(res.body.status).toBe('error');
  });

  it('POST /verify/token succeeds with valid token', async () => {
    // Generate a token
    const payload = { id: 'test-user', email: 'test@email.com' };
    const token = await JWT.main.sign(payload);

    const res = await ctx.request.post('/verify/token').send({ token });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.user.id).toBe(payload.id);
    expect(res.body.user.email).toBe(payload.email);
  });

  it('POST /verify/token fails with invalid token', async () => {
    const res = await ctx.request.post('/verify/token').send({ token: 'invalid-token' });
    expect(res.status).toBe(412);
    expect(res.body.status).toBe('error');
  });

  it('POST /verify/checkAccess fails with missing fields', async () => {
    const res = await ctx.request.post('/verify/checkAccess').send({ token: 'something' });
    expect(res.status).toBe(412);
    expect(res.body.status).toBe('error');
  });

  it('POST /verify/checkAccess succeeds for admin', async () => {
    // Use the admin token from context
    // We need to extract the token string (it might have 'Bearer ' prefix if we set it that way,
    // but in createIntegrationTestApp it is just the token)
    const token = ctx.adminToken;

    const res = await ctx.request.post('/verify/checkAccess').send({
      token,
      permissionField: 'advanced_settings', // Admin should have this
    });

    // If global.services is not set, this will likely return 500 or 412 depending on error handling
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.access).toBe(true);
  });
});
