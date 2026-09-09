import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) =>
          values.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          }),
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuth = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].some((path) => request.nextUrl.pathname.startsWith(path));
  if (!user && !isAuth)
    return NextResponse.redirect(new URL("/login", request.url));
  if (user && isAuth) return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
