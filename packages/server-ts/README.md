# @modular-rest/server-ts

TypeScript version of a Node.js module based on Koa.js for developing REST APIs in a modular solution.

## Version 1.12 Breaking Changes

The 1.12 release includes several breaking changes:

- Complete rewrite in TypeScript with full type safety and improved IDE support
- Auto-generated API documentation using TypeDoc
- Changed configuration structure for better TypeScript support

## Migration Status

This is a TypeScript migration of the original [@modular-rest/server](https://github.com/modular-rest/modular-rest) package. While maintaining compatibility with the JavaScript version, it adds type safety and better developer experience.

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

This package includes full TypeScript type definitions for all API components. The entire codebase is written in TypeScript, providing:

- IntelliSense and autocompletion in modern IDEs
- Type safety for all API operations
- Better compile-time error detection
- Improved developer experience

## Documentation

The API documentation is automatically generated using TypeDoc. You can access the latest documentation:

- In the `docs` directory of this repository
- On the [modular-rest documentation site](https://modular-rest.github.io/docs)

## Development

To build the package:

```bash
yarn build
```

To run the development build with watch mode:

```bash
yarn dev
```

To generate documentation:

```bash
yarn docs
```

## License

MIT