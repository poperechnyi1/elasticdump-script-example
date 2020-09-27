const argv = require("minimist")(process.argv);
const _ = require("lodash");
const path = require("path");
const Elasticdump = require(path.join(
  __dirname,
  "/node_modules/elasticdump/",
  "elasticdump.js"
));

//simple example of request
const necessaryData = JSON.stringify([]);
const searchBody = `{ \"query\":{ \"terms\":{\"necessaryData\": ${necessaryData}}}}`;

// option
const defaults = {
  size: -1,
  limit: 100,
  offset: 0,
  debug: false,
  type: "data",
  delete: false,
  maxSockets: null,
  input: "http://localhost:9200/",
  "input-index": "",
  output: "http://localhost:9200/",
  "output-index": "",
  noRefresh: false,
  inputTransport: null,
  outputTransport: null,
  searchBody: searchBody,
  searchWithTemplate: false,
  headers: null,
  sourceOnly: false,
  jsonLines: false,
  format: "",
  "ignore-errors": false,
  "support-big-int": false,
  "big-int-fields": "",
  scrollId: null,
  scrollTime: "10m",
  timeout: null,
  toLog: null,
  quiet: false,
  awsChain: false,
  awsAccessKeyId: "",
  awsSecretAccessKey: "",
  awsIniFileProfile: null,
  awsService: null,
  awsRegion: "",
  awsUrlRegex: null,
  s3AccessKeyId: null,
  s3SecretAccessKey: null,
  s3Region: null,
  s3Endpoint: null,
  s3SSLEnabled: true,
  s3ForcePathStyle: false,
  s3Compress: false,
  fsCompress: false,
  awsIniFileName: null,
  sessionToken: null,
  transform: null,
  httpAuthFile: null,
  params: null,
  prefix: "",
  suffix: "",
  retryAttempts: 0,
  customBackoff: false,
  retryDelayBase: 0,
  retryDelay: 5000,
  parseExtraFields: "",
  fileSize: -1,
  cert: null,
  key: null,
  pass: null,
  ca: null,
  tlsAuth: false,
  "input-cert": null,
  "input-key": null,
  "input-pass": null,
  "input-ca": null,
  "output-cert": null,
  "output-key": null,
  "output-pass": null,
  "output-ca": null,
  inputSocksProxy: null,
  inputSocksPort: null,
  outputSocksProxy: null,
  outputSocksPort: null,
  concurrency: 1,
  throttleInterval: 1,
  carryoverConcurrencyCount: true,
  intervalCap: 5,
  concurrencyInterval: 5000,
  overwrite: false,
  handleVersion: false,
  versionType: null,
};
const options = {};

class ArgParser {
  constructor(config) {
    this.options = config.options || {};
    this.jsonParsedOpts = config.jsonParsedOpts || [
      "searchBody",
      "headers",
      "params",
    ];
    this.parseJSONOpts = config.parseJSONOpts;
  }

  parse(argv, defaults, parseJSONOpts = false) {
    // parse passed options & use defaults otherwise
    for (const i in defaults) {
      this.options[i] = argv[i] || defaults[i];

      if (this.options[i] === "true") {
        this.options[i] = true;
      }
      if (this.options[i] === "false") {
        this.options[i] = false;
      }
      if (this.options[i] === "Infinity") {
        this.options[i] = Infinity;
      }
      if (this.options[i] === "null") {
        this.options[i] = null;
      }
      if (i === "interval" && _.isNumber(argv[i])) {
        // special case to handle value == 0
        this.options[i] = argv[i];
      }
    }

    if (parseJSONOpts || this.parseJSONOpts) {
      // parse whitelisted json formatted options
      for (const i of this.jsonParsedOpts) {
        if (this.options[i]) {
          this.options[i] = JSON.parse(this.options[i]);
        }
      }
    }
  }

  log(type, message) {
    if (type === "debug") {
      if (this.options.debug === true) {
        message = `${new Date().toUTCString()} [debug] | ${message}`;
        console.log(message);
      } else {
        return false;
      }
    } else if (type === "error") {
      message = `${new Date().toUTCString()} | ${message}`;
      console.error(message);
    } else if (this.options.quiet === false) {
      message = `${new Date().toUTCString()} | ${message}`;
      console.log(message);
    } else {
      return false;
    }
  }
}

const args = new ArgParser({ options, parseJSONOpts: true });
args.parse(argv, defaults);

const dumper = new Elasticdump(defaults.input, options.output, options);

dumper.on("log", function (message) {
  args.log("log", message);
});
dumper.on("debug", function (message) {
  args.log("debug", message);
});
dumper.on("error", function (error) {
  args.log(
    "error",
    `Error Emitted => ${error.message || JSON.stringify(error)}`
  );
});

dumper.dump(function (error) {
  if (error) {
    process.exit(1);
  }
});
