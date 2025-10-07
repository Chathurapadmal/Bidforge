import { auth } from "@/lib/auth"; // or ../../lib/auth
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth.handler);
