import { SESSION_COOKIE } from "@/lib/auth";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: "/" });
  return redirect("/admin/login", 303);
};
