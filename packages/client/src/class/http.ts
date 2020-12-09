import BaseResponse from '../types/base-response';
import GlobalOptions from './global_options';
import axios from 'axios';

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

/**
 * Mocking global XMLHttpRequest class
 * outside of browser
 */
// if (global) {
//     let xhr = require('xmlhttprequest-ts');
//     global.XMLHttpRequest = xhr.XMLHttpRequest;
// }

class HTTPClient {
    private commonHeaders: Headers;

    constructor(/*options?: HTTPClientOption*/) {
        this.commonHeaders = {};
    }

    get baseurl() {
        return GlobalOptions.host;
    }

    private injectHeader(request: XMLHttpRequest, headers: Headers) {

        Object.keys(headers).forEach(key => {
            request.setRequestHeader(key, headers[key]);
        })

        return request;
    }

    private request(options: RequestOptionAllProperties) {
        // let request = new XMLHttpRequest();
        // request.open(options.method, options.url)

        return new Promise<{ data: any }>((resolve, reject) => {
            if (options.method == 'POST') {
                axios.post(options.url, options.body, {
                    params: options.query,
                    headers: {
                        ...this.commonHeaders,
                        ...options.headers,
                    },
                }).then(resolve).catch(reject)
            }
            else {
                axios.get(options.url, {
                    params: options.query,
                    headers: {
                        ...this.commonHeaders,
                        ...options.headers,
                    }
                }).then(resolve).catch(reject)
            }
        })
            .then(body => body.data)
            .catch(error => {
                let result;


                if (error.response) {
                    result = error.response.data;
                } else {
                    result = error.message;
                }

                throw {
                    hasError: true,
                    error: result,
                } as BaseResponse;
            })

        // if (options.headers) {
        //     request = this.injectHeader(request, options.headers);
        // }

        // if (this.commonHeaders) {
        //     request = this.injectHeader(request, this.commonHeaders);
        // }

        // return new Promise<XMLHttpRequest>((done) => {

        //     if (options.method == "POST") {
        //         request = this.injectHeader(request, { 'content-type': 'application/json' });
        //         request.send(JSON.stringify(options.body))
        //     }
        //     else {
        //         request.send();
        //     }

        //     request.onloadend = function (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) {

        //         done(this as XMLHttpRequest)
        //     };

        //     request.onerror = function (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) {
        //         done(this)
        //     }
        // })
        //     .then((request) => {

        //         let result = parsJson(request.responseText);

        //         if (request.status == 200) {
        //             return (result)
        //         }
        //         else {
        //             throw {
        //                 hasError: true,
        //                 error: result,
        //             } as BaseResponse;
        //         }
        //     })
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
                .then((body) => resolve(body as T))
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
            })
                .then((body) => resolve(body as T))
                .catch(reject);
        })
            .then(body => body as T)
    }
}

export default HTTPClient;