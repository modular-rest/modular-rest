import {
  Project,
  Node,
  SourceFile,
  ExportDeclaration,
  Symbol,
  JSDoc,
} from "ts-morph";
import { TSDocParser, TSDocConfiguration, DocNode } from "@microsoft/tsdoc";
import * as Handlebars from "handlebars";
import MarkdownIt from "markdown-it";
import * as fs from "fs";
import * as path from "path";
import {
  DocConfig,
  DocCategory,
  DocSection,
  ParsedExport,
  CodeExample,
  ParameterTable,
  ReturnTypeTable,
  DocItem,
} from "./types";

export class DocumentationGenerator {
  private project: Project;
  private config: DocConfig;
  private md: MarkdownIt;
  private tsdocParser: TSDocParser;

  constructor(config: DocConfig) {
    this.config = config;
    this.project = new Project();
    this.md = new MarkdownIt();
    this.tsdocParser = new TSDocParser();
  }

  async generate(): Promise<void> {
    // Load the source file
    const sourceFile = this.project.addSourceFileAtPath(this.config.sourcePath);

    // Parse exports and generate documentation
    const exports = sourceFile.getExportedDeclarations();
    const docItems: DocItem[] = [];

    for (const [name, declarations] of exports) {
      for (const declaration of declarations) {
        const docItem = await this.parseDeclaration(declaration, name);
        if (docItem) {
          docItems.push(docItem);
        }
      }
    }

    // Generate markdown files
    await this.generateMarkdownFiles(docItems);
  }

  private async parseDeclaration(
    declaration: any,
    name: string
  ): Promise<DocItem | null> {
    let docComment: JSDoc | undefined;

    if (declaration.getJsDocs) {
      docComment = declaration.getJsDocs()[0];
    } else if (declaration.getDocumentationComment) {
      docComment = declaration.getDocumentationComment();
    }

    if (!docComment) return null;

    const parsedComment = this.tsdocParser.parseString(docComment.getText());
    const description = parsedComment.docComment.summarySection.nodes
      .map((node) => node.toString())
      .join("");

    // Determine category and subcategory based on name and structure
    const category = this.determineCategory(name);
    const subcategory = this.determineSubcategory(name, category);

    return {
      name,
      description,
      category,
      subcategory,
      examples: this.extractExamples(parsedComment),
      parameters: this.extractParameters(parsedComment),
      returns: this.extractReturns(parsedComment),
    };
  }

  private determineCategory(name: string): "modules" | "utility" | "root" {
    if (
      this.config.structure.modules.some((m) => name.toLowerCase().includes(m))
    ) {
      return "modules";
    }
    if (
      this.config.structure.utility.some((u) => name.toLowerCase().includes(u))
    ) {
      return "utility";
    }
    return "root";
  }

  private determineSubcategory(
    name: string,
    category: "modules" | "utility" | "root"
  ): string {
    const structure = this.config.structure[category];
    return (
      structure.find((s) => name.toLowerCase().includes(s.toLowerCase())) ||
      "general"
    );
  }

  private extractExamples(parsedComment: any): string[] {
    const examples: string[] = [];
    const exampleBlocks = parsedComment.docComment.customBlocks.filter(
      (block: any) => block.blockTag.tagName === "@example"
    );
    for (const block of exampleBlocks) {
      examples.push(
        block.content.nodes.map((node: any) => node.toString()).join("")
      );
    }
    return examples;
  }

  private extractParameters(
    parsedComment: any
  ): { name: string; type: string; description: string }[] {
    const parameters: { name: string; type: string; description: string }[] =
      [];
    const paramBlocks = parsedComment.docComment.params.blocks;
    for (const block of paramBlocks) {
      parameters.push({
        name: block.parameterName,
        type: block.typeExpression
          ? block.typeExpression.nodes
              .map((node: any) => node.toString())
              .join("")
          : "any",
        description: block.content.nodes
          .map((node: any) => node.toString())
          .join(""),
      });
    }
    return parameters;
  }

  private extractReturns(
    parsedComment: any
  ): { type: string; description: string } | undefined {
    const returnBlock = parsedComment.docComment.returnsBlock;
    if (!returnBlock) return undefined;

    return {
      type: returnBlock.typeExpression
        ? returnBlock.typeExpression.nodes
            .map((node: any) => node.toString())
            .join("")
        : "any",
      description: returnBlock.content.nodes
        .map((node: any) => node.toString())
        .join(""),
    };
  }

  private async generateMarkdownFiles(docItems: DocItem[]): Promise<void> {
    // Group items by category and subcategory
    const groupedItems = this.groupItems(docItems);

    // Generate markdown files for each category and subcategory
    for (const [category, subcategories] of Object.entries(groupedItems)) {
      for (const [subcategory, items] of Object.entries(subcategories)) {
        const content = this.generateMarkdownContent(items);
        const outputPath = path.join(
          this.config.outputPath,
          category,
          `${subcategory}.md`
        );

        // Ensure directory exists
        await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

        // Write file
        await fs.promises.writeFile(outputPath, content);
      }
    }
  }

  private groupItems(
    docItems: DocItem[]
  ): Record<string, Record<string, DocItem[]>> {
    const grouped: Record<string, Record<string, DocItem[]>> = {
      modules: {},
      utility: {},
      root: {},
    };

    for (const item of docItems) {
      if (!grouped[item.category][item.subcategory]) {
        grouped[item.category][item.subcategory] = [];
      }
      grouped[item.category][item.subcategory].push(item);
    }

    return grouped;
  }

  private generateMarkdownContent(items: DocItem[]): string {
    const template = `
# {{subcategory}}

{{#each items}}
## {{name}}

{{description}}

{{#if parameters}}
### Parameters
{{#each parameters}}
- **{{name}}** ({{type}}) - {{description}}
{{/each}}
{{/if}}

{{#if returns}}
### Returns
{{returns.type}} - {{returns.description}}
{{/if}}

{{#if examples}}
### Examples
{{#each examples}}
\`\`\`typescript
{{this}}
\`\`\`
{{/each}}
{{/if}}

{{/each}}
`;

    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate({
      subcategory: items[0]?.subcategory || "General",
      items,
    });
  }
}
