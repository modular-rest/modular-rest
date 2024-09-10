

# package.json

```json
{
  "name": "@modular-rest/client",
  "version": "1.6.2",
  "description": "This is a browser library for using modular-rest server abilities on client side.",
  "scripts": {
    "test": "mocha -r ts-node/register src/**/*.spec.ts",
    "coverage": "nyc -r lcov -e .ts -x \"*.spec.ts\" npm run test",
    "start:dev": "nodemon",
    "build": "rimraf ./dist && tsc"
  },
  "keywords": [
    "modular-rest",
    "client",
    "http"
  ],
  "author": "Navid Shad",
  "license": "GPL-3.0",
  "devDependencies": {
    "@types/chai": "^4.2.14",
    "@types/mocha": "^8.0.3",
    "@types/node": "^14.14.5",
    "alsatian": "^3.2.1",
    "chai": "^4.2.0",
    "mocha": "^8.2.1",
    "nodemon": "^2.0.6",
    "nyc": "^15.1.0",
    "rimraf": "^3.0.2",
    "ts-node": "^9.0.0",
    "typescript": "^4.9.4"
  },
  "dependencies": {
    "axios": "^0.21.0",
    "ts-bus": "^2.3.1"
  },
  "files": [
    "dist"
  ],
  "types": "dist/index.d.ts",
  "main": "dist/index.js"
}

```



# src/index.ts

```typescript
import DataProvider from "./services/data-provider";
import FileProvider from "./services/file-provider";
import Authentication from "./services/authentication";
import GlobalOptions from "./class/global_options";
import FunctionProvider from "./services/function-provider";

export * as Types from "./types/types";

export { createPagination } from "./helper/list";

const authentication = Authentication.getInstance();
const dataProvider = DataProvider.getInstance();
const fileProvider = FileProvider.getInstance();
const functionProvider = FunctionProvider.getInstance();

export {
  GlobalOptions,
  authentication,
  dataProvider,
  fileProvider,
  functionProvider,
};

```



# src/types/auth.type.ts

```typescript
import { BaseResponseType } from "./base-response.type";

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

```



# src/types/function-provider.type.ts

```typescript
import { BaseResponseType } from "./base-response.type";

export interface FunctionResponseType<T> extends BaseResponseType {
  data: T;
}

```



# src/types/types.ts

```typescript
export interface RequestError {
  hasError: boolean;
  error: any;
}

export interface FileDocument {
  _id: string;
  originalName: String;
  fileName: String;
  owner: String;
  size: Number;
}

export type OnProgressCallback = (progressEvent: ProgressEvent) => void;

export * from "./data-provider.type";
export * from "./auth.type";

```



# src/types/data-provider.type.ts

```typescript
import { BaseResponseType } from "./base-response.type";

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

```



# src/types/base-response.type.ts

```typescript
export interface BaseResponseType {
  hasError?: boolean;
  error?: any;
  status?: string;
}

```



# src/class/http.spec.ts

```typescript
import { describe, it, before, beforeEach } from 'mocha'
import { assert } from 'chai'
import HTTP from './http';
import GlobalOption from './global_options';

describe('Http Client', () => {

    before(() => {

        // mocking global XMLHttpRequest class
        // let xhr = require('xmlhttprequest-ts');
        // global.XMLHttpRequest = xhr.XMLHttpRequest;

    })

    it('send GET request', async function () {
        GlobalOption.set({
            host: 'https://reqres.in'
        });

        let http = new HTTP();

        this.timeout(1000)

        await http.get<{ page: number }>('api/users')
            .then((body) => {
                // Expect(body.page).toBe(1);
                assert.equal(body.page, 1)
            })
    })

})
```



# src/class/http.ts

```typescript
import { BaseResponseType } from "../types/base-response.type";
import { OnProgressCallback } from "../types/types";
import GlobalOptions from "./global_options";
import axios from "axios";

interface Headers {
  [index: string]: string;
}

interface RequestOption {
  headers?: Headers;
  query?: object;
}

interface RequestOptionAllProperties extends RequestOption {
  url: string;
  method: string;
  body?: object;
}

class HTTPClient {
  private commonHeaders: Headers;

  constructor(/*options?: HTTPClientOption*/) {
    this.commonHeaders = {};
  }

  get baseurl() {
    return GlobalOptions.host;
  }

  private request(options: RequestOptionAllProperties) {
    return new Promise<{ data: any }>((resolve, reject) => {
      if (options.method == "POST") {
        axios
          .post(options.url, options.body, {
            params: options.query,
            headers: {
              ...this.commonHeaders,
              ...options.headers,
            },
          })
          .then(resolve)
          .catch(reject);
      } else if (options.method == "DELETE") {
        axios
          .delete(options.url, {
            params: options.query,
            headers: {
              ...this.commonHeaders,
              ...options.headers,
            },
          })
          .then(resolve)
          .catch(reject);
      } else {
        axios
          .get(options.url, {
            params: options.query,
            headers: {
              ...this.commonHeaders,
              ...options.headers,
            },
          })
          .then(resolve)
          .catch(reject);
      }
    })
      .then((body) => body.data)
      .catch((error) => {
        let result;

        if (error.response && error.response.data) {
          result = error.response.data.error || error.message.data;
        } else {
          result = error.message;
        }

        throw {
          hasError: true,
          error: result,
        } as BaseResponseType;
      });
  }

  setCommonHeader(headers: Headers) {
    this.commonHeaders = headers;
  }

  uploadFile(
    url: string | "",
    file: string | Blob,
    body: any,
    onProgress: OnProgressCallback
  ) {
    let urlObject: string;

    try {
      urlObject = GlobalOptions.getUrl(url);
    } catch (error) {
      throw error;
    }

    let form = new FormData();
    form.append("file", file);

    Object.keys(body).forEach((key) => {
      form.append(key, body[key].toString());
    });

    return axios({
      baseURL: urlObject.toString(),
      method: "post",
      headers: {
        ...this.commonHeaders,
        "content-type": "multipart/form-data",
      },
      data: form,
      onUploadProgress: (progressEvent: ProgressEvent) => {
        if (onProgress) onProgress(progressEvent);
      },
    })
      .then((body) => body.data)
      .catch((error) => {
        let result;

        if (error.response) {
          result = error.response.data;
        } else {
          result = error.message;
        }

        throw {
          hasError: true,
          error: result,
        } as BaseResponseType;
      });
  }

  post<T>(url: string = "", body: object = {}, options: RequestOption = {}) {
    let urlObject: string;

    try {
      urlObject = GlobalOptions.getUrl(url);
    } catch (error) {
      throw error;
    }

    return this.request({
      url: urlObject,
      body: body,
      method: "POST",
      ...options,
    }).then((data) => data as T);
  }

  delete<T>(url: string = "", options: RequestOption = {}) {
    let urlObject: string;

    try {
      urlObject = GlobalOptions.getUrl(url);
    } catch (error) {
      throw error;
    }

    return this.request({
      url: urlObject,
      method: "DELETE",
      ...options,
    }).then((body) => body as T);
  }

  get<T>(url: string = "", options: RequestOption = {}) {
    let urlObject: string;

    try {
      urlObject = GlobalOptions.getUrl(url);
    } catch (error) {
      throw error;
    }

    return this.request({
      url: urlObject.toString(),
      method: "GET",
      ...options,
    }).then((body) => body as T);
  }
}

export default HTTPClient;

```



# src/class/global_options.ts

```typescript
import { join } from "../helper/url";

interface Options {
  host: string;
}

class GlobalOptions {
  private static instance: GlobalOptions;
  private options: Options;

  private constructor(options: Options) {
    this.options = options;
  }

  static getInstance() {
    if (GlobalOptions.instance) return GlobalOptions.instance;

    GlobalOptions.instance = new GlobalOptions({ host: "" });
    return GlobalOptions.instance;
  }

  set(options: Options) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  get host() {
    return this.options.host;
  }

  getUrl(path: string, overrideUrl?: string) {
    return join([overrideUrl || this.host, path]);
  }
}

export default GlobalOptions.getInstance();

```



# src/class/event-bus.ts

```typescript
import { EventBus, createEventDefinition } from 'ts-bus';

const bus = new EventBus();
const tokenReceivedEvent = createEventDefinition<{ token: string }>()('token.received')

export {
    bus,
    tokenReceivedEvent,
}
```



# src/class/user.ts

```typescript
class User {
  /**
   * Registered email
   */
  email?: string;
  /**
   * Registered phone
   */
  phone?: string;
  /**
   * Unique generated id for the user
   */
  id: string;
  /**
   * permission type
   */
  type: string;
  private permissionGroup: any;

  constructor(detail: {
    email?: string;
    phone?: string;
    id: string;
    permissionGroup: any;
    type: string;
  }) {
    if (detail.email) this.email = detail.email;
    if (detail.phone) this.phone = detail.phone;

    this.id = detail.id;
    this.permissionGroup = detail.permissionGroup;
    this.type = detail.type;
  }

  /**
   * Check whether or not the user has access to an specific permission.
   * @param permissionField permission name
   */
  hasAccess(permissionField: string) {
    if (this.permissionGroup == null) return false;

    let key = false;

    for (let i = 0; i < this.permissionGroup.validPermissionTypes.length; i++) {
      const userPermissionType = this.permissionGroup.validPermissionTypes[i];

      if (userPermissionType == permissionField) {
        key = true;
        break;
      }
    }

    return key;
  }
}

export default User;

```



# src/helper/url.ts

```typescript
export function join([...args]) {
  let url = "";

  for (let i = 0; i < args.length; i++) {
    const path = args[i] || "";

    let parts = path.split("");
    if (path.startsWith("/")) parts[0] = "";
    if (path.endsWith("/")) parts[parts.length - 1] = "";

    url += parts.join("");

    if (i < args.length - 1) url += "/";
  }

  return url;
}

```



# src/helper/list.ts

```typescript
import { PaginationType } from "../types/data-provider.type";

export function createPagination(
  count: number,
  perPage: number,
  page: number
): PaginationType {
  const totalPages = Math.ceil(count / perPage);
  if (page > totalPages) page = 1;

  // Fixes
  perPage = perPage < 1 ? 1 : perPage;
  page = page < 1 ? 1 : page;

  let from = 0;
  if (perPage == 1) from = page - 1;
  else from = perPage * page - perPage;

  if (page <= 1) from = 0;

  const result = {
    total: count,
    pages: totalPages,
    page: page,
    from: from,
    to: perPage,
    limit: perPage,
  };

  return result;
}

```



# src/services/authentication.ts

```typescript
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
    if (this.token) localStorage.setItem("token", this.token);
    else localStorage.removeItem("token");
  }

  /**
   * Login with last session if you pass allowSave=true in last login.
   *
   * @return user
   */
  loginWithLastSession(token?: string) {
    return new Promise<User>((done, reject) => {
      // Load token
      this.token = token || localStorage.getItem("token");

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

          localStorage.setItem("token", this.token!);

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
    localStorage.removeItem("token");
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

```



# src/services/data-provider.ts

```typescript
import HttpClient from "../class/http";

import { bus, tokenReceivedEvent } from "../class/event-bus";

import {
  FindQueryType,
  FindByIdsQueryType,
  UpdateQueryType,
  InsertQueryType,
  AggregateQueryType,
  ResponseType,
  PaginatedResponseType,
} from "../types/data-provider.type";

import { createPagination } from "../helper/list";

class DataProvider {
  private static instance: DataProvider;
  private http: HttpClient;

  private constructor() {
    this.http = new HttpClient();

    bus.subscribe(tokenReceivedEvent, (event) => {
      this.http.setCommonHeader({
        authorization: event.payload.token,
      });
    });
  }

  static getInstance() {
    if (DataProvider.instance) return DataProvider.instance;

    DataProvider.instance = new DataProvider();
    return DataProvider.instance;
  }

  find<T>(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/find", options)
      .then((body) => body.data as Array<T>);
  }

  /**
   * Returns an object containing pagination information and controller methods.
   *
   * @param findOption - The query options to find data.
   * @param paginationOption - The pagination options to limit and paginate data.
   * @returns Pagination information, `getPage` for fetching data for a specific page, and `updatePagination` for updating the pagination object.
   */
  list<T>(
    findOption: FindQueryType,
    paginationOption: {
      limit: number;
      page: number;
      onFetched?: (docs: T[]) => void;
    }
  ): PaginatedResponseType<T> {
    let count = 0;
    const pagination = createPagination(
      0,
      paginationOption.limit,
      paginationOption.page || 0
    );

    const _this = this;

    async function calculatePages() {
      count = await _this.count(findOption);
      const { from, to, page, pages, total } = createPagination(
        count,
        paginationOption.limit,
        paginationOption.page || 0
      );

      pagination.from = from;
      pagination.to = to;
      pagination.page = page;
      pagination.pages = pages;
      pagination.total = total;
    }

    return {
      /**
       * The pagination information object.
       */
      pagination,

      /**
       * Updates the pagination object with fresh "pages" value.
       * @returns A new pagination object.
       */
      updatePagination() {
        return calculatePages();
      },

      /**
       * Returns the data for the specified page.
       * @param page - The page number to retrieve.
       * @returns The data for the specified page.
       */
      fetchPage(page: number) {
        // return if page is out of range
        if (page < 1 || page > pagination.pages) {
          return Promise.resolve([]);
        }

        // Calculate the "from" value for the next page.
        this.pagination.from = (page - 1) * paginationOption.limit;

        return _this
          .find<T>({
            ...findOption,
            options: {
              ...findOption.options,
              limit: paginationOption.limit,
              skip: this.pagination.from,
            },
          })
          .then((data) => {
            const np = createPagination(count, paginationOption.limit, page);

            this.pagination.from = np.from;
            this.pagination.to = np.to;
            this.pagination.page = np.page;
            this.pagination.pages = np.pages;

            if (paginationOption.onFetched) {
              paginationOption.onFetched(data);
            }

            return data;
          });
      },
    };
  }

  findOne<T>(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/find-one", options)
      .then((body) => body.data as T);
  }

  count(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/count", options)
      .then((body) => body.data as number);
  }

  updateOne(options: UpdateQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/update-one", options)
      .then((body) => body.data);
  }

  insertOne(options: InsertQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/insert-one", options)
      .then((body) => body.data);
  }

  removeOne(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/remove-one", options)
      .then((body) => body.data);
  }

  aggregate<T>(options: AggregateQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/aggregate", options)
      .then((body) => body.data as Array<T>);
  }

  findByIds<T>(options: FindByIdsQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/findByIds", options)
      .then((body) => body.data as Array<T>);
  }
}

export default DataProvider;

```



# src/services/data-provider.spec.ts

```typescript
import { describe, it, before, beforeEach } from 'mocha'
import { assert, expect } from 'chai'
import AuthService from './authentication';
import GlobalOptions from '../class/global_options';
import DataProvider from './data-provider'

describe('Data Provider', () => {

    const authService = AuthService.getInstance();
    const dataProvider = DataProvider.getInstance();

    before(async () => {

        GlobalOptions.set({ host: 'http://localhost:3001' })

        // Running modular-rest server
        // const mrest = require('modular-rest');
        // await mrest.createRest();

        // Mocking global XMLHttpRequest class
        // let xhr = require('xmlhttprequest-ts');
        // global.XMLHttpRequest = xhr.XMLHttpRequest;

    })

    it('should login as anonymous', (done) => {

        authService.loginAsAnonymous()
            .then(() => done())
            .catch(done)

    })

    // it('should run a find query', async () => {

    //     await dataProvider.find({
    //         database: 'cms',
    //         collection: 'permission',
    //         query: {},
    //     })
    //         .then(permissions => {
    //             debugger
    //             expect(permissions.length).greaterThan(-1);
    //         })
    //         .catch(error => {
    //             debugger
    //             expect(error.hasError).to.be.false
    //         })

    // })
})
```



# src/services/file-provider.ts

```typescript
import HttpClient from "../class/http";
import GlobalOptions from "../class/global_options";
import { bus, tokenReceivedEvent } from "../class/event-bus";
import { FileDocument, OnProgressCallback } from "../types/types";
import { dataProvider } from "..";

class FileProvider {
  private static instance: FileProvider;
  private http: HttpClient;

  private constructor() {
    this.http = new HttpClient();

    bus.subscribe(tokenReceivedEvent, (event) => {
      this.http.setCommonHeader({
        authorization: event.payload.token,
      });
    });
  }

  static getInstance() {
    if (FileProvider.instance) return FileProvider.instance;

    FileProvider.instance = new FileProvider();
    return FileProvider.instance;
  }

  uploadFile(
    file: string | Blob,
    onProgress: OnProgressCallback,
    tag: string = "untagged"
  ) {
    const path = "/file";
    return this.http
      .uploadFile(path, file, { tag }, onProgress)
      .then((body) => body["file"] as FileDocument);
  }

  uploadFileToURL(
    url: string,
    file: string | Blob,
    body: any = {},
    onProgress: OnProgressCallback,
    tag: string
  ) {
    return this.http.uploadFile(url, file, body, onProgress);
  }

  removeFile(id: string) {
    const path = "/file";
    return this.http.delete(path, { query: { id: id } });
  }

  getFileLink(
    fileDoc: { fileName: string; format: string; tag: String },
    overrideUrl?: string,
    rootPath: string = "assets"
  ) {
    // remove / from the rootPath
    if (rootPath.endsWith("/")) {
      rootPath = rootPath.slice(0, -1);
    }

    const url = GlobalOptions.getUrl(
      `/${rootPath}/` + `${fileDoc.format}/${fileDoc.tag}/` + fileDoc.fileName,
      overrideUrl
    );
    return url;
  }

  getFileDoc(id: string, userId: string) {
    return dataProvider.findOne<FileDocument>({
      database: "cms",
      collection: "file",
      query: { _id: id, owner: userId },
    });
  }

  getFileDocsByTag(tag: string, userId: string) {
    return dataProvider.find<FileDocument>({
      database: "cms",
      collection: "file",
      query: { owner: userId, tag: tag },
    });
  }
}

export default FileProvider;

```



# src/services/function-provider.ts

```typescript
import HttpClient from "../class/http";
import { BaseResponseType } from "../types/base-response.type";
import { bus, tokenReceivedEvent } from "../class/event-bus";
import { FunctionResponseType } from "../types/function-provider.type";

class FunctionProvider {
  private static instance: FunctionProvider;
  private http: HttpClient;

  private constructor() {
    this.http = new HttpClient();

    bus.subscribe(tokenReceivedEvent, (event) => {
      this.http.setCommonHeader({
        authorization: event.payload.token,
      });
    });
  }

  static getInstance() {
    if (FunctionProvider.instance) return FunctionProvider.instance;

    FunctionProvider.instance = new FunctionProvider();
    return FunctionProvider.instance;
  }

  run<T>(options: { name: string; args: any }) {
    return this.http
      .post<FunctionResponseType<T>>("/function/run", options)
      .then((response) => response.data);
  }
}

export default FunctionProvider;

```



# src/services/authentication.spec.ts

```typescript
import { describe, it, before, after } from 'mocha'
import { assert, expect } from 'chai'
import AuthService from './authentication';
import GlobalOptions from '../class/global_options';

describe('Auth Service', () => {
    let authService = AuthService.getInstance();
    // let server: any;

    before(async () => {
        GlobalOptions.set({ host: 'http://localhost:3001' })
    })

    it('should login as Anonymous', async () => {

        await authService.loginAsAnonymous()
            .then(body => {
                expect(body).to.include.keys('token')
            }).catch(error => {
                expect(error.hasError).to.be.false
            })

    })

    it('should login with email', async () => {

        await authService.login({
            idType: 'email',
            id: 'admin@email.com',
            password: '@dmin',
        }, false).then(body => {
            expect(body).to.include.keys('email')
        }).catch(error => {
            expect(error.hasError).to.be.false
        })
    })

    describe('User registration', async () => {

        let fakeMail = 'email' + new Date().getMilliseconds() + '@fake.com';
        let fakePassword = '1234567890';

        it('should register an identity', async () => {
            await authService.registerIdentity({
                id: fakeMail,
                idType: 'email'
            })
                .then((body) => {
                    expect(body).to.have.property('status', 'success');
                }).catch(error => {
                    expect(error.hasError).to.be.false
                })
        })

        it('should validate verification code', async () => {
            await authService.validateCode({
                id: fakeMail,
                code: '123'
            })
                .then((body) => {
                    expect(body.isValid).to.be.true
                }).catch(error => {
                    expect(error.hasError).to.be.false
                })
        })

        it('should submit password', async () => {
            await authService.submitPassword({
                id: fakeMail,
                code: '123',
                password: fakePassword
            })
                .then((body) => {
                    expect(body).to.have.property('status', 'success');
                }).catch(error => {
                    expect(error.hasError).to.be.false
                })
        })

        describe('Password change', () => {

            it('should register an identity', async () => {
                await authService.registerIdentity({
                    id: fakeMail,
                    idType: 'email'
                })
                    .then((body) => {
                        expect(body).to.have.property('status', 'success');
                    }).catch(error => {
                        expect(error.hasError).to.be.false
                    })
            })

            it('should validate verification code', async () => {
                await authService.validateCode({
                    id: fakeMail,
                    code: '123'
                })
                    .then((body) => {
                        expect(body.isValid).to.be.true
                    }).catch(error => {
                        expect(error.hasError).to.be.false
                    })
            })

            it('should submit Password', async () => {
                await authService.changePassword({
                    id: fakeMail,
                    code: '123',
                    password: fakePassword + '-changed'
                })
                    .then((body) => {
                        expect(body).to.have.property('status', 'success');
                    }).catch(error => {
                        expect(error.hasError).to.be.false
                    })
            })

        })
    })
})
```