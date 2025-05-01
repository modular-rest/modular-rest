# CORS

Cross-Origin Resource Sharing (CORS) is a security feature implemented in web browsers to prevent malicious websites from accessing resources and data from another domain without permission. By default, web browsers enforce the same-origin policy, which restricts web pages from making requests to a different domain than the one that served the web page. CORS provides a way for servers to declare who can access their assets and under what conditions, enhancing security while enabling controlled cross-origin requests.

## Understanding CORS

CORS is essential for modern web applications that integrate resources from different origins. For instance, if your web application hosted at `http://example.com` tries to request resources from `http://api.example.com`, the browser will block these requests unless the server at `http://api.example.com` includes the appropriate CORS headers in its responses to indicate that such requests are allowed.

The CORS mechanism involves the browser sending an `Origin` header with the origin of the requesting site to the server. The server then decides whether to allow or deny the request based on its CORS policy. If allowed, the server includes the `Access-Control-Allow-Origin` header in its response, specifying which origins can access the resources.

## CORS Configuration

The `@modular-rest/server` framework uses `koa/cors` middleware to configure CORS policies. Here's how you can set it up:

### CORS Middleware Options

Below is a detailed explanation of the CORS configuration options provided by `koa/cors` in `@modular-rest/server`:

<!-- @include: @server-client-ts/generative/interfaces/_internal_.Options.md#properties -->

### Example Configuration

Here's an example of how to configure CORS in your `@modular-rest/server` application:

```javascript
import { createRest } from '@modular-rest/server';

const corsOptions = {
    origin: 'https://www.example.com',
    allowMethods: ['GET', 'POST'],
    credentials: true,
    secureContext: true,
};

const app = createRest({
    port: 3000,
    cors: corsOptions,
    // Other configuration options...
});
```

In this configuration:
- CORS requests are only allowed from `https://www.example.com`.
- Only `GET` and `POST` methods are permitted.
- Credentials are allowed in cross-origin requests.
- Secure context headers are enabled for added security.

## Conclusion

Properly configuring CORS is crucial for securing your application and enabling necessary cross-origin requests. `@modular-rest/server` simplifies this process by integrating `koa/cors` middleware, providing a flexible and powerful way to define your CORS policy. By understanding and utilizing these settings, developers can ensure that their web applications are secure and functional across different domains.