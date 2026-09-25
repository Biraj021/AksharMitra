import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES } from '@backend/data/languages';
import { DEMO_PROFILES } from '@backend/data/demoProfiles';
import { TRANSLATIONS, getTranslation } from '@backend/data/translations';
import { calculateLearningProfile } from '@ai/crossSignalIntelligence';
import { calculateStreakStats, formatDateKey, getRelativeDemoAttendance } from '@backend/streakUtils';

// Data access services
import {
  getLearners,
  createLearner,
  updateLearner,
  deleteLearner,
  isDemoProfile
} from '@database/services/learnerService';
import { saveParentObservation, getParentObservation } from '@database/services/parentObservationService';
import { saveActivityAttempt } from '@database/services/activityService';
import { saveLearningProfile } from '@database/services/learningProfileService';
import { saveLearnerProgress } from '@database/services/progressService';
import { flushOfflineQueue } from '@database/services/offlineSyncService';
import { isSupabaseConfigured, ensureAuthSession } from '@database/lib/supabaseClient';

const ProfileContext = createContext(null);

const STORAGE_ACTIVE_KEY = 'aksharmitra_active_profile';
const STORAGE_PROFILES_KEY = 'aksharmitra_all_profiles_v2';
const STORAGE_VERSION_KEY = 'aksharmitra_storage_version';

export const AVATAR_MAP = {
  sheru: '🦁',
  gaja: '🐘',
  mayur: '🦚',
  khargosh: '🐰',
  titu: '🦜',
  bhalu: '🐻',
  taara: '⭐',
  chiku: '🤖',
  mitra: '🦉',
  appu: '🐘',
  mithu: '🦜',
  ganga: '🐬',
  tara: '🦄'
};

export const getAvatarEmoji = (avatarIdOrEmoji) => {
  if (!avatarIdOrEmoji) return '🦁';
  if (AVATAR_MAP[avatarIdOrEmoji]) return AVATAR_MAP[avatarIdOrEmoji];
  if (/\p{Extended_Pictographic}/u.test(avatarIdOrEmoji)) return avatarIdOrEmoji;
  return '🦁';
};

const normalizeProfile = (p) => {
  if (!p) return p;
  const isAarav = p.id === 'demo_aarav' || p.id === 'aarav_demo';
  const isPriya = p.id === 'demo_priya' || p.id === 'priya_demo';
  const defaultHistory = isAarav
    ? getRelativeDemoAttendance(2)
    : (isPriya ? getRelativeDemoAttendance(12) : getRelativeDemoAttendance(2));

  const history = Array.isArray(p.attendanceHistory) && p.attendanceHistory.length > 0
    ? p.attendanceHistory
    : defaultHistory;

  const normalized = {
    ...p,
    avatarEmoji: getAvatarEmoji(p.avatarEmoji || p.avatar),
    parentFeedback: p.parentFeedback || null,
    attendanceHistory: history,
    streak: p.streak || calculateStreakStats(history).currentStreak || 1
  };
  normalized.learningProfile = calculateLearningProfile(normalized);
  return normalized;
};

export function ProfileProvider({ children }) {
  const [activeLanguage, setActiveLanguage] = useState(() => {
    return SUPPORTED_LANGUAGES[0]; // Default English
  });

  // Sync / Network state
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState(() => (isSupabaseConfigured() ? 'connected' : 'offline'));

  // Multi-profile store: Instant local hydration to prevent blank page
  const [profilesList, setProfilesList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nonDemo = parsed
            .filter((p) => !p.id.startsWith('demo_') && p.id !== 'aarav_demo' && p.id !== 'priya_demo')
            .map(normalizeProfile);
          return [...DEMO_PROFILES.map(normalizeProfile), ...nonDemo];
        }
      }
    } catch (e) { }
    // Default seed with Demo Profiles
    return DEMO_PROFILES.map(normalizeProfile);
  });

  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === 'aarav_demo' || parsed?.id === 'demo_aarav') return normalizeProfile({ ...DEMO_PROFILES[0] });
        if (parsed?.id === 'priya_demo' || parsed?.id === 'demo_priya') return normalizeProfile({ ...DEMO_PROFILES[1] });
        return normalizeProfile(parsed);
      }
    } catch (e) { }
    return null;
  });

  // Navigation / View states: 'login' | 'landing' | 'screening' | 'games' | 'dashboard' | game subviews
  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
      return saved ? 'landing' : 'login';
    } catch {
      return 'login';
    }
  });

  // Parent / Teacher Companion Mode Modal & Auth state
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Ref to prevent race conditions during background sync
  const isMigratingRef = useRef(false);

  // Background Database Hydration & Migration
  useEffect(() => {
    let isMounted = true;

    async function initDatabaseSync() {
      if (!isSupabaseConfigured()) {
        setDbStatus('offline');
        return;
      }

      try {
        setIsSyncing(true);
        const user = await ensureAuthSession();
        if (!user) {
          setDbStatus('offline');
          setIsSyncing(false);
          return;
        }

        setDbStatus('connected');

        // 1. Fetch remote learners from Supabase
        const remoteLearners = await getLearners();
        if (isMounted && remoteLearners && remoteLearners.length > 0) {
          setProfilesList((prevList) => {
            const demoList = DEMO_PROFILES.map(normalizeProfile);
            const remoteNormalized = remoteLearners.map(normalizeProfile);
            return [...demoList, ...remoteNormalized];
          });
        }

        // 2. Safe Legacy localStorage Migration (Phase 12)
        const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);
        if (currentVersion !== '2' && !isMigratingRef.current) {
          isMigratingRef.current = true;
          const rawLocal = localStorage.getItem(STORAGE_PROFILES_KEY);
          if (rawLocal) {
            try {
              const parsed = JSON.parse(rawLocal);
              if (Array.isArray(parsed)) {
                const customProfiles = parsed.filter(
                  (p) => p && !p.id.startsWith('demo_') && p.id !== 'aarav_demo' && p.id !== 'priya_demo'
                );

                for (const p of customProfiles) {
                  // Check if already in remote
                  const existsRemote = (remoteLearners || []).some((r) => r.id === p.id);
                  if (!existsRemote) {
                    await createLearner(p);
                    if (p.parentFeedback) {
                      await saveParentObservation(p.id, p.parentFeedback);
                    }
                    if (p.learningProfile) {
                      await saveLearningProfile(p.id, p.learningProfile);
                    }
                  }
                }
              }
            } catch (err) {
              console.warn('[ProfileContext] Error migrating local profiles:', err);
            }
          }
          localStorage.setItem(STORAGE_VERSION_KEY, '2');
          isMigratingRef.current = false;
        }

        // 3. Flush any pending offline mutations
        await flushOfflineQueue({
          CREATE_LEARNER: (payload) => createLearner(payload),
          UPDATE_LEARNER: ({ learnerId, updates }) => updateLearner(learnerId, updates),
          SAVE_PARENT_OBSERVATION: ({ learnerId, feedbackData }) => saveParentObservation(learnerId, feedbackData),
          SAVE_ACTIVITY_ATTEMPT: (payload) => saveActivityAttempt(payload),
          SAVE_LEARNING_PROFILE: ({ learnerId, learningProfile }) => saveLearningProfile(learnerId, learningProfile),
          SAVE_PROGRESS: (payload) => saveLearnerProgress(payload)
        });
      } catch (err) {
        console.warn('[ProfileContext] Background DB sync warning:', err);
        setDbStatus('offline');
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    initDatabaseSync();

    const handleOnlineSync = () => {
      if (!isSyncing) {
        initDatabaseSync();
      }
    };
    window.addEventListener('aksharmitra:online_sync', handleOnlineSync);

    return () => {
      isMounted = false;
      window.removeEventListener('aksharmitra:online_sync', handleOnlineSync);
    };
  }, []);

  // Sync active profile & profiles list to local cache for instant reload
  useEffect(() => {
    try {
      if (activeProfile) {
        localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(activeProfile));
        setProfilesList((prevList) => {
          const index = prevList.findIndex((p) => p.id === activeProfile.id);
          if (index >= 0 && JSON.stringify(prevList[index]) === JSON.stringify(activeProfile)) {
            return prevList;
          }
          let updatedList;
          if (index >= 0) {
            updatedList = [...prevList];
            updatedList[index] = activeProfile;
          } else {
            updatedList = [activeProfile, ...prevList];
          }
          localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(updatedList));
          return updatedList;
        });
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_KEY);
      }
    } catch (e) { }
  }, [activeProfile]);

  // Set Language by ID
  const setLanguageById = (langId) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
    if (found) {
      setActiveLanguage(found);
    }
  };

  // Switch Active Profile by ID
  const switchProfile = async (profileId) => {
    const found = profilesList.find((p) => p.id === profileId);
    if (found) {
      const normalized = normalizeProfile(found);
      setActiveProfile({ ...normalized });
      setLanguageById(normalized.language || 'english');
      setCurrentView(normalized.screeningCompleted ? 'landing' : 'screening');

      // Fetch fresh parent feedback from DB if real learner
      if (!isDemoProfile(profileId) && isSupabaseConfigured()) {
        try {
          const freshFeedback = await getParentObservation(profileId);
          if (freshFeedback) {
            setActiveProfile((prev) => {
              if (prev?.id !== profileId) return prev;
              const refreshed = { ...prev, parentFeedback: freshFeedback };
              refreshed.learningProfile = calculateLearningProfile(refreshed);
              return refreshed;
            });
          }
        } catch (e) { }
      }
      return normalized;
    }
    return null;
  };

  // Create or Update Student Profile
  const createStudentProfile = async ({ name, avatar, grade, languageId }) => {
    const avatarEmoji = getAvatarEmoji(avatar);
    const gradeLabels = {
      kg: 'KG',
      grade1: 'Class 1',
      grade2: 'Class 2',
      grade3: 'Class 3',
      grade4: 'Class 4',
      grade5: 'Class 5'
    };

    const newProfile = {
      id: `student_${Date.now()}`,
      name: name.trim() || 'Explorer',
      avatar: avatar || 'sheru',
      avatarEmoji: avatarEmoji,
      grade: grade || 'grade2',
      gradeLabel: gradeLabels[grade] || 'Class 2',
      language: languageId || activeLanguage.id,
      stars: 15, // Starter reward
      streak: 1,
      attendanceHistory: [formatDateKey()],
      screeningCompleted: false,
      riskLevel: 'typical',
      learningPathway: 'accelerated_fluency',
      screeningMetrics: null,
      parentFeedback: null,
      createdAt: new Date().toISOString()
    };

    const normalized = normalizeProfile(newProfile);
    setActiveProfile(normalized);
    setLanguageById(normalized.language);
    setCurrentView('screening'); // Jump to screening adventure

    // Asynchronously persist to Supabase
    try {
      const saved = await createLearner(normalized);
      if (saved?.id && saved.id !== normalized.id) {
        setActiveProfile((prev) => (prev?.id === normalized.id ? { ...prev, id: saved.id } : prev));
      }
    } catch (err) {
      console.warn('[ProfileContext] Error persisting created learner to DB:', err);
    }

    return normalized;
  };

  // Update an Existing Student Profile (Name, Avatar, Grade, Language)
  const updateStudentProfile = async ({ name, avatar, grade, languageId }) => {
    if (!activeProfile) return null;

    const gradeLabels = {
      kg: 'Kindergarten / KG',
      grade1: 'Grade 1',
      grade2: 'Grade 2',
      grade3: 'Grade 3',
      grade4: 'Grade 4'
    };

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (avatar) {
      updates.avatar = avatar;
      updates.avatarEmoji = getAvatarEmoji(avatar);
    }
    if (grade) {
      updates.grade = grade;
      updates.gradeLabel = gradeLabels[grade] || 'Grade 2';
    }
    if (languageId) {
      updates.language = languageId;
      setLanguageById(languageId);
    }

    const updated = {
      ...activeProfile,
      ...updates
    };
    updated.learningProfile = calculateLearningProfile(updated);
    setActiveProfile(updated);

    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(updated));
    } catch (e) { }

    setProfilesList((prev) => {
      const newList = prev.map((p) => (p.id === activeProfile.id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(newList));
      } catch (e) { }
      return newList;
    });

    if (!isDemoProfile(activeProfile.id)) {
      try {
        await updateLearner(activeProfile.id, updates);
      } catch (err) {
        console.warn('[ProfileContext] Error updating learner in DB:', err);
      }
    }

    return updated;
  };

  // Delete a Custom Profile
  const deleteProfile = async (profileId) => {
    setProfilesList((prev) => {
      const updated = prev.filter((p) => p.id !== profileId);
      try {
        localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });

    if (activeProfile?.id === profileId) {
      logoutProfile();
    }

    if (!isDemoProfile(profileId)) {
      try {
        await deleteLearner(profileId);
      } catch (e) { }
    }
  };

  // Load Judge Demo Profile (Aarav or Priya)
  const loadDemoProfile = (demoId) => {
    const demo = DEMO_PROFILES.find((p) => p.id === demoId) || DEMO_PROFILES[0];
    setActiveProfile({ ...demo });
    setLanguageById(demo.language);
    setCurrentView('dashboard');
  };

  // Logout / Return to Profile Login Screen
  const logoutProfile = () => {
    setActiveProfile(null);
    try {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
    } catch (e) { }
    setCurrentView('login');
    setIsParentUnlocked(false);
  };

  // Add stars reward
  const addStars = (count = 5) => {
    if (!activeProfile) return;
    setActiveProfile((prev) => {
      const updated = {
        ...prev,
        stars: (prev.stars || 0) + count
      };
      if (!isDemoProfile(prev.id)) {
        updateLearner(prev.id, { stars: updated.stars }).catch(() => { });
      }
      return updated;
    });
  };

  // Update Parent Observation & Feedback
  const updateParentFeedback = async (feedbackData) => {
    if (!activeProfile) return null;
    const updated = {
      ...activeProfile,
      parentFeedback: feedbackData
    };
    updated.learningProfile = calculateLearningProfile(updated);
    setActiveProfile(updated);

    // Asynchronously persist to Supabase
    if (!isDemoProfile(activeProfile.id)) {
      try {
        await saveParentObservation(activeProfile.id, feedbackData);
        if (updated.learningProfile) {
          await saveLearningProfile(activeProfile.id, updated.learningProfile);
        }
      } catch (err) {
        console.warn('[ProfileContext] Error saving observation to DB:', err);
      }
    }

    return updated;
  };

  // Record Activity Completion & Trigger Reassessment
  const recordActivityCompletion = async ({ activityId, starsEarned = 5, metricUpdates = {} }) => {
    if (!activeProfile) return null;
    const existingMetrics = activeProfile.screeningMetrics || {};
    const updatedMetrics = {
      ...existingMetrics,
      ...metricUpdates,
      lastActivityCompleted: activityId,
      lastActivityDate: new Date().toISOString()
    };

    const todayKey = formatDateKey();
    const prevHistory = Array.isArray(activeProfile.attendanceHistory) ? activeProfile.attendanceHistory : [];
    const updatedHistory = prevHistory.includes(todayKey) ? prevHistory : [...prevHistory, todayKey];
    const streakStats = calculateStreakStats(updatedHistory);

    const updated = {
      ...activeProfile,
      stars: (activeProfile.stars || 0) + starsEarned,
      streak: streakStats.currentStreak,
      attendanceHistory: updatedHistory,
      screeningMetrics: updatedMetrics
    };
    updated.learningProfile = calculateLearningProfile(updated);
    setActiveProfile(updated);

    // Asynchronously persist to Supabase
    if (!isDemoProfile(activeProfile.id)) {
      try {
        await updateLearner(activeProfile.id, {
          stars: updated.stars,
          screeningCompleted: updated.screeningCompleted
        });
        await saveActivityAttempt({
          learnerId: activeProfile.id,
          activityId,
          language: activeLanguage?.id || 'en',
          starsEarned,
          metricUpdates
        });
        if (updated.learningProfile) {
          await saveLearningProfile(activeProfile.id, updated.learningProfile);
        }
        await saveLearnerProgress({
          learnerId: activeProfile.id,
          activityId,
          completed: true,
          stars: starsEarned
        });
      } catch (err) {
        console.warn('[ProfileContext] Error persisting activity completion:', err);
      }
    }

    return updated;
  };

  const t = (key) => getTranslation(key, activeLanguage?.id || 'english');

  return (
    <ProfileContext.Provider
      value={{
        activeLanguage,
        setActiveLanguage,
        setLanguageById,
        activeProfile,
        setActiveProfile,
        profilesList,
        switchProfile,
        createStudentProfile,
        deleteProfile,
        loadDemoProfile,
        logoutProfile,
        addStars,
        updateParentFeedback,
        recordActivityCompletion,
        calculateLearningProfile,
        currentView,
        setCurrentView,
        isParentUnlocked,
        setIsParentUnlocked,
        showParentModal,
        setShowParentModal,
        showPitchModal,
        setShowPitchModal,
        showStreakModal,
        setShowStreakModal,
        showEditProfileModal,
        setShowEditProfileModal,
        updateStudentProfile,
        getAvatarEmoji,
        t,
        getTranslation,
        isSyncing,
        dbStatus
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
