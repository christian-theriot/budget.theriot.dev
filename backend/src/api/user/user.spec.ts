import { UserService } from ".";

describe("User Service", () => {
  it('exports a function called "authenticate" which succeeds if OAuth2Client.verifyIdToken succeeds', async () => {
    const { OAuth2Client } = require("google-auth-library");
    const date = Math.floor((new Date().getTime() + 1000 * 60 * 60) / 1000);

    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce((...args: any) => {
        return {
          getPayload: () => ({
            sub: "1",
            email: "test@gmail.com",
            email_verified: true,
            aud: process.env["GOOGLE_CLIENT_ID"],
            exp: date,
          }),
        };
      });
    const auth = await UserService.authenticate("credential");

    expect(auth).toEqual({
      authenticated: true,
      user: {
        email: "test@gmail.com",
        expires: new Date(date * 1000),
        id: 1,
        provider: "GIS",
      },
    });
  });

  it('exports a function called "authenticate" which fails if email is not verified', async () => {
    const { OAuth2Client } = require("google-auth-library");
    const date = Math.floor((new Date().getTime() + 1000 * 60 * 60) / 1000);

    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce((...args: any) => {
        return {
          getPayload: () => ({
            sub: "1",
            email: "test@gmail.com",
            email_verified: false,
            aud: process.env["GOOGLE_CLIENT_ID"],
            exp: date,
          }),
        };
      });
    const auth = await UserService.authenticate("credential");

    expect(auth).toEqual({ authenticated: false });
  });

  it('exports a function called "authenticate" which fails if payload is undefined', async () => {
    const { OAuth2Client } = require("google-auth-library");
    const date = Math.floor((new Date().getTime() + 1000 * 60 * 60) / 1000);

    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce((...args: any) => {
        return {
          getPayload: () => undefined,
        };
      });
    const auth = await UserService.authenticate("credential");

    expect(auth).toEqual({ authenticated: false });
  });

  it('exports a function called "authenticate" which fails if aud is not the app\'s client id', async () => {
    const { OAuth2Client } = require("google-auth-library");
    const date = Math.floor((new Date().getTime() + 1000 * 60 * 60) / 1000);

    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce((...args: any) => {
        return {
          getPayload: () => ({
            sub: "1",
            email: "test@gmail.com",
            email_verified: true,
            aud: "invalid",
            exp: date,
          }),
        };
      });
    const auth = await UserService.authenticate("credential");

    expect(auth).toEqual({ authenticated: false });
  });

  it('exports a function called "authenticate" which fails if exp is invalid', async () => {
    const { OAuth2Client } = require("google-auth-library");

    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce((...args: any) => {
        return {
          getPayload: () => ({
            sub: "1",
            email: "test@gmail.com",
            email_verified: true,
            aud: process.env["GOOGLE_CLIENT_ID"],
            exp: 0,
          }),
        };
      });
    const auth = await UserService.authenticate("credential");

    expect(auth).toEqual({ authenticated: false });
  });

  it('exports a function called "authenticate" which fails if the verifyIdToken call throws an error', async () => {
    const { OAuth2Client } = require("google-auth-library");
    const date = Math.floor((new Date().getTime() + 1000 * 60 * 60) / 1000);
    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockRejectedValueOnce(new Error("mock error"));
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    const auth = await UserService.authenticate("credential");

    expect(auth).toEqual({ authenticated: false });
    expect(console.error).toHaveBeenCalledWith(new Error("mock error"));
  });
});
