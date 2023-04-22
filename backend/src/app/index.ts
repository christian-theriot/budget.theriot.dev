import { Express, Request, Response, json, NextFunction } from "express";
import cors from "cors";

export class App {
  constructor(public server: Express) {
    this.server.use(json());
    this.server.disable("x-powered-by");
    this.server.use(
      cors({
        origin: (o, done) => {
          if (o === undefined) {
            return done(null, o);
          }

          done(new Error('CORS Blocked origin "' + o + '"'));
        },
      })
    );

    this.enableHealthCheck();
    this.catchErrors();
  }

  private enableHealthCheck() {
    this.server.use("/healthcheck", (_, res) => res.status(200).send("OK"));
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
