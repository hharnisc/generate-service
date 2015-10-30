import BaseService from "rest-methods/server";
import { logger } from "./logging";
import { PubSub } from "service-pubsub";
import { PushWorker } from "service-pushworker";

export class Service {
  constructor(options={}) {
    this.name = options.name || "<%= displayName %>";
    this.version = options.version || "0.0.1";
    this.basePath = options.basePath || "/v1";
    this.initPubSub();
    this.initPushWorker();
    this.initService();
  }

  // setup PUB/SUB
  createPubSub (topic="time", rabbitmqHost=process.env.RABBITMQ_SERVICE_HOST) {
    return new PubSub(topic, "amqp://" + rabbitmqHost);
  }

  initPubSub () {
    this.pubsub = this.createPubSub();
    this.pubsub.connect()
      .then(() => this.pubsub.subscribe())
      .then(() => {
        this.pubsub.on("data", (data) => {
          logger.info("Time Event: " + JSON.stringify(data));
        });
      })
      .catch((err) => {
        logger.error("err", err);
      });
  }

  // setup PUSH/WORKER
  createPushWorker (queue="work", deadQueue="deadtasks", rabbitmqHost= process.env.RABBITMQ_SERVICE_HOST) {
    return new PushWorker(queue, deadQueue, "amqp://" + rabbitmqHost);
  }

  initPushWorker () {
    this.pushworker = this.createPushWorker();

    this.pushworker.connect()
      .then(() => this.pushworker.subscribe())
      .then(() => {
        this.pushworker.on("task", (task) => {
          logger.info("Starting Task: " + JSON.stringify(task.task));
          setTimeout(() => {
            task.success();
            logger.info("Task Complete: " + JSON.stringify(task.task));
          }, 1000);
        });
      })
      .catch((err) => {
        logger.error("err", err);
      });
  }

  initService () {
    // service methods
    let serviceMiddleware = this.serviceMiddleware = new BaseService({
      name: this.name,
      version: this.version,
      basePath: this.basePath
    });
    serviceMiddleware.methods({
      "thetime": {
        docs: `Return **the time**`,
        get: function() {
          let date = new Date();
          logger.info("The time is " + date);
          return {
            date: date
          };
        }
      },
      "timeevent": {
        docs: `Publish a **time event** to all subscribers`,
        get: () => {
          let date = new Date();
          this.pubsub.publish({ date: date });
          return { success: true };
        }
      },
      "dowork": {
        docs: `Push a **task** onto the worker queue`,
        get: () => {
          this.pushworker.push({ banana: "yes" });
          return { success: true };
        }
      }
    });
  }
}
