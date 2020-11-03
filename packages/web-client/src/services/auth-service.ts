import HttpClient from '../class/http';
import BaseResponse from '../types/base-response';

interface LoginResponse extends BaseResponse {
    status?: string,
    token?: string,
}

interface LoginOptions {
    idType: 'email' | 'phone';
    id: String;
    password: string;
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
     * @param idType the type of user identity
     * @param id user identity
     * @param password user password
     */
    login(options: LoginOptions) {
        return this.http.post('/user/login', { ...options })
            .then(body => body as LoginResponse);
    }
}


export default AuthService;