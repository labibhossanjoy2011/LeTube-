export type CategoryName = 
  | 'Technology'
  | 'Programming'
  | 'Business'
  | 'Education'
  | 'Motivation'
  | 'Islam'
  | 'Entertainment'
  | 'Science'
  | 'Health'
  | 'Finance'
  | 'News';

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // HLS/MP4 or embed URL
  thumbnailUrl: string;
  category: CategoryName;
  tags: string[];
  duration: string; // e.g. "14:20"
  durationSeconds: number;
  views: number;
  likesCount: number;
  savesCount: number;
  publishedAt: string; // ISO date
  channelName: string; // Default "StreamMind Admin"
  channelAvatar: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isRecentlyAdded?: boolean;
}

export interface WatchHistoryItem {
  videoId: string;
  watchedAt: string; // ISO date
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

export interface UserStats {
  totalVideosWatched: number;
  totalWatchTimeSeconds: number;
  activeStreakDays: number;
  favoriteCategory: CategoryName | 'None';
}

export interface UserSettings {
  language: 'en' | 'bn';
  darkMode: boolean;
  autoplay: boolean;
  defaultQuality: '1080p' | '720p' | '480p';
  subtitleSupport: boolean;
  resumePlayback: boolean;
  pauseHistory: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  joinedAt: string;
  lastLoginAt: string;
  hasCompletedOnboarding: boolean;
  preferredLanguage: 'en' | 'bn';
  favoriteCategories: string[];
  contentInterests: string[];
  watchHistory: WatchHistoryItem[];
  likedVideoIds: string[];
  savedVideoIds: string[];
  searchHistory: string[];
  isAdmin: boolean;
  stats: UserStats;
  settings: UserSettings;
}

export interface CommentItem {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'new_video' | 'trending' | 'recommendation' | 'system';
  createdAt: string;
  read: boolean;
  videoId?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedVideoIds?: string[];
  createdAt: string;
}

export interface VideoAnalysisResult {
  summary: string;
  keyTakeaways: string[];
  targetAudience: string;
  estimatedValueScore: number;
}
