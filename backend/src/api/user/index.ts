import { OAuth2Client, TokenPayload } from "google-auth-library";
import { config } from "dotenv";

config();

const googleAuthClient = new OAuth2Client(process.env["GOOGLE_CLIENT_ID"]);

export async function authenticate(
  credential: string
): Promise<{ authenticated: boolean; payload?: TokenPayload }> {
  const verifiedIdToken = await googleAuthClient.verifyIdToken({
    idToken: credential,
    audience: process.env["GOOGLE_CLIENT_ID"],
  });
  const payload = verifiedIdToken.getPayload();

  // user's email must be verified
  if (!payload?.email_verified) {
    return { authenticated: false };
  }

  // aud must match client id
  if (payload?.aud !== process.env["GOOGLE_CLIENT_ID"]) {
    return { authenticated: false };
  }

  // exp must be a date in the future
  if (new Date(parseInt(`${payload?.exp}000`)) <= new Date()) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    payload,
  };
}
