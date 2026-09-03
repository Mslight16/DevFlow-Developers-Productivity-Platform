import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/browser";
import { GitBranch, LogOut, Search, UserCircle } from "lucide-react";
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
  setProfileOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  setAccountOpen: (value: boolean) => void;
  onSetActive: (label: string) => void;
  onSignOut: () => Promise<void>;
}) {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [displayName, setDisplayName] = useState(accountName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

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

      window.location.href = "/login";
    } catch {
      alert("Something went wrong while deleting your account.");
    }
  }

  return (
    <header className="topbar" style={{ position: "relative" }}>
      <div className="breadcrumbs">
        <span>Workspace</span>
        <i>/</i>
        <strong>{active}</strong>
      </div>

      <label className="search-trigger">
        <Search size={17} />

        <input
          aria-label="Search tasks"
          placeholder="Search tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <span className="welcome-user">
          Hi, <strong>{accountName}!</strong>
        </span>

        <button
          className="icon-button"
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          style={{
            width: 38,
            height: 38,
            padding: 0,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={38}
              height={38}
              unoptimized
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <UserCircle size={30} />
          )}
        </button>

        {profileOpen && (
          <div
            role="dialog"
            aria-label="Profile menu"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 300,
              background: "#252d38",
              border: "1px solid #3a4552",
              borderRadius: 14,
              boxShadow: "0 18px 45px rgba(0, 0, 0, 0.4)",
              zIndex: 1000,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#17382e",
                  color: "#d8eee5",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={42}
                    height={42}
                    unoptimized
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  accountName.charAt(0).toUpperCase()
                )}
              </div>

              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <strong
                  style={{
                    fontSize: 14,
                    color: "#f1f5f4",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {accountName}
                </strong>

                <span
                  style={{
                    fontSize: 12,
                    color: "#8d9995",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 210,
                  }}
                >
                  {user?.email || "No email on file"}
                </span>
              </div>
            </div>

            <div
              style={{
                height: 1,
                background: "#3a4552",
              }}
            />

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setAccountOpen(true);
              }}
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                color: "#d8dfdd",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
              }}
            >
              <UserCircle size={18} />

              <span>
                <strong
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Account
                </strong>

                <small
                  style={{
                    display: "block",
                    marginTop: 2,
                    color: "#7f8d87",
                    fontSize: 11,
                  }}
                >
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
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                color: "#d8dfdd",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
              }}
            >
              <GitBranch size={18} />

              <span>
                <strong
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  GitHub
                </strong>

                <small
                  style={{
                    display: "block",
                    marginTop: 2,
                    color: "#7f8d87",
                    fontSize: 11,
                  }}
                >
                  Connect and manage GitHub
                </small>
              </span>
            </button>

            <div
              style={{
                height: 1,
                background: "#3a4552",
                margin: "4px 0",
              }}
            />

            <button
              type="button"
              onClick={() => void onSignOut()}
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                color: "#ef9a9a",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(239,154,154,0.08)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={18} />

              <span>Sign out</span>
            </button>
          </div>
        )}

        {accountOpen && (
          <div className="modal-backdrop">
            <section className="account-dialog">
              <div className="account-dialog-header">
                <div>
                  <p className="eyebrow">Account</p>
                  <h2>Account details</h2>
                  <p className="subtitle">Manage your DevFlow account.</p>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setAccountOpen(false)}
                  aria-label="Close account dialog"
                >
                  ×
                </button>
              </div>

              <div className="account-details">
                <div className="account-profile-preview">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={accountName}
                      width={64}
                      height={64}
                      unoptimized
                    />
                  ) : (
                    <span>{accountName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="account-field">
                  <span className="account-field-label">Display name</span>
                  <strong>{accountName}</strong>
                </div>

                <div className="account-field">
                  <span className="account-field-label">Email</span>
                  <strong>{user?.email || "No email"}</strong>
                </div>

                <div className="account-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setDisplayName(accountName);
                      setProfileError("");
                      setEditProfileOpen(true);
                    }}
                  >
                    Edit profile
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setDeleteAccountOpen(true)}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
        {editProfileOpen && (
          <div className="modal-backdrop">
            <section className="account-dialog">
              <div className="account-dialog-header">
                <div>
                  <p className="eyebrow">Account</p>
                  <h2>Edit profile</h2>
                  <p className="subtitle">Update your profile information.</p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setEditProfileOpen(false)}
                  aria-label="Close edit profile dialog"
                >
                  ×
                </button>
              </div>

              <div className="account-details">
                <div className="account-profile-preview">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="account-profile-image"
                    />
                  ) : (
                    <span>{accountName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;

                    if (!file) return;

                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }}
                  className="input"
                />

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void uploadAvatar()}
                  disabled={!avatarFile || uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading..." : "Upload picture"}
                </button>

                <div className="account-field">
                  <label className="account-field-label">Display name</label>

                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="input"
                    required
                  />
                  {profileError && <p className="form-error">{profileError}</p>}
                </div>

                <div className="account-field">
                  <label className="account-field-label">Email</label>

                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input"
                  />
                </div>

                <div className="account-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void saveProfile()}
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setEditProfileOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
        {deleteAccountOpen && (
          <div className="modal-backdrop">
            <section className="account-dialog">
              <div className="account-dialog-header">
                <div>
                  <p className="eyebrow">Danger zone</p>
                  <h2>Delete account?</h2>
                  <p className="subtitle">
                    Are you sure you want to delete your DevFlow account? This
                    action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setDeleteAccountOpen(false)}
                  aria-label="Close delete account dialog"
                >
                  ×
                </button>
              </div>

              <div className="account-details">
                <p className="form-error">
                  Your account and associated data may be permanently deleted.
                </p>

                <div className="account-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setDeleteAccountOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="primary-button"
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
        {deleteConfirmOpen && (
          <div className="modal-backdrop">
            <section className="account-dialog">
              <div className="account-dialog-header">
                <div>
                  <p className="eyebrow">Final confirmation</p>
                  <h2>Are you absolutely sure?</h2>
                  <p className="subtitle">
                    This will permanently delete your DevFlow account. You will
                    not be able to recover it.
                  </p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  aria-label="Close confirmation dialog"
                >
                  ×
                </button>
              </div>

              <div className="account-details">
                <p className="form-error">
                  Please confirm that you really want to permanently delete your
                  account.
                </p>

                <div className="account-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setDeleteConfirmOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="primary-button"
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
