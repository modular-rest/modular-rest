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

## Configuration Summary Table

| Property                          | Type       | Optional | Description                                   |
| --------------------------------- | ---------- | -------- | --------------------------------------------- |
| `cors`                            | `Cors`     | Yes      | CORS options.                                 |
| `modulesPath`                     | `string`   | Yes      | Root directory for `router.js`/`db.js` files. |
| `staticPath`                      | `Object`   | Yes      | Configuration for serving static files.       |
| `onBeforeInit`                    | `Function` | Yes      | Callback before Koa server initialization.    |
| `onAfterInit`                     | `Function` | Yes      | Callback after Koa server initialization.     |
| `port`                            | `number`   | Yes      | Server port number.                           |
| `dontListen`                      | `boolean`  | Yes      | If `true`, doesn't start the server.          |
| `mongo`                           | `Object`   | No       | MongoDB configuration.                        |
| `keypair`                         | `Object`   | No       | RSA keypair for authentication.               |
| `adminUser`                       | `Object`   | No       | Admin user credentials.                       |
| `verificationCodeGeneratorMethod` | `Function` | No       | Method to generate a verification code.       |
| `collectionDefinitions`           | `Array`    | No       | Additional collection definitions.            |
| `permissionGroups`                | `Array`    | No       | Additional permission groups.                 |
| `authTriggers`                    | `Array`    | No       | Database triggers for the auth collection.    |

## Server and Middleware Configuration

- **`cors`**: Defines Cross-Origin Resource Sharing (CORS) options to control how resources on your server can be requested from another domain.
- **`port`**: Specifies the port number on which the server will listen for requests.
- **`dontListen`**: If set to `true`, the server setup is done but it won't start listening. This is useful for cases where you want to perform tests or when integrating with another server.

## Static Files and Modules Path

- **`modulesPath`**: The directory path where your module files (`router.js`, `db.js`) are located.
- **`staticPath`**: Provides detailed options for serving static files from your server, such as the root directory, caching options, and whether to serve gzipped content.

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