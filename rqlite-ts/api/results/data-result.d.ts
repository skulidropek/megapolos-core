/**
 * Class for handling single RQLite data api result
 * @module api/results/data-result
 */
/**
 * A class that represents one data result from an RQLite query or execute
 * API call
 */
export default class DataResult {
  /**
     * The data result constructor
     * @param {Array} result An API response individual result
     * @param {Array} [valuesIndex] The index to get the values from the result
     */
  constructor(result: any[], valuesIndex?: any[]);
  /**
     * The time the results query took to complete
     * @type {Number}
     */
  time: number;

  /**
     * The last insert id
     * @type {Number}
     */
  lastInsertId: number;

  /**
     * The rows affected
     * @type {Number}
     */
  rowsAffected: number;

  /**
     * An array of DataResult and/or DataResultError instances
     * @type {Array<DataResult|DataResultError>}
     */
  results: Array<DataResult | DataResultError>;

  /**
     * An object after the columns and values are mapped from
     * an RQLite response
     */
  data: {};
  /**
     * Return the value a property or undefined if it does not exist
     * @returns {*} The value of the property or undefined
     */
  get(property: any): any;
  /**
     * Get the time the result took
     * @returns {Number} The time the query took
     */
  getTime(): number;
  /**
     * Get the last insert id
     * @returns {Number|undefined}
     */
  getLastInsertId(): number | undefined;
  /**
     * Get the row affected
     * @returns {Number|undefined}
     */
  getRowsAffected(): number | undefined;
  /**
     * Get the result data as plain object
     * @returns {Object} The data as an object
     */
  toObject(): any;
  /**
     * Map the data values to an array
     * @returns {Array}
     */
  toArray(): any[];
  /**
     * Map the data properites to an array
     * @returns {String[]}
     */
  toColumnsArray(): string[];
  /**
     * Convert the result data to a JSON string
     * @returns {String} The JSON string for the data object
     */
  toString(): string;
}
