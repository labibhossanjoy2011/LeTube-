import React, { useState, useRef, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Video as VideoIcon, User, ShieldAlert, Sparkles, Mic, X, Check, Globe, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, notifications, unreadNotifCount, markNotificationRead } = usePlatform();
  const { user, loginWithGoogle, loginAsDemo } = useAuth();
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [showDemoLoginModal, setShowDemoLoginModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
      setShowSearchSuggestions(false);
    }
  };

  const handleVoiceSearch = () => {
    setIsListeningVoice(true);
    // Simulate Web Speech API voice search recognition
    setTimeout(() => {
      const simulatedQueries = ['Next.js server components', 'Islamic mindfulness salah', 'bootstrap vs venture capital', 'quantum ai hardware'];
      const randomQ = simulatedQueries[Math.floor(Math.random() * simulatedQueries.length)];
      setSearchQuery(randomQ);
      setIsListeningVoice(false);
      setActiveTab('search');
    }, 1800);
  };

  const trendingSuggestions = ['Quantum Computing', 'Next.js 16', 'Salah Khushu', 'SaaS ARR', 'James Webb Telescope'];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <VideoIcon className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Stream<span className="text-rose-600 dark:text-rose-400">Mind</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block -mt-1">AI Video Platform</span>
            </div>
          </div>

          {/* Search Bar (Desktop & Tablet) */}
          <div className="flex-1 max-w-2xl hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(true)}
                  placeholder={user?.settings.language === 'bn' ? "ভিডিও, টপিক বা ট্যাগ অনুসন্ধান করুন..." : "Search premium videos, topics, or AI tags..."}
                  className="w-full pl-10 pr-20 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-slate-900 text-sm focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${isListeningVoice ? 'bg-rose-600 text-white animate-pulse' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Smart Search Suggestions Autocomplete Dropdown */}
            {showSearchSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>🔥 {user?.settings.language === 'bn' ? 'ট্রেন্ডিং অনুসন্ধান' : 'Trending Searches'}</span>
                  <button onClick={() => setShowSearchSuggestions(false)} className="text-slate-400 hover:text-slate-600 text-[11px] font-normal">Close</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {trendingSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSearchQuery(sug);
                        setActiveTab('search');
                        setShowSearchSuggestions(false);
                      }}
                      className="px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <Search className="w-3.5 h-3.5 text-rose-500" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Navigation & Profile Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Button */}
            <button 
              onClick={() => setActiveTab('search')} 
              className="md:hidden p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Assistant Quick Pill */}
            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs ${
                activeTab === 'ai_assistant'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" style={{ animationDuration: '4s' }} />
              <span>{user?.settings.language === 'bn' ? 'এআই সহকারী' : 'AI Assistant'}</span>
            </button>

            {/* Admin Publishing Portal Link (If Admin) */}
            {user?.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeTab === 'admin'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/30'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Studio</span>
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-500" /> Notifications
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{unreadNotifCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.videoId) setActiveTab('home'); // or open player
                          }}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors ${!n.read ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-xs text-slate-900 dark:text-white">{n.title}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authentication / User Profile Button */}
            {user ? (
              <div 
                onClick={() => setActiveTab('account')} 
                className={`flex items-center gap-2 p-1 pr-2.5 rounded-full cursor-pointer transition-all border ${
                  activeTab === 'account' || activeTab === 'settings'
                    ? 'bg-rose-50 dark:bg-slate-800 border-rose-300 dark:border-rose-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-500/20"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-md hover:bg-slate-800 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => setShowDemoLoginModal(true)}
                  className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-xs font-medium hidden sm:flex items-center gap-1"
                  title="One-Click Demo Accounts"
                >
                  <span>⚡ Demo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Voice search simulation alert banner */}
      {isListeningVoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-rose-500/30">
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-4 animate-ping">
              <Mic className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Listening to your voice...</h3>
            <p className="text-sm text-slate-500">Say a topic or video query in English or বাংলা</p>
          </div>
        </div>
      )}

      {/* Instant Demo Accounts Selector Modal */}
      {showDemoLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                ⚡ Instant One-Click Demo Sign-In
              </h3>
              <button onClick={() => setShowDemoLoginModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              To bypass third-party iframe cookie restrictions in preview mode, choose a verified persona to test 100% of platform features instantly:
            </p>
            <div className="grid grid-cols-1 gap-3 mt-4">
              <button
                onClick={async () => {
                  await loginAsDemo('admin');
                  setShowDemoLoginModal(false);
                }}
                className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/30 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-left hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">👑</div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">Labib Hossan Joy (Platform Admin)</span>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Full access: Watch feed + Admin Studio video publishing</span>
                </div>
              </button>

              <button
                onClick={async () => {
                  await loginAsDemo('viewer');
                  setShowDemoLoginModal(false);
                }}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center gap-3 text-left hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">👤</div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">Arafat Rahman (Regular Viewer)</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Standard user: Watch, AI chat, like, save recommendations</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
