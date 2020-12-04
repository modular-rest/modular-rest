import HttpClient from '../class/http';
import User from '../class/user';
import GlobalOptions from '../class/global_options';
import { bus, tokenReceivedEvent } from '../class/event-bus'

import {
    Identity, LoginOptions, LoginResponse, ValidateCodeResponse, VerifyTokenResponse, BaseResponse
} from '../types/auth';


class AuthService {

    private static instance: AuthService;
    private http: HttpClient;
    private token?: string | null;

    get isLogin() {
        return !!this.token;
    }

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

    private saveSession() {
        if (this.token)
            localStorage.setItem('token', this.token)
    }

    /**
     * Login with last session if you pass allowSave=true in last login.
     * 
     * @return user 
     */
    loginWithLastSession() {

        // load token
        this.token = localStorage.getItem('token');

        this.validateToken(this.token || '')
            .then(({ user }: { user: any }) => new User({
                email: user.email,
                phone: user.phone,
                id: user.id,
                permission: user['permission']
            }))
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
    login(options: LoginOptions, allowSave: boolean) {
        return this.http.post<LoginResponse>('/user/login', options)
            .then(body => {
                this.token = body.token
                this.emitToken()

                if (allowSave) this.saveSession();
            })
            // verify token and get user object
            .then(_ => {
                return this.validateToken(this.token || '')
                    .then(({ user }: { user: any }) => new User({
                        email: user.email,
                        phone: user.phone,
                        id: user.id,
                        permission: user['permission']
                    }))
            })
    }

    validateToken(token: string) {
        return this.http.post<VerifyTokenResponse>('verify/token', { token });
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
        return this.http.post<ValidateCodeResponse>('/user/validateCode', options);
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