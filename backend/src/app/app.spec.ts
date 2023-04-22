import express from "express";
import { App } from ".";
import request from "supertest";

describe("App module", () => {
  let app: App;

  beforeAll(() => {
    app = new App(express());
  });

  it("can create", () => {
    expect(app).toBeDefined();
    expect(app.server).toBeDefined();
  });

  it("can GET /healthcheck", async () => {
    await request(app.server).get("/healthcheck").expect(200).expect("OK");
  });

  it("can POST /healthcheck", async () => {
    await request(app.server).get("/healthcheck").expect(200).expect("OK");
  });

  it("can listen on a port given as a number", (done) => {
    jest.spyOn(console, "log");

    const connection = app.listen(8080);

    connection.addListener("close", () => {
      expect(connection).toBeDefined();

      done();
    });

    connection.close();
  });

  it("blocks unrecognized origins", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});

    await request(app.server)
      .get("/healthcheck")
      .set("Origin", "unknown.com")
      .expect(500)
      .expect("Internal Server Error");

    expect(console.error).toHaveBeenCalledWith(
      new Error('CORS Blocked origin "unknown.com"')
    );
  });
});
