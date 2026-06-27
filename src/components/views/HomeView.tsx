import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../lib/data';
import { VideoCard } from '../VideoCard';
import { Sparkles, Flame, Play, Clock, History, Compass, ArrowRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { videos, selectedCategory, setSelectedCategory, playVideo } = usePlatform();
  const { user } = useAuth();

  // Filter by selected category
  const filteredCatalog = selectedCategory === 'All' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  const featuredVideo = videos.find(v => v.isFeatured) || videos[0];
  const trendingVideos = videos.filter(v => v.isTrending);
  const popularVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 4);
  const recentlyAdded = videos.slice(0, 4);

  // For returning users
  const isReturningUser = user && user.hasCompletedOnboarding && user.watchHistory.length > 0;
  const lastWatchedItem = user?.watchHistory[0];
  const lastWatchedVideo = videos.find(v => v.id === lastWatchedItem?.videoId);

  // Because you watched ...
  const becauseYouWatchedList = lastWatchedVideo 
    ? videos.filter(v => v.category === lastWatchedVideo.category && v.id !== lastWatchedVideo.id).slice(0, 4)
    : [];

  // Recommended For You based on favoriteCategories
  const favCats = user?.favoriteCategories || ['Technology', 'Programming'];
  const recommendedForYou = videos.filter(v => favCats.includes(v.category)).slice(0, 6);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Category Pills Filter Header */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 border-b border-slate-100 dark:border-slate-800 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {user?.settings.language === 'bn' ? 'সকল' : 'All Discovery'}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/25 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Featured Video Banner */}
      {featuredVideo && selectedCategory === 'All' && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl group border border-slate-800">
          <div className="aspect-video md:aspect-[21/9] w-full relative">
            <img
              src={featuredVideo.thumbnailUrl}
              alt={featuredVideo.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
          </div>

          <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-600/40">
                <Sparkles className="w-3 h-3" /> Admin Featured Spotlight
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-white text-[10px] font-mono">
                {featuredVideo.category}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {featuredVideo.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 line-clamp-2 sm:line-clamp-3 leading-relaxed opacity-90 font-light">
              {featuredVideo.description}
            </p>

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => playVideo(featuredVideo)}
                className="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Spotlight Now</span>
              </button>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {featuredVideo.duration} • Exclusive Platform Stream
              </span>
            </div>
          </div>
        </div>
      )}

      {/* If category filtered */}
      {selectedCategory !== 'All' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-rose-500" />
              <span>Category: {selectedCategory}</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{filteredCatalog.length} videos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCatalog.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      ) : isReturningUser ? (
        /* RETURNING USERS SMART FEED */
        <div className="space-y-12">
          
          {/* Continue Watching Section */}
          {lastWatchedVideo && (
            <section className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>{user?.settings.language === 'bn' ? 'দেখা চালিয়ে যান (Continue Watching)' : 'Continue Watching'}</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {user.watchHistory.slice(0, 3).map((item) => {
                  const vid = videos.find(v => v.id === item.videoId);
                  if (!vid) return null;
                  const progressPct = Math.min(100, Math.floor((item.progressSeconds / (item.durationSeconds || 1)) * 100));
                  return (
                    <div key={vid.id} className="relative">
                      <VideoCard video={vid} />
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2 px-2">
                        <div className="bg-rose-600 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Recommended For You */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>{user?.settings.language === 'bn' ? 'আপনার জন্য প্রস্তাবিত (Recommended For You)' : 'Recommended For You'}</span>
              </h3>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                AI Inference Active
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedForYou.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

          {/* Because You Watched ... */}
          {lastWatchedVideo && becauseYouWatchedList.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  <span>Because You Watched "{lastWatchedVideo.title.slice(0, 28)}..."</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {becauseYouWatchedList.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          )}

          {/* Trending Now */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>{user?.settings.language === 'bn' ? 'ট্রেন্ডিং ভিডিও (Trending Now)' : 'Trending Now'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

          {/* Popular This Week */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🌟 Popular This Week</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

        </div>
      ) : (
        /* NEW USERS / FIRST-TIME FEED */
        <div className="space-y-12">
          
          {/* Trending Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>🔥 Trending Videos</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

          {/* Editor-Selected / Featured Videos */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>✨ Editor-Selected & Featured</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.filter(v => v.isFeatured).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

          {/* Popular Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              <span>🌟 Most Popular Videos</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

          {/* Recently Added Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              <span>🆕 Recently Added by Platform Admin</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentlyAdded.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>

        </div>
      )}

    </div>
  );
};
