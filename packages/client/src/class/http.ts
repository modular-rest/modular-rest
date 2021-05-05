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
            if (options.method == 'POST') {
                axios.post(options.url, options.body, {
                    params: options.query,
                    headers: {
                        ...this.commonHeaders,
                        ...options.headers,
                    },
                }).then(resolve).catch(reject)
            }
            else if (options.method == 'DELETE') {
                axios.delete(options.url, {
                    params: options.query,
                    headers: {
                        ...this.commonHeaders,
                        ...options.headers,
                    }
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
            });
    }

    setCommonHeader(headers: Headers) {
        this.commonHeaders = headers;
    }

    uploadFile(url: string | '', file: string | Blob, body: any, onProgress: Function) {
        let urlObject: string;

        try {
            urlObject = new URL(url, this.baseurl).toString();
        } catch (error) {
            throw error;
        }

        let form = new FormData();
        form.append('file', file);

        Object.keys(body).forEach(key => {
            form.append(key, body[key].toString());
        })

        return axios({
            baseURL: urlObject.toString(),
            method: 'post',
            headers: {
                ...this.commonHeaders,
                'content-type': 'multipart/form-data'
            },
            data: form,
            onUploadProgress: (progressEvent) => {
                if (onProgress) onProgress(progressEvent.loaded);
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
            });
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

    delete<T>(url: string = '', options: RequestOption = {}) {

        return new Promise<T>((resolve, reject) => {
            let urlObject: string;

            try {
                urlObject = new URL(url, this.baseurl).toString();
            } catch (error) {
                throw error;
            }

            return this.request({
                url: urlObject,
                method: 'DELETE',
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