import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../lib/data';
import { Video, CategoryName } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, Plus, Edit, Trash2, Sparkles, Check, X, Users, Eye, Clock, TrendingUp, Calendar, Tag, Flame } from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { videos, publishVideo, editVideo, deleteVideo, setActiveTab } = usePlatform();
  const { user, loginAsDemo } = useAuth();

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<CategoryName>('Technology');
  const [tagsStr, setTagsStr] = useState('AI, Future Tech, Deep Dive');
  const [thumbUrl, setThumbUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [duration, setDuration] = useState('15:30');
  const [isFeaturedPin, setIsFeaturedPin] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  if (!user?.isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl text-center space-y-6 border border-rose-500/30 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Portal Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          In this single-direction video platform, only platform administrators can publish and manage catalog videos.
        </p>
        <button
          onClick={async () => {
            await loginAsDemo('admin');
          }}
          className="w-full py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>👑 Switch to Labib Hossan Joy (Admin)</span>
        </button>
      </div>
    );
  }

  const handleOpenEdit = (vid: Video) => {
    setEditingVideoId(vid.id);
    setTitle(vid.title);
    setDesc(vid.description);
    setCategory(vid.category);
    setTagsStr(vid.tags?.join(', ') || '');
    setThumbUrl(vid.thumbnailUrl);
    setVideoUrl(vid.videoUrl);
    setDuration(vid.duration);
    setIsFeaturedPin(!!vid.isFeatured);
    setShowPublishModal(true);
  };

  const handleOpenPublishNew = () => {
    setEditingVideoId(null);
    setTitle('');
    setDesc('');
    setCategory('Technology');
    setTagsStr('Next.js, React, Architecture');
    setThumbUrl('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80');
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setDuration('12:40');
    setIsFeaturedPin(false);
    setShowPublishModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArr = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const durParts = duration.split(':');
    const durSecs = (parseInt(durParts[0] || '10') * 60) + parseInt(durParts[1] || '0');

    if (editingVideoId) {
      await editVideo(editingVideoId, {
        title: title.trim(),
        description: desc.trim(),
        category,
        tags: tagsArr,
        thumbnailUrl: thumbUrl,
        videoUrl,
        duration,
        durationSeconds: durSecs,
        isFeatured: isFeaturedPin
      });
    } else {
      await publishVideo({
        title: title.trim(),
        description: desc.trim() || 'Published by StreamMind Admin.',
        category,
        tags: tagsArr,
        thumbnailUrl: thumbUrl,
        videoUrl,
        duration,
        durationSeconds: durSecs,
        channelName: 'StreamMind Admin',
        channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        isFeatured: isFeaturedPin
      });
    }

    setShowPublishModal(false);
  };

  const handleTogglePin = async (vid: Video) => {
    await editVideo(vid.id, { isFeatured: !vid.isFeatured });
  };

  // Recharts Data
  const topVideosChartData = [...videos].sort((a, b) => b.views - a.views).slice(0, 5).map(v => ({
    name: v.title.slice(0, 16) + '...',
    views: v.views
  }));

  const categoryCounts: Record<string, number> = {};
  videos.forEach(v => {
    categoryCounts[v.category] = (categoryCounts[v.category] || 0) + v.views;
  });
  const pieColors = ['#e11d48', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899', '#6366f1'];
  const categoryPieData = Object.entries(categoryCounts).map(([cat, views]) => ({
    name: cat,
    value: views
  }));

  const totalPlatformViews = videos.reduce((acc, v) => acc + v.views, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-300">
      
      {/* Admin Studio Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-rose-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            👑 Sole Publishing Authority
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">StreamMind Admin Studio</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-light">
            Centralized publishing portal. Upload single-direction broadcast streams, pin spotlights, and analyze user engagement telemetry.
          </p>
        </div>

        <button
          onClick={handleOpenPublishNew}
          className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 shrink-0 cursor-pointer transition-transform hover:scale-105"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Publish New Video</span>
        </button>
      </div>

      {/* Analytics KPI Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 block">1,482</span>
          <span className="text-[10px] text-emerald-500 font-mono mt-1 block">↑ +14% this week</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Active (DAU)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 block">890</span>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">~60% DAU/MAU stickiness</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Catalog Views</span>
            <Eye className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            {(totalPlatformViews / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-rose-500 font-mono mt-1 block">Across {videos.length} videos</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Completion Rate</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 block">78.4%</span>
          <span className="text-[10px] text-amber-500 font-mono mt-1 block">AI Feed alignment high</span>
        </div>
      </div>

      {/* Analytics Recharts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Viewed Videos Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>📊 Top Performing Videos by View Volume</span>
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVideosChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="views" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>🥧 Engagement Distribution by Category</span>
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Video Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            📹 Published Video Catalog ({videos.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Platform Admin Curation Only</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-mono text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6">Thumbnail & Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Pin Spotlight</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {videos.map((vid) => (
                <tr key={vid.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-6 flex items-center gap-3 min-w-[280px]">
                    <img src={vid.thumbnailUrl} alt={vid.title} className="w-16 aspect-video rounded-lg object-cover shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{vid.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{vid.duration}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">{vid.category}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {vid.views.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePin(vid)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                        vid.isFeatured
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {vid.isFeatured ? '★ Pinned' : 'Pin Hero'}
                    </button>
                  </td>

                  <td className="py-3.5 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(vid)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="Edit Video"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete video "${vid.title}"?`)) {
                          await deleteVideo(vid.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                      title="Delete Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish or Edit Video Form Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                {editingVideoId ? <Edit className="w-5 h-5 text-rose-600" /> : <Plus className="w-5 h-5 text-rose-600 stroke-[3]" />}
                <span>{editingVideoId ? 'Edit Video Metadata' : 'Publish New Stream'}</span>
              </h3>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5 mt-6 text-xs sm:text-sm">
              
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Quantum Hardware Breakthroughs 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1">Duration (MM:SS)</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="14:20"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Video Stream MP4 / HLS URL</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Google Cloud GTV Sample Bucket preset active</span>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Thumbnail Cover URL</label>
                <input
                  type="url"
                  required
                  value={thumbUrl}
                  onChange={(e) => setThumbUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="AI, Next.js, Finance"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Comprehensive video overview..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">Pin as Featured Spotlight</span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">Displays in hero banner on Home feed</span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeaturedPin}
                  onChange={(e) => setIsFeaturedPin(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 cursor-pointer"
                >
                  {editingVideoId ? 'Save Changes' : 'Publish Broadcast'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
