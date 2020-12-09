import BaseResponse from './base-response';

interface Identity {
    idType: 'email' | 'phone';
    id: string;
}

interface LoginOptions extends Identity {
    password: string;
}

interface LoginResponse extends BaseResponse {
    token?: string,
}

interface ValidateCodeResponse extends BaseResponse {
    isValid: boolean,
}

interface VerifyTokenResponse extends BaseResponse {
    user: object,
}

export {
    Identity,
    LoginOptions,
    LoginResponse,
    ValidateCodeResponse,
    VerifyTokenResponse,
    BaseResponse
}