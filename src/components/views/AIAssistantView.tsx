import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { AIChatMessage } from '../../types';
import { VideoCard } from '../VideoCard';
import { CATEGORIES } from '../../lib/data';
import { Sparkles, Send, Bot, User, Upload, Image as ImageIcon, Camera, Globe, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { videos, playVideo } = usePlatform();
  const { user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'image_analyze'>('chat');
  const [langPref, setLangPref] = useState<'en' | 'bn'>(user?.settings.language || 'en');

  // Chat state
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: langPref === 'bn'
        ? "নমস্কার! আমি StreamMind এআই। আপনি কোন ধরনের ভিডিও দেখতে চান আমাকে বলুন, যেমন: 'আমাকে বিজনেসের ভিডিও দেখাও' বা 'ইসলামিক লেকচার সাজেস্ট করো'।"
        : "Hello! I am StreamMind AI. Ask me in English or বাংলা to discover videos, e.g. 'show me business videos', 'recommend motivational content', or 'suggest Islamic lectures'.",
      suggestedVideoIds: ['biz-1', 'islam-1'],
      createdAt: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Image Analyzer state
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<any | null>(null);

  const samplePrompts = [
    langPref === 'bn' ? "আমাকে বিজনেসের ভিডিও দেখাও" : "show me business videos",
    langPref === 'bn' ? "ইসলামিক লেকচার সাজেস্ট করো" : "suggest Islamic lectures",
    langPref === 'bn' ? "প্রোগ্রামিং শেখার ভিডিও চাই" : "I want programming tutorials",
    langPref === 'bn' ? "ফাইন্যান্স নিয়ে সহজ ভিডিও দেখাও" : "find beginner-friendly videos about finance",
    langPref === 'bn' ? "মোটিভেশনাল ভিডিও দাও" : "recommend motivational content"
  ];

  const handleSendMessage = async (e: React.FormEvent, customPrompt?: string) => {
    e.preventDefault();
    const query = customPrompt || inputText;
    if (!query.trim() || isSending) return;

    const userMsg: AIChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: chatMessages.slice(-6),
          userInterests: user?.contentInterests || [],
          language: langPref,
          availableVideos: videos
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiReply: AIChatMessage = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: data.replyText || (langPref === 'bn' ? "আপনার জন্য কিছু চমৎকার ভিডিও নিচে দেওয়া হলো।" : "Here are some great videos matching your intent!"),
          suggestedVideoIds: data.suggestedVideoIds || [],
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, aiReply]);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      // Fallback response if offline
      const fallbackMatches = videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) || v.category.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
      const aiReply: AIChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: langPref === 'bn'
          ? "আপনার অনুরোধ অনুযায়ী আমাদের ক্যাটালগ থেকে এই ভিডিওগুলো বাছাই করা হয়েছে:"
          : "Based on your request, I found these relevant platform streams:",
        suggestedVideoIds: fallbackMatches.map(m => m.id),
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiReply]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedImageBase64(base64String);
      setImageAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImageSubmit = async () => {
    if (!selectedImageBase64 || isAnalyzingImage) return;
    setIsAnalyzingImage(true);
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImageBase64,
          mimeType: selectedImageMime,
          promptText: imagePrompt,
          language: langPref,
          availableCategories: CATEGORIES
        })
      });
      if (res.ok) {
        const data = await res.json();
        setImageAnalysisResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-purple-500/20">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Gemini 3.1 Pro Neural Discovery
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {langPref === 'bn' ? "এআই ভিডিও ডিসকভারি সহকারী" : "Conversational Video Assistant"}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-2 max-w-lg leading-relaxed font-light">
              {langPref === 'bn'
                ? "স্বাভাবিক ভাষায় লিখে বা ছবি আপলোড করে আপনার পছন্দের ভিডিও খুঁজে নিন।"
                : "Ask natural questions or upload a photo to discover personalized content curated by platform admins."}
            </p>
          </div>

          {/* Language toggle pill */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
            <Globe className="w-4 h-4 text-purple-300 ml-2" />
            <button
              onClick={() => setLangPref('en')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${langPref === 'en' ? 'bg-white text-slate-900 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              English
            </button>
            <button
              onClick={() => setLangPref('bn')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${langPref === 'bn' ? 'bg-white text-slate-900 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'chat'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                : 'bg-white/5 text-purple-200 hover:bg-white/10'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>💬 Natural Language Chat</span>
          </button>

          <button
            onClick={() => setActiveSubTab('image_analyze')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'image_analyze'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                : 'bg-white/5 text-purple-200 hover:bg-white/10'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>📷 AI Photo Analyzer</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: CONVERSATIONAL CHAT */}
      {activeSubTab === 'chat' && (
        <div className="space-y-6">
          
          {/* Sample prompt pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase shrink-0 mr-1">Try asking:</span>
            {samplePrompts.map((prm, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSendMessage(e, prm)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-xs shrink-0 font-medium cursor-pointer transition-transform hover:scale-105"
              >
                "{prm}"
              </button>
            ))}
          </div>

          {/* Chat transcript container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 min-h-[420px] max-h-[600px] overflow-y-auto space-y-6 shadow-inner">
            {chatMessages.map((msg) => {
              const isBot = msg.sender === 'ai';
              const suggestedVids = (msg.suggestedVideoIds || []).map(id => videos.find(v => v.id === id)).filter(Boolean);

              return (
                <div key={msg.id} className={`flex gap-3.5 items-start ${!isBot ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white font-bold text-xs ${
                    isBot ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-slate-900 dark:bg-slate-700'
                  }`}>
                    {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-2xl space-y-3 ${!isBot ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed inline-block shadow-xs ${
                      isBot
                        ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs text-left'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Suggested Videos Grid */}
                    {isBot && suggestedVids.length > 0 && (
                      <div className="pt-2 space-y-3 text-left">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold block">
                          📹 Recommended Streams ({suggestedVids.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {suggestedVids.map((sv: any) => (
                            <VideoCard key={sv.id} video={sv} layout="horizontal" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3.5 items-center">
                <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 animate-pulse">
                  StreamMind AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => handleSendMessage(e)} className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={langPref === 'bn' ? "ভিডিও খোঁজার জন্য যেকোনো প্রশ্ন লিখুন..." : "Ask StreamMind AI anything about videos..."}
              disabled={isSending}
              className="w-full pl-6 pr-16 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-purple-600 text-sm shadow-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-40 text-white shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>

        </div>
      )}

      {/* SUB TAB 2: AI IMAGE / PHOTO ANALYZER */}
      {activeSubTab === 'image_analyze' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-8 animate-in zoom-in-95 duration-200">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
              <Camera className="w-8 h-8" />
            </div>
            <h2 className="font-bold text-xl text-slate-900 dark:text-white">
              {langPref === 'bn' ? "ছবি আপলোড করে ভিডিও খুঁজুন" : "Analyze Photo to Find Videos"}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a photo of a book cover, code screenshot, workout note, or gadget. Gemini 3.1 Pro will analyze the image and recommend matching platform topics!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Upload Area */}
            <div className="space-y-4">
              <label className="border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all aspect-video group">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                {selectedImageBase64 ? (
                  <img src={`data:${selectedImageMime};base64,${selectedImageBase64}`} alt="Uploaded preview" className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform mb-3" />
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Click or drag photo here</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP supported</span>
                  </>
                )}
              </label>

              {selectedImageBase64 && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Optional note (e.g., 'What tutorials explain this?')"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    onClick={handleAnalyzeImageSubmit}
                    disabled={isAnalyzingImage}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
                  >
                    {isAnalyzingImage ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isAnalyzingImage ? 'Analyzing Image...' : 'Run Gemini Visual Search'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 min-h-[280px] flex flex-col justify-center border border-slate-200 dark:border-slate-700/60">
              {isAnalyzingImage ? (
                <div className="text-center space-y-3 py-12">
                  <Sparkles className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Gemini Vision is inspecting photo...</span>
                </div>
              ) : imageAnalysisResult ? (
                <div className="space-y-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                    ✨ Vision Analysis
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {imageAnalysisResult.imageAnalysis}
                  </p>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Recommended Platform Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {imageAnalysisResult.recommendedCategories?.map((c: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-950/50 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                    💡 {imageAnalysisResult.message}
                  </p>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs p-8">
                  Upload a photo on the left and click analyze to see Gemini AI visual recommendations here.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
