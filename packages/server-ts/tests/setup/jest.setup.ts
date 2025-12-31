process.env.TZ = 'UTC';

// Allow longer-running integration hooks (Mongo + server bootstrap)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).jest?.setTimeout?.(60000);
