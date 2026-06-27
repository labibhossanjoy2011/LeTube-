import React, { useState, useRef, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { VideoCard } from '../VideoCard';
import { VideoAnalysisResult } from '../../types';
import { ThumbsUp, Bookmark, Share2, Sparkles, CheckCircle2, Play, Pause, Volume2, VolumeX, Maximize, Settings, Subtitles, ArrowLeft, MessageSquare, Check, Copy } from 'lucide-react';

export const VideoPlayerView: React.FC = () => {
  const { activeVideo, videos, playVideo, setActiveTab } = usePlatform();
  const { user, toggleLike, toggleSave, updateWatchHistory } = useAuth();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [subtitlesActive, setSubtitlesActive] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tabs below player
  const [playerTab, setPlayerTab] = useState<'related' | 'ai_analyze' | 'comments'>('related');
  
  // AI Analyze state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);

  // Comments simulation state
  const [comments, setComments] = useState([
    { id: 'c1', userName: 'Arif Ahmed', text: 'Incredible breakdown. The platform admin curation makes this 10x better than standard noise.', createdAt: '2 hours ago', likes: 24 },
    { id: 'c2', userName: 'Fatima Zahra', text: 'অসাধারণ একটি ভিডিও! অনেক কিছু শিখতে পারলাম। ধন্যবাদ অ্যাডমিনকে।', createdAt: '5 hours ago', likes: 42 }
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  const videoElementRef = useRef<HTMLVideoElement>(null);

  if (!activeVideo) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500">No video selected.</p>
        <button onClick={() => setActiveTab('home')} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-full text-sm font-bold">Back to Home</button>
      </div>
    );
  }

  const isLiked = user?.likedVideoIds.includes(activeVideo.id);
  const isSaved = user?.savedVideoIds.includes(activeVideo.id);

  // Resume playback position check
  useEffect(() => {
    if (videoElementRef.current && user) {
      const hist = user.watchHistory.find(h => h.videoId === activeVideo.id);
      if (hist && hist.progressSeconds > 5 && user.settings.resumePlayback) {
        videoElementRef.current.currentTime = hist.progressSeconds;
      }
    }
    setAnalysisResult(null); // Reset AI analysis on video change
  }, [activeVideo.id]);

  // Periodic watch history record
  const handleTimeUpdate = () => {
    if (videoElementRef.current) {
      const curr = Math.floor(videoElementRef.current.currentTime);
      if (curr > 0 && curr % 15 === 0) {
        updateWatchHistory(activeVideo.id, curr, activeVideo.durationSeconds || 600);
      }
    }
  };

  const handleVideoEnded = () => {
    updateWatchHistory(activeVideo.id, activeVideo.durationSeconds || 600, activeVideo.durationSeconds || 600);
    if (autoplayNext) {
      const related = videos.filter(v => v.id !== activeVideo.id && v.category === activeVideo.category);
      if (related.length > 0) {
        playVideo(related[0]);
      }
    }
  };

  const handleTriggerAIAnalyze = async () => {
    setIsAnalyzing(true);
    setPlayerTab('ai_analyze');
    try {
      const res = await fetch('/api/ai/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: activeVideo.title,
          videoDescription: activeVideo.description,
          category: activeVideo.category,
          tags: activeVideo.tags,
          language: user?.settings.language || 'en'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newC = {
      id: 'c-' + Date.now(),
      userName: user?.name || 'Viewer',
      text: newCommentText.trim(),
      createdAt: 'Just now',
      likes: 1
    };
    setComments([newC, ...comments]);
    setNewCommentText('');
  };

  const relatedVideos = videos.filter(v => v.id !== activeVideo.id && (v.category === activeVideo.category || v.isTrending)).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-300">
      
      {/* Back button on mobile */}
      <div className="flex items-center gap-2 lg:hidden">
        <button onClick={() => setActiveTab('home')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold truncate">{activeVideo.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Player Column (Spans 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Video Container Stage */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-slate-800 group">
            <video
              ref={videoElementRef}
              src={activeVideo.videoUrl}
              autoPlay
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain"
            />

            {/* Custom Overlay Quality & Speed Badges */}
            <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-2 py-1 rounded-md bg-black/80 text-white text-[10px] font-mono backdrop-blur-md border border-white/10">
                {selectedQuality}
              </span>
              <span className="px-2 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Admin Exclusive Stream
              </span>
            </div>
          </div>

          {/* Video Title & Actions */}
          <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {activeVideo.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              
              {/* Channel Info */}
              <div className="flex items-center gap-3">
                <img
                  src={activeVideo.channelAvatar}
                  alt={activeVideo.channelName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-500/30"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                    <span>{activeVideo.channelName}</span>
                    <CheckCircle2 className="w-4 h-4 text-rose-500 fill-rose-50 dark:fill-slate-900" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block">Sole Authorized Publisher</span>
                </div>
              </div>

              {/* Action Buttons (Like, Save, Share, AI Analyze) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => toggleLike(activeVideo.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{activeVideo.likesCount + (isLiked ? 1 : 0)}</span>
                </button>

                <button
                  onClick={() => toggleSave(activeVideo.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleTriggerAIAnalyze}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:opacity-95 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Video Takeaways</span>
                </button>
              </div>

            </div>

            {/* Description Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
              <div className="font-mono text-xs text-slate-500 font-semibold flex items-center gap-3">
                <span>{activeVideo.views.toLocaleString()} views</span>
                <span>•</span>
                <span>Category: {activeVideo.category}</span>
              </div>
              <p className="whitespace-pre-wrap">{activeVideo.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeVideo.tags?.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Player Navigation Tabs (Related, AI Takeaways, Comments) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <button
                onClick={() => setPlayerTab('related')}
                className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                  playerTab === 'related' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                📹 Up Next & Related ({relatedVideos.length})
              </button>

              <button
                onClick={() => {
                  setPlayerTab('ai_analyze');
                  if (!analysisResult && !isAnalyzing) handleTriggerAIAnalyze();
                }}
                className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                  playerTab === 'ai_analyze' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-400 hover:text-purple-600'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>🤖 AI Content Analysis</span>
              </button>

              <button
                onClick={() => setPlayerTab('comments')}
                className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                  playerTab === 'comments' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discussion ({comments.length})</span>
              </button>
            </div>

            {/* Tab 1: Related Videos on Mobile/Main stage */}
            {playerTab === 'related' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedVideos.map((vid) => (
                  <VideoCard key={vid.id} video={vid} layout="horizontal" />
                ))}
              </div>
            )}

            {/* Tab 2: AI Content Analyzer (gemini-3.1-pro-preview) */}
            {playerTab === 'ai_analyze' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {isAnalyzing ? (
                  <div className="p-12 text-center space-y-4">
                    <Sparkles className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
                    <h4 className="font-bold text-base text-slate-800 dark:text-white">Gemini 3.1 Pro is synthesizing video takeaways...</h4>
                    <p className="text-xs text-slate-400">Extracting key concepts, executive summary, and target audience alignment</p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6">
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-2xl border border-purple-200 dark:border-purple-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-2">
                        ✨ Executive AI Summary
                      </span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {analysisResult.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Takeaways Checklist
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysisResult.keyTakeaways.map((point, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[10px]">✓</span>
                            <span className="leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">🎯 Target Audience:</span>
                        <span className="text-slate-500">{analysisResult.targetAudience}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-400 block text-[10px]">AI Value Score</span>
                        <span className="text-base font-black text-rose-600">{analysisResult.estimatedValueScore}/100</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleTriggerAIAnalyze} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm">
                    Run Gemini Video Analysis
                  </button>
                )}
              </div>
            )}

            {/* Tab 3: Discussion Comments */}
            {playerTab === 'comments' && (
              <div className="space-y-6">
                <form onSubmit={handleAddComment} className="flex gap-3">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={user ? "Add a respectful comment..." : "Sign in to join the discussion..."}
                    disabled={!user}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-rose-500 text-sm focus:outline-hidden text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!user || !newCommentText.trim()}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm cursor-pointer"
                  >
                    Post
                  </button>
                </form>

                <div className="space-y-4 pt-2">
                  {comments.map((com) => (
                    <div key={com.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{com.userName}</span>
                        <span className="text-slate-400 font-mono">{com.createdAt}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{com.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Column: Related Feed on Desktop */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs sticky top-20">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Up Next</span>
              <label className="text-xs font-normal text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoplayNext}
                  onChange={(e) => setAutoplayNext(e.target.checked)}
                  className="accent-rose-600 rounded-xs"
                />
                Autoplay
              </label>
            </h3>

            <div className="space-y-3 mt-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {relatedVideos.map((vid) => (
                <VideoCard key={vid.id} video={vid} layout="horizontal" />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-rose-500" /> Share Video
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <p className="text-xs text-slate-500 mt-4 truncate font-medium">
              "{activeVideo.title}"
            </p>

            <div className="flex items-center gap-2 mt-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={`https://streammind.ai/watch?v=${activeVideo.id}`}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://streammind.ai/watch?v=${activeVideo.id}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
