import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";

export async function getAuthSession() {
  try {
    const headersList = await headers();
    const cookiesList = await cookies();
    
    // Debug logging
    console.log("Getting session - headers present:", !!headersList);
    console.log("Cookie names available:", Array.from(cookiesList.getAll()).map(c => c.name));
    
    const session = await auth.api.getSession({
      headers: headersList,
    });
    
    console.log("Session result:", session ? "Found" : "Not found");
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
