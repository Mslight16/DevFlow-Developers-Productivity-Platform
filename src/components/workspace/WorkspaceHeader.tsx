"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  GitBranch,
  LogOut,
  Menu,
  Search,
  UserCircle,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function WorkspaceHeader({
  active,
  query,
  setQuery,
  accountName,
  avatarUrl,
  user,
  profileOpen,
  accountOpen,
  setProfileOpen,
  setAccountOpen,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  onSetActive,
  onSignOut,
}: {
  active: string;
  query: string;
  setQuery: (value: string) => void;
  accountName: string;
  avatarUrl?: string;
  user: User | null;
  profileOpen: boolean;
  accountOpen: boolean;
  setProfileOpen: (
    value: boolean | ((value: boolean) => boolean),
  ) => void;
  setAccountOpen: (value: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  onSetActive: (label: string) => void;
  onSignOut: () => Promise<void>;
}) {
  const router = useRouter();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [displayName, setDisplayName] = useState(accountName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const initial = accountName.trim().charAt(0).toUpperCase() || "U";

  async function saveProfile() {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setProfileError("Display name cannot be empty.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: trimmedName,
      },
    });

    if (error) {
      setProfileError(error.message);
      setSavingProfile(false);
      return;
    }

    setEditProfileOpen(false);
    setSavingProfile(false);
  }

  async function uploadAvatar() {
    if (!avatarFile || !user) return;

    setUploadingAvatar(true);
    setProfileError("");

    const supabase = createClient();

    const fileExtension = avatarFile.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        upsert: true,
        contentType: avatarFile.type,
      });

    if (uploadError) {
      setProfileError(uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: data.publicUrl,
      },
    });

    if (updateError) {
      setProfileError(updateError.message);
      setUploadingAvatar(false);
      return;
    }

    setAvatarPreview(data.publicUrl);
    setAvatarFile(null);
    setUploadingAvatar(false);
  }

  async function deleteAccount() {
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to delete your account.");
        return;
      }

      router.push("/login");
    } catch {
      alert("Something went wrong while deleting your account.");
    }
  }

  function openEditProfile() {
    setDisplayName(accountName);
    setProfileError("");
    setEditProfileOpen(true);
  }

  return (
    <header className="relative flex min-h-[68px] w-full items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--background)] px-3 py-3 shadow-[var(--shadow-raised-sm)] sm:min-h-[72px] sm:gap-4 sm:px-6">
      {/* Left side */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={
            mobileSidebarOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileSidebarOpen}
          onClick={() =>
            setMobileSidebarOpen(!mobileSidebarOpen)
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--ink)] shadow-[var(--shadow-raised-sm)] transition-all duration-200 hover:text-[var(--primary)] active:shadow-[var(--shadow-inset-sm)] md:hidden"
        >
          {mobileSidebarOpen ? (
            <X size={19} />
          ) : (
            <Menu size={19} />
          )}
        </button>

        {/* Desktop breadcrumb */}
        <div className="hidden min-w-0 items-center gap-2 text-xs sm:flex">
          <span className="font-medium text-[var(--muted)]">
            Workspace
          </span>

          <span className="text-[var(--line)]">/</span>

          <strong className="truncate text-[var(--ink)]">
            {active}
          </strong>
        </div>

        {/* Search */}
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5 shadow-[var(--shadow-inset-sm)] transition-all focus-within:border-[var(--primary)] focus-within:shadow-[var(--shadow-inset)] sm:flex-none sm:w-[240px]">
          <Search
            size={16}
            className="shrink-0 text-[var(--muted)]"
          />

          <input
            aria-label="Search tasks"
            placeholder="Search tasks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 w-full flex-1 bg-transparent text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
        </label>
      </div>

      {/* Right side */}
      <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Greeting - hidden on mobile */}
        <span className="hidden text-xs text-[var(--muted)] lg:block">
          Hi,{" "}
          <strong className="font-bold text-[var(--ink)]">
            {accountName}!
          </strong>
        </span>

        {/* Profile button */}
        <button
          type="button"
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((open) => !open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--background)] text-sm font-bold text-[var(--primary)] shadow-[var(--shadow-raised-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)]"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={40}
              height={40}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </button>

        {/* Profile menu */}
        {profileOpen && (
          <div
            role="dialog"
            aria-label="Profile menu"
            className="absolute right-0 top-[calc(100%+10px)] z-[1000] w-[min(300px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--background)] shadow-[var(--shadow-raised)]"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--background)] text-sm font-bold text-[var(--primary)] shadow-[var(--shadow-inset-sm)]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={44}
                    height={44}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              <div className="min-w-0">
                <strong className="block truncate text-sm font-bold text-[var(--ink)]">
                  {accountName}
                </strong>

                <span className="mt-0.5 block truncate text-[11px] text-[var(--muted)]">
                  {user?.email || "No email on file"}
                </span>
              </div>
            </div>

            <div className="mx-4 h-px bg-[var(--line)]" />

            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  setAccountOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-inset-sm)]">
                  <UserCircle size={17} />
                </span>

                <span className="min-w-0">
                  <strong className="block text-xs font-bold text-[var(--ink)]">
                    Account
                  </strong>

                  <small className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">
                    {user?.email || "Manage your account"}
                  </small>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onSetActive("GitHub");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-inset-sm)]">
                  <GitBranch size={17} />
                </span>

                <span>
                  <strong className="block text-xs font-bold text-[var(--ink)]">
                    GitHub
                  </strong>

                  <small className="mt-0.5 block text-[10px] text-[var(--muted)]">
                    Connect and manage GitHub
                  </small>
                </span>
              </button>
            </div>

            <div className="mx-4 h-px bg-[var(--line)]" />

            <div className="p-2">
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[var(--error)] transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background)] shadow-[var(--shadow-inset-sm)]">
                  <LogOut size={17} />
                </span>

                <span className="text-xs font-bold">
                  Sign out
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Account dialog */}
        {accountOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[3px]">
            <section className="w-full max-w-md rounded-3xl bg-[var(--background)] p-5 shadow-2xl sm:p-7">
              <DialogHeader
                eyebrow="Account"
                title="Account details"
                subtitle="Manage your DevFlow account."
                onClose={() => setAccountOpen(false)}
              />

              <div className="mt-6 grid gap-4">
                <div className="flex items-center gap-4 rounded-2xl bg-[var(--background)] p-4 shadow-[var(--shadow-inset)]">
                  <ProfileAvatar
                    src={avatarUrl}
                    initial={initial}
                    size={64}
                  />

                  <div className="min-w-0">
                    <strong className="block truncate text-sm font-bold text-[var(--ink)]">
                      {accountName}
                    </strong>

                    <span className="mt-1 block truncate text-[11px] text-[var(--muted)]">
                      {user?.email || "No email"}
                    </span>
                  </div>
                </div>

                <AccountField
                  label="Display name"
                  value={accountName}
                />

                <AccountField
                  label="Email"
                  value={user?.email || "No email"}
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-xl bg-[var(--primary)] px-4 py-3 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)]"
                    onClick={() => {
                      setAccountOpen(false);
                      openEditProfile();
                    }}
                  >
                    Edit profile
                  </button>

                  <button
                    type="button"
                    className="rounded-xl px-4 py-3 text-xs font-bold text-[var(--error)] shadow-[var(--shadow-raised-sm)] transition-all hover:shadow-[var(--shadow-inset-sm)]"
                    onClick={() => {
                      setAccountOpen(false);
                      setDeleteAccountOpen(true);
                    }}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Edit profile dialog */}
        {editProfileOpen && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[3px]">
            <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[var(--background)] p-5 shadow-2xl sm:p-7">
              <DialogHeader
                eyebrow="Account"
                title="Edit profile"
                subtitle="Update your profile information."
                onClose={() => setEditProfileOpen(false)}
              />

              <div className="mt-6 grid gap-4">
                <div className="flex justify-center">
                  <ProfileAvatar
                    src={avatarPreview}
                    initial={initial}
                    size={76}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[11px] font-bold text-[var(--ink)]">
                    Profile picture
                  </label>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0] || null;

                      if (!file) return;

                      setAvatarFile(file);
                      setAvatarPreview(
                        URL.createObjectURL(file),
                      );
                    }}
                    className="w-full cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5 text-[11px] text-[var(--muted)] shadow-[var(--shadow-inset-sm)] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => void uploadAvatar()}
                    disabled={!avatarFile || uploadingAvatar}
                    className="w-full rounded-xl px-4 py-3 text-xs font-bold text-[var(--primary)] shadow-[var(--shadow-raised-sm)] transition-all hover:shadow-[var(--shadow-inset-sm)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingAvatar
                      ? "Uploading..."
                      : "Upload picture"}
                  </button>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--ink)]">
                    Display name
                  </label>

                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(event.target.value)
                    }
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 py-3 text-xs text-[var(--ink)] shadow-[var(--shadow-inset-sm)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:shadow-[var(--shadow-inset)]"
                    required
                  />

                  {profileError && (
                    <p className="text-[10px] font-medium text-[var(--error)]">
                      {profileError}
                    </p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--ink)]">
                    Email
                  </label>

                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 py-3 text-xs text-[var(--muted)] shadow-[var(--shadow-inset-sm)] outline-none"
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void saveProfile()}
                    disabled={savingProfile}
                    className="rounded-xl bg-[var(--primary)] px-4 py-3 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditProfileOpen(false)
                    }
                    className="rounded-xl px-4 py-3 text-xs font-bold text-[var(--muted)] shadow-[var(--shadow-raised-sm)] transition-all hover:text-[var(--ink)] hover:shadow-[var(--shadow-inset-sm)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Delete account dialog */}
        {deleteAccountOpen && (
          <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[3px]">
            <section className="w-full max-w-md rounded-3xl bg-[var(--background)] p-5 shadow-2xl sm:p-7">
              <DialogHeader
                eyebrow="Danger zone"
                title="Delete account?"
                subtitle="Are you sure you want to delete your DevFlow account? This action cannot be undone."
                onClose={() =>
                  setDeleteAccountOpen(false)
                }
              />

              <div className="mt-6 grid gap-5">
                <div className="rounded-2xl bg-[var(--background)] p-4 text-xs leading-6 text-[var(--error)] shadow-[var(--shadow-inset)]">
                  Your account and associated data may be
                  permanently deleted.
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-xl px-4 py-3 text-xs font-bold text-[var(--muted)] shadow-[var(--shadow-raised-sm)] transition-all hover:shadow-[var(--shadow-inset-sm)]"
                    onClick={() =>
                      setDeleteAccountOpen(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="rounded-xl bg-[var(--error)] px-4 py-3 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all hover:opacity-90 active:shadow-[var(--shadow-inset-sm)]"
                    onClick={() => {
                      setDeleteAccountOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Final confirmation */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[4px]">
            <section className="w-full max-w-md rounded-3xl bg-[var(--background)] p-5 shadow-2xl sm:p-7">
              <DialogHeader
                eyebrow="Final confirmation"
                title="Are you absolutely sure?"
                subtitle="This will permanently delete your DevFlow account. You will not be able to recover it."
                onClose={() =>
                  setDeleteConfirmOpen(false)
                }
              />

              <div className="mt-6 grid gap-5">
                <div className="rounded-2xl bg-[var(--background)] p-4 text-xs leading-6 text-[var(--error)] shadow-[var(--shadow-inset)]">
                  Please confirm that you really want to
                  permanently delete your account.
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-xl px-4 py-3 text-xs font-bold text-[var(--muted)] shadow-[var(--shadow-raised-sm)] transition-all hover:shadow-[var(--shadow-inset-sm)]"
                    onClick={() =>
                      setDeleteConfirmOpen(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="rounded-xl bg-[var(--error)] px-4 py-3 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all hover:opacity-90 active:shadow-[var(--shadow-inset-sm)]"
                    onClick={() => void deleteAccount()}
                  >
                    Yes, delete my account
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </header>
  );
}

function ProfileAvatar({
  src,
  initial,
  size,
}: {
  src?: string;
  initial: string;
  size: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--background)] font-bold text-[var(--primary)] shadow-[var(--shadow-inset-sm)]"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(14, Math.round(size * 0.28)),
      }}
    >
      {src ? (
        <Image
          src={src}
          alt="Profile"
          width={size}
          height={size}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );
}

function DialogHeader({
  eyebrow,
  title,
  subtitle,
  onClose,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-lg font-bold tracking-tight text-[var(--ink)]">
          {title}
        </h2>

        <p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${title}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] shadow-[var(--shadow-raised-sm)] transition-all hover:text-[var(--ink)] hover:shadow-[var(--shadow-inset-sm)]"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function AccountField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--background)] px-4 py-3 shadow-[var(--shadow-inset-sm)]">
      <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </span>

      <strong className="mt-1 block truncate text-xs font-semibold text-[var(--ink)]">
        {value}
      </strong>
    </div>
  );
}

