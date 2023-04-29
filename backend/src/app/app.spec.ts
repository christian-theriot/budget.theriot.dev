import express from "express";
import { OAuth2Client } from "google-auth-library";
import { App } from ".";
import request from "supertest";
import { Database } from "../services";
jest.mock("../services");

describe("App module", () => {
  let app: App;

  beforeAll(() => {
    app = new App(express(), new Database());
  });

  afterAll(async () => {
    await app.database.teardown();
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

  it("can query user's ip", async () => {
    await request(app.server).get("/ip").expect(200).expect("::ffff:127.0.0.1");
  });

  it("provides an auth login route at POST /api/auth/login", async () => {
    const date = Math.floor((new Date().getTime() + 1000 * 60 * 60) / 1000);
    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce(() => ({
        getPayload: () => ({
          sub: "1",
          email: "test@gmail.com",
          email_verified: true,
          aud: process.env["GOOGLE_CLIENT_ID"],
          exp: new Date(date),
        }),
      }));

    await request(app.server)
      .post("/api/auth/login")
      .send({ credential: "test" })
      .expect(200)
      .expect({ id: 1, email: "test@gmail.com" })
      .then(async (res) => {
        await request(app.server)
          .get("/api/auth/prelogin")
          .set("Cookie", res.header["set-cookie"])
          .expect(200)
          .expect({ id: 1, email: "test@gmail.com" });

        jest.spyOn(console, "error").mockImplementationOnce(() => {});

        await request(app.server)
          .post("/api/auth/login")
          .set("Cookie", res.header["set-cookie"])
          .send({ credential: "test" })
          .expect(401)
          .expect("Unauthorized");

        expect(console.error).toHaveBeenCalledWith(
          new Error("Wrong number of segments in token: test")
        );
      });
  });

  it("provides an auth logout mechanism", async () => {
    await request(app.server).get("/api/auth/logout").expect(200).expect("OK");
  });

  it("provides an auth prelogin mechanism", async () => {
    await request(app.server)
      .get("/api/auth/prelogin")
      .expect(401)
      .expect("Unauthorized");
  });
});
