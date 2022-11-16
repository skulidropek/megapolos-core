/**
 * The RQLite load api path
 */
export const PATH_LOAD: "/db/load";
/**
 * The RQLite backup api path
 */
export const PATH_BACKUP: "/db/backup";
/**
 * Use plain SQL dump as the back up format
 */
export const BACKUP_DATA_FORMAT_SQL: "sql";
/**
 * Use sqlite3 dump as the back up format
 */
export const BACKUP_DATA_FORMAT_DUMP: "dump";
/**
 * Backup api client to perform RQLite back up and load operations
 */
export default class BackupApiClient extends HttpRequest {
    /**
     * Perform a SQL dump backup from the RQLite server
     * @param {String} [format=BACKUP_DATA_FORMAT_DUMP] The backup data format
     * @returns {Stream} The response stream
     */
    backup(format?: string): Stream;
    /**
     * Perform a SQL restore by sending data the RQLite server
     * @param {Buffer|String} data The data to be loaded
     * @param {String} [format=BACKUP_DATA_FORMAT_SQL] The backup data format
     * @returns {Stream} The response stream
     */
    load(data: Buffer | string, format?: string): Stream;
}
import HttpRequest from "../../http-request";
