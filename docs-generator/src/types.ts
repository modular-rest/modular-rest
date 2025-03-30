export interface DocSection {
  title: string;
  description: string;
  examples?: CodeExample[];
  parameters?: ParameterTable[];
  returnTypes?: ReturnTypeTable[];
  notes?: string[];
}

export interface CodeExample {
  language: string;
  code: string;
  description?: string;
}

export interface ParameterTable {
  name: string;
  type: string;
  description: string;
}

export interface ReturnTypeTable {
  type: string;
  description: string;
}

export interface DocCategory {
  name: string;
  description: string;
  sections: DocSection[];
}

export interface DocConfig {
  sourcePath: string;
  outputPath: string;
  structure: {
    modules: string[];
    utility: string[];
    root: string[];
  };
}

export interface DocItem {
  name: string;
  description: string;
  examples?: string[];
  parameters?: {
    name: string;
    type: string;
    description: string;
  }[];
  returns?: {
    type: string;
    description: string;
  };
  category: "modules" | "utility" | "root";
  subcategory: string;
}

export interface ParsedExport {
  name: string;
  category: string;
  description: string;
  examples: CodeExample[];
  parameters: ParameterTable[];
  returnTypes: ReturnTypeTable[];
  notes: string[];
  filePath: string;
}
