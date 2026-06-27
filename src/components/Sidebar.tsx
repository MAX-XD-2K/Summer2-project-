import { 
  BookOpen, LayoutDashboard, FileText, MessageSquare, 
  Layers, GraduationCap, Calendar, Trophy, Settings, Shield, LogOut, Flame, Sparkles 
} from "lucide-react";
import { User, Role } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  theme: "light" | "dark";
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, theme, onLogout }: SidebarProps) {
  const isDark = theme === "dark";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "chat", label: "AI Chat (RAG)", icon: MessageSquare },
    { id: "notes", label: "AI Notes", icon: FileText },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "quiz", label: "Interactive Quizzes", icon: GraduationCap },
    { id: "planner", label: "Study Planner", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (user && user.role === Role.ADMIN) {
    navItems.push({ id: "admin", label: "Admin Panel", icon: Shield });
  }

  return (
    <aside className={`w-64 h-screen flex flex-col justify-between border-r ${
      isDark 
        ? "bg-slate-950 border-slate-900 text-slate-300" 
        : "bg-slate-900 border-slate-800 text-slate-300"
    } transition-colors duration-300 fixed left-0 top-0 z-20`}>
      {/* Brand Header */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-display">
              AI Study
            </h1>
            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
              Companion Hub
            </p>
          </div>
        </div>

        {/* User Quick Metrics Card */}
        {user && (
          <div className="mt-6 p-4 rounded-xl border border-slate-800/80 bg-slate-800/40">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                alt={user.name} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">
                  {user.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5 text-orange-500">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold font-mono">{user.streak}D STREAK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto text-sm font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group cursor-pointer ${
                isActive
                  ? "bg-indigo-600/10 text-white font-semibold"
                  : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${
                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Log Out Area */}
      <div className="mt-auto border-t border-slate-800 p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer group"
        >
          <LogOut className="h-5 w-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
