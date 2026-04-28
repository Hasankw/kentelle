import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyAdminToken, signAdminToken } from "@/lib/auth/admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

const ADMIN_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin route protection + sliding-window renewal ---
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_token")?.value;
    const payload = token ? await verifyAdminToken(token) : null;
    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Re-issue token on every valid admin request (sliding 30-day window)
    const freshToken = await signAdminToken({
      adminId: payload.adminId,
      email: payload.email,
      role: payload.role,
    });
    const adminResponse = NextResponse.next();
    adminResponse.cookies.set("admin_token", freshToken, ADMIN_COOKIE_OPTS);
    return adminResponse;
  }

  // --- Supabase session refresh ---
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          // Ensure session cookies persist long-term in the browser
          const maxAge = name.includes("refresh-token")
            ? 60 * 60 * 24 * 365   // refresh token: 1 year
            : 60 * 60 * 24 * 30;   // access token: 30 days (Supabase rotates it)
          response.cookies.set(name, value, {
            ...options,
            maxAge,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        });
      },
    },
  });

  await supabase.auth.getUser();

  // Protect /account routes — redirect to /login if not authenticated
  if (pathname.startsWith("/account")) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
