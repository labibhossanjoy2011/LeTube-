import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserSettings, WatchHistoryItem, CategoryName } from '../types';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (role: 'admin' | 'viewer') => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  completeOnboarding: (lang: 'en' | 'bn', categories: string[], interests: string[]) => Promise<void>;
  updateWatchHistory: (videoId: string, progressSeconds: number, durationSeconds: number) => Promise<void>;
  toggleLike: (videoId: string) => Promise<boolean>;
  toggleSave: (videoId: string) => Promise<boolean>;
  recordSearch: (query: string) => Promise<void>;
  clearHistory: (type: 'watch' | 'search' | 'all') => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  darkMode: false,
  autoplay: true,
  defaultQuality: '1080p',
  subtitleSupport: true,
  resumePlayback: true,
  pauseHistory: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check localStorage for Demo Session or Firebase Auth
  useEffect(() => {
    const demoSession = localStorage.getItem('streammind_demo_user');
    if (demoSession) {
      try {
        setUser(JSON.parse(demoSession));
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('streammind_demo_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          const isAdminEmail = firebaseUser.email === 'labibhossanjoy2011@gmail.com' || firebaseUser.email === 'admin@stream.ai';
          
          if (snap.exists()) {
            const profileData = snap.data() as UserProfile;
            const updatedProfile = {
              ...profileData,
              lastLoginAt: new Date().toISOString(),
              isAdmin: profileData.isAdmin || isAdminEmail
            };
            setUser(updatedProfile);
            await updateDoc(userRef, { lastLoginAt: updatedProfile.lastLoginAt, isAdmin: updatedProfile.isAdmin });
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Google User',
              email: firebaseUser.email || 'user@example.com',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
              joinedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              hasCompletedOnboarding: false,
              preferredLanguage: 'en',
              favoriteCategories: [],
              contentInterests: [],
              watchHistory: [],
              likedVideoIds: [],
              savedVideoIds: [],
              searchHistory: [],
              isAdmin: isAdminEmail,
              stats: { totalVideosWatched: 0, totalWatchTimeSeconds: 0, activeStreakDays: 1, favoriteCategory: 'None' },
              settings: DEFAULT_SETTINGS
            };
            setUser(newProfile);
            await setDoc(userRef, newProfile);
          }
        } catch (err) {
          console.error("Firestore user fetch error:", err);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserToStore = async (updated: UserProfile) => {
    setUser(updated);
    if (updated.uid.startsWith('demo-')) {
      localStorage.setItem('streammind_demo_user', JSON.stringify(updated));
    } else {
      try {
        await setDoc(doc(db, 'users', updated.uid), updated, { merge: true });
      } catch (e) {
        console.error("Failed to sync to Firestore:", e);
      }
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn("Popup blocked or failed in iframe sandbox. Defaulting to instant Demo Login pattern.", err);
      // Fallback to demo login if iframe blocks popups
      await loginAsDemo('admin');
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: 'admin' | 'viewer') => {
    setIsLoading(true);
    setAuthError(null);
    const isAdm = role === 'admin';
    const demoProfile: UserProfile = {
      uid: isAdm ? 'demo-admin-joy' : 'demo-viewer-1',
      name: isAdm ? 'Labib Hossan Joy (Admin)' : 'Arafat Rahman (Viewer)',
      email: isAdm ? 'labibhossanjoy2011@gmail.com' : 'viewer@streammind.ai',
      photoURL: isAdm 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' 
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      joinedAt: '2026-06-01T10:00:00Z',
      lastLoginAt: new Date().toISOString(),
      hasCompletedOnboarding: isAdm, // Admin has completed onboarding, Viewer may test onboarding or already have it
      preferredLanguage: 'en',
      favoriteCategories: isAdm ? ['Technology', 'Programming', 'Business'] : [],
      contentInterests: isAdm ? ['AI hardware', 'Next.js architecture', 'SaaS scaling'] : [],
      watchHistory: isAdm ? [
        { videoId: 'tech-1', watchedAt: new Date().toISOString(), progressSeconds: 400, durationSeconds: 860, completed: false },
        { videoId: 'prog-1', watchedAt: new Date(Date.now() - 86400000).toISOString(), progressSeconds: 1725, durationSeconds: 1725, completed: true }
      ] : [],
      likedVideoIds: isAdm ? ['tech-1', 'islam-1'] : [],
      savedVideoIds: isAdm ? ['prog-1', 'biz-1'] : [],
      searchHistory: isAdm ? ['quantum ai', 'next.js tutorial', 'salah mindfulness'] : [],
      isAdmin: isAdm,
      stats: {
        totalVideosWatched: isAdm ? 14 : 0,
        totalWatchTimeSeconds: isAdm ? 12450 : 0,
        activeStreakDays: isAdm ? 5 : 1,
        favoriteCategory: isAdm ? 'Technology' : 'None'
      },
      settings: DEFAULT_SETTINGS
    };

    await syncUserToStore(demoProfile);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    localStorage.removeItem('streammind_demo_user');
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setIsLoading(false);
  };

  const deleteAccount = async () => {
    if (!user) return;
    setIsLoading(true);
    localStorage.removeItem('streammind_demo_user');
    try {
      if (!user.uid.startsWith('demo-')) {
        await setDoc(doc(db, 'users', user.uid), { deleted: true });
        await signOut(auth);
      }
    } catch (e) {}
    setUser(null);
    setIsLoading(false);
  };

  const completeOnboarding = async (lang: 'en' | 'bn', categories: string[], interests: string[]) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      hasCompletedOnboarding: true,
      preferredLanguage: lang,
      favoriteCategories: categories,
      contentInterests: interests,
      stats: {
        ...user.stats,
        favoriteCategory: categories.length > 0 ? (categories[0] as CategoryName) : 'Technology'
      },
      settings: {
        ...user.settings,
        language: lang
      }
    };
    await syncUserToStore(updated);
  };

  const updateWatchHistory = async (videoId: string, progressSeconds: number, durationSeconds: number) => {
    if (!user || user.settings.pauseHistory) return;
    const completed = progressSeconds >= durationSeconds * 0.85;
    const existingIndex = user.watchHistory.findIndex(h => h.videoId === videoId);
    
    let newHistory = [...user.watchHistory];
    if (existingIndex >= 0) {
      newHistory[existingIndex] = {
        videoId,
        watchedAt: new Date().toISOString(),
        progressSeconds,
        durationSeconds,
        completed: newHistory[existingIndex].completed || completed
      };
    } else {
      newHistory.unshift({
        videoId,
        watchedAt: new Date().toISOString(),
        progressSeconds,
        durationSeconds,
        completed
      });
    }

    // Keep max 50 history items
    if (newHistory.length > 50) newHistory = newHistory.slice(0, 50);

    const timeDelta = 10; // estimate 10 seconds incremental
    const updatedStats = {
      ...user.stats,
      totalVideosWatched: completed ? user.stats.totalVideosWatched + 1 : user.stats.totalVideosWatched,
      totalWatchTimeSeconds: user.stats.totalWatchTimeSeconds + timeDelta
    };

    await syncUserToStore({
      ...user,
      watchHistory: newHistory,
      stats: updatedStats
    });
  };

  const toggleLike = async (videoId: string): Promise<boolean> => {
    if (!user) return false;
    const isLiked = user.likedVideoIds.includes(videoId);
    const newLikes = isLiked 
      ? user.likedVideoIds.filter(id => id !== videoId)
      : [...user.likedVideoIds, videoId];
    
    await syncUserToStore({ ...user, likedVideoIds: newLikes });
    return !isLiked;
  };

  const toggleSave = async (videoId: string): Promise<boolean> => {
    if (!user) return false;
    const isSaved = user.savedVideoIds.includes(videoId);
    const newSaved = isSaved 
      ? user.savedVideoIds.filter(id => id !== videoId)
      : [...user.savedVideoIds, videoId];
    
    await syncUserToStore({ ...user, savedVideoIds: newSaved });
    return !isSaved;
  };

  const recordSearch = async (query: string) => {
    if (!user || !query.trim() || user.settings.pauseHistory) return;
    const cleaned = query.trim().toLowerCase();
    const filtered = user.searchHistory.filter(q => q !== cleaned);
    const newSearches = [cleaned, ...filtered].slice(0, 15);
    await syncUserToStore({ ...user, searchHistory: newSearches });
  };

  const clearHistory = async (type: 'watch' | 'search' | 'all') => {
    if (!user) return;
    const updated = { ...user };
    if (type === 'watch' || type === 'all') updated.watchHistory = [];
    if (type === 'search' || type === 'all') updated.searchHistory = [];
    await syncUserToStore(updated);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    await syncUserToStore({
      ...user,
      settings: { ...user.settings, ...newSettings }
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      authError,
      loginWithGoogle,
      loginAsDemo,
      logout,
      deleteAccount,
      completeOnboarding,
      updateWatchHistory,
      toggleLike,
      toggleSave,
      recordSearch,
      clearHistory,
      updateSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
