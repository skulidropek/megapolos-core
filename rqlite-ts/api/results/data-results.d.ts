/**
 * A class to manage a list of results from an RQLite query or execute API response
 */
export default class DataResults {
  /**
     * The data result list constructor
     * @param {Object} data The data object sent from a RQLite API response
     * @param {Number} data.time The time the API response took to complete
     * @param {Object[{error:String,values:Object}]} data.results The results array
     */
  constructor(data: {
    time: number;
    results: any[{
      error: string;
      values: any;
    }];
  });
  /**
     * The time the results took to return from the
     * RQLite api
     * @type {Number}
     */
  time: number;

  /**
     * The results which is an empty arry to start
     * @type {DataResult[]}
     */
  results: DataResult[];
  /**
     * Set the api as results
     * @param {Object} data Api data
     */
  setApiData(data: any): void;
  /**
     * Returns true if an instance of DataResultError exists in the results
     * @returns {Boolean} True if a DataResultError instance exists
     */
  hasError(): boolean;
  /**
     * Get the first error that occured
     * @returns {DataResultError|undefined}
     */
  getFirstError(): DataResultError | undefined;
  /**
     * Get the time the results took
     * @returns {Number} The time the query took
     */
  getTime(): number;
  /**
     * Return one result at a specific index or undefined it it does not exist
     * @returns {DataResult|DataResultError|undefined}
     */
  get(index: any): DataResult | DataResultError | undefined;
  /**
     * Return the results array
     * @returns {Array<DataResult|DataResultError>}
     */
  getResults(): Array<DataResult | DataResultError>;
  /**
     * Get the result data list as array of plain objects
     * @returns {Object[]} The data as an array or objects
     */
  toArray(): any[];
  /**
     * Convert the result data list to a JSON string that is an
     * array of objects
     * @returns {String} A JSON string
     */
  toString(): string;
}
import DataResult from './data-result';
import DataResultError from './data-result-error';
