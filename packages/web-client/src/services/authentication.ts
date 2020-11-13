import HttpClient from '../class/http';
import BaseResponse from '../types/base-response';
import GlobalOptions from '../class/global_options';
import { bus, tokenReceivedEvent } from '../class/event-bus'

interface Identity {
    idType: 'email' | 'phone';
    id: String;
}

interface LoginOptions extends Identity {
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
    private token?: string;

    private constructor() {
        this.http = new HttpClient({ baseUrl: GlobalOptions.host });
    }

    public static getInstance(): AuthService {

        if (AuthService.instance == null) {
            AuthService.instance = new AuthService();
        }

        return AuthService.instance;
    }

    private emitToken() {

        bus.publish(tokenReceivedEvent({ token: this.token || '' }))

    }

    /**
     * Login as an anonymous user and get a token.
     */
    loginAsAnonymous() {
        return this.http.get<LoginResponse>('/user/loginAnonymous')
            .then(body => {
                this.token = body.token
                this.emitToken()
                return body;
            })
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
        return this.http.post<LoginResponse>('/user/login', options)
            .then(body => {
                this.token = body.token
                this.emitToken()
                return body;
            })
    }

    /**
     * Register user identity, 
     * first step for creating new account
     * 
     * @param options
     * @param options.idType the type of user identity
     * @param options.id user identity
     */
    registerIdentity(identity: Identity) {
        return this.http.post<BaseResponse>('/user/register_id', identity)
    }

    /**
     * Send verification code to server,
     * second step for creating new account.
     * 
     * @param code verification code  
     */
    validateCode(options: { code: string, id: string }) {
        return this.http.post<validateCodeResponse>('/user/validateCode', options)
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
        return this.http.post<BaseResponse>('/user/submit_password', options)
    }

    /**
     * Change password.
     * 
     * @param options 
     * @param options.id user identity
     * @param options.password user password
     * @param options.code verification code
     */
    changePassword(options: { id: string, password: string, code: string }) {
        return this.http.post<BaseResponse>('/user/change_password', options)
    }
}


export default AuthService;