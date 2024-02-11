export interface RequestError {
  hasError: boolean;
  error: any;
}

export interface FileDocument {
  _id: string;
  originalName: String;
  fileName: String;
  owner: String;
}

export * from "./data-provider";
export * from "./auth";
