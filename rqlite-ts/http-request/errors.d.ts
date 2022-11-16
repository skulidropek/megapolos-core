/**
 * Http request errors
 * @module http-request/errors
 */
/**
 * Error when max rediret attempts have been reached
 */
export class ERROR_HTTP_REQUEST_MAX_REDIRECTS extends Error {
    constructor(...args: any[]);
    code: string;
}
