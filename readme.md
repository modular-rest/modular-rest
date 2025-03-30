# Modular Rest Documentation Generator

This tool generates documentation for the Modular Rest TypeScript library by analyzing the source code and TSDoc comments.

## Installation

```bash
npm install
```

## Usage

1. Add TSDoc comments to your code in the following format:

```typescript
/**
 * @description Creates a new REST API instance
 * @example
 * ```typescript
 * const rest = createRest();
 * ```
 * @param options - Configuration options
 * @returns A new REST API instance
 * @note This is the main entry point for the library
 */
export function createRest(options?: RestOptions): RestInstance {
  // Implementation
}
```

2. Run the documentation generator:

```bash
npm run generate
```

This will:
- Parse the source code from `../packages/server-ts/src/index.ts`
- Extract TSDoc comments and code structure
- Generate markdown documentation in `./docs/server-client-ts/`
- Maintain the existing documentation structure

## Documentation Structure

The generated documentation will follow the existing structure:

```
docs/server-client-ts/
├── key-concepts.md
├── configuration.md
├── install.md
├── modules/
│   ├── database.md
│   ├── functions.md
│   ├── custom-route.md
│   └── intro.md
└── utility/
    ├── router.md
    ├── user-manager.md
    ├── database.md
    └── file.md
```

## TSDoc Tags

The generator supports the following TSDoc tags:

- `@description` - Main description of the export
- `@example` - Code examples
- `@param` - Parameter documentation
- `@returns` - Return type documentation
- `@note` - Additional notes or warnings

## Development

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev
```

## Configuration

The documentation generator can be configured in `src/index.ts`:

```typescript
const config: DocConfig = {
  sourcePath: "../packages/server-ts/src/index.ts",
  outputPath: "./docs/server-client-ts",
  structure: {
    modules: ["database", "functions", "custom-route", "intro"],
    utility: ["router", "user-manager", "database", "file"],
    root: ["key-concepts", "configuration", "install"]
  }
};
```

## Category Detection

The generator automatically categorizes exports based on their names:

- Database related: `collection`, `schema`, `database`
- Function related: `function`, `definefunction`
- Router related: `router`, `route`
- User management: `user`, `auth`
- File related: `file`, `upload`
- Core: All other exports
