import React, { useState, useEffect } from "react";
import { 
  Sparkles, Lock, Mail, User as UserIcon, LogIn, ChevronRight, CheckCircle2, AlertCircle, RefreshCw 
} from "lucide-react";

import { User, StudyDoc, Notification } from "./types";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import DocumentsView from "./components/DocumentsView";
import ChatView from "./components/ChatView";
import NotesView from "./components/NotesView";
import FlashcardsView from "./components/FlashcardsView";
import QuizzesView from "./components/QuizzesView";
import PlannerView from "./components/PlannerView";
import SettingsView from "./components/SettingsView";
import AdminView from "./components/AdminView";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [documents, setDocuments] = useState<StudyDoc[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");

  // Auth States
  const [isLoginView, setIsLoginView] = useState(true);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // App global loading
  const [appLoading, setAppLoading] = useState(true);

  // Fetch initial profile context if authenticated or check default auth
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/profile", {
        headers: { "x-user-id": "user-123" } // Fallback to seed user id for preview seamlessness
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setTheme(data.user.settings?.theme || "light");
        fetchDocuments(data.user.id);
        fetchNotifications(data.user.id);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch Documents
  const fetchDocuments = async (userId: string) => {
    try {
      const response = await fetch("/api/documents", {
        headers: { "x-user-id": userId }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        headers: { "x-user-id": userId }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (!user) return;
    try {
      await fetch("/api/notifications/read", {
        method: "PUT",
        headers: { "x-user-id": user.id }
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Authentication Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const url = isLoginView ? "/api/auth/login" : "/api/auth/register";
    const body = isLoginView 
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setTheme(data.user.settings?.theme || "light");
        fetchDocuments(data.user.id);
        fetchNotifications(data.user.id);
        // Clear fields
        setAuthPassword("");
        setAuthError("");
      } else {
        const data = await response.json();
        setAuthError(data.error || "Authentication declined.");
      }
    } catch (err) {
      setAuthError("Auth service connection timeout.");
    } finally {
      setAuthLoading(false);
    }
  };

  // One-Click Onboarding Demo Bypass
  const handleDemoLogin = async (role: "student" | "admin") => {
    setAuthLoading(true);
    setAuthError("");
    const demoEmail = role === "admin" ? "admin@studycompanion.edu" : "student@studycompanion.edu";
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "password123" })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setTheme(data.user.settings?.theme || "light");
        fetchDocuments(data.user.id);
        fetchNotifications(data.user.id);
      }
    } catch (err) {
      setAuthError("Failed to authenticate seed session.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const syncProfileContext = () => {
    if (user) {
      checkAuthStatus();
    }
  };

  if (appLoading) {
    return (
      <div className="h-screen w-screen bg-[#0b0f19] flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">
          Mounting AI Study Workspace...
        </p>
      </div>
    );
  }

  // Not Logged In screen
  if (!user) {
    return (
      <div className="h-screen w-screen bg-[#070a13] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glow Spheres */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[120px] -top-10 -left-10"></div>
        <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[120px] -bottom-10 -right-10"></div>

        <div className="w-full max-w-md rounded-3xl bg-[#0f1423]/70 border border-gray-800/80 backdrop-blur-xl p-8 relative z-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white">
              AI Study Assistant
            </h1>
            <p className="text-xs text-gray-400">
              Intelligent Learning Companion & Syllabus RAG Tutor
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginView && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border border-gray-800 bg-[#161d30]/50 text-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border border-gray-800 bg-[#161d30]/50 text-white focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border border-gray-800 bg-[#161d30]/50 text-white focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <LogIn className="w-4 h-4" />
              <span>{authLoading ? "Verifying Credentials..." : isLoginView ? "Sign In to Hub" : "Create Account"}</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-gray-400 hover:text-indigo-400 font-medium cursor-pointer"
            >
              {isLoginView ? "Create an account" : "Sign in to existing account"}
            </button>
          </div>

          <div className="border-t border-gray-800/80 pt-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">
              Onboard via Sandbox Quick Credentials
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer hover:bg-indigo-500/20 transition-all"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer hover:bg-rose-500/20 transition-all"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged In Shell viewport
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen w-screen transition-colors duration-300 font-sans ${
      isDark ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        theme={theme} 
        onLogout={handleLogout}
      />

      {/* Main Container Wrapper */}
      <div className="pl-64">
        {/* Top Header bar */}
        <Navbar 
          user={user} 
          theme={theme} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          onMarkNotificationsAsRead={handleMarkNotificationsRead}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic Inner Viewport Panel */}
        <main className="pt-22 pb-10 px-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardView 
                user={user} 
                theme={theme} 
                documents={documents} 
                setActiveTab={setActiveTab}
                onUploadClicked={() => setActiveTab("documents")}
              />
            )}

            {activeTab === "documents" && (
              <DocumentsView 
                documents={documents} 
                theme={theme} 
                onDocumentUploaded={() => {
                  fetchDocuments(user.id);
                  fetchNotifications(user.id);
                }}
                user={user}
              />
            )}

            {activeTab === "chat" && (
              <ChatView 
                documents={documents} 
                user={user} 
                theme={theme} 
              />
            )}

            {activeTab === "notes" && (
              <NotesView 
                documents={documents} 
                user={user} 
                theme={theme} 
              />
            )}

            {activeTab === "flashcards" && (
              <FlashcardsView 
                documents={documents} 
                user={user} 
                theme={theme} 
                onUpdated={syncProfileContext}
              />
            )}

            {activeTab === "quiz" && (
              <QuizzesView 
                documents={documents} 
                user={user} 
                theme={theme} 
                onUpdated={syncProfileContext}
              />
            )}

            {activeTab === "planner" && (
              <PlannerView 
                user={user} 
                theme={theme} 
                onUpdated={syncProfileContext}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView 
                user={user} 
                theme={theme} 
                setTheme={setTheme}
                onProfileUpdated={syncProfileContext}
              />
            )}

            {activeTab === "admin" && (
              <AdminView 
                user={user} 
                theme={theme} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
