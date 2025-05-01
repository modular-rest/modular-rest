import { AxiosProgressEvent } from "axios";

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

export type OnProgressCallback = (progressEvent: AxiosProgressEvent) => void;

export * from "./data-provider.type";
export * from "./auth.type";
