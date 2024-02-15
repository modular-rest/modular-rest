import { BaseResponseType } from "./base-response";

export interface BaseRequestType {
  database: string;
  collection: string;
}

export interface FindQueryType extends BaseRequestType {
  query: object;
  populates?: [string | { path: string; select: string }];
  options?: {
    skip?: number;
    limit?: number;
    sort?: string | object;
    select?: string | object | [string];
  };
}

export interface FindByIdsQueryType extends BaseRequestType {
  ids: string[];
  accessQuery: { [key: string]: any };
}

export interface UpdateQueryType extends BaseRequestType {
  query: object;
  update: object;
}

export interface InsertQueryType extends BaseRequestType {
  doc: object;
}

export interface AggregateQueryType extends BaseRequestType {
  pipelines: object[];
  accessQuery: { [key: string]: any };
}

export interface ResponseType extends BaseResponseType {
  data: any;
}

export interface PaginationType {
  from: number;
  limit: number;
  page: number;
  pages: number;
  to: number;
  total: number;
}

export interface PaginatedResponseType<T> {
  pagination: PaginationType;
  updatePagination: () => Promise<void>;
  fetchPage: (page: number) => Promise<Array<T>>;
}
