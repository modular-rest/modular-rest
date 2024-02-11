import { BaseResponseType } from "./base-response";

export interface IdentityType {
  idType: "email" | "phone";
  id: string;
}

export interface LoginOptionsType extends IdentityType {
  password: string;
}

export interface LoginResponseType extends BaseResponseType {
  token?: string;
}

export interface ValidateCodeResponseType extends BaseResponseType {
  isValid: boolean;
}

export interface VerifyTokenResponseType extends BaseResponseType {
  user: object;
}

export { BaseResponseType };
