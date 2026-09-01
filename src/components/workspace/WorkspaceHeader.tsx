import Image from "next/image";
import { GitBranch, LogOut, Search, Settings, UserCircle } from "lucide-react";
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
  onOpenSettings,
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
  onOpenSettings: () => void;
  onSignOut: () => Promise<void>;
}) {
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

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <button
          type="button"
          className="icon-button"
          aria-label="Open settings"
          onClick={onOpenSettings}
          title="Settings"
          style={{
            width: 36,
            height: 36,
            padding: 0,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <Settings size={16} />
        </button>

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
                    <Image src={avatarUrl} alt={accountName} width={64} height={64} unoptimized />
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
                  <button type="button" className="primary-button">
                    Edit profile
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
