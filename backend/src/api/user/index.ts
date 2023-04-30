import { OAuth2Client } from "google-auth-library";
import { config } from "dotenv";
import { Express, Request, Response } from "express";

config();

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      email: string;
      expires: Date;
    };
  }
}

export namespace UserService {
  const GOOGLE_AUTH_CLIENT = new OAuth2Client(process.env["GOOGLE_CLIENT_ID"]);

  export async function authenticate(
    credential: string
  ): Promise<{ authenticated: false } | { authenticated: true; user: User }> {
    try {
      const verifiedIdToken = await GOOGLE_AUTH_CLIENT.verifyIdToken({
        idToken: credential,
        audience: process.env["GOOGLE_CLIENT_ID"],
      });
      const payload = verifiedIdToken.getPayload();

      // user's email must be verified
      if (!payload?.email_verified) {
        return { authenticated: false };
      }

      // aud must match client id
      if (payload.aud !== process.env["GOOGLE_CLIENT_ID"]) {
        return { authenticated: false };
      }

      // exp must be a valid date in the future
      if (
        !payload.exp ||
        new Date(parseInt(`${payload.exp}000`)) <= new Date()
      ) {
        return { authenticated: false };
      }

      return {
        authenticated: true,
        user: {
          id: parseInt(`${payload.sub}`),
          email: `${payload.email}`,
          provider: "GIS",
          expires: new Date(parseInt(`${payload.exp}000`)),
        },
      };
    } catch (err) {
      console.error(err);

      return { authenticated: false };
    }
  }

  export const middleware = {
    prelogin: (req: Request, res: Response) => {
      if (req.session.user) {
        res
          .status(200)
          .send({ id: req.session.user.id, email: req.session.user.email });
      } else {
        res.status(401).send("Unauthorized");
      }
    },

    login: async (req: Request, res: Response) => {
      const auth = await UserService.authenticate(req.body.credential);

      if (!auth.authenticated) {
        req.session.destroy((err) => {
          /* istanbul ignore next */
          if (err) {
            console.error(err);
          }
        });
        res.status(401).send("Unauthorized");
      } else {
        req.session.user = auth.user;

        res.status(200).send({ id: auth.user.id, email: auth.user.email });
      }
    },

    logout: (req: Request, res: Response) => {
      req.session.destroy((err) => {
        /* istanbul ignore next */
        if (err) {
          console.error(err);
        }

        res.status(200).send("OK");
      });
    },
  };

  export function enableGoogleSignIn(app: Express) {
    app.post("/auth/login", middleware.login);
    app.get("/auth/prelogin", middleware.prelogin);
    app.get("/auth/logout", middleware.logout);
  }
}
