# Modular Rest Documentation Generator

A TypeScript-based documentation generator for the Modular Rest library that generates markdown documentation from TSDoc comments.

## Features

- Parses TSDoc comments from TypeScript source files
- Generates organized markdown documentation
- Supports examples, parameters, and return types
- Categorizes documentation based on module structure
- Uses Handlebars templates for flexible output formatting

## Installation

```bash
npm install @modular-rest/docs-generator
```

## Usage

1. Add TSDoc comments to your TypeScript code:

```typescript
/**
 * Creates a new collection in the database
 * @param name - The name of the collection
 * @param schema - The schema definition for the collection
 * @returns A promise that resolves to the created collection
 * @example
 * ```typescript
 * const collection = await createCollection('users', {
 *   name: 'string',
 *   age: 'number'
 * });
 * ```
 */
export async function createCollection(name: string, schema: Schema) {
  // Implementation
}
```

2. Configure the documentation generator:

```typescript
import { DocumentationGenerator } from '@modular-rest/docs-generator';
import { DocConfig } from '@modular-rest/docs-generator';

const config: DocConfig = {
  sourcePath: './src/index.ts',
  outputPath: './docs',
  structure: {
    modules: ['database', 'functions', 'custom-route', 'intro'],
    utility: ['router', 'user-manager', 'database', 'file'],
    root: ['key-concepts', 'configuration', 'install']
  }
};

const generator = new DocumentationGenerator(config);
await generator.generate();
```

3. Run the generator:

```bash
npm run generate
```

## Documentation Structure

The generated documentation is organized into three main categories:

- **Modules**: Core functionality modules (database, functions, etc.)
- **Utility**: Helper functions and utilities
- **Root**: General documentation and concepts

Each category contains subcategories based on the configuration provided.

## TSDoc Tags Support

The generator supports the following TSDoc tags:

- `@param` - Document function parameters
- `@returns` - Document return values
- `@example` - Provide code examples
- `@description` - Detailed description
- `@summary` - Brief summary

## Output Format

The generated markdown files follow this structure:

```markdown
# Category Name

## Function Name

Description of the function

### Parameters
- **paramName** (type) - Description

### Returns
type - Description

### Examples
```typescript
// Example code
```
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 