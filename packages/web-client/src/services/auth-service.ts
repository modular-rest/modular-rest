import HttpClient from '../class/http';
import BaseResponse from '../types/base-response';

interface identity {
    idType: 'email' | 'phone';
    id: String;
}

interface LoginOptions extends identity {
    password: string;
}

interface LoginResponse extends BaseResponse {
    token?: string,
}

interface validateCodeResponse extends BaseResponse {
    isValid: boolean,
}

class AuthService {

    private static instance: AuthService;
    private http: HttpClient;

    private constructor(baseUrl: string) {
        this.http = new HttpClient({ baseUrl: baseUrl });
    }

    public static getInstance(baseUrl: string): AuthService {

        if (AuthService.instance == null) {
            AuthService.instance = new AuthService(baseUrl);
        }

        return AuthService.instance;
    }

    /**
     * Login as an anonymous user and get a token.
     */
    loginAsAnonymous() {
        return this.http.get('/user/loginAnonymous')
            .then(body => body as LoginResponse)
    }

    /**
     * Login az an registered user.
     * 
     * @param options
     * @param options.idType the type of user identity
     * @param options.id user identity
     * @param options.password user password
     */
    login(options: LoginOptions) {
        return this.http.post('/user/login', options)
            .then(body => body as LoginResponse);
    }

    /**
     * Register user identity, 
     * first step for creating new account
     * 
     * @param options
     * @param options.idType the type of user identity
     * @param options.id user identity
     */
    registerIdentity(identity: identity) {
        return this.http.post('/user/register_id', identity)
            .then(body => body as BaseResponse);
    }

    /**
     * Send verification code to server,
     * second step for creating new account.
     * 
     * @param code verification code  
     */
    validateCode(options: {code: string, id:string}) {
        return this.http.post('/user/validateCode', options)
            .then(body => body as validateCodeResponse);
    }

    /**
     * Submit password,
     * third step for creating new account.
     * 
     * @param options 
     * @param options.id user identity
     * @param options.password user password
     * @param options.code verification code
     */
    submitPassword(options: { id: string, password: string, code: string }) {
        return this.http.post('/user/submit_pass', options)
            .then(body => body as BaseResponse);
    }
}


export default AuthService;