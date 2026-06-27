import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../lib/data';
import { Sparkles, Check, ArrowRight, Globe, Tag } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  
  const [step, setStep] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<'en' | 'bn'>('en');
  const [selectedCats, setSelectedCats] = useState<string[]>(['Technology', 'Programming']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['AI Tutorials', 'Startup SaaS', 'Islamic Lectures']);

  if (!user || user.hasCompletedOnboarding) return null;

  const interestOptions = [
    'AI Tutorials', 'React Next.js', 'Startup SaaS', 'Venture Capital', 
    'Salah Mindfulness', 'Longevity Cardio', 'Quantum Hardware', 'Index Investing',
    'Unreal Engine VFX', 'CRISPR Gene Editing', 'Dopamine Detox', 'Seerah History'
  ];

  const handleToggleCat = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleToggleInterest = (intr: string) => {
    if (selectedInterests.includes(intr)) {
      setSelectedInterests(selectedInterests.filter(i => i !== intr));
    } else {
      setSelectedInterests([...selectedInterests, intr]);
    }
  };

  const handleSubmit = async () => {
    await completeOnboarding(selectedLang, selectedCats, selectedInterests);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> First-Time Personalization
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {selectedLang === 'bn' ? "আপনার পছন্দের বিষয় নির্বাচন করুন" : "Customize Your StreamMind Feed"}
          </h2>
          <p className="text-sm text-rose-100 mt-2 max-w-md mx-auto leading-relaxed">
            {selectedLang === 'bn' 
              ? "আমাদের এআই আপনার পছন্দের ক্যাটাগরি অনুযায়ী সবচেয়ে উপযুক্ত ভিডিও সাজিয়ে দেবে।"
              : "Tell our AI recommendation engine what you care about to generate instant, tailored video suggestions."}
          </p>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-rose-500" /> Preferred Audio/AI Language
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLang('en')}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      selectedLang === 'en'
                        ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>🇺🇸 English (Global)</span>
                    {selectedLang === 'en' && <Check className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLang('bn')}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      selectedLang === 'bn'
                        ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>🇧🇩 বাংলা (Bengali)</span>
                    {selectedLang === 'bn' && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-rose-500" /> Favorite Categories (Choose at least 2)
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => {
                    const isSel = selectedCats.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleToggleCat(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isSel
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30 scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isSel && <Check className="w-3 h-3" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selectedCats.length < 1}
                className="w-full py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Specific Topics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">
                  🎯 Specific AI Topic Interests
                </label>
                <p className="text-xs text-slate-400 mb-3">Select keywords to refine your initial neural recommendations</p>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                  {interestOptions.map((opt) => {
                    const isSel = selectedInterests.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleInterest(opt)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSel
                            ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold shadow-xs scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isSel ? '✓ ' : '+ '}{opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Start AI Personalized Feed</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
