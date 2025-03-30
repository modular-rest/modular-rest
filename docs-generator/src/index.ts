import { DocumentationGenerator } from "./DocumentationGenerator";
import { DocConfig } from "./types";
import * as path from "path";

const config: DocConfig = {
  sourcePath: path.resolve(__dirname, "../../packages/server-ts/src/index.ts"),
  outputPath: path.resolve(__dirname, "../docs/server-client"),
  structure: {
    modules: ["database", "functions", "custom-route", "intro"],
    utility: ["router", "user-manager", "database", "file"],
    root: ["key-concepts", "configuration", "install"],
  },
};

async function main() {
  try {
    const generator = new DocumentationGenerator(config);
    await generator.generate();
    console.log("Documentation generated successfully!");
  } catch (error) {
    console.error("Error generating documentation:", error);
  }
}

main();
