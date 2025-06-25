import { BaseResponseType } from "../types/base-response.type";
import { OnProgressCallback } from "../types/types";
import GlobalOptions from "./global_options";
import axios, { AxiosProgressEvent } from "axios";

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

/**
 * HTTPClient class to handle HTTP requests.
 */
class HTTPClient {
  private commonHeaders: Headers;

  /**
   * Constructs an instance of HTTPClient.
   */
  constructor(/*options?: HTTPClientOption*/) {
    this.commonHeaders = {};
  }

  /**
   * Gets the base URL for the HTTP client.
   * @returns {string} The base URL.
   */
  get baseurl() {
    return GlobalOptions.host;
  }

  /**
   * Makes an HTTP request.
   * @private
   * @param {RequestOptionAllProperties} options - The request options.
   * @returns {Promise<{ data: any }>} The response data.
   */
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
          // Return the full response data, not just error.response.data.error
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

  /**
   * Sets common headers for all requests in this instance.
   * Generally called when the user logs in to set the authentication token.
   * @param {Headers} headers - The headers to set.
   */
  setCommonHeader(headers: Headers) {
    this.commonHeaders = headers;
  }

  /**
   * Uploads a file to the specified URL.
   * @param {string} url - The URL to upload the file to, it can be any url can handle file upload.
   * @param {string | Blob} file - The file to upload.
   * @param {any} body - Additional data to send with the file.
   * @param {OnProgressCallback} onProgress - Callback for progress events.
   * @returns {Promise<any>} The response data.
   */
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
      onUploadProgress: onProgress,
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

  /**
   * Makes a POST request to the specified URL.
   * @param {string} [path=""] - The path to send the request to, it will be appended to module base URL.
   * @param {object} [body={}] - The request body.
   * @param {RequestOption} [options={}] - Additional request options.
   * @returns {Promise<T>} The response data.
   */
  post<T>(path: string = "", body: object = {}, options: RequestOption = {}) {
    let urlObject: string;

    try {
      urlObject = GlobalOptions.getUrl(path);
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

  /**
   * Makes a DELETE request to the specified URL.
   * @param {string} [path=""] - The path to send the request to, it will be appended to module base URL.
   * @param {RequestOption} [options={}] - Additional request options.
   * @returns {Promise<T>} The response data.
   */
  delete<T>(path: string = "", options: RequestOption = {}) {
    let urlObject: string;

    try {
      urlObject = GlobalOptions.getUrl(path);
    } catch (error) {
      throw error;
    }

    return this.request({
      url: urlObject,
      method: "DELETE",
      ...options,
    }).then((body) => body as T);
  }

  /**
   * Makes a GET request to the specified URL.
   * @param {string} [path=""] - The path to send the request to, it will be appended to module base URL.
   * @param {RequestOption} [options={}] - Additional request options.
   * @returns {Promise<T>} The response data.
   */
  get<T>(path: string = "", options: RequestOption = {}) {
    let urlObject: string;

    try {
      urlObject = GlobalOptions.getUrl(path);
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
