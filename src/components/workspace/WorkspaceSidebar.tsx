"use client";

import {
  BarChart3,
  CheckSquare,
  Code2,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    icon: FolderKanban,
  },
  {
    label: "Tasks",
    icon: ListTodo,
  },
  {
    label: "Kanban",
    icon: CheckSquare,
  },
  {
    label: "GitHub",
    icon: GitBranch,
  },
  {
    label: "Snippets",
    icon: Code2,
  },
  {
    label: "Analytics",
    icon: BarChart3,
  },
  {
    label: "AI Assistant",
    icon: Sparkles,
  },
];

export const sections = navigation.map((item) => item.label);

export function WorkspaceSidebar({
  active,
  onSelect,
  mobileOpen,
  onMobileClose,
}: {
  active: string;
  onSelect: (label: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  function handleSelect(label: string) {
    onSelect(label);
    onMobileClose();
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
        className={`fixed inset-0 z-[900] bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        aria-label="Workspace navigation"
        className={`fixed inset-y-0 left-0 z-[1000] flex h-screen w-[280px] max-w-[85vw] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--background)] px-4 py-5 shadow-[var(--shadow-raised)] transition-transform duration-300 ease-out md:sticky md:top-0 md:z-auto md:w-[240px] md:translate-x-0 md:shadow-[var(--shadow-raised-sm)] ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="mb-7 flex items-center justify-between px-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-raised-sm)]">
              <Terminal size={18} strokeWidth={2.2} />
            </div>

            <div className="min-w-0 leading-none">
              <span className="text-base font-bold tracking-tight text-[var(--ink)]">
                dev<span className="text-[var(--primary)]">flow</span>
              </span>

              <span className="mt-1 block truncate text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                Developer workspace
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] shadow-[var(--shadow-raised-sm)] transition-all hover:text-[var(--ink)] hover:shadow-[var(--shadow-inset-sm)] md:hidden"
          >
            <X size={17} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Workspace
          </p>

          <div className="grid gap-1">
            {navigation.map(({ label, icon: Icon }) => {
              const isActive = active === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSelect(label)}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-inset-sm)]"
                      : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--ink)] hover:shadow-[var(--shadow-raised-sm)]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                      isActive
                        ? "bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-inset-sm)]"
                        : "text-[var(--muted)] group-hover:text-[var(--primary)]"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </span>

                  <span className="truncate">
                    {label}
                  </span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)] shadow-[0_0_0_3px_rgba(91,141,239,0.12)]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Assistant card */}
        <div className="mt-5 shrink-0">
          <div className="rounded-2xl bg-[var(--background)] p-4 shadow-[var(--shadow-inset)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-raised-sm)]">
              <Sparkles size={16} />
            </div>

            <strong className="block text-xs font-bold text-[var(--ink)]">
              Developer assistant
            </strong>

            <p className="mt-1.5 text-[10px] leading-5 text-[var(--muted)]">
              Groq first, OpenRouter fallback.
            </p>

            <button
              type="button"
              onClick={() =>
                handleSelect("AI Assistant")
              }
              className="mt-3 w-full rounded-xl bg-[var(--primary)] px-3 py-2.5 text-[10px] font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all duration-200 hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)]"
            >
              Open assistant
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

