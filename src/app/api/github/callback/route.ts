import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const params = new URL(request.url).searchParams;
  const state = params.get("state");
  const storedState = (await cookies()).get(
    "devflow_github_oauth_state",
  )?.value;
  if (!code || !state || !storedState || state !== storedState)
    return NextResponse.redirect(new URL("/?github=error", request.url));
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    },
  );
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenResponse.ok || !token.access_token)
    return NextResponse.redirect(new URL("/?github=error", request.url));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: user.user_metadata.display_name ?? "",
    });
  const response = NextResponse.redirect(
    new URL("/?github=connected", request.url),
  );
  response.cookies.delete("devflow_github_oauth_state");
  response.cookies.set("devflow_github_token", token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("devflow_github_user", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
