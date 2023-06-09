import {
  Express,
  Request,
  Response,
  json,
  NextFunction,
  urlencoded,
} from "express";
import cors from "cors";
import { config } from "dotenv";
import { UserService } from "../api";
import session from "express-session";
import { Database } from "../services";
import rateLimit from "express-rate-limit";
import csurf from "csurf";

config();

export class App {
  constructor(public server: Express, public database: Database) {
    this.server.use(json());
    this.server.use(urlencoded({ extended: true }));
    this.server.disable("x-powered-by");
    this.server.use(
      cors({
        credentials: true,
        origin: (o, done) => {
          if (
            o === undefined ||
            (
              JSON.parse(`${process.env["ALLOWED_ORIGINS"]}`) as string[]
            ).includes(o)
          ) {
            return done(null, o);
          }

          done(new Error('CORS Blocked origin "' + o + '"'));
        },
      })
    );

    this.enableHealthCheck();
    this.enableLocalhost();
    this.enableUserSessions();
    this.server.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
      })
    );
    this.server.use(csurf(), (req, res, next) => {
      res.setHeader("X-XSRF-TOKEN", req.csrfToken());
      res.cookie("XSRF-TOKEN", req.csrfToken());

      next();
    });
    UserService.enableGoogleSignIn(this.server);
    this.catchErrors();
  }

  private enableHealthCheck() {
    this.server.use("/healthcheck", (_, res) => res.status(200).send("OK"));
  }

  private enableLocalhost() {
    this.server.use((_, res, next) => {
      res.header("Referrer-Policy", "no-referrer-when-downgrade");

      next();
    });
  }

  private enableUserSessions() {
    this.server.set("trust proxy", parseInt(`${process.env["NUM_PROXIES"]}`));
    this.server.get("/ip", (req, res) => res.status(200).send(req.ip));
    this.server.use(
      session({
        secret: `${process.env["SESSION_SECRET"]}`,
        cookie: {
          maxAge: 1000 * 60 * 60, //ms
          sameSite: "none",
          secure: process.env["ENVIRONMENT"] === "production",
        },
        resave: false,
        saveUninitialized: true,
        store: this.database.store,
      })
    );
  }

  private catchErrors() {
    this.server.use(
      (err: Error, _: Request, res: Response, _next: NextFunction) => {
        if (err) {
          console.error(err);
        }

        res.status(500).send("Internal Server Error");
      }
    );
  }

  listen(port: string | number) {
    return this.server.listen(
      port,
      /* istanbul ignore next */ () =>
        console.log(`Listening at http://localhost:${port}`)
    );
  }
}
