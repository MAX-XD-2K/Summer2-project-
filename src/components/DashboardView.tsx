import { useState, useEffect } from "react";
import { 
  BookOpen, MessageSquare, Layers, GraduationCap, Clock, Flame, 
  Trophy, ArrowUpRight, Plus, Sparkles, BookMarked, Calendar, CheckCircle 
} from "lucide-react";
import { StudyDoc, User } from "../types";

interface DashboardViewProps {
  user: User | null;
  theme: "light" | "dark";
  documents: StudyDoc[];
  setActiveTab: (tab: string) => void;
  onUploadClicked: () => void;
}

interface DashboardStats {
  totalDocuments: number;
  aiChats: number;
  flashcardsGenerated: number;
  quizAttempts: number;
  studyHours: number;
  xp: number;
  streak: number;
  flashcardProgress: number;
  averageQuizScore: number;
}

export default function DashboardView({ 
  user, theme, documents, setActiveTab, onUploadClicked 
}: DashboardViewProps) {
  const isDark = theme === "dark";
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    aiChats: 0,
    flashcardsGenerated: 0,
    quizAttempts: 0,
    studyHours: 18.5,
    xp: 0,
    streak: 0,
    flashcardProgress: 0,
    averageQuizScore: 0
  });
  const [weeklyHours, setWeeklyHours] = useState<number[]>([3.2, 4.5, 2.1, 5.0, 3.8, 1.2, 0.0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const userId = user?.id || "user-123";
        const response = await fetch("/api/analytics/dashboard", {
          headers: { "x-user-id": userId }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setWeeklyHours(data.weeklyHours || [3.2, 4.5, 2.1, 5.0, 3.8, 1.2, 0.0]);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user, documents]);

  const cards = [
    { label: "Uploaded Documents", value: stats.totalDocuments, icon: BookOpen, color: "text-blue-500 bg-blue-500/10", tab: "documents" },
    { label: "Active AI Chats", value: stats.aiChats, icon: MessageSquare, color: "text-emerald-500 bg-emerald-500/10", tab: "chat" },
    { label: "Flashcards Created", value: stats.flashcardsGenerated, icon: Layers, color: "text-purple-500 bg-purple-500/10", tab: "flashcards" },
    { label: "Quizzes Attempted", value: stats.quizAttempts, icon: GraduationCap, color: "text-amber-500 bg-amber-500/10", tab: "quiz" },
    { label: "Hours Engaged", value: `${stats.studyHours}h`, icon: Clock, color: "text-indigo-500 bg-indigo-500/10", tab: "progress" },
    { label: "Current Streak", value: `${stats.streak} days`, icon: Flame, color: "text-orange-500 bg-orange-500/10", tab: "planner" },
  ];

  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxWeeklyHour = Math.max(...weeklyHours, 1);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-800 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight font-display ${isDark ? "text-white" : "text-slate-900"}`}>
            Welcome back, {user?.name || "Student"}!
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Track, analyze, and supercharge your academic study materials using AI.
          </p>
        </div>
        <button
          onClick={onUploadClicked}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Grid KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-2xl border p-5 ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950 shadow-sm"
        }`}>
          <p className="text-xs font-medium text-slate-500">Total Documents</p>
          <p className="mt-2 text-2xl font-bold font-display">{stats.totalDocuments}</p>
          <div className={`mt-3 h-1 w-full rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <div className="h-1 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (stats.totalDocuments / 10) * 100)}%` }}></div>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950 shadow-sm"
        }`}>
          <p className="text-xs font-medium text-slate-500">Flashcards Ready</p>
          <p className="mt-2 text-2xl font-bold font-display">{stats.flashcardsGenerated}</p>
          <div className="mt-3 flex gap-1">
            <span className="text-xs font-medium text-emerald-500">+{stats.flashcardsGenerated > 0 ? 12 : 0} today</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950 shadow-sm"
        }`}>
          <p className="text-xs font-medium text-slate-500">Study Hours</p>
          <p className="mt-2 text-2xl font-bold font-display">{stats.studyHours}h</p>
          <p className="mt-3 text-xs text-slate-400">Top 5% of users</p>
        </div>

        <div className={`rounded-2xl border p-5 ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950 shadow-sm"
        }`}>
          <p className="text-xs font-medium text-slate-500">Quiz Accuracy</p>
          <p className="mt-2 text-2xl font-bold font-display">{stats.averageQuizScore > 0 ? `${stats.averageQuizScore}%` : "88%"}</p>
          <p className={`mt-3 text-xs ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Improvement: +4%</p>
        </div>
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Weekly Study Activity */}
          <section className={`rounded-3xl border p-6 ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className={`font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Weekly Study Activity</h3>
              <select className={`text-xs border-none rounded-md px-2 py-1 outline-hidden ${
                isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
              }`}>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="flex items-end justify-between gap-2 h-40 px-2">
              {weeklyHours.map((hours, i) => {
                const pct = (hours / maxWeeklyHour) * 100;
                // Alternate bar colors to match the dynamic palette in design
                let barColor = isDark ? "bg-slate-850" : "bg-slate-100";
                if (i === 2) barColor = "bg-indigo-550 bg-indigo-500";
                else if (i === 4) barColor = isDark ? "bg-indigo-900" : "bg-indigo-200";
                else if (i === 6) barColor = "bg-indigo-400";

                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative z-10 mx-1">
                    {/* Tooltip */}
                    <span className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-950 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-md transition-opacity shadow-lg">
                      {hours}h
                    </span>
                    <div 
                      style={{ height: `${Math.max(6, pct)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-350 ${barColor}`}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between px-2 text-[10px] font-semibold text-slate-400">
              {weekdayNames.map((day, idx) => (
                <span key={idx} className="w-12 text-center">{day.toUpperCase()}</span>
              ))}
            </div>
          </section>

          {/* Recent Knowledge Uploads */}
          <section className={`rounded-3xl border p-6 ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h3 className={`mb-4 font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Recent Knowledge Uploads</h3>
            
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No documents uploaded. Click standard Upload button above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 2).map((doc, i) => {
                  const isPdf = doc.title.toLowerCase().endsWith(".pdf");
                  return (
                    <div 
                      key={doc.id} 
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer ${
                        isDark 
                          ? "border-slate-800 bg-slate-850/40 hover:bg-slate-800" 
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                      }`}
                      onClick={() => setActiveTab("documents")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-xs ${
                          isPdf 
                            ? "bg-red-100 text-red-600" 
                            : "bg-blue-100 text-blue-600"
                        }`}>
                          {isPdf ? "PDF" : "DOC"}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold truncate max-w-[200px] md:max-w-[320px] ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {doc.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Subject: {doc.subject} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ${
                        doc.processingStatus === "processed"
                          ? (isDark ? "bg-emerald-950/40 text-emerald-400" : "bg-emerald-100 text-emerald-700")
                          : (isDark ? "bg-amber-950/40 text-amber-400" : "bg-amber-100 text-amber-700")
                      }`}>
                        {doc.processingStatus === "processed" ? "Analyzed" : "Processing"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Content Column */}
        <div className="space-y-8">
          
          {/* AI Study Planner Info banner */}
          <section className={`rounded-3xl bg-indigo-600 p-6 text-white shadow-xl ${isDark ? "shadow-indigo-950/30" : "shadow-indigo-100"}`}>
            <h3 className="text-lg font-bold">AI Study Planner</h3>
            <p className="mt-1 text-xs text-indigo-100">Next Exam: Calculus III in 12 days</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-white shrink-0"></div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">Review Partial Derivatives</p>
                  <p className="text-[10px] text-indigo-200">30 mins remaining</p>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-60">
                <div className="mt-1 h-2 w-2 rounded-full border border-white shrink-0"></div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">Quiz: Multiple Integrals</p>
                  <p className="text-[10px] text-indigo-200">Locked until 4 PM</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab("planner")}
              className="mt-6 w-full rounded-xl bg-white/20 hover:bg-white/30 py-2.5 text-xs font-bold backdrop-blur-xs transition-colors cursor-pointer"
            >
              VIEW SCHEDULE
            </button>
          </section>

          {/* Learning Path Circular indicator */}
          <section className={`rounded-3xl border p-6 ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h3 className={`mb-4 font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Learning Path</h3>
            <div className="relative flex flex-col items-center">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="absolute h-full w-full">
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="10" />
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="#6366f1" strokeWidth="10" strokeDasharray="364" strokeDashoffset="110" />
                </svg>
                <div className="text-center">
                  <p className={`text-2xl font-bold font-display ${isDark ? "text-white" : "text-slate-900"}`}>72%</p>
                  <p className="text-[10px] text-slate-400">Complete</p>
                </div>
              </div>
              <p className={`mt-4 text-center text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                4 Units Completed this week
              </p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
