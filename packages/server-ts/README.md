# @modular-rest/server-ts

TypeScript version of a Node.js module based on Koa.js for developing REST APIs in a modular solution.

## Migration Status

This is a TypeScript migration of the original [@modular-rest/server](https://github.com/modular-rest/modular-rest) package. The API is compatible with the original JavaScript version.

## Installation

```bash
npm install @modular-rest/server-ts
# or
yarn add @modular-rest/server-ts
```

## Usage

```typescript
import { createRest } from '@modular-rest/server-ts';

// Create a Koa application with modular-rest
createRest({
  port: 3000,
  modulesPath: __dirname + '/modules',
  uploadDirectory: __dirname + '/uploads',
  staticPath: {
    rootDir: __dirname + '/assets',
    rootPath: '/assets'
  },
  mongo: {
    mongoBaseAddress: 'mongodb://localhost:27017',
    dbPrefix: 'myapp_'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'securePassword'
  }
}).then(({ app, server }) => {
  console.log('Server started successfully');
});
```

## Key Features

- Modular REST API development with Koa.js
- Built-in MongoDB integration
- User authentication and authorization
- File upload and management
- Event system
- Extensible architecture

## TypeScript Support

This package includes full TypeScript type definitions for all API components.

## Development

To build the package:

```bash
yarn build
```

To run the development build with watch mode:

```bash
yarn dev
```

## License

MIT 