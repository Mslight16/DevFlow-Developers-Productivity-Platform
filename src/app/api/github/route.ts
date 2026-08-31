import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const github = async (path: string, token: string) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  const token = (await cookies()).get("devflow_github_token")?.value;
  const tokenUser = (await cookies()).get("devflow_github_user")?.value;
  if (tokenUser !== user.id)
    return NextResponse.json(
      { success: false, error: "Connect GitHub for this account" },
      { status: 412 },
    );
  if (!token)
    return NextResponse.json(
      { success: false, error: "Connect GitHub before loading activity" },
      { status: 412 },
    );
  const action = new URL(request.url).searchParams.get("action") ?? "repos";
  const repository = new URL(request.url).searchParams.get("repo");
  const paths: Record<string, string> = {
    repos: "/user/repos?sort=updated&per_page=30",
    activity: "/users/{login}/events?per_page=30",
  };
  let path = paths[action] ?? paths.repos;
  if (action === "commits" && repository)
    path = `/repos/${repository}/commits?per_page=30`;
  if (action === "activity") {
    const identity = await github("/user", token);
    if (!identity.ok)
      return NextResponse.json(
        { success: false, error: "GitHub identity request failed" },
        { status: identity.status },
      );
    const account = (await identity.json()) as { login: string };
    path = paths.activity.replace("{login}", account.login);
  }
  const response = await github(path, token);
  if (!response.ok)
    return NextResponse.json(
      {
        success: false,
        error:
          response.status === 403
            ? "GitHub rate limit reached"
            : "GitHub request failed",
      },
      { status: response.status },
    );
  return NextResponse.json({ success: true, data: await response.json() });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/api/github/callback`;
  const state = crypto.randomUUID();
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(process.env.GITHUB_CLIENT_ID ?? "")}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20repo&state=${encodeURIComponent(state)}`;
  const response = NextResponse.json({ success: true, data: { url } });
  response.cookies.set("devflow_github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
