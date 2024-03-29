/**
 * Class for handling RQLite data api result error
 * @module api/results/data-results
 */
/**
 * A class that represents one data error result from an RQLite query or execute
 * API call
 */
export default class DataResultError extends Error {
  constructor(...args: any[]);
  code: string;
  /**
     * Get the result data error as plain object
     * @returns {Object} The data as an object
     */
  toObject(): any;
}
