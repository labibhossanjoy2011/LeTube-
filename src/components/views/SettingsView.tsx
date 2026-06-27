import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { Settings, Globe, Moon, Sun, Play, Shield, Sparkles, Trash2, PauseCircle, Check, Crown, RotateCcw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateSettings, clearHistory, loginAsDemo } = useAuth();
  const { setActiveTab } = usePlatform();

  const [notificationToggle, setNotificationToggle] = useState(true);
  const [showToast, setShowToast] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-500">
        Please sign in to configure personalized streaming settings.
      </div>
    );
  }

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const toggleDark = () => {
    const next = !user.settings.darkMode;
    updateSettings({ darkMode: next });
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    triggerToast(`Theme updated to ${next ? 'Dark' : 'Light'}`);
  };

  const handleResetRecommendations = async () => {
    await clearHistory('all');
    triggerToast("AI Recommendations reset to initial onboarding baseline!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{showToast}</span>
        </div>
      )}

      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-rose-500" />
          <span>{user.settings.language === 'bn' ? 'সেটিংস ও নিয়ন্ত্রণ' : 'Platform Settings'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Manage playback behavior, AI neural filters, and privacy controls</p>
      </div>

      {/* Quick Admin Demo Persona Switcher Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-md">
            👑
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-white block">Reviewer Admin Demonstration Mode</span>
            <span className="text-xs text-slate-500">Need to test Admin Studio video publishing permissions? Switch instantly below.</span>
          </div>
        </div>
        <button
          onClick={async () => {
            await loginAsDemo('admin');
            triggerToast("Switched to Labib Hossan Joy (Platform Admin)!");
            setActiveTab('admin');
          }}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shrink-0 shadow-md hover:bg-rose-700 cursor-pointer"
        >
          Activate Admin Permissions
        </button>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: GENERAL SETTINGS */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="w-4 h-4" /> General Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Language */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Platform Language</span>
                <span className="text-[11px] text-slate-400">Audio recommendations & Assistant UI</span>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => {
                    updateSettings({ language: 'en' });
                    triggerToast("Language changed to English");
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${user.settings.language === 'en' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs' : 'text-slate-500'}`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    updateSettings({ language: 'bn' });
                    triggerToast("ভাষা বাংলা করা হয়েছে");
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${user.settings.language === 'bn' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs' : 'text-slate-500'}`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Appearance Mode</span>
                <span className="text-[11px] text-slate-400">Toggle light / dark visual canvas</span>
              </div>
              <button
                onClick={toggleDark}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs font-bold cursor-pointer"
              >
                {user.settings.darkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>{user.settings.darkMode ? 'Dark Slate' : 'Clean Light'}</span>
              </button>
            </div>

          </div>
        </section>

        {/* SECTION 2: PLAYBACK SETTINGS */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Play className="w-4 h-4" /> Video Playback
          </h2>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Autoplay Next Recommended Video</span>
                <span className="text-[11px] text-slate-400">Automatically advance stream at video end</span>
              </div>
              <input
                type="checkbox"
                checked={user.settings.autoplay}
                onChange={(e) => updateSettings({ autoplay: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Resume from Last Watched Position</span>
                <span className="text-[11px] text-slate-400">Remember timestamp across devices</span>
              </div>
              <input
                type="checkbox"
                checked={user.settings.resumePlayback}
                onChange={(e) => updateSettings({ resumePlayback: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Default Streaming Resolution</span>
                <span className="text-[11px] text-slate-400">Preferred video clarity</span>
              </div>
              <select
                value={user.settings.defaultQuality}
                onChange={(e) => updateSettings({ defaultQuality: e.target.value as any })}
                className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl text-xs font-bold border-none"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p Data Saver</option>
              </select>
            </div>

          </div>
        </section>

        {/* SECTION 3: PRIVACY & PERSONALIZATION CONTROLS */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4" /> Privacy & AI Personalization Engine
          </h2>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Pause Neural Watch History Logging</span>
                <span className="text-[11px] text-slate-400">Stops AI recommendation inference updates</span>
              </div>
              <input
                type="checkbox"
                checked={user.settings.pauseHistory}
                onChange={(e) => updateSettings({ pauseHistory: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Clear Watch & Search History</span>
                <span className="text-[11px] text-slate-400">Wipes local and cloud logs</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { clearHistory('watch'); triggerToast('Watch history cleared'); }} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs hover:text-rose-600">Clear Watch</button>
                <button onClick={() => { clearHistory('search'); triggerToast('Search history cleared'); }} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs hover:text-rose-600">Clear Search</button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Reset AI Recommendation Weights</span>
                <span className="text-[11px] text-slate-400">Reverts personalization to initial onboarding interests</span>
              </div>
              <button
                onClick={handleResetRecommendations}
                className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset AI Weights</span>
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
