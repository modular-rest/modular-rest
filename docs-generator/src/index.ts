import * as path from "path";
import { DocumentationGenerator } from "./generators/documentation-generator";

async function main() {
  const inputDir = path.resolve(__dirname, "../../packages/server-ts/src/temp");
  console.log(`Processing files in: ${inputDir}`);
  const generator = new DocumentationGenerator();
  await generator.generate(inputDir);
  console.log("Documentation generation completed!");
}

main().catch(console.error);
