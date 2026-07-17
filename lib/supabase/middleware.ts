import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv } from "./public-env";

export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/admin")) {
    if (!user) {
      return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const redirectUrl = new URL("/admin/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin/innsendinger", request.url));
  }

  return response;
}
