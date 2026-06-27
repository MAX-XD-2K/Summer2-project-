import { useState } from "react";
import { Search, Bell, CheckCircle, Info, AlertTriangle, Sparkles, LogOut } from "lucide-react";
import { User, Notification } from "../types";

interface NavbarProps {
  user: User | null;
  theme: "light" | "dark";
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ 
  user, theme, searchQuery, setSearchQuery, notifications, onMarkNotificationsAsRead, setActiveTab 
}: NavbarProps) {
  const isDark = theme === "dark";
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <header className={`h-16 border-b transition-colors duration-300 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8 ${
      isDark 
        ? "bg-slate-950/80 border-slate-900 backdrop-blur-md text-white" 
        : "bg-white/80 border-slate-200 backdrop-blur-md text-slate-800"
    }`}>
      {/* Search Input Bar */}
      <div className="w-80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search your knowledge..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full text-xs py-1.5 pl-10 pr-4 rounded-full border transition-all outline-hidden ${
            isDark
              ? "bg-slate-900/60 border-slate-800 focus:border-indigo-500 focus:bg-slate-900 text-white"
              : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800"
          }`}
        />
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-6">
        {/* Streak from the Design Theme */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-orange-500">🔥 {user.streak} DAY STREAK</span>
          </div>
        )}

        {/* Notifications Icon with Popup */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (!showNotifDropdown && unreadCount > 0) {
                onMarkNotificationsAsRead();
              }
            }}
            className={`p-2 rounded-xl border relative transition-colors cursor-pointer ${
              isDark 
                ? "border-slate-800 hover:bg-slate-800/50 text-slate-300" 
                : "border-slate-200 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Bell className="w-4 h-4 text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {/* Notifications Dropdown list */}
          {showNotifDropdown && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-3 z-50 ${
              isDark 
                ? "bg-slate-900 border-slate-800 text-white" 
                : "bg-white border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/20 mb-2">
                <span className="text-xs font-bold">Notifications</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {notifications.length} Total
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">No recent learning updates.</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-2 rounded-xl text-[11px] flex items-start gap-2 border ${
                        notif.isRead 
                          ? isDark ? "bg-slate-800/30 border-transparent text-slate-400" : "bg-slate-50/50 border-transparent text-slate-500"
                          : isDark ? "bg-slate-800 border-slate-800 text-white" : "bg-indigo-50/30 border-indigo-100 text-slate-800"
                      }`}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1">
                        <p className="line-clamp-2 leading-relaxed">{notif.message}</p>
                        <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Capsule */}
        {user && (
          <div className={`flex items-center gap-2 pl-4 border-l ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <span className={`hidden lg:inline text-xs font-semibold max-w-[120px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {user.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner select-none uppercase">
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
