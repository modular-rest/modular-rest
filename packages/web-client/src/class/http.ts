import BaseResponse from '../types/base-response';
import GlobalOptions from './global_options';

interface HTTPClientOption {
    baseUrl: string,
}

interface Headers {
    [index: string]: string
}

interface RequestOption {
    headers?: Headers,
    query?: object,
}

interface RequestOptionAllProperties extends RequestOption {
    url: string,
    method: string,
    body?: object,
}

function parsJson(entry: string) {
    try {
        return JSON.parse(entry);
    } catch (error) {
        // console.error('can\'t pars json', error);
        return entry
    }
}

class HTTPClient {

    private baseUrl: string;
    private commonHeaders: Headers;

    constructor(options: HTTPClientOption) {
        this.baseUrl = options.baseUrl;
        this.commonHeaders = {};
    }

    get baseurl () {
        if(!this.baseUrl || !this.baseUrl.length)
            return GlobalOptions.host;

        return this.baseUrl
    }

    private injectHeader(request: XMLHttpRequest, headers: Headers) {

        Object.keys(headers).forEach(key => {
            request.setRequestHeader(key, headers[key]);
        })

        return request;
    }

    private request(options: RequestOptionAllProperties) {
        let request = new XMLHttpRequest();
        request.open(options.method, options.url)

        if (options.headers) {
            request = this.injectHeader(request, options.headers);
        }

        if (this.commonHeaders) {
            request = this.injectHeader(request, this.commonHeaders);
        }

        return new Promise<XMLHttpRequest>((done) => {

            if (options.method == "POST") {
                request = this.injectHeader(request, { 'content-type': 'application/json' });
                request.send(JSON.stringify(options.body))
            }
            else {
                request.send();
            }

            request.onloadend = function (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) {

                done(this as XMLHttpRequest)
            };

            request.onerror = function (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) {
                done(this)
            }
        })
            .then((request) => {

                let result = parsJson(request.responseText);

                if (request.status == 200) {
                    return (result)
                }
                else {
                    throw {
                        hasError: true,
                        error: result,
                    } as BaseResponse;
                }
            })
    }

    setCommonHeader(headers: Headers) {
        this.commonHeaders = headers;
    }

    post<T>(url: string = '', body: object = {}, options: RequestOption = {}) {

        return new Promise<T>((resolve, reject) => {
            let urlObject: string;

            try {
                urlObject = new URL(url, this.baseurl).toString();
            } catch (error) {
                throw error;
            }

            return this.request({
                url: urlObject,
                body: body,
                method: 'POST',
                ...options
            })
                .then(resolve)
                .catch(reject);
        })
            .then(body => body as T)
    }

    get<T>(url: string = '', options: RequestOption = {}) {

        return new Promise<T>((resolve, reject) => {

            let urlObject: string;

            try {
                urlObject = new URL(url, this.baseurl).toString();
            } catch (error) {
                throw error;
            }

            return this.request({
                url: urlObject.toString(),
                method: 'GET',
                ...options
            }).then(resolve)
                .catch(reject);
        })
            .then(body => body as T)
    }
}

export default HTTPClient;