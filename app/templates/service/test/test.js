"use strict";

import { expect } from "chai";
import request from "supertest";
import { Service } from "../src/service";
import sinon from "sinon";


describe("<%= displayName %> Tests", () => {
  function generateTestResources() {
    // stub out pub/sub
    let publishStub = sinon.stub();
    let pubSubConnectStub = sinon.stub();
    pubSubConnectStub.returnsThis();
    let pubSubThenStub = sinon.stub();
    pubSubThenStub.returnsThis();

    let pubSubStub = {
      connect: pubSubConnectStub,
      publish: publishStub,
      then: pubSubThenStub,
      catch: sinon.stub()
    };

    // stub out push/worker
    let pushStub = sinon.stub();
    let pushWorkerConnectStub = sinon.stub();
    pushWorkerConnectStub.returnsThis();
    let pushWorkerThenStub = sinon.stub();
    pushWorkerThenStub.returnsThis();


    let pushWorkerStub = {
      connect: pushWorkerConnectStub,
      push: pushStub,
      then: pushWorkerThenStub,
      catch: sinon.stub()
    };

    return {
      publishStub,
      pubSubConnectStub,
      pubSubStub,
      pushStub,
      pushWorkerConnectStub,
      pushWorkerStub
    };
  }

  afterEach(() => {
    Service.prototype.createPubSub.restore();
    Service.prototype.createPushWorker.restore();
  });

  it("does GET /thetime", (done) => {
    let {
      publishStub,
      pubSubConnectStub,
      pubSubStub,
      pushStub,
      pushWorkerConnectStub,
      pushWorkerStub
    } = generateTestResources();

    sinon.stub(Service.prototype, "createPubSub", () => pubSubStub);
    sinon.stub(Service.prototype, "createPushWorker", () => pushWorkerStub);

    let service = new Service();

    // hook into the connect middleware
    let req = request(service.serviceMiddleware.middleware);

    req.get("/v1/thetime")
    .expect(200)
    .end((err, res) => {
      if (err) {
        done(err);
      } else {
        // make sure we've got a date
        expect(res.body).to.have.all.keys("date");
        // and that the date is valid
        expect(isNaN(Date.parse(res.body.date))).to.equal(false);
        // make sure pub/sub connected
        expect(pubSubConnectStub.callCount).to.equal(1);
        // make sure push/worker connected
        expect(pushWorkerConnectStub.callCount).to.equal(1);
        // make sure nothing was published or pushed
        expect(publishStub.callCount).to.equal(0);
        expect(pushStub.callCount).to.equal(0);

        done();
      }
    });
  });

  it("does GET /timeevent", (done) => {
    let {
      publishStub,
      pubSubConnectStub,
      pubSubStub,
      pushStub,
      pushWorkerConnectStub,
      pushWorkerStub
    } = generateTestResources();

    sinon.stub(Service.prototype, "createPubSub", () => pubSubStub);
    sinon.stub(Service.prototype, "createPushWorker", () => pushWorkerStub);

    let service = new Service();

    // hook into the connect middleware
    let req = request(service.serviceMiddleware.middleware);

    req.get("/v1/timeevent")
    .expect(200)
    .end((err, res) => {
      if (err) {
        done(err);
      } else {
        // make sure we've got a date
        expect(res.body).to.have.all.keys("success");
        // and that the date is valid
        expect(res.body.success).to.equal(true);

        // make sure pub/sub connected
        expect(pubSubConnectStub.callCount).to.equal(1);
        // make sure push/worker connected
        expect(pushWorkerConnectStub.callCount).to.equal(1);
        // make sure nothing was published or pushed
        expect(publishStub.callCount).to.equal(1);
        expect(pushStub.callCount).to.equal(0);

        done();
      }
    });
  });

  it("does GET /dowork", (done) => {
    let {
      publishStub,
      pubSubConnectStub,
      pubSubStub,
      pushStub,
      pushWorkerConnectStub,
      pushWorkerStub
    } = generateTestResources();

    sinon.stub(Service.prototype, "createPubSub", () => pubSubStub);
    sinon.stub(Service.prototype, "createPushWorker", () => pushWorkerStub);

    let service = new Service();

    // hook into the connect middleware
    let req = request(service.serviceMiddleware.middleware);

    req.get("/v1/dowork")
    .expect(200)
    .end((err, res) => {
      if (err) {
        done(err);
      } else {
        // make sure we've got a date
        expect(res.body).to.have.all.keys("success");
        // and that the date is valid
        expect(res.body.success).to.equal(true);

        // make sure pub/sub connected
        expect(pubSubConnectStub.callCount).to.equal(1);
        // make sure push/worker connected
        expect(pushWorkerConnectStub.callCount).to.equal(1);
        // make sure nothing was published or pushed
        expect(publishStub.callCount).to.equal(0);
        expect(pushStub.callCount).to.equal(1);

        done();
      }
    });
  });
});
