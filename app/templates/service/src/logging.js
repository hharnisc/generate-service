import winston from "winston";
import winstonExpressMiddleWare from "winston-express-middleware";
require('winston-logstash');

winstonExpressMiddleWare.requestWhitelist.push("connection.remoteAddress");

// console logger with custom formatting to handle request visualization
let transports = [
  new winston.transports.Console({
    colorize: true,
    label: "<%= name %>",
    formatter: function(options) {
      let hasMeta = options.meta && Object.keys(options.meta).length;
      let isAccessLog = hasMeta && options.meta.req && options.meta.res;

      return options.level.toUpperCase() + // log level
        " [" + (options.label ? options.label : "") + "]" + // label
        " " + (options.message ? options.message : "") + // message
        (hasMeta && !isAccessLog ? "\n\t" + JSON.stringify(options.meta) : "" );
    }
  })
];

// connect to logstash host if env var is set
if (process.env.LOGSTASH_SERVICE_HOST) {
  transports.push(
    new (winston.transports.Logstash)({
      port: 5000,
      label: "<%= name %>",
      host: process.env.LOGSTASH_SERVICE_HOST,
      timeout_connect_retries: 10000, // retry after 10 seconds
      max_connect_retries: 10 // retry 10 times
    })
  );
}

// logging instance for HTTP access logs
export let accessLogger = winstonExpressMiddleWare.logger({
  transports: transports,
  ignoreRoute: function (req, res) {
    // use the error logger for 500's, that adds the stack trace
    if (res.statusCode === 500) {
      return true;
    }
    return false;
  },
  statusLevels: true,
  expressFormat: true
});

// logging instance for HTTP error logs
export let errorLogger = winstonExpressMiddleWare.errorLogger({
  transports: transports
});

// logging instance for general purpose logging
export let logger = new (winston.Logger)({
  transports: transports
});
