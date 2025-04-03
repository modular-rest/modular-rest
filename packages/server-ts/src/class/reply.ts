/**
 * Response status type
 */
export type ResponseStatus = 's' | 'f' | 'e';

/**
 * Response object interface
 */
export interface ResponseObject {
  status: 'success' | 'fail' | 'error';
  [key: string]: any;
}

/**
 * Creates a response object with the given status and detail.
 *
 * @param status - The status of the response. Can be "s" for success, "f" for fail, or "e" for error.
 * @param detail - The detail of the response. Can contain any additional information about the response.
 * @returns The response object with the given status and detail.
 *
 * @example
 * ```typescript
 * import { reply } from '@modular-rest/server';
 *
 * // inside the router
 * const response = reply.create("s", { message: "Hello, world!" });
 * ctx.body = response;
 * ctx.status = 200;
 * ```
 */
export function create(status: ResponseStatus, detail: Record<string, any> = {}): ResponseObject {
  // Initialize with a default status that will be overwritten
  const result: ResponseObject = {
    status: 'success',
    ...detail,
  };

  // define status
  switch (status) {
    case 's':
      result.status = 'success';
      break;

    case 'f':
      result.status = 'fail';
      break;

    case 'e':
      result.status = 'error';
      break;

    default:
      result.status = 'success';
      break;
  }

  // return
  return result;
}
