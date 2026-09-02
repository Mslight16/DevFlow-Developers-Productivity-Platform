import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to delete your account." },
      { status: 401 }
    );
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteAvatarError } = await supabaseAdmin.storage
    .from("avatars")
    .remove([
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.jpeg`,
      `${user.id}/avatar.png`,
      `${user.id}/avatar.webp`,
    ]);

  if (deleteAvatarError) {
    return NextResponse.json(
      { error: deleteAvatarError.message },
      { status: 500 }
    );
  }

  const { error: deleteUserError } =
    await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    return NextResponse.json(
      { error: deleteUserError.message },
      { status: 500 }
    );
  }

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}