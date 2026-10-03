import { auth } from "./supabase.js";
export const isAdminUser = (user) => user?.app_metadata?.role === "admin";
export async function requireAdmin() {
  const user = await auth.getUser();
  if (!isAdminUser(user))
    throw new Error("Sign in with an authorized store administrator account.");
  return user;
}
