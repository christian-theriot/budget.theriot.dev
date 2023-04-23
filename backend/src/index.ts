import { App } from "./app";
import express from "express";
import { Database } from "./services";

const db = new Database();

db.setup()
  .then(() => {
    const app = new App(express(), db);

    app.listen(8080);
  })
  .catch((err) => {
    console.error(err);
  });
