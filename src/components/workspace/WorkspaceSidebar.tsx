import { BarChart3, Check, Code2, FolderKanban, GitBranch, LayoutDashboard, Sparkles, Terminal } from "lucide-react";

const icons = [
  LayoutDashboard,
  FolderKanban,
  Check,
  Check,
  GitBranch,
  Code2,
  BarChart3,
  Sparkles,
];

export const sections = [
  "Overview",
  "Projects",
  "Tasks",
  "Kanban",
  "GitHub",
  "Snippets",
  "Analytics",
  "AI Assistant",
];

export function WorkspaceSidebar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (label: string) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Terminal size={18} />
        </div>

        <span>
          dev<span>flow</span>
        </span>
      </div>

      <nav>
        <p className="nav-label">Workspace</p>

        {sections.map((label, index) => {
          const Icon = icons[index];

          return (
            <button
              className={`nav-item ${active === label ? "active" : ""}`}
              key={label}
              onClick={() => onSelect(label)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <Sparkles size={16} />

          <strong>Developer assistant</strong>

          <p>Groq first, OpenRouter fallback.</p>

          <button onClick={() => onSelect("AI Assistant")}>
            Open assistant
          </button>
        </div>
      </div>
    </aside>
  );
}
