import { BaseResponseType } from "./base-response.type";

export interface FunctionResponseType<T> extends BaseResponseType {
  data: T;
}
