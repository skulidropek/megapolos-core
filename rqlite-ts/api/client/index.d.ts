/**
 * @typedef HttpRequestOptions
 * @type {import('../../http-request').HttpRequestOptions}
 */
/**
 * Create the base HTTP query options from RQLite API options
 * @param {Object} [options={}] The RQLite API options
 * @param {String} [options.level] The consistency level
 * @param {String} [options.pretty] Pretty print the response body
 * @param {String} [options.timings] Provide query timings
 * @param {String} [options.atomic] Treat all commands in the request as a single transaction
 * for RQLite v5 and higher
 * @param {String} [options.transaction] Treat all commands in the request as a single transaction
 * for RQLite v4 and lower
 * @returns {Object} The HTTP query
 */
export function createQuery(options?: {
  level?: string;
  pretty?: string;
  timings?: string;
  atomic?: string;
  transaction?: string;
}): any;
/**
 * Base API client for RQLite which abstracts the HTTP calls
 * from the user
 */
export default class ApiClient extends HttpRequest {
  /**
     * Perform a RQLite data API get request
     * @param {String} path The path for the request i.e. /db/query
     * @param {String} sql The SQL query
     * @param {HttpRequestOptions} [options={}] RQLite API options
     */
  get(path: string, sql: string, options?: HttpRequestOptions): Promise<{
    status: number;
    body: any;
  }>;
  /**
     * Perform a RQLite data API post request
     * @param {String} path The path for the request i.e. /db/query
     * @param {String} sql The SQL query
     * @param {HttpRequestOptions} [options={}] RQLite API options
     */
  post(path: string, sql: string, options?: HttpRequestOptions): Promise<{
    status: number;
    body: any;
  }>;
}
export type HttpRequestOptions = import('../../http-request').HttpRequestOptions;
import HttpRequest from '../../http-request';
