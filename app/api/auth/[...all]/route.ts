import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

console.log("Auth handler loaded with baseURL:", process.env.BETTER_AUTH_URL);

export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(auth);
