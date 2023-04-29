import { App } from "./app";
import express from "express";
import { Database } from "./services";
import https from "https";
import { config } from "dotenv";
import { readFileSync } from "fs";

config();

const db = new Database();

db.setup()
  .then(() => {
    const app = new App(express(), db);

    app.listen(8080);

    const httpsApp = https.createServer(
      {
        key: readFileSync(`${process.env["SSL_KEY"]}`),
        cert: readFileSync(`${process.env["SSL_CERT"]}`),
      },
      app.server
    );

    httpsApp.listen(8443);

    console.log("Listening at https://localhost:8443");
  })
  .catch((err) => {
    console.error(err);
  });
