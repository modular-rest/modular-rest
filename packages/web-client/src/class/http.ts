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

        return new Promise<any>((done, reject) => {

            request.send(JSON.stringify(options.body))

            request.onloadend = function (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) {

                let result = parsJson(this.responseText);

                if (this.status == 200) {
                    done(result)
                }
                else {
                    reject(result)
                }
            };

            request.onerror = function (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) {
                let result = parsJson(this.response);
                reject(result);
            }
        })
    }

    post(url: string = '', body: object = {}, options: RequestOption = {}) {

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
        })
    }
}

export default HTTPClient;