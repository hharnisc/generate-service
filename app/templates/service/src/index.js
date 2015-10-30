import { Service } from "./service";
import minimist from "minimist";
import express from "express";
import { accessLogger, errorLogger, logger } from "./logging";

// create a new rest service
let service = new Service();

// get input arguments
let argv = minimist(process.argv.slice(2), {
  default: {
    port: 8080
  }
});

let app = express();

// hook up the access logger
app.use(accessLogger);

// hook up the service middleware
app.use(service.serviceMiddleware.middleware);

// hook up the error logger
app.use(errorLogger);

// start the service
app.listen(argv.port);

logger.info("Service started on port " + argv.port);
