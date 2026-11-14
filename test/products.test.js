import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();
let server;
let api;

before(() => {
  server = app.listen(0);
  api = request(server);
});

after(() => {
  server.close();
});

describe("Product API", () => {
  it("returns the starter products and supports name search", async () => {
    const listResponse = await api.get("/api/products");
    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.data.length, 5);

    const searchResponse = await api.get("/api/products?search=buku");
    assert.equal(searchResponse.status, 200);
    assert.deepEqual(searchResponse.body.data.map((product) => product.name), ["Buku Tulis"]);
  });

  it("creates, updates, and deletes a product", async () => {
    const createResponse = await api
      .post("/api/products")
      .send({ name: "Buku Agenda", price: 15000 });

    assert.equal(createResponse.status, 201);
    const productId = createResponse.body.data.id;

    const updateResponse = await api
      .patch(`/api/products/${productId}`)
      .send({ name: "Buku Agenda Baru", price: 18000 });
    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.data.name, "Buku Agenda Baru");

    const deleteResponse = await api.delete(`/api/products/${productId}`);
    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.data.productId, productId);

    const detailResponse = await api.get(`/api/products/${productId}`);
    assert.equal(detailResponse.status, 404);
  });

  it("rejects invalid input and malformed product IDs", async () => {
    const invalidBody = await api.post("/api/products").send({ name: "  ", price: -1 });
    assert.equal(invalidBody.status, 400);

    const invalidPrice = await api.post("/api/products").send({ name: "Buku", price: 1.5 });
    assert.equal(invalidPrice.status, 400);

    const invalidId = await api.get("/api/products/abc");
    assert.equal(invalidId.status, 400);
  });
});