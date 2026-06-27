import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { VideoCard } from '../VideoCard';
import { User, Clock, Flame, Award, Heart, Bookmark, History, LogOut, Trash2, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export const AccountView: React.FC = () => {
  const { user, logout, deleteAccount, clearHistory } = useAuth();
  const { videos, setActiveTab } = usePlatform();

  const [activeProfileTab, setActiveProfileTab] = useState<'history' | 'saved' | 'liked'>('history');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl text-center space-y-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-xs text-slate-500">Sign in with Google to view your watch history, saved streams, and active AI streaks.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const formatWatchTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} mins`;
  };

  const savedVideosList = videos.filter(v => user.savedVideoIds.includes(v.id));
  const likedVideosList = videos.filter(v => user.likedVideoIds.includes(v.id));

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-300">
      
      {/* Profile Header Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={user.photoURL}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-500/40 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black">{user.name}</h1>
                {user.isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-[10px] font-bold uppercase tracking-wider">
                    Platform Admin
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono block">{user.email}</span>
              <span className="text-[11px] text-slate-400 block pt-1">
                Joined: {new Date(user.joinedAt).toLocaleDateString()} • Preferred Lang: <strong className="uppercase text-amber-400">{user.preferredLanguage}</strong>
              </span>
            </div>
          </div>

          {/* Account Settings & Auth Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            >
              <span>⚙️ Settings</span>
            </button>

            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-center sm:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <History className="w-3 h-3 text-rose-500" /> Videos Watched
            </span>
            <span className="text-2xl font-black mt-1 block text-white">{user.stats.totalVideosWatched}</span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-center sm:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Watch Time
            </span>
            <span className="text-2xl font-black mt-1 block text-amber-300">{formatWatchTime(user.stats.totalWatchTimeSeconds)}</span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-center sm:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Flame className="w-3 h-3 text-orange-500" /> Active Streak
            </span>
            <span className="text-2xl font-black mt-1 block text-orange-400">{user.stats.activeStreakDays} days 🔥</span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-center sm:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Award className="w-3 h-3 text-purple-400" /> Favorite Category
            </span>
            <span className="text-lg font-bold mt-2 block text-purple-300 truncate">{user.stats.favoriteCategory}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (History, Saved, Liked) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveProfileTab('history')}
              className={`text-sm font-bold pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeProfileTab === 'history' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Watch History ({user.watchHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveProfileTab('saved')}
              className={`text-sm font-bold pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeProfileTab === 'saved' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-indigo-600'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Watchlist ({savedVideosList.length})</span>
            </button>

            <button
              onClick={() => setActiveProfileTab('liked')}
              className={`text-sm font-bold pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeProfileTab === 'liked' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-400 hover:text-rose-600'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Liked Streams ({likedVideosList.length})</span>
            </button>
          </div>

          {activeProfileTab === 'history' && user.watchHistory.length > 0 && (
            <button
              onClick={() => clearHistory('watch')}
              className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>

        {/* Tab Content Grids */}
        {activeProfileTab === 'history' && (
          user.watchHistory.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl">No watch history recorded yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {user.watchHistory.map((hist) => {
                const vid = videos.find(v => v.id === hist.videoId);
                if (!vid) return null;
                const progressPct = Math.min(100, Math.floor((hist.progressSeconds / (hist.durationSeconds || 1)) * 100));
                return (
                  <div key={vid.id} className="space-y-1.5">
                    <VideoCard video={vid} />
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden px-1">
                      <div className="bg-rose-600 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeProfileTab === 'saved' && (
          savedVideosList.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl">No saved streams in watchlist</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {savedVideosList.map((vid) => (
                <VideoCard key={vid.id} video={vid} />
              ))}
            </div>
          )
        )}

        {activeProfileTab === 'liked' && (
          likedVideosList.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl">No liked videos</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {likedVideosList.map((vid) => (
                <VideoCard key={vid.id} video={vid} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-mono"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Delete Account & Personal Profile Data
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-rose-500/40">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Delete Profile?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action permanently deletes your Google profile record, watch statistics, and AI recommendations from Firestore.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Cancel</button>
              <button
                onClick={async () => {
                  await deleteAccount();
                  setShowDeleteModal(false);
                  setActiveTab('home');
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
