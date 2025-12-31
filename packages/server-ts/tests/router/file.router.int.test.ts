import fs from 'fs';
import path from 'path';
import { getCollection } from '../../src/services/data_provider/service';
import { IFile } from '../../src/class/db_schemas';
import {
  TestAppContext,
  createFileRouterTestApp,
  createTempFile,
  ensureUploadPath,
} from '../helpers/test-app';

describe('file router integration', () => {
  let ctx: TestAppContext;
  let createdFileId: string;
  let storedPath: string;

  beforeAll(async () => {
    ctx = await createFileRouterTestApp();
  });

  afterAll(async () => {
    if (ctx) {
      await ctx.cleanup();
    }
  });

  it('rejects upload without authorization', async () => {
    const res = await ctx.request.post('/file').field('tag', 'avatar');
    expect(res.status).toBe(401);
  });

  it('fails upload when tag is missing', async () => {
    const res = await ctx.request.post('/file').set('authorization', ctx.adminToken);
    expect(res.status).toBe(412);
    expect(res.body.status).toBe('error');
  });

  it('fails upload when file field is missing', async () => {
    const res = await ctx.request
      .post('/file')
      .set('authorization', ctx.adminToken)
      .field('tag', 'avatar');

    expect(res.status).toBe(412);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toBe('file field required');
  });

  it('uploads a file and stores metadata', async () => {
    const tag = 'avatar';
    const filePath = createTempFile('txt', 'hello-world');

    // Ensure upload path exists for format/tag (service expects path to exist)
    ensureUploadPath(ctx.uploadDir, 'plain', tag);

    const res = await ctx.request
      .post('/file')
      .set('authorization', ctx.adminToken)
      .field('tag', tag)
      .attach('file', filePath);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.file).toBeDefined();

    createdFileId = res.body.file._id;
    expect(createdFileId).toBeTruthy();

    const fileModel = getCollection<IFile>('cms', 'file');
    const doc = await fileModel.findById(createdFileId).lean();

    expect(doc).toBeTruthy();
    expect(doc?.originalName).toBe('temp.txt');
    expect(doc?.tag).toBe(tag);
    expect(doc?.format).toBe('plain');

    storedPath = path.join(ctx.uploadDir, doc!.format, doc!.tag, doc!.fileName);
    expect(fs.existsSync(storedPath)).toBe(true);

    fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
  });

  it('deletes a file by id', async () => {
    const res = await ctx.request
      .delete('/file')
      .set('authorization', ctx.adminToken)
      .query({ id: createdFileId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const fileModel = getCollection<IFile>('cms', 'file');
    const doc = await fileModel.findById(createdFileId).lean();
    expect(doc).toBeNull();

    expect(storedPath ? fs.existsSync(storedPath) : false).toBe(false);
  });

  it('returns validation error when id is missing on delete', async () => {
    const res = await ctx.request.delete('/file').set('authorization', ctx.adminToken);
    expect(res.status).toBe(412);
    expect(res.body.status).toBe('fail');
  });
});
