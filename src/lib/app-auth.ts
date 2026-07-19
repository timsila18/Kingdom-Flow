import { cookies } from "next/headers";
import { appSessionCookie } from "./auth-constants";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get(appSessionCookie)?.value;
  if (!email) return undefined;

  return {
    email,
    name: email,
    role: "Authenticated user",
  };
}
