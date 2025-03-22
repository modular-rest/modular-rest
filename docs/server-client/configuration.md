# Configuration Overview

This guide provides an overview and detailed explanation of the configuration options available for `@modular-rest/server`.

## Quick Start
To get started, you need to require `@modular-rest/server` and call `createRest` with your configuration object:

```javascript
const { createRest } = require('@modular-rest/server');

const app = createRest({
    port: '80',
    // Additional configuration options...
});
```

### Health Chek
You may need to check the server health, just request to below endpoint:
```bash
GET:[base_url]/verify/ready
# {"status":"success"}
```

## Configuration Summary Table

| Property                                                             | Type       | Optional | Description                                   |
| -------------------------------------------------------------------- | ---------- | -------- | --------------------------------------------- |
| [cors](./advanced/cors.md)                                           | `Cors`     | Yes      | CORS options.                                 |
| modulesPath                                                          | `string`   | Yes      | Root directory for `router.js`/`db.js` files. |
| uploadDirectory                                                      | `string`   | Yes      | Root directory of your uploaded files.        |
| [staticPath](#static-files)                                          | `Object`   | Yes      | Configuration for serving static files.       |
| onBeforeInit                                                         | `Function` | Yes      | Callback before Koa server initialization.    |
| onAfterInit                                                          | `Function` | Yes      | Callback after Koa server initialization.     |
| port                                                                 | `number`   | Yes      | Server port number.                           |
| dontListen                                                           | `boolean`  | Yes      | If `true`, doesn't start the server.          |
| mongo                                                                | `Object`   | No       | MongoDB configuration.                        |
| keypair                                                              | `Object`   | No       | RSA keypair for authentication.               |
| adminUser                                                            | `Object`   | No       | Admin user credentials.                       |
| verificationCodeGeneratorMethod                                      | `Function` | No       | Method to generate a verification code.       |
| [collectionDefinitions](./modules/database.html#define-a-collection) | `Array`    | No       | Additional collection definitions.            |
| permissionGroups                                                     | `Array`    | No       | Additional permission groups.                 |
| [authTriggers](./modules/database.html#triggers)                     | `Array`    | No       | Database triggers for the auth collection.    |
| fileTriggers                                                         | `Array`    | No       | Database triggers for the file collection.    |

## Server and Middleware Configuration

- **`cors`**: Defines Cross-Origin Resource Sharing (CORS) options to control how resources on your server can be requested from another domain.
- **`port`**: Specifies the port number on which the server will listen for requests.
- **`dontListen`**: If set to `true`, the server setup is done but it won't start listening. This is useful for cases where you want to perform tests or when integrating with another server.

## Modules and Upload Directory
- **`modulesPath`**: The directory path where your module files (`router.js`, `db.js`) are located.
- **`uploadDirectory`**: The root directory where uploaded files are stored, you can mount this directory to a CDN or a cloud storage service.

## Static Files
- **`staticPath`**: Provides detailed options for serving static files from your server, such as the root directory, caching options, and whether to serve gzipped content.
  
| Property     | Type                        | Description                                                                                                                                                                                     | Default Value  |
| ------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `rootDir`    | `string`                    | Root directory of your static files.                                                                                                                                                            |                |
| `rootPath`   | `string`                    | Root path of your static files, defaults to '/assets'.                                                                                                                                          | `'/assets'`    |
| `maxage`     | `number` (optional)         | Browser cache max-age in milliseconds.                                                                                                                                                          | `0`            |
| `hidden`     | `boolean` (optional)        | Allow transfer of hidden files.                                                                                                                                                                 | `false`        |
| `index`      | `string` (optional)         | Default file name.                                                                                                                                                                              | `'index.html'` |
| `defer`      | `boolean` (optional)        | If true, serves after return next(), allowing any downstream middleware to respond first.                                                                                                       | `false`        |
| `gzip`       | `boolean` (optional)        | Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested file with .gz extension exists.                                                | `true`         |
| `br`         | `boolean` (optional)        | Try to serve the brotli version of a file automatically when brotli is supported by a client and if the requested file with .br extension exists. Note that brotli is only accepted over https. | `false`        |
| `setHeaders` | `Function` (optional)       | Function to set custom headers on response.                                                                                                                                                     |                |
| `extensions` | `boolean\|Array` (optional) | Try to match extensions from passed array to search for file when no extension is suffixed in URL. First found is served.                                                                       | `false`        |

## Initialization Hooks

- **`onBeforeInit`**: A function that is called before the Koa application is initialized. This allows you to add or configure middleware and routes.
- **`onAfterInit`**: Similar to `onBeforeInit`, but this function is called after the application has been initialized.

## Database Configuration

- **`mongo`**: Contains MongoDB configuration details like the database address, prefix for database names, and more.

## Security and Authentication

- **`keypair`**: RSA keys used for authentication purposes.
- **`adminUser`**: Credentials for an admin user, typically used for initial setup or administrative tasks.

## Customization and Extensions

- **`verificationCodeGeneratorMethod`**, 
- **`collectionDefinitions`**, 
- **`permissionGroups`**, 
- **`authTriggers`**

 
These properties allow for extending the functionality of `@modular-rest/server` by adding custom verification code generation logic, defining additional database collections, setting up permission groups, and specifying triggers for database operations.

## Example Configuration

Here's an example demonstrating how to configure some of these properties:

```javascript
const { createRest } = require('@modular-rest/server');

const app = createRest({
    port: 3000,
    modulesPath: './modules',
    staticPath: {
        rootDir: './public',
        notFoundFile: '404.html',
        log: true,
    },
    mongo: {
        mongoBaseAddress: 'mongodb://localhost:27017',
        dbPrefix: 'myApp_'
    },
    onBeforeInit: (koaApp) => {
        // Custom middleware
        koaApp.use(customMiddleware());
    },
    adminUser: {
        email: 'admin@example.com',
        password: 'securepassword'
    }
});
```

This guide should give you a clear understanding of how to configure `@modular-rest/server` for your project, along with some examples to get you started.

---