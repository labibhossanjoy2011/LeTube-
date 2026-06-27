import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { VideoCard } from '../VideoCard';
import { Search, Sparkles, SlidersHorizontal, History, X, AlertCircle } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery, videos } = usePlatform();
  const { user, recordSearch, clearHistory } = useAuth();

  const [filterType, setFilterType] = useState<'all' | 'title' | 'tag' | 'category'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'views' | 'date'>('relevance');

  // Fuzzy / substring matching
  const queryClean = searchQuery.trim().toLowerCase();

  const matchingVideos = videos.filter((vid) => {
    if (!queryClean) return true;
    const titleMatch = vid.title.toLowerCase().includes(queryClean);
    const descMatch = vid.description.toLowerCase().includes(queryClean);
    const catMatch = vid.category.toLowerCase().includes(queryClean);
    const tagMatch = vid.tags?.some(t => t.toLowerCase().includes(queryClean));

    if (filterType === 'title') return titleMatch;
    if (filterType === 'tag') return tagMatch;
    if (filterType === 'category') return catMatch;
    return titleMatch || descMatch || catMatch || tagMatch;
  }).sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'date') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    return 0; // standard order
  });

  // Simulated typo correction
  const simulatedTypoCorrection = () => {
    if (queryClean === 'quantam' || queryClean === 'quantom') return 'Quantum Computing';
    if (queryClean === 'nxtjs' || queryClean === 'reactjs') return 'Next.js 16';
    if (queryClean === 'sala' || queryClean === 'namaz') return 'Salah Khushu';
    return null;
  };
  const correctedTypo = simulatedTypoCorrection();

  return (
    <div className="space-y-8 pb-20">
      
      {/* Search Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Search className="w-6 h-6 text-rose-500" />
              <span>Search Results for "{searchQuery || 'All Videos'}"</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Found {matchingVideos.length} matching verified streams</p>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-hidden focus:border-rose-500"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="views">Sort: Most Viewed</option>
              <option value="date">Sort: Newest</option>
            </select>
          </div>
        </div>

        {/* Filter type pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          {(['all', 'title', 'tag', 'category'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                filterType === ft ? 'bg-rose-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Filter: {ft}
            </button>
          ))}
        </div>
      </div>

      {/* Typo correction notification */}
      {correctedTypo && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <span className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Showing results for query. Did you mean: <strong className="underline cursor-pointer" onClick={() => setSearchQuery(correctedTypo)}>{correctedTypo}</strong>?</span>
          </span>
        </div>
      )}

      {/* Search History Chips */}
      {user && user.searchHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Recent Searches
            </span>
            <button onClick={() => clearHistory('search')} className="text-[11px] text-slate-400 hover:text-rose-600">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.searchHistory.map((q, i) => (
              <span
                key={i}
                onClick={() => setSearchQuery(q)}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Grid */}
      {matchingVideos.length === 0 ? (
        <div className="p-16 text-center space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">No videos matched your query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try searching for broad categories like "Technology", "Islam", "Programming", or use our Natural Language AI Assistant!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {matchingVideos.map((vid) => (
            <VideoCard key={vid.id} video={vid} />
          ))}
        </div>
      )}

    </div>
  );
};
