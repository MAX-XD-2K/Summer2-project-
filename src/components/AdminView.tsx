import { useState, useEffect } from "react";
import { 
  ShieldAlert, Users, BookOpen, Clock, Activity, Trash2, 
  Settings, RefreshCw, Radio, CheckCircle, Database 
} from "lucide-react";

interface AdminViewProps {
  user: any;
  theme: "light" | "dark";
}

interface AdminStats {
  activeUsers: number;
  totalDocuments: number;
  averageResponseTime: string;
  totalStorageSize: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  streak: number;
  createdAt: string;
}

export default function AdminView({ user, theme }: AdminViewProps) {
  const isDark = theme === "dark";
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { "x-user-id": user?.id || "user-123" };
      
      const statsResp = await fetch("/api/admin/stats", { headers });
      const usersResp = await fetch("/api/admin/users", { headers });

      if (statsResp.ok && usersResp.ok) {
        const statsData = await statsResp.json();
        const usersData = await usersResp.json();
        setStats(statsData.stats);
        setUsers(usersData.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleDeleteUser = async (targetUserId: string) => {
    if (targetUserId === user?.id) {
      alert("You cannot delete your own administrative session!");
      return;
    }
    if (!confirm("Are you sure you want to delete this student's account permanently from the study assistant database?")) return;
    try {
      const response = await fetch(`/api/admin/users/${targetUserId}`, {
        method: "DELETE",
        headers: { "x-user-id": user?.id || "user-123" }
      });
      if (response.ok) {
        setUsers(users.filter((u) => u.id !== targetUserId));
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">
            Administrative Control Panel
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Secure console to audit global users, system telemetries, document storage, and system processing health.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl border border-gray-800 hover:border-gray-700 hover:bg-gray-800/20 text-gray-400 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex justify-between items-center text-indigo-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Active Cohorts</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold font-display mt-2">{stats.activeUsers}</p>
            <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-semibold">Registered students</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex justify-between items-center text-blue-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Course Ingestions</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold font-display mt-2">{stats.totalDocuments}</p>
            <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-semibold">Processed materials</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex justify-between items-center text-emerald-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">AI Latency</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold font-display mt-2">{stats.averageResponseTime}</p>
            <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-semibold">Gemini compilation</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex justify-between items-center text-amber-500">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Vector Storage</span>
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold font-display mt-2">{stats.totalStorageSize}</p>
            <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-semibold">Disk nodes utilized</p>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold font-display flex items-center gap-2">
            <Radio className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
            <span>Audit Student Roster</span>
          </h3>
          <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">
            Total users: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                isDark ? "text-gray-400 border-gray-800" : "text-gray-500 border-gray-200"
              }`}>
                <th className="pb-3 pl-2">Student Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">System Role</th>
                <th className="pb-3">Accumulated XP</th>
                <th className="pb-3">Streak</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-xs">
              {users.map((u) => (
                <tr key={u.id} className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <td className="py-3.5 pl-2 font-semibold text-white">{u.name}</td>
                  <td className="py-3.5 font-mono text-gray-400">{u.email}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${
                      u.role === "admin" 
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-gray-400">{u.xp} XP</td>
                  <td className="py-3.5 text-orange-500 font-mono font-bold">{u.streak} days</td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user?.id}
                      className="p-1.5 rounded-lg border border-gray-800 hover:border-gray-700 text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 cursor-pointer"
                      title="Decommission User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
