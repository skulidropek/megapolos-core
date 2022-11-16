/**
 * @typedef {Object} HttpResponse
 * @property {Object} Body The HTTP response body parsed by JSON.parse()
 * @property {Number} statusCode The HTTP response code
 */
/**
 * @typedef {Object} StatusAllHostsResponse
 * @property {HttpResponse} response An HTTP response
 * @property {String} host The host name
 */
/**
 * The RQLite status api path
 */
export const PATH_STATUS: "/status";
/**
 * Data api client to perform RQLite queries
 */
export default class StatusApiClient extends ApiClient {
    /**
     * Get the RQLite server status which defaults to the master host
     * @param {Object} [options={}] RQLite api options
     * @returns {HttpResponse} An HTTP response object
     */
    status(options?: any): HttpResponse;
    /**
     * Get the RQLite server status for all hosts as an array of object with
     * the host and their status
     * @param {Object} [options={}] RQLite api options
     * @param {Object} [options.raw] If true return the raw http response from
     * RQLite response
     * @returns {StatusAllHostsResponse[]} An array of http response for the provide hosts
     */
    statusAllHosts(options?: {
        raw?: any;
    }): StatusAllHostsResponse[];
}
export type HttpResponse = {
    /**
     * The HTTP response body parsed by JSON.parse()
     */
    Body: any;
    /**
     * The HTTP response code
     */
    statusCode: number;
};
export type StatusAllHostsResponse = {
    /**
     * An HTTP response
     */
    response: HttpResponse;
    /**
     * The host name
     */
    host: string;
};
import ApiClient from "../client";
