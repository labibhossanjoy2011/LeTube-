import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import { Home, Sparkles, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = usePlatform();
  const { user } = useAuth();

  const tabs = [
    { id: 'home', label: user?.settings.language === 'bn' ? 'হোম' : 'Home', icon: Home },
    { id: 'ai_assistant', label: user?.settings.language === 'bn' ? 'এআই সহকারী' : 'AI Assistant', icon: Sparkles },
    { id: 'account', label: user?.settings.language === 'bn' ? 'অ্যাকাউন্ট' : 'Account', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-6 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'account' && activeTab === 'settings');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 scale-105 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-rose-50 dark:bg-rose-950/40' : ''}`}>
                <Icon className={`w-5 h-5 ${tab.id === 'ai_assistant' && isActive ? 'animate-spin text-amber-500' : ''}`} />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
