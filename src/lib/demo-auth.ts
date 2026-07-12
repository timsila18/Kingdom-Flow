import { cookies } from "next/headers";
import { profiles, testLoginAccounts } from "./data";
import { demoSessionCookie } from "./auth-constants";

export { demoSessionCookie };

export function getDemoAccountByEmail(email: string) {
  return testLoginAccounts.find((account) => account.email.toLowerCase() === email.toLowerCase());
}

export async function getCurrentDemoUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get(demoSessionCookie)?.value;
  if (!email) return undefined;
  const account = getDemoAccountByEmail(email);
  const profile = profiles.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!account) return undefined;
  return { ...account, name: profile?.fullName ?? account.role };
}
