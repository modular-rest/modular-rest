export interface RequestError {
  hasError: boolean;
  error: any;
}

export interface FileDocument {
  _id: string;
  originalName: String;
  fileName: String;
  owner: String;
  size: Number;
}

export type OnProgressCallback = (progressEvent: ProgressEvent) => void;

export * from "./data-provider";
export * from "./auth";
