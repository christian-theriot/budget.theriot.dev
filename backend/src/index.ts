import { App } from "./app";
import express from "express";

const app = new App(express());

app.listen(8080);
