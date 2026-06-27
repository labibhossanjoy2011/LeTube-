import React, { createContext, useContext, useState, useEffect } from 'react';
import { Video, NotificationItem, CategoryName } from '../types';
import { SEED_VIDEOS, INITIAL_NOTIFICATIONS } from '../lib/data';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

export type TabType = 'home' | 'ai_assistant' | 'account' | 'search' | 'settings' | 'admin' | 'player';

interface PlatformContextType {
  videos: Video[];
  activeTab: TabType;
  activeVideo: Video | null;
  searchQuery: string;
  selectedCategory: CategoryName | 'All';
  notifications: NotificationItem[];
  unreadNotifCount: number;
  isLoadingVideos: boolean;
  setActiveTab: (tab: TabType, video?: Video | null) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: CategoryName | 'All') => void;
  markNotificationRead: (id: string) => void;
  publishVideo: (data: Omit<Video, 'id' | 'views' | 'likesCount' | 'savesCount' | 'publishedAt'>) => Promise<void>;
  editVideo: (id: string, updated: Partial<Video>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  playVideo: (video: Video) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>(SEED_VIDEOS);
  const [activeTab, setActiveTabState] = useState<TabType>('home');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'All'>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true);

  // Load videos from local storage or Firestore
  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoadingVideos(true);
      const localCat = localStorage.getItem('streammind_videos_catalog');
      if (localCat) {
        try {
          const parsed = JSON.parse(localCat);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVideos(parsed);
            setIsLoadingVideos(false);
            return;
          }
        } catch (e) {}
      }

      try {
        const querySnapshot = await getDocs(collection(db, 'videos'));
        if (!querySnapshot.empty) {
          const fetched: Video[] = [];
          querySnapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() } as Video);
          });
          setVideos(fetched);
          localStorage.setItem('streammind_videos_catalog', JSON.stringify(fetched));
        } else {
          // Seed initial catalog to Firestore
          setVideos(SEED_VIDEOS);
          localStorage.setItem('streammind_videos_catalog', JSON.stringify(SEED_VIDEOS));
          SEED_VIDEOS.forEach(async (v) => {
            try {
              await setDoc(doc(db, 'videos', v.id), v);
            } catch (err) {}
          });
        }
      } catch (err) {
        console.warn("Using offline seed video catalog.", err);
        setVideos(SEED_VIDEOS);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    loadCatalog();
  }, []);

  const syncVideos = (newCatalog: Video[]) => {
    setVideos(newCatalog);
    localStorage.setItem('streammind_videos_catalog', JSON.stringify(newCatalog));
  };

  const setActiveTab = (tab: TabType, video: Video | null = null) => {
    setActiveTabState(tab);
    if (video !== undefined) {
      setActiveVideo(video);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const playVideo = (video: Video) => {
    // Increase view count locally
    const updated = videos.map(v => v.id === video.id ? { ...v, views: v.views + 1 } : v);
    syncVideos(updated);
    setActiveVideo({ ...video, views: video.views + 1 });
    setActiveTabState('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publishVideo = async (data: Omit<Video, 'id' | 'views' | 'likesCount' | 'savesCount' | 'publishedAt'>) => {
    const newId = 'admin-pub-' + Date.now();
    const newVid: Video = {
      ...data,
      id: newId,
      views: Math.floor(Math.random() * 500) + 10,
      likesCount: Math.floor(Math.random() * 50) + 2,
      savesCount: Math.floor(Math.random() * 10) + 1,
      publishedAt: new Date().toISOString(),
      channelName: 'StreamMind Admin',
      channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      isRecentlyAdded: true
    } as Video;

    const newCatalog = [newVid, ...videos];
    syncVideos(newCatalog);

    // Notify users
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: '🚨 New Video Published!',
      message: `Admin published: "${newVid.title}" in ${newVid.category}`,
      type: 'new_video',
      createdAt: new Date().toISOString(),
      read: false,
      videoId: newVid.id
    };
    setNotifications([newNotif, ...notifications]);

    try {
      await setDoc(doc(db, 'videos', newId), newVid);
    } catch (e) {}
  };

  const editVideo = async (id: string, updated: Partial<Video>) => {
    const newCatalog = videos.map(v => v.id === id ? { ...v, ...updated } : v);
    syncVideos(newCatalog);
    if (activeVideo?.id === id) {
      setActiveVideo({ ...activeVideo, ...updated });
    }
    try {
      await setDoc(doc(db, 'videos', id), updated, { merge: true });
    } catch (e) {}
  };

  const deleteVideo = async (id: string) => {
    const newCatalog = videos.filter(v => v.id !== id);
    syncVideos(newCatalog);
    if (activeVideo?.id === id) {
      setActiveVideo(null);
      setActiveTabState('home');
    }
    try {
      await deleteDoc(doc(db, 'videos', id));
    } catch (e) {}
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <PlatformContext.Provider value={{
      videos,
      activeTab,
      activeVideo,
      searchQuery,
      selectedCategory,
      notifications,
      unreadNotifCount,
      isLoadingVideos,
      setActiveTab,
      setSearchQuery,
      setSelectedCategory,
      markNotificationRead,
      publishVideo,
      editVideo,
      deleteVideo,
      playVideo
    }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used inside PlatformProvider");
  return context;
};
