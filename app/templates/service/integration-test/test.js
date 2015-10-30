"use strict";

import { expect } from "chai";
import http from "http";

describe("<%= displayName %> Integration Tests", () => {
  it("does GET /thetime", (done) => {
    http.get("http://<%= name %>:<%= port %>/v1/thetime", function (res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
});
