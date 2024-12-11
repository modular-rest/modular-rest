import HttpClient from "../class/http";
import User from "../class/user";
import { bus, tokenReceivedEvent } from "../class/event-bus";

import {
  IdentityType,
  LoginOptionsType,
  LoginResponseType,
  ValidateCodeResponseType,
  VerifyTokenResponseType,
  BaseResponseType,
} from "../types/auth.type";

class AuthService {
  private static instance: AuthService;
  private http: HttpClient;
  private token?: string | null;

  user: User | null = null;

  get isLogin() {
    return !!this.token;
  }

  get getToken() {
    return this.token;
  }

  private constructor() {
    this.http = new HttpClient();
  }

  public static getInstance(): AuthService {
    if (AuthService.instance == null) {
      AuthService.instance = new AuthService();
    }

    return AuthService.instance;
  }

  private emitToken() {
    bus.publish(tokenReceivedEvent({ token: this.token || "" }));
  }

  private saveSession() {
    if (this.token != null) localStorage.setItem("token", this.token);
    else localStorage.removeItem("token");
  }

  loginWithLastSession() {
    // Load token
    this.token = localStorage.getItem("token");

    return this.loginWithToken(this.token || "", true);
  }

  /**
   * Login with last session if you pass allowSave=true in last login.
   *
   * @return user
   */
  loginWithToken(token: string, allowSave?: boolean) {
    return new Promise<User>((done, reject) => {
      // Load token
      this.token = token;

      if (!this.token)
        throw { hasError: true, error: "Token doesn't find on local machine" };

      this.emitToken();

      this.validateToken(this.token || "")
        .then(({ user }: { user: any }) => {
          this.user = new User({
            email: user.email,
            phone: user.phone,
            id: user.id,
            permissionGroup: user["permissionGroup"],
            type: user.type,
          });

          if (allowSave) this.saveSession();

          return this.user;
        })
        .then(done)
        .catch((err) => {
          this.logout();
          reject(err);
        });
    });
  }

  logout() {
    this.token = null;
    this.emitToken();
    this.saveSession();
  }

  /**
   * Login as an anonymous user and get a token.
   */
  loginAsAnonymous() {
    return this.http
      .get<LoginResponseType>("/user/loginAnonymous")
      .then((body) => {
        this.token = body.token;
        this.emitToken();
        return body;
      });
  }

  /**
   * Login az an registered user.
   *
   * @param options
   * @param options.idType the type of user identity
   * @param options.id user identity
   * @param options.password user password
   */
  login(options: LoginOptionsType, allowSave: boolean) {
    return (
      this.http
        .post<LoginResponseType>("/user/login", options)
        .then((body) => {
          this.token = body.token;
          this.emitToken();

          if (allowSave) this.saveSession();
        })
        // Verify token and get user object
        .then((_) => {
          return this.validateToken(this.token || "").then(
            ({ user }: { user: any }) => {
              return new User({
                email: user.email,
                phone: user.phone,
                id: user.id,
                permissionGroup: user["permissionGroup"],
                type: user.type,
              });
            }
          );
        })
    );
  }

  validateToken(token: string) {
    return this.http.post<VerifyTokenResponseType>("verify/token", { token });
  }

  /**
   * Register user identity,
   * first step for creating new account
   *
   * @param options
   * @param options.idType the type of user identity
   * @param options.id user identity
   */
  registerIdentity(identity: IdentityType) {
    return this.http.post<BaseResponseType>("/user/register_id", identity);
  }

  /**
   * Send verification code to server,
   * second step for creating new account.
   *
   * @param code verification code
   */
  validateCode(options: { code: string; id: string }) {
    return this.http.post<ValidateCodeResponseType>(
      "/user/validateCode",
      options
    );
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
  submitPassword(options: { id: string; password: string; code: string }) {
    return this.http.post<BaseResponseType>("/user/submit_password", options);
  }

  /**
   * Change password.
   *
   * @param options
   * @param options.id user identity
   * @param options.password user password
   * @param options.code verification code
   */
  changePassword(options: { id: string; password: string; code: string }) {
    return this.http.post<BaseResponseType>("/user/change_password", options);
  }
}

export default AuthService;
