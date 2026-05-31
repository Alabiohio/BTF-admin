import { auth } from "./auth";
import { headers } from "next/headers";

export async function getAuthSession() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    return session;
  } catch (error) {
    console.error("Failed to get auth session:", error);
    return null;
  }
}
