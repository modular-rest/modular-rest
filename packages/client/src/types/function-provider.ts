import { BaseResponseType } from "./base-response";

export interface FunctionResponseType<T> extends BaseResponseType {
  data: T;
}
