/**
 * Create default header for all HTTP requests
 * @param {Object} [headers={}] HTTP headers to send with the request
 * @returns {Object} The headers with defaults applied
 */
export function createDefaultHeaders(headers?: any): any;
/**
 * Returns the next wait interval, in milliseconds, using an exponential
 * backoff algorithm.
 * @param {Number} attempt The retry attempt
 * @param {Number} base The base of the exponential backoff
 * @param {Number} pow The exponential power
 * @returns {Number} The time to wait in milliseconds
 */
export function getWaitTimeExponential(attempt?: number, base?: number, pow?: number): number;
/**
 * RQliteJS HTTP Request options
 * @typedef HttpRequestOptions
 * @type {Object}
 * @property {Object} [auth] A object for user authentication
 * @property {String} [auth.username] The username for authentication
 * @property {String} [auth.password] The username for authentication
 * @property {Object} [body] The body of the HTTP request
 * @property {Object} [headers={}] HTTP headers to send with the request
 * @property {String} [httpMethod=HTTP_METHOD_GET] The HTTP method for the request
 * i.e. GET or POST
 * @property {Object} [query] An object with the query to send with the HTTP request
 * @property {Boolean} [stream=false] When true the returned value is a request object with
 * stream support instead of a request-promise result
 * @property {Number} [timeout=DEAULT_TIMEOUT] Optional timeout to override default
 * @property {String} uri The uri for the request which can be a relative path to use
 * the currently active host or a full i.e. http://localhost:4001/db/query which is used
 * literally
 * @property {Boolean} [useLeader=false] When true the request will use the master host, the
 * first host in this.hosts, this is ideal for write operations to skip the redirect
 * @property {Number} [retries] The number of retries, defaults to the number of
 * hosts times 3
 * @property {Number} [maxRedirects=10] The maximum number of HTTP redirects to follow before
 * throwing an error
 * @property {Number} [attempt=0] The current attempt count when retrying or redirecting
 * @property {Number} [retryAttempt=0] The current attempt based on retry logic
 * @property {Number} [redirectAttempt=0] The current attempt based on redirect logic
 * @property {Number} [attemptHostIndex] When in a retry state the host index of the last
 * attempt which is used to get the next host index
 * @property {import('http').Agent} [httpAgent] An option http agent, useful for
 * keepalive pools using plain HTTP
 * @property {import('https').Agent} [httpsAgent] An option http agent, useful
 * for keepalive pools using SSL
 */
/**
 * The default timeout value
 */
export const DEAULT_TIMEOUT: 30000;
/**
 * The default to retry a request using the next host in the chain
 */
export const DEAULT_RETRY_DELAY: 30000;
/**
 * Generic HTTP Request class which all RQLiteJS client
 * should extend for consistent communitication with an RQLite
 * server
 */
export default class HttpRequest {
  /**
     * Construtor for HttpRequest
     * @param {String[]|String} hosts An array of RQLite hosts or a string
     * that will be split on "," to create an array of hosts, the first
     * host will be tried first when there are multiple hosts
     * @param {Object} [options={}] Additional options
     * @param {Object} [options.authentication] Authentication options
     * @param {String} [options.authentication.username] The host authentication username
     * @param {String} [options.authentication.password] The host authentication password
     * @param {Boolean} [options.activeHostRoundRobin=true] If true this.setNextActiveHostIndex()
     * will perform a round robin when called
     * @param {import('http').Agent} [options.httpAgent] An option http agent, useful for
     * keepalive pools using plain HTTP
     * @param {import('https').Agent} [options.httpsAgent] An option http agent, useful
     * for keepalive pools using SSL
     * @param {Set|String[]} [options.retryableErrorCodes] The list of retryable error codes
     * @param {Set|Number[]} [options.retryableStatusCodes] The list of retryable http status codes
     * @param {Set|String[]} [options.retryableHttpMethods] The list of retryable http methods
     * @param {Number} [options.exponentailBackoffBase] The value for exponentail backoff base
     * for retry exponential backoff
     */
  constructor(hosts: string[] | string, options?: {
    authentication?: {
      username?: string;
      password?: string;
    };
    activeHostRoundRobin?: boolean;
    httpAgent?: import('http').Agent;
    httpsAgent?: import('https').Agent;
    retryableErrorCodes?: Set<any> | string[];
    retryableStatusCodes?: Set<any> | number[];
    retryableHttpMethods?: Set<any> | string[];
    exponentailBackoffBase?: number;
  });
  /**
     * The index of the host in this.hosts which will be tried
     * first before attempting other hosts
     * @type {Number}
     */
  activeHostIndex: number;

  /**
     * Whether or not the setNextActiveHostIndex() should
     * perform a round robin strategy
     */
  activeHostRoundRobin: boolean;

  /**
     * The regex pattern to check if a uri is absolute or relative,
     * if it is absolute the host is not appended
     */
  absoluteUriPattern: RegExp;

  /**
     * A list of hosts that are tried in round robin fashion
     * when certain HTTP responses are received
     * @type {String[]}
     */
  hosts: string[];

  /**
     * @type {import('http').Agent} The http agent if it is set
     */
  httpAgent: import('http').Agent;

  /**
     * @type {import('https').Agent} The https agent if it is set
     */
  httpsAgent: import('https').Agent;

  /**
     * The host list index of the leader node defaults
     * to the first host
     * @type {Number}
     */
  leaderHostIndex: number;

  /**
     * Http error codes which are considered retryable
     * @type {Set}
     */
  retryableErrorCodes: Set<any>;

  /**
     * Http status codes which are considered retryable
     * @type {Set}
     */
  retryableStatusCodes: Set<any>;

  /**
     * Http methods which are considered retryable
     * @type {Set}
     */
  retryableHttpMethods: Set<any>;

  /**
     * The exponential backoff base for retries
     */
  exponentailBackoffBase: number;

  /**
     * Authentication Map
     * @type {Map}
     * @property {String} username
     * @property {String} password
     */
  authentication: Map<any, any>;
  /**
     * Set authentication information
     * @param {Object} [authentication] Authentication data
     * @param {String} [authentication.username] The host authentication username
     * @param {String} [authentication.password] The host authentication password
     */
  setAuthentication(authentication?: {
    username?: string;
    password?: string;
  }): void;
  /**
     * Set the exponentail backoff base
     * @param {Number} exponentailBackoffBase
     */
  setExponentailBackoffBase(exponentailBackoffBase: number): void;
  /**
     * Get the exponentail backoff base
     * @return {Number} The exponentail backoff base
     */
  getExponentailBackoffBase(): number;
  /**
     * Set the retryable error codes
     * @param {Set} retryableErrorCodes
     */
  setRetryableErrorCodes(retryableErrorCodes: Set<any>): void;
  /**
     * Get the retryable error codes
     * @returns {Set}
     */
  getRetryableErrorCodes(): Set<any>;
  /**
     * Set the retryable status codes
     * @param {Set} retryableStatusCodes
     */
  setRetryableStatusCodes(retryableStatusCodes: Set<any>): void;
  /**
     * Get the retryable status codes
     * @returns {Set}
     */
  getRetryableStatusCodes(): Set<any>;
  /**
     * Set the retryable http methods
     * @param {Set} retryableHttpMethods
     */
  setRetryableHttpMethods(retryableHttpMethods: Set<any>): void;
  /**
     * Get the retryable http methods
     * @returns {Set}
     */
  getRetryableHttpMethods(): Set<any>;
  /**
     * Set an http agent which is useful for http keepalive requests
     * @param {import('http').Agent} httpAgent An http agent
     */
  setHttpAgent(httpAgent: import('http').Agent): void;
  /**
     * Get the set http agent
     * @returns {import('http').Agent|undefined} The https agent if it is set
     */
  getHttpAgent(): import('http').Agent | undefined;
  /**
     * Set an https agent which is useful for https keepalive requests
     * @param {import('https').Agent} httpsAgent An https agent
     */
  setHttpsAgent(httpsAgent: import('https').Agent): void;
  /**
     * Get the set https agent
     * @returns {import('https').Agent|undefined} The https agent if it is set
     */
  getHttpsAgent(): import('https').Agent | undefined;
  /**
     * Set the list of hosts
     * @param {String[]|String} hosts An array of RQLite hosts or a string
     * that will be split on "," to create an array of hosts, the first
     * host will be tried first when there are multiple hosts
     */
  setHosts(hosts: string[] | string): void;
  /**
     * Get the list of hosts
     * @returns {String[]} The list of hosts
     */
  getHosts(): string[];
  /**
     * Given a host string find the index of that host in the hosts
     * @param {String} host A host to find in hosts
     * @returns {Number} The found host index or -1 if not found
     */
  findHostIndex(host: string): number;
  /**
     * Get the current active host from the hosts array
     * @param {Boolean} useLeader If true use the first host which is always
     * the master, this is prefered for write operations
     * @returns {String} The active host
     */
  getActiveHost(useLeader: boolean): string;
  /**
     * Set the active host index with check based on this.hosts
     * @param {Number} activeHostIndex The index
     * @returns {Number} The active host index
     */
  setActiveHostIndex(activeHostIndex: number): number;
  /**
     * Get the host index for the leader node
     * @returns {Number} The host index for the leader node
     */
  getLeaderHostIndex(): number;
  /**
     * Set the index in the host array for the leader node
     * @param {Number} leaderHostIndex The index of the host that is the leader node
     * @returns {Number} The host index for the leader node
     */
  setLeaderHostIndex(leaderHostIndex: number): number;
  /**
     * Get the active host index
     * @returns {Number} The active host index
     */
  getActiveHostIndex(): number;
  /**
     * Set active host round robin value
     * @param {Boolean} activeHostRoundRobin If true setActiveHostIndex() will
     * perform a round robin
     */
  setActiveHostRoundRobin(activeHostRoundRobin: boolean): void;
  /**
     * Get active host round robin value
     * @returns {Boolean} The value of activeHostRoundRobin
     */
  getActiveHostRoundRobin(): boolean;
  /**
     * Get the next active host index
     * @param {Number} [activeHostIndex] An optional paramater to provide the active host index
     * @returns {Number} The next active host index which will wrap around to zero
     */
  getNextActiveHostIndex(activeHostIndex?: number): number;
  /**
     * Set the active host index to the next host using a
     * round robin strategy
     */
  setNextActiveHostIndex(): void;
  /**
     * Get the total number of hosts
     * @returns {Number} The total number of hosts
     */
  getTotalHosts(): number;
  /**
     * Returns whether or not the uri passes a test for this.absoluteUriPattern
     * @returns {Boolean} True if the path is absolute
     */
  uriIsAbsolute(uri: any): boolean;
  /**
     * Returns true when the HTTP request is retryable
     * @param {Object} options The options
     * @param {Number} options.statusCode The HTTP status code
     * @param {String} options.errorCode The error code
     * @param {String} options.httpMethod The http method
     * @returns {Boolean} True if the request is retry able
     */
  requestIsRetryable(options?: {
    statusCode: number;
    errorCode: string;
    httpMethod: string;
  }): boolean;
  /**
     * Perform an HTTP request using the provided options
     * @param {HttpRequestOptions} [options={}] Options for the HTTP client
     * @returns {Promise<{status: Number, body: Object|String}>} An object with a status and body
     * property when stream is false and a stream when the stream option is true
     * @throws {ERROR_HTTP_REQUEST_MAX_REDIRECTS} When the maximum number of redirect has been reached
     */
  fetch(options?: HttpRequestOptions): Promise<{
    status: number;
    body: any | string;
  }>;
  /**
     * Perform an HTTP GET request
     * @param {HttpRequestOptions} [options={}] The options
     * @see this.fetch() for options
     */
  get(options?: HttpRequestOptions): Promise<{
    status: number;
    body: any | string;
  }>;
  /**
     * Perform an HTTP POST request
     * @param {HttpRequestOptions} [options={}] The options
     * @see this.fetch() for options
     */
  post(options?: HttpRequestOptions): Promise<{
    status: number;
    body: any | string;
  }>;
}
/**
 * RQliteJS HTTP Request options
 */
export type HttpRequestOptions = {
  /**
     * A object for user authentication
     */
  auth?: {
    username?: string;
    password?: string;
  };
  /**
     * The body of the HTTP request
     */
  body?: any;
  /**
     * HTTP headers to send with the request
     */
  headers?: any;
  /**
     * The HTTP method for the request
     * i.e. GET or POST
     */
  httpMethod?: string;
  /**
     * An object with the query to send with the HTTP request
     */
  query?: any;
  /**
     * When true the returned value is a request object with
     * stream support instead of a request-promise result
     */
  stream?: boolean;
  /**
     * Optional timeout to override default
     */
  timeout?: number;
  /**
     * The uri for the request which can be a relative path to use
     * the currently active host or a full i.e. http://localhost:4001/db/query which is used
     * literally
     */
  uri: string;
  /**
     * When true the request will use the master host, the
     * first host in this.hosts, this is ideal for write operations to skip the redirect
     */
  useLeader?: boolean;
  /**
     * The number of retries, defaults to the number of
     * hosts times 3
     */
  retries?: number;
  /**
     * The maximum number of HTTP redirects to follow before
     * throwing an error
     */
  maxRedirects?: number;
  /**
     * The current attempt count when retrying or redirecting
     */
  attempt?: number;
  /**
     * The current attempt based on retry logic
     */
  retryAttempt?: number;
  /**
     * The current attempt based on redirect logic
     */
  redirectAttempt?: number;
  /**
     * When in a retry state the host index of the last
     * attempt which is used to get the next host index
     */
  attemptHostIndex?: number;
  /**
     * An option http agent, useful for
     * keepalive pools using plain HTTP
     */
  httpAgent?: import('http').Agent;
  /**
     * An option http agent, useful
     * for keepalive pools using SSL
     */
  httpsAgent?: import('https').Agent;
};
