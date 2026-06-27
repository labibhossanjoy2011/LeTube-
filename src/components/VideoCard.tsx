import React from 'react';
import { Video } from '../types';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Flame, Sparkles } from 'lucide-react';

export const VideoCard: React.FC<{ video: Video; layout?: 'grid' | 'horizontal' }> = ({ video, layout = 'grid' }) => {
  const { playVideo } = usePlatform();
  const { user } = useAuth();

  const formatViews = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / 86400000);
    if (days === 0) return user?.settings.language === 'bn' ? 'আজ' : 'Today';
    if (days === 1) return user?.settings.language === 'bn' ? '১ দিন আগে' : '1 day ago';
    if (days < 30) return user?.settings.language === 'bn' ? `${days} দিন আগে` : `${days} days ago`;
    return user?.settings.language === 'bn' ? '১ মাস আগে' : '1 month ago';
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => playVideo(video)}
        className="group flex gap-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 p-2 rounded-2xl transition-all"
      >
        <div className="relative w-40 sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 shadow-xs">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute bottom-1.5 right-1.5 bg-slate-950/80 text-white text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md backdrop-blur-xs">
            {video.duration}
          </span>
          {video.isTrending && (
            <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white p-1 rounded-md">
              <Flame className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {video.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span>{video.channelName}</span>
            <CheckCircle2 className="w-3 h-3 text-rose-500 shrink-0" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{getTimeAgo(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => playVideo(video)}
      className="group cursor-pointer flex flex-col gap-3 rounded-2xl p-2 sm:p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5 dark:ring-white/10">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <span className="absolute bottom-2 right-2 bg-slate-950/85 text-white text-xs font-mono font-semibold px-2 py-0.5 rounded-lg backdrop-blur-xs">
          {video.duration}
        </span>

        {video.isFeatured && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        )}

        {video.isTrending && !video.isFeatured && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3" /> Trending
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex gap-3 px-1">
        <img
          src={video.channelAvatar}
          alt={video.channelName}
          className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 ring-2 ring-rose-500/20"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
            <span>{video.channelName}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Verified Admin Publisher" />
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{getTimeAgo(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
