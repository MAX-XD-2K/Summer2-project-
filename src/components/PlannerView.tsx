import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, CheckCircle, Flame, Plus, Sparkles, 
  BookMarked, ChevronRight, Check, AlertCircle, RefreshCw 
} from "lucide-react";
import { StudyPlan } from "../types";

interface PlannerViewProps {
  user: any;
  theme: "light" | "dark";
  onUpdated: () => void;
}

export default function PlannerView({ user, theme, onUpdated }: PlannerViewProps) {
  const isDark = theme === "dark";
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Configuration Fields
  const [examDate, setExamDate] = useState("2026-07-20");
  const [targetHours, setTargetHours] = useState(3);
  const [subjects, setSubjects] = useState("Operating Systems, Computer Networks");
  const [creating, setCreating] = useState(false);

  // Calculate completion metrics on-the-fly to align with backend StudyPlan schema
  const totalTopics = plan?.schedule?.reduce((acc, day) => acc + (day.topics?.length || 0), 0) || 0;
  const completedTopics = plan?.schedule?.reduce(
    (acc, day) => acc + (day.topics?.filter((t) => t.completed).length || 0),
    0
  ) || 0;
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  useEffect(() => {
    async function loadPlan() {
      try {
        const response = await fetch("/api/planner", {
          headers: { "x-user-id": user?.id || "user-123" }
        });
        if (response.ok) {
          const data = await response.json();
          setPlan(data.plan);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [user]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({
          examDate,
          dailyStudyHours: targetHours,
          subjects: subjects.split(",").map((s) => s.trim())
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
        onUpdated(); // Refresh global level / streak
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (dayIndex: number, topicIndex: number, field: "completed" | "missed") => {
    if (!plan) return;
    
    // Copy and update state optimistically
    const updatedSchedule = (plan.schedule || []).map((day, dIdx) => {
      if (dIdx !== dayIndex) return day;
      return {
        ...day,
        topics: (day.topics || []).map((topic, tIdx) => {
          if (tIdx !== topicIndex) return topic;
          if (field === "completed") {
            const nextCompleted = !topic.completed;
            return {
              ...topic,
              completed: nextCompleted,
              missed: nextCompleted ? false : topic.missed
            };
          } else {
            const nextMissed = !topic.missed;
            return {
              ...topic,
              missed: nextMissed,
              completed: nextMissed ? false : topic.completed
            };
          }
        })
      };
    });

    setPlan({
      ...plan,
      schedule: updatedSchedule
    });

    try {
      const response = await fetch("/api/planner/toggle", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({ dayIndex, topicIndex, field })
      });
      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
        onUpdated(); // Refresh global stats, XP, level, badges, etc.
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-800 rounded-2xl"></div>
          <div className="h-64 bg-gray-800 rounded-2xl md:col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight">Personalized Study Planner</h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Configure your target exam syllabus schedules and track daily revision progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Plan Configuration Card */}
        <div className={`p-5 rounded-2xl border h-fit ${
          isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
            <span>AI Syllabus Scheduler</span>
          </h3>

          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Upcoming Exam Date</label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Target Daily Study Hours</label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Syllabus Subjects (comma separated)</label>
              <input
                type="text"
                required
                placeholder="e.g. Operating Systems, Networks, DBs"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {creating ? "Generating Study Calendar..." : "Compile AI Study Plan"}
            </button>
          </form>
        </div>

        {/* Right Pane: Day schedule items */}
        <div className="lg:col-span-2">
          {plan ? (
            <div className="space-y-4">
              {/* Progress Summary KPI */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200"
              }`}>
                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
                  <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>Exam Revision Completion Tracker</span>
                  <span className="text-indigo-500 font-mono font-bold">{progressPercentage}% Complete</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-850" : "bg-gray-100"}`}>
                  <div 
                    style={{ width: `${progressPercentage}%` }}
                    className="h-full bg-indigo-600 transition-all duration-300"
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-semibold text-gray-500 font-mono text-center">
                  <div className={`p-2 border rounded-lg ${isDark ? "border-gray-800/50" : "border-gray-200"}`}>
                    <span className={`block text-xs font-bold ${isDark ? "text-gray-300" : "text-gray-750"}`}>{plan.dailyStudyHours || plan.dailyStudyHours === 0 ? plan.dailyStudyHours : targetHours}h</span>
                    <span>Daily Target</span>
                  </div>
                  <div className={`p-2 border rounded-lg ${isDark ? "border-gray-800/50" : "border-gray-200"}`}>
                    <span className={`block text-xs font-bold ${isDark ? "text-gray-300" : "text-gray-750"}`}>{plan.subjects?.length || 0}</span>
                    <span>Syllabus Subjects</span>
                  </div>
                  <div className={`p-2 border rounded-lg ${isDark ? "border-gray-800/50" : "border-gray-200"}`}>
                    <span className={`block text-xs font-bold ${isDark ? "text-gray-300" : "text-gray-750"}`}>
                      {new Date(plan.examDate).toLocaleDateString()}
                    </span>
                    <span>Target Exam</span>
                  </div>
                </div>
              </div>

              {/* Day-by-Day schedule list */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 font-display">Chronological Revision Schedule</h3>
                
                {(plan.schedule || []).map((dayItem, dayIndex) => (
                  <div 
                    key={`${dayItem.day || 'day'}-${dayIndex}`}
                    className={`p-4 rounded-2xl border ${
                      isDark ? "bg-[#111625] border-gray-800/80" : "bg-white border-gray-200 shadow-xs"
                    }`}
                  >
                    <h4 className={`text-xs font-bold font-display uppercase tracking-wider mb-2.5 ${
                      isDark ? "text-indigo-400" : "text-indigo-600"
                    }`}>
                      {dayItem.day}
                    </h4>

                    <div className="space-y-2">
                      {(dayItem.topics || []).map((topicItem, topicIndex) => {
                        const isCompleted = !!topicItem.completed;
                        const isMissed = !!topicItem.missed;
                        const uniqueKey = `${dayItem.day || 'day'}-${dayIndex}-${topicIndex}`;
                        return (
                          <div 
                            key={uniqueKey}
                            onClick={() => handleToggleTask(dayIndex, topicIndex, "completed")}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 group ${
                              isCompleted
                                ? (isDark ? "bg-emerald-950/15 border-emerald-900/50 text-gray-400" : "bg-emerald-50/40 border-emerald-150 text-slate-500")
                                : isMissed
                                ? (isDark ? "bg-rose-950/15 border-rose-900/40 text-gray-400" : "bg-rose-50/40 border-rose-150 text-slate-500")
                                : isDark ? "bg-[#161e31]/60 border-gray-800/60 hover:border-gray-700 hover:bg-[#161e31]" : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 transition-all ${
                                isCompleted 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : isDark ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400 bg-white"
                              }`}>
                                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>

                              <div className="min-w-0">
                                <p className={`text-xs font-semibold truncate ${
                                  isCompleted 
                                    ? "line-through text-gray-500" 
                                    : isDark ? "text-white" : "text-slate-800"
                                }`}>
                                  {topicItem.topic}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTask(dayIndex, topicIndex, "missed");
                                }}
                                className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-lg uppercase tracking-wide transition-all border ${
                                  isMissed
                                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                    : isDark
                                    ? "bg-gray-800/30 text-gray-400 border-transparent hover:text-rose-400 hover:bg-rose-500/10"
                                    : "bg-gray-100 text-gray-500 border-transparent hover:text-rose-600 hover:bg-rose-50"
                                }`}
                              >
                                {isMissed ? "Missed" : "Mark Missed"}
                              </button>

                              <span className={`text-[9px] font-bold font-mono px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                                isCompleted 
                                  ? (isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "bg-emerald-50 text-emerald-700 border border-emerald-200") 
                                  : (isDark ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10" : "bg-indigo-50 text-indigo-700 border border-indigo-200")
                              }`}>
                                {isCompleted ? "Done" : "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`p-10 rounded-2xl border text-center py-20 ${
              isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-xs"
            }`}>
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Configure your parameters and trigger 'Compile AI Study Plan' to generate your study calendar!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
