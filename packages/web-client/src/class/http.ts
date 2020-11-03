import BaseResponse from '../types/base-response';

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

    baseUrl: string;

    constructor(options: HTTPClientOption) {
        this.baseUrl = options.baseUrl;
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

    post(url: string = '', body: object = {}, options: RequestOption = {}): Promise<any> {

        let urlObject = new URL(url, this.baseUrl);

        return this.request({
            url: urlObject.toString(),
            body: body,
            method: 'POST',
            ...options
        })
    }

    get(url: string = '', options: RequestOption = {}) {
        let urlObject = new URL(url, this.baseUrl);

        return this.request({
            url: urlObject.toString(),
            method: 'GET',
            ...options
        });
    }
}

export default HTTPClient;