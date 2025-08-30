import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins"; // we'll mint JWT for your C# API

export const auth = betterAuth({
  // Email + password out of the box; you can add socials later
  // see docs for DB adapter if you want a real DB instead of default
  plugins: [
    jwt(),          // exposes /api/auth/token and /api/auth/jwks
    nextCookies(),  // auto set cookies in server actions
  ],
});
