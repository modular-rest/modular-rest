import * as path from "path";
import * as fs from "fs";
import { Project } from "ts-morph";
import { TSDocParser } from "@microsoft/tsdoc";
import * as Handlebars from "handlebars";

interface DocItem {
  name: string;
  description: string;
  properties: string[];
  examples: string[];
  parameters: { name: string; type: string; description: string }[];
  returns?: { type: string; description: string };
}

class DocumentationGenerator {
  private project: Project;
  private tsdocParser: TSDocParser;
  private template: Handlebars.TemplateDelegate;

  constructor() {
    this.project = new Project();
    this.tsdocParser = new TSDocParser();
    this.template = Handlebars.compile(`
# {{name}}

{{{description}}}

{{#if properties}}
## Properties
{{#each properties}}
{{{this}}}
{{/each}}
{{/if}}

{{#if parameters}}
## Parameters
{{#each parameters}}
- **{{name}}** ({{type}}) - {{{description}}}
{{/each}}
{{/if}}

{{#if returns}}
## Returns
{{returns.type}} - {{{returns.description}}}
{{/if}}

{{#if examples}}
## Examples
{{#each examples}}
\`\`\`typescript
{{{this}}}
\`\`\`
{{/each}}
{{/if}}
`);
  }

  private extractText(node: any): string {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (node.text) return node.text;
    if (node.nodes) {
      return node.nodes
        .map((n: any) => this.extractText(n))
        .filter((text: string) => text)
        .join(" ");
    }
    return "";
  }

  private extractExamples(parsedComment: any): string[] {
    const examples: string[] = [];
    const exampleBlocks = parsedComment.docComment.customBlocks.filter(
      (block: any) => block.blockTag.tagName === "@example"
    );
    for (const block of exampleBlocks) {
      const example = this.extractText(block.content);
      if (example) {
        examples.push(example);
      }
    }
    return examples;
  }

  private extractParameters(
    parsedComment: any
  ): { name: string; type: string; description: string }[] {
    const parameters: { name: string; type: string; description: string }[] =
      [];
    const paramBlocks = parsedComment.docComment.params?.blocks || [];
    for (const block of paramBlocks) {
      const description = this.extractText(block.content);
      if (description) {
        parameters.push({
          name: block.parameterName,
          type: block.typeExpression
            ? this.extractText(block.typeExpression)
            : "any",
          description,
        });
      }
    }
    return parameters;
  }

  private extractReturns(
    parsedComment: any
  ): { type: string; description: string } | undefined {
    const returnBlock = parsedComment.docComment.returnsBlock;
    if (!returnBlock) return undefined;

    const description = this.extractText(returnBlock.content);
    if (!description) return undefined;

    return {
      type: returnBlock.typeExpression
        ? this.extractText(returnBlock.typeExpression)
        : "any",
      description,
    };
  }

  private async parseDeclaration(
    declaration: any,
    name: string
  ): Promise<DocItem | null> {
    let docComment: any;

    try {
      if (typeof declaration.getJsDocs === "function") {
        const jsDocs = declaration.getJsDocs();
        if (Array.isArray(jsDocs) && jsDocs.length > 0) {
          docComment = jsDocs[0];
        }
      }
    } catch (error) {
      console.log(`Warning: Could not get JSDoc for ${name}`);
      return null;
    }

    if (!docComment) return null;

    let parsedComment;
    try {
      parsedComment = this.tsdocParser.parseString(docComment.getText());
    } catch (error) {
      console.log(`Warning: Could not parse JSDoc for ${name}`);
      return null;
    }

    const description = this.extractText(
      parsedComment.docComment.summarySection
    );

    let properties: string[] = [];
    try {
      if (typeof declaration.getProperties === "function") {
        properties = declaration.getProperties().map((prop: any) => {
          const type = prop.getType();
          const typeText = type
            .getText()
            .replace(/import\("[^"]+"\)\./g, "")
            .replace(/Document<[^>]+>/g, "Document")
            .replace(/Model<[^>]+>/g, "Model")
            .replace(/Schema<[^>]+>/g, "Schema")
            .replace(/\{[^}]+\}/g, "object");

          const isOptional = prop.hasQuestionToken();
          let docs = "";
          try {
            if (typeof prop.getJsDocs === "function") {
              const propJsDocs = prop.getJsDocs();
              if (Array.isArray(propJsDocs) && propJsDocs.length > 0) {
                docs = propJsDocs[0].getDescription() || "";
              }
            }
          } catch (error) {
            console.log(
              `Warning: Could not get JSDoc for property ${prop.getName()}`
            );
          }

          return `- \`${prop.getName()}${
            isOptional ? "?" : ""
          }\` (${typeText}) - ${docs}`;
        });
      }
    } catch (error) {
      console.log(`Warning: Could not get properties for ${name}`);
    }

    return {
      name,
      description: description || "No description available.",
      properties,
      examples: this.extractExamples(parsedComment),
      parameters: this.extractParameters(parsedComment),
      returns: this.extractReturns(parsedComment),
    };
  }

  async generate(inputDir: string): Promise<void> {
    // Create docs directory
    const outputDir = path.resolve(__dirname, "../generated-docs");
    fs.mkdirSync(outputDir, { recursive: true });

    // Add source files to the project
    const sourcePattern = path.join(inputDir, "**", "*.ts");
    console.log(`Looking for TypeScript files with pattern: ${sourcePattern}`);
    this.project.addSourceFilesAtPaths([sourcePattern]);

    // Process all TypeScript files recursively
    const files = this.project.getSourceFiles();
    console.log(`Found ${files.length} TypeScript files to process`);

    for (const file of files) {
      const filePath = file.getFilePath();
      console.log(`Processing file: ${filePath}`);
      await this.processFile(filePath, outputDir);
    }
  }

  private async processFile(
    filePath: string,
    outputDir: string
  ): Promise<void> {
    console.log(`\nProcessing file: ${filePath}`);
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    const basePath = path.resolve(__dirname, "../../packages/server-ts/src");
    const relativePath = path.relative(basePath, filePath);
    const outputPath = path.join(
      outputDir,
      relativePath.replace(/\.ts$/, ".md")
    );

    console.log(`Output path: ${outputPath}`);

    const items: DocItem[] = [];

    // Process interfaces
    const interfaces = sourceFile.getInterfaces();
    console.log(`Found ${interfaces.length} interfaces`);
    for (const interfaceDeclaration of interfaces) {
      const name = interfaceDeclaration.getName();
      if (name) {
        const item = await this.parseDeclaration(interfaceDeclaration, name);
        if (item) items.push(item);
      }
    }

    // Process classes
    const classes = sourceFile.getClasses();
    console.log(`Found ${classes.length} classes`);
    for (const classDeclaration of classes) {
      const name = classDeclaration.getName();
      if (name) {
        const item = await this.parseDeclaration(classDeclaration, name);
        if (item) items.push(item);
      }
    }

    // Process functions
    const functions = sourceFile.getFunctions();
    console.log(`Found ${functions.length} functions`);
    for (const functionDeclaration of functions) {
      const name = functionDeclaration.getName();
      if (name) {
        const item = await this.parseDeclaration(functionDeclaration, name);
        if (item) items.push(item);
      }
    }

    // Process exported variables
    const variables = sourceFile.getVariableDeclarations();
    console.log(`Found ${variables.length} variables`);
    for (const variableDeclaration of variables) {
      if (variableDeclaration.isExported()) {
        const name = variableDeclaration.getName();
        if (name) {
          const item = await this.parseDeclaration(variableDeclaration, name);
          if (item) items.push(item);
        }
      }
    }

    if (items.length > 0) {
      // Create output directory if it doesn't exist
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      // Generate markdown content
      const content = items.map((item) => this.template(item)).join("\n\n");
      fs.writeFileSync(outputPath, content);
      console.log(
        `Generated documentation for ${filePath} with ${items.length} items`
      );
    } else {
      console.log(`No documented items found in ${filePath}`);
    }
  }
}

async function main() {
  const inputDir = path.resolve(__dirname, "../../packages/server-ts/src");
  console.log(`Processing files in: ${inputDir}`);
  const generator = new DocumentationGenerator();
  await generator.generate(inputDir);
  console.log("Documentation generation completed!");
}

main().catch(console.error);
