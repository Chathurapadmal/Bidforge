declare module "better-auth" {
  import type { Request } from "@types/node";
  export function createAuth(options: any): any;
  export function init(options: any): Promise<any>;
  export const betterAuth: any;
  export default createAuth;
}

declare module "better-auth/next" {
  export function nextHandler(auth: any): { GET: (req: Request) => Promise<Response> | Response; POST: (req: Request) => Promise<Response> | Response };
}

declare module "better-auth/next-js" {
  export function toNextJsHandler(auth: any): { GET: (req: Request) => Promise<Response> | Response; POST: (req: Request) => Promise<Response> | Response };
}

declare module "better-auth/react" {
  export function createAuthClient(options?: any): any;
}
