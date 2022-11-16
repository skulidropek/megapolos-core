/**
 * The RQLite query api path
 */
export const PATH_QUERY: "/db/query";
/**
 * The RQLite execute api path
 */
export const PATH_EXECUTE: "/db/execute";
/**
 * Read query consistency level none which means
 * any node can respond
 */
export const CONSISTENCY_LEVEL_NONE: "none";
/**
 * Read query consistency strong which must come from
 * the master node
 */
export const CONSISTENCY_LEVEL_STRONG: "strong";
/**
 * Read query consistency weak which must come from
 * the master node
 */
export const CONSISTENCY_LEVEL_WEAK: "weak";
/**
 * Data api client to perform RQLite queries
 */
export default class DataApiClient extends ApiClient {
    /**
     * Send an RQLite query API request to the RQLite server
     * @param {String} sql The SQL string to excute on the server
     * @param {QueryRequestOptions} [options={}] RQLite api options
     */
    query(sql: string, options?: QueryRequestOptions): Promise<any>;
    /**
     * Send an RQLite execute API request to the RQLite server
     * @param {String} sql The SQL string to excute on the server
     * @param {ExecuteRequestOptions} [options={}] RQLite execute api options
     */
    execute(sql: string, options?: ExecuteRequestOptions): Promise<any>;
}
export type HttpRequestOptions = import('../../http-request').HttpRequestOptions;
/**
 * Data request base options
 */
export type DataRequestBaseOptions = {
    /**
     * If true return the raw http response from
     * RQLite response
     */
    raw?: boolean;
};
/**
 * Data query request base options
 */
export type QueryRequestBaseOptions = {
    /**
     * The api consistency level
     */
    level: string;
};
/**
 * Data query request options
 */
export type QueryRequestOptions = HttpRequestOptions & DataRequestBaseOptions & QueryRequestBaseOptions;
/**
 * Data execute request options
 */
export type ExecuteRequestOptions = HttpRequestOptions & DataRequestBaseOptions;
import ApiClient from "../client";
