import React, { useState, useEffect } from "react";
import { 
  Settings, User, Bell, Volume2, Moon, Sun, ShieldCheck, Save, CheckCircle 
} from "lucide-react";
import { UserSettings } from "../types";

interface SettingsViewProps {
  user: any;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  onProfileUpdated: () => void;
}

export default function SettingsView({ user, theme, setTheme, onProfileUpdated }: SettingsViewProps) {
  const isDark = theme === "dark";
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", {
          headers: { "x-user-id": user?.id || "user-123" }
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }

        if (user) {
          setName(user.name);
          setEmail(user.email);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      // Save settings
      const respSet = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify(settings)
      });

      // Save Profile
      const respProf = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({ name, email })
      });

      if (respSet.ok && respProf.ok) {
        onProfileUpdated();
        alert("Personal profile preferences and system settings synced successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded-lg w-1/4"></div>
        <div className="h-64 bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight">System & Account Settings</h2>
        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Modify your avatar details, theme options, voice synthesis parameters, and system configs.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Card 1: Student Profile */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-indigo-500" />
            <span>Personal Profile Capsule</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Aesthetic Themes */}
        {settings && (
          <div className={`p-5 rounded-2xl border ${
            isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
              <Sun className="w-4.5 h-4.5 text-amber-500" />
              <span>Theme Preferences</span>
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">Toggle Color Theme</p>
                <p className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Choose between a focused Dark theme or standard Light theme.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetTheme = theme === "dark" ? "light" : "dark";
                  setTheme(targetTheme);
                  setSettings({ ...settings, theme: targetTheme });
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700 shadow-sm"
                }`}
              >
                {theme === "dark" ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                    <Moon className="w-4 h-4 text-indigo-400" /> <span>DARK</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                    <Sun className="w-4 h-4 text-amber-500" /> <span>LIGHT</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Card 3: TTS parameters */}
        {settings && (
          <div className={`p-5 rounded-2xl border ${
            isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
              <Volume2 className="w-4.5 h-4.5 text-emerald-500" />
              <span>Syllabus Voice synthesis speed</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Voice Velocity RateMultiplier</span>
                  <span className="font-mono text-emerald-500">{settings.voiceSpeed}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={settings.voiceSpeed}
                  onChange={(e) => setSettings({ ...settings, voiceSpeed: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-xs font-semibold">Enable Audio Speech Playback</p>
                  <p className="text-[10px] text-gray-500">Play spoken definitions when viewing cards.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.speechToTextEnabled}
                  onChange={(e) => setSettings({ ...settings, speechToTextEnabled: e.target.checked })}
                  className="w-4.5 h-4.5 accent-indigo-600 rounded-md cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          {saving ? "Saving Configurations..." : "Sync System Configurations"}
        </button>

      </form>
    </div>
  );
}
