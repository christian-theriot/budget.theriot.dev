import { Express, Request, Response, json, NextFunction } from "express";
import cors from "cors";
import { config } from "dotenv";
import { authenticate } from "../api/user";

config();

export class App {
  constructor(public server: Express) {
    this.server.use(json());
    this.server.disable("x-powered-by");
    this.server.use(
      cors({
        origin: (o, done) => {
          if (
            o === undefined ||
            JSON.parse(process.env["ALLOWED_ORIGINS"] ?? "[]").includes(o)
          ) {
            return done(null, o);
          }

          done(new Error('CORS Blocked origin "' + o + '"'));
        },
      })
    );

    this.enableHealthCheck();
    this.enableLocalhost();
    this.enableGoogleSignIn();
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

  private enableGoogleSignIn() {
    this.server.post("/api/auth/login", async (req, res) => {
      const { authenticated, payload } = await authenticate(
        req.body.credential
      );

      if (!authenticated) {
        res.status(401).send("Unauthorized");
      } else {
        res.status(200).send(payload);
      }
    });
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
