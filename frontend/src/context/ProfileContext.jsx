import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES } from '@backend/data/languages';
import { DEMO_PROFILES } from '@backend/data/demoProfiles';
import { TRANSLATIONS, getTranslation } from '@backend/data/translations';
import { calculateLearningProfile } from '@ai/crossSignalIntelligence';
import { calculateStreakStats, formatDateKey, getRelativeDemoAttendance } from '@backend/streakUtils';

// Data access & Auth services
import {
  getLearners,
  createLearner,
  updateLearner,
  deleteLearner,
  isDemoProfile,
  generateKidCode,
  getLearnerByKidCode,
  linkStudentToTeacher,
  getTeacherLinkedStudents,
  saveGlobalLearner,
  getStoredGlobalLearners
} from '@database/services/learnerService';
import {
  getCurrentUser,
  loginWithPhone as authLoginWithPhone,
  registerWithPhone as authRegisterWithPhone,
  loginDemoJudge as authLoginDemoJudge,
  logoutUser as authLogoutUser,
  DEMO_JUDGE_USER
} from '@database/services/authService';
import { saveParentObservation, getParentObservation } from '@database/services/parentObservationService';
import { saveActivityAttempt } from '@database/services/activityService';
import { saveLearningProfile } from '@database/services/learningProfileService';
import { saveLearnerProgress } from '@database/services/progressService';
import { flushOfflineQueue } from '@database/services/offlineSyncService';
import { isSupabaseConfigured, ensureAuthSession } from '@database/lib/supabaseClient';

const ProfileContext = createContext(null);

export const getProfilesStorageKey = (user) => {
  if (!user) return 'aksharmitra_guest_profiles';
  if (user.isDemo) return 'aksharmitra_demo_profiles_v1';
  return `aksharmitra_profiles_${user.id}`;
};

export const getActiveStorageKey = (user) => {
  if (!user) return 'aksharmitra_guest_active';
  if (user.isDemo) return 'aksharmitra_demo_active_v1';
  return `aksharmitra_active_${user.id}`;
};

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
  const defaultKidCode = isAarav ? 'AM-1001' : (isPriya ? 'AM-1002' : (p.kidCode || `AM-${(p.id || '9999').toString().slice(-4).toUpperCase()}`));

  const defaultHistory = isAarav
    ? getRelativeDemoAttendance(2)
    : (isPriya ? getRelativeDemoAttendance(12) : getRelativeDemoAttendance(2));

  const history = Array.isArray(p.attendanceHistory) && p.attendanceHistory.length > 0
    ? p.attendanceHistory
    : defaultHistory;

  // Retrieve any fresher completed screening data from global cache to avoid downgrading
  let existingScreening = null;
  try {
    const globalList = getStoredGlobalLearners();
    const match = globalList.find(
      (g) =>
        (g.id && g.id === p.id) ||
        (g.kidCode && (p.kidCode || defaultKidCode) && g.kidCode.toUpperCase() === (p.kidCode || defaultKidCode).toUpperCase())
    );
    if (match && (match.screeningCompleted || match.screeningMetrics)) {
      existingScreening = match;
    }
  } catch (e) {}

  // Check also active student profile in localStorage
  if (!existingScreening?.screeningCompleted) {
    try {
      const rawActive = localStorage.getItem('aksharmitra_active_student_profile');
      if (rawActive) {
        const parsedActive = JSON.parse(rawActive);
        if (
          (parsedActive.id && parsedActive.id === p.id) ||
          (parsedActive.kidCode && (p.kidCode || defaultKidCode) && parsedActive.kidCode.toUpperCase() === (p.kidCode || defaultKidCode).toUpperCase())
        ) {
          if (parsedActive.screeningCompleted || parsedActive.screeningMetrics) {
            existingScreening = parsedActive;
          }
        }
      }
    } catch (e) {}
  }

  const isCompleted = Boolean(p.screeningCompleted || existingScreening?.screeningCompleted);

  const normalized = {
    ...p,
    kidCode: p.kidCode || defaultKidCode,
    ageBand: p.ageBand || '5-7',
    avatarEmoji: getAvatarEmoji(p.avatarEmoji || p.avatar),
    parentFeedback: p.parentFeedback || null,
    attendanceHistory: history,
    streak: p.streak || calculateStreakStats(history).currentStreak || 1,
    screeningCompleted: isCompleted,
    riskLevel: (isCompleted && existingScreening?.riskLevel && existingScreening.riskLevel !== 'typical')
      ? existingScreening.riskLevel
      : (p.riskLevel || existingScreening?.riskLevel || 'typical'),
    screeningMetrics: (isCompleted && existingScreening?.screeningMetrics)
      ? existingScreening.screeningMetrics
      : (p.screeningMetrics || null),
    learningPathway: (isCompleted && existingScreening?.learningPathway)
      ? existingScreening.learningPathway
      : (p.learningPathway || null)
  };
  saveGlobalLearner(normalized);
  normalized.learningProfile = calculateLearningProfile(normalized);
  return normalized;
};

export function ProfileProvider({ children }) {
  const [activeLanguage, setActiveLanguage] = useState(() => {
    return SUPPORTED_LANGUAGES[0]; // Default English
  });

  // Current authenticated user session (teacher, parent, or student)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const user = getCurrentUser();
      if (user) return user;
    } catch { }
    return { id: 'demo_aarav_user', name: 'Aarav', role: 'student', isDemo: true, kidCode: 'AM-1001' };
  });

  // Current session role: 'teacher' | 'student' | 'parent'
  const [userRole, setUserRole] = useState(() => {
    try {
      const saved = localStorage.getItem('aksharmitra_user_role_v1');
      if (saved) return saved;
      const initialUser = getCurrentUser();
      if (initialUser?.role) return initialUser.role;
    } catch { }
    return 'student';
  });

  // Sync / Network state
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState(() => (isSupabaseConfigured() ? 'connected' : 'offline'));

  // User-scoped profiles store: guarantees multi-user data isolation
  const [profilesList, setProfilesList] = useState(() => {
    const initialUser = getCurrentUser() || { id: 'demo_aarav_user', isDemo: true };
    try {
      const saved = localStorage.getItem(getProfilesStorageKey(initialUser));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProfile);
        }
      }
    } catch { }
    return DEMO_PROFILES.map(normalizeProfile);
  });

  // Active child learner (for /play or focused report in /dashboard)
  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const studentProfile = localStorage.getItem('aksharmitra_active_student_profile');
      if (studentProfile) {
        const parsed = JSON.parse(studentProfile);
        if (parsed?.id) return normalizeProfile(parsed);
      }
    } catch { }

    const initialUser = getCurrentUser();
    if (initialUser) {
      try {
        const saved = localStorage.getItem(getActiveStorageKey(initialUser));
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.id) {
            if (parsed.id === 'aarav_demo' || parsed.id === 'demo_aarav') return normalizeProfile({ ...DEMO_PROFILES[0] });
            if (parsed.id === 'priya_demo' || parsed.id === 'demo_priya') return normalizeProfile({ ...DEMO_PROFILES[1] });
            return normalizeProfile(parsed);
          }
        }
      } catch { }
    }
    // Default immediately to Aarav so /play is never blank
    return normalizeProfile({ ...DEMO_PROFILES[0] });
  });

  // Navigation / View states: 'login' | 'picker' | 'landing' | 'screening' | 'games' | 'dashboard' | game subviews
  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedView = localStorage.getItem('aksharmitra_current_view_v1');
      if (savedView && savedView !== 'login' && savedView !== 'picker') return savedView;
    } catch { }
    return 'landing';
  });

  // Streak & Profile Edit Modals
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Background Database Hydration & Sync per authenticated user
  useEffect(() => {
    let isMounted = true;

    async function initDatabaseSync() {
      if (!currentUser || currentUser.isDemo || !isSupabaseConfigured()) {
        setDbStatus(isSupabaseConfigured() ? 'connected' : 'offline');
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

        // Fetch remote learners from Supabase for this parent account
        const remoteLearners = await getLearners();
        if (isMounted && remoteLearners && remoteLearners.length > 0) {
          const remoteNormalized = remoteLearners.map(normalizeProfile);
          setProfilesList((prevList) => {
            const merged = remoteNormalized.map((rem) => {
              const local = prevList.find(
                (p) =>
                  p.id === rem.id ||
                  (p.kidCode && rem.kidCode && p.kidCode.toUpperCase() === rem.kidCode.toUpperCase())
              );
              if (local && (local.screeningCompleted || local.screeningMetrics)) {
                return {
                  ...rem,
                  ...local,
                  screeningCompleted: Boolean(rem.screeningCompleted || local.screeningCompleted),
                  screeningMetrics: local.screeningMetrics || rem.screeningMetrics || null,
                  riskLevel: (local.riskLevel && local.riskLevel !== 'typical') ? local.riskLevel : (rem.riskLevel || local.riskLevel || 'typical'),
                  learningPathway: local.learningPathway || rem.learningPathway || null
                };
              }
              return rem;
            });
            // Preserve any local learners not yet pushed
            for (const prev of prevList) {
              if (
                !merged.some(
                  (m) =>
                    m.id === prev.id ||
                    (m.kidCode && prev.kidCode && m.kidCode.toUpperCase() === prev.kidCode.toUpperCase())
                )
              ) {
                merged.push(prev);
              }
            }
            try {
              localStorage.setItem(getProfilesStorageKey(currentUser), JSON.stringify(merged));
            } catch (e) { }
            return merged;
          });
        }

        // Flush any pending offline mutations
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
  }, [currentUser]);

  // Sync active profile & profiles list to user-isolated local cache
  useEffect(() => {
    if (!currentUser) return;
    const activeKey = getActiveStorageKey(currentUser);
    const profilesKey = getProfilesStorageKey(currentUser);
    try {
      if (activeProfile) {
        localStorage.setItem(activeKey, JSON.stringify(activeProfile));
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
          try {
            localStorage.setItem(profilesKey, JSON.stringify(updatedList));
          } catch (e) { }
          return updatedList;
        });
      } else {
        localStorage.removeItem(activeKey);
      }
    } catch (e) { }
  }, [activeProfile, currentUser]);

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
      setCurrentView(normalized.ageBand === '2-4' || normalized.screeningCompleted ? 'landing' : 'screening');

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

  // Authenticate Parent / Educator via Phone & Password
  const loginWithPhone = async ({ phone, password }) => {
    setIsSyncing(true);
    try {
      const user = await authLoginWithPhone({ phone, password });
      setCurrentUser(user);

      // Hydrate profiles specifically for this authenticated user
      const profilesKey = getProfilesStorageKey(user);
      let userProfiles = [];
      try {
        const saved = localStorage.getItem(profilesKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            userProfiles = parsed.map(normalizeProfile);
          }
        }
      } catch (e) { }

      // If Supabase is online, fetch remote profiles for this account
      if (isSupabaseConfigured()) {
        try {
          const remoteLearners = await getLearners();
          if (remoteLearners && remoteLearners.length > 0) {
            const remoteNormalized = remoteLearners.map(normalizeProfile);
            for (const rem of remoteNormalized) {
              const existingIdx = userProfiles.findIndex(
                (p) =>
                  p.id === rem.id ||
                  (p.kidCode && rem.kidCode && p.kidCode.toUpperCase() === rem.kidCode.toUpperCase())
              );
              if (existingIdx >= 0) {
                // Merge without clobbering completed screening
                const isComp = Boolean(userProfiles[existingIdx].screeningCompleted || rem.screeningCompleted);
                userProfiles[existingIdx] = {
                  ...rem,
                  ...userProfiles[existingIdx],
                  screeningCompleted: isComp,
                  screeningMetrics: userProfiles[existingIdx].screeningMetrics || rem.screeningMetrics || null,
                  riskLevel: (isComp && userProfiles[existingIdx].riskLevel && userProfiles[existingIdx].riskLevel !== 'typical')
                    ? userProfiles[existingIdx].riskLevel
                    : (rem.riskLevel || userProfiles[existingIdx].riskLevel || 'typical'),
                  learningPathway: userProfiles[existingIdx].learningPathway || rem.learningPathway || null
                };
              } else {
                userProfiles.push(rem);
              }
            }
            try {
              localStorage.setItem(profilesKey, JSON.stringify(userProfiles));
            } catch (e) { }
          }
        } catch (err) {
          console.warn('[ProfileContext] Error fetching learners during login:', err);
        }
      }

      setProfilesList(userProfiles);

      // Check for last active profile for this user
      const activeKey = getActiveStorageKey(user);
      let lastActive = null;
      try {
        const savedActive = localStorage.getItem(activeKey);
        if (savedActive) {
          const parsedActive = JSON.parse(savedActive);
          const found = userProfiles.find(
            (p) =>
              p.id === parsedActive.id ||
              (p.kidCode && parsedActive.kidCode && p.kidCode.toUpperCase() === parsedActive.kidCode.toUpperCase())
          );
          lastActive = found ? normalizeProfile(found) : normalizeProfile(parsedActive);
        }
      } catch (e) { }

      if (lastActive) {
        setActiveProfile(lastActive);
        setLanguageById(lastActive.language || 'english');
        setCurrentView(lastActive.ageBand === '2-4' || lastActive.screeningCompleted ? 'landing' : 'screening');
        try {
          localStorage.setItem('aksharmitra_active_student_profile', JSON.stringify(lastActive));
        } catch (e) {}
      } else if (userProfiles.length > 0) {
        const first = normalizeProfile(userProfiles[0]);
        setActiveProfile(first);
        setLanguageById(first.language || 'english');
        setCurrentView(first.ageBand === '2-4' || first.screeningCompleted ? 'landing' : 'screening');
        try {
          localStorage.setItem('aksharmitra_active_student_profile', JSON.stringify(first));
        } catch (e) {}
      } else {
        setActiveProfile(null);
      }

      return user;
    } finally {
      setIsSyncing(false);
    }
  };

  // Kid / Student Direct Login (with Kid ID or New Pass)
  const loginAsStudent = async ({ kidCode, studentName, avatar, grade, ageBand }) => {
    setIsSyncing(true);
    try {
      let student = null;
      if (kidCode) {
        student = await getLearnerByKidCode(kidCode);
        if (!student) {
          throw new Error(`No learner found with Kid ID "${kidCode}". Please check the ID or create a new student pass.`);
        }
      } else if (studentName) {
        const code = generateKidCode();
        student = {
          id: `student_${Date.now()}`,
          kidCode: code,
          name: studentName.trim(),
          avatar: avatar || 'sheru',
          avatarEmoji: getAvatarEmoji(avatar || 'sheru'),
          ageBand: ageBand || '5-7',
          grade: grade || 'grade2',
          gradeLabel: grade || 'Class 2',
          language: activeLanguage.id,
          stars: 15,
          streak: 1,
          screeningCompleted: false,
          riskLevel: 'typical',
          createdAt: new Date().toISOString()
        };
        saveGlobalLearner(student);

        // Also initiate remote persistence to Supabase if configured
        if (isSupabaseConfigured()) {
          createLearner(student).catch(() => {});
        }
      } else {
        throw new Error('Please enter your Kid ID or create a new explorer pass.');
      }

      const normalized = normalizeProfile(student);
      setActiveProfile(normalized);
      setUserRole('student');
      const studentUser = {
        id: `student_${normalized.id}`,
        name: normalized.name,
        role: 'student',
        kidCode: normalized.kidCode
      };
      setCurrentUser(studentUser);
      setProfilesList([normalized]);

      try {
        localStorage.setItem('aksharmitra_user_role_v1', 'student');
        localStorage.setItem('aksharmitra_active_student_profile', JSON.stringify(normalized));
        localStorage.setItem('aksharmitra_auth_user_v1', JSON.stringify(studentUser));
        localStorage.setItem(getProfilesStorageKey(studentUser), JSON.stringify([normalized]));
        localStorage.setItem(getActiveStorageKey(studentUser), JSON.stringify(normalized));
      } catch (e) { }

      setLanguageById(normalized.language || 'english');
      setCurrentView(normalized.ageBand === '2-4' || normalized.screeningCompleted ? 'landing' : 'screening');
      return normalized;
    } finally {
      setIsSyncing(false);
    }
  };

  // Teacher / Educator Login
  const loginAsTeacher = async ({ phone, password }) => {
    const user = await loginWithPhone({ phone, password });
    user.role = 'teacher';
    setCurrentUser(user);
    setUserRole('teacher');
    setActiveProfile(null);
    try {
      localStorage.setItem('aksharmitra_user_role_v1', 'teacher');
    } catch {}
    return user;
  };

  // Register New Teacher / Educator
  const registerAsTeacher = async ({ name, phone, password }) => {
    setIsSyncing(true);
    try {
      const user = await authRegisterWithPhone({ name, phone, password });
      user.role = 'teacher';
      setCurrentUser(user);
      setUserRole('teacher');
      setActiveProfile(null);
      setProfilesList([]);
      try {
        localStorage.setItem('aksharmitra_user_role_v1', 'teacher');
      } catch {}
      return user;
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick Demo Access for Evaluators as Teacher
  const loginTeacherDemo = () => {
    const user = { ...DEMO_JUDGE_USER, role: 'teacher' };
    setCurrentUser(user);
    setUserRole('teacher');
    try {
      localStorage.setItem('aksharmitra_user_role_v1', 'teacher');
      localStorage.setItem('aksharmitra_auth_user_v1', JSON.stringify(user));
    } catch {}
    const demoList = DEMO_PROFILES.map(normalizeProfile);
    setProfilesList(demoList);
    setActiveProfile(null);
    return user;
  };

  // Link Student to Teacher via Kid ID
  const linkStudentByKidCode = async (kidCode) => {
    if (!currentUser?.id) throw new Error('Please log in as a teacher first.');
    const linked = await linkStudentToTeacher(currentUser.id, kidCode);
    const normalized = normalizeProfile(linked);

    setProfilesList((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.id === normalized.id ||
          (p.kidCode && normalized.kidCode && p.kidCode.toUpperCase() === normalized.kidCode.toUpperCase())
      );
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        const isComp = Boolean(updated[idx].screeningCompleted || normalized.screeningCompleted);
        updated[idx] = {
          ...updated[idx],
          ...normalized,
          isLinked: true,
          screeningCompleted: isComp,
          screeningMetrics: normalized.screeningMetrics || updated[idx].screeningMetrics || null,
          riskLevel: (isComp && normalized.riskLevel && normalized.riskLevel !== 'typical')
            ? normalized.riskLevel
            : (updated[idx].riskLevel || normalized.riskLevel || 'typical')
        };
      } else {
        updated = [normalized, ...prev];
      }
      try {
        localStorage.setItem(getProfilesStorageKey(currentUser), JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return normalized;
  };

  // Register New Parent / Educator with Phone & Password (alias)
  const registerWithPhone = registerAsTeacher;

  // Quick Demo Access for Evaluators & Judges
  const loginDemoJudge = () => {
    return loginTeacherDemo();
  };

  // Full Account Sign Out
  const logoutUser = async () => {
    try {
      await authLogoutUser();
    } catch (err) {
      console.warn('[ProfileContext] Logout error:', err);
    }
    setCurrentUser(null);
    setActiveProfile(null);
    setUserRole(null);
    setProfilesList([]);
    try {
      localStorage.removeItem('aksharmitra_user_role_v1');
      localStorage.removeItem('aksharmitra_active_student_profile');
      localStorage.removeItem('aksharmitra_auth_user_v1');
    } catch (e) {}
    setCurrentView('login');
    setIsParentUnlocked(false);
  };

  // Learner Profile Sign Out (returns to Learner Picker without logging parent out)
  const logoutProfile = () => {
    if (currentUser) {
      try {
        localStorage.removeItem(getActiveStorageKey(currentUser));
      } catch (e) { }
    }
    setActiveProfile(null);
    setCurrentView('picker');
    setIsParentUnlocked(false);
  };

  // Create New Student Profile (strictly linked to current user account)
  const createStudentProfile = async ({ name, avatar, grade, languageId, ageBand = '5-7' }) => {
    const avatarEmoji = getAvatarEmoji(avatar);
    const isExplorer = ageBand === '2-4';
    const gradeLabels = {
      preschool: 'Little Explorer (Age 2-4)',
      kg: 'KG',
      grade1: 'Class 1',
      grade2: 'Class 2',
      grade3: 'Class 3',
      grade4: 'Class 4',
      grade5: 'Class 5'
    };

    const newProfile = {
      id: `student_${Date.now()}`,
      userId: currentUser?.id || 'guest',
      name: name.trim() || (isExplorer ? 'Little Explorer' : 'Explorer'),
      avatar: avatar || 'sheru',
      avatarEmoji: avatarEmoji,
      ageBand: ageBand,
      grade: isExplorer ? 'preschool' : (grade || 'grade2'),
      gradeLabel: isExplorer ? 'Little Explorer (Age 2-4)' : (gradeLabels[grade] || 'Class 2'),
      language: languageId || activeLanguage.id,
      stars: isExplorer ? 0 : 15, // Starter reward only for readers
      streak: 1,
      attendanceHistory: [formatDateKey()],
      screeningCompleted: isExplorer ? true : false,
      riskLevel: 'typical',
      learningPathway: isExplorer ? 'early_play' : 'accelerated_fluency',
      screeningMetrics: null,
      parentFeedback: null,
      createdAt: new Date().toISOString()
    };

    const normalized = normalizeProfile(newProfile);
    setActiveProfile(normalized);
    setLanguageById(normalized.language);
    setCurrentView(isExplorer ? 'landing' : 'screening');

    setProfilesList((prev) => {
      const updated = [normalized, ...prev.filter((p) => p.id !== normalized.id)];
      if (currentUser) {
        try {
          localStorage.setItem(getProfilesStorageKey(currentUser), JSON.stringify(updated));
        } catch (e) { }
      }
      return updated;
    });

    // Asynchronously persist to Supabase with proper user_id link
    if (!isDemoProfile(normalized.id) && isSupabaseConfigured()) {
      try {
        const saved = await createLearner(normalized);
        if (saved?.id && saved.id !== normalized.id) {
          const remapped = { ...normalized, id: saved.id };
          setActiveProfile((prev) => (prev?.id === normalized.id ? { ...prev, id: saved.id } : prev));
          setProfilesList((prev) => {
            const nextList = prev.map((p) => (p.id === normalized.id ? { ...p, id: saved.id } : p));
            if (currentUser) {
              try {
                localStorage.setItem(getProfilesStorageKey(currentUser), JSON.stringify(nextList));
                localStorage.setItem(getActiveStorageKey(currentUser), JSON.stringify(remapped));
              } catch (e) {}
            }
            return nextList;
          });
          try {
            localStorage.setItem('aksharmitra_active_student_profile', JSON.stringify(remapped));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[ProfileContext] Error persisting created learner to DB:', err);
      }
    }

    return normalized;
  };

  // Update an Existing Student Profile (Name, Avatar, Grade, Language, AgeBand)
  const updateStudentProfile = async ({ name, avatar, grade, languageId, ageBand }) => {
    if (!activeProfile) return null;

    const gradeLabels = {
      preschool: 'Little Explorer (Age 2-4)',
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
    if (ageBand) {
      updates.ageBand = ageBand;
      if (ageBand === '2-4') {
        updates.screeningCompleted = true;
        updates.grade = 'preschool';
        updates.gradeLabel = 'Little Explorer (Age 2-4)';
      }
    }
    if (grade && (!ageBand || ageBand !== '2-4') && activeProfile.ageBand !== '2-4') {
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

    if (currentUser) {
      try {
        localStorage.setItem(getActiveStorageKey(currentUser), JSON.stringify(updated));
      } catch (e) { }
    }

    setProfilesList((prev) => {
      const newList = prev.map((p) => (p.id === activeProfile.id ? { ...p, ...updates } : p));
      if (currentUser) {
        try {
          localStorage.setItem(getProfilesStorageKey(currentUser), JSON.stringify(newList));
        } catch (e) { }
      }
      return newList;
    });

    if (!isDemoProfile(activeProfile.id) && isSupabaseConfigured()) {
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
      if (currentUser) {
        try {
          localStorage.setItem(getProfilesStorageKey(currentUser), JSON.stringify(updated));
        } catch (e) { }
      }
      return updated;
    });

    if (activeProfile?.id === profileId) {
      logoutProfile();
    }

    if (!isDemoProfile(profileId) && isSupabaseConfigured()) {
      try {
        await deleteLearner(profileId);
      } catch (e) { }
    }
  };

  // Load Judge Demo Profile (Aarav or Priya)
  const loadDemoProfile = (demoId) => {
    const demo = DEMO_PROFILES.find((p) => p.id === demoId) || DEMO_PROFILES[0];
    const normalized = normalizeProfile(demo);
    setActiveProfile({ ...normalized });
    setLanguageById(normalized.language);
    setCurrentView(normalized.ageBand === '2-4' || normalized.screeningCompleted ? 'landing' : 'screening');
  };

  // Add stars reward
  const addStars = (count = 5) => {
    if (!activeProfile) return;
    setActiveProfile((prev) => {
      const updated = {
        ...prev,
        stars: (prev.stars || 0) + count
      };
      if (!isDemoProfile(prev.id) && isSupabaseConfigured()) {
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

  // Save Full Screening Results & Sync to Profiles, LocalStorage, Linked Teachers, and Supabase
  const saveScreeningResults = async (updatedProfile) => {
    if (!updatedProfile) return null;

    const fullProfile = {
      ...updatedProfile,
      screeningCompleted: true
    };
    fullProfile.learningProfile = calculateLearningProfile(fullProfile);

    // 1. Update active profile in state
    setActiveProfile(fullProfile);

    // 2. Persist active profile to storage
    try {
      localStorage.setItem('aksharmitra_active_student_profile', JSON.stringify(fullProfile));
      if (currentUser) {
        localStorage.setItem(getActiveStorageKey(currentUser), JSON.stringify(fullProfile));
      }
    } catch (e) {
      console.warn('[ProfileContext] Error saving active student storage:', e);
    }

    // 3. Update profilesList in React state and in currentUser's profile storage
    setProfilesList((prev) => {
      const exists = prev.some(
        (p) =>
          p.id === fullProfile.id ||
          (p.kidCode && fullProfile.kidCode && p.kidCode.toUpperCase() === fullProfile.kidCode.toUpperCase())
      );
      let newList;
      if (exists) {
        newList = prev.map((p) =>
          p.id === fullProfile.id ||
          (p.kidCode && fullProfile.kidCode && p.kidCode.toUpperCase() === fullProfile.kidCode.toUpperCase())
            ? { ...p, ...fullProfile }
            : p
        );
      } else {
        newList = [fullProfile, ...prev];
      }

      if (currentUser) {
        try {
          localStorage.setItem(getProfilesStorageKey(currentUser), JSON.stringify(newList));
        } catch (e) {}
      }
      return newList;
    });

    // 4. Save to global learners lookup cache (so teachers linking by Kid ID get completed screening)
    try {
      saveGlobalLearner(fullProfile);
    } catch (e) {}

    // 5. Update all teacher linked student stores in localStorage
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key && key.startsWith('aksharmitra_teacher_links_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const linkedList = JSON.parse(raw);
              if (Array.isArray(linkedList)) {
                let changed = false;
                const updatedList = linkedList.map((st) => {
                  if (
                    st.id === fullProfile.id ||
                    (st.kidCode &&
                      fullProfile.kidCode &&
                      st.kidCode.trim().toUpperCase() === fullProfile.kidCode.trim().toUpperCase())
                  ) {
                    changed = true;
                    return { ...st, ...fullProfile, isLinked: true };
                  }
                  return st;
                });
                if (changed) {
                  localStorage.setItem(key, JSON.stringify(updatedList));
                }
              }
            }
          } catch (err) {}
        }
      }
    } catch (e) {}

    // 6. Broadcast screening completion event so open dashboards and windows update immediately
    try {
      window.dispatchEvent(new CustomEvent('aksharmitra:screening_updated', { detail: fullProfile }));
    } catch (e) {}

    // 7. Asynchronously sync to Supabase if not a demo profile
    if (!isDemoProfile(fullProfile.id) && isSupabaseConfigured()) {
      try {
        await updateLearner(fullProfile.id, {
          kidCode: fullProfile.kidCode,
          stars: fullProfile.stars,
          screeningCompleted: true,
          riskLevel: fullProfile.riskLevel,
          learningPathway: fullProfile.learningPathway
        });
        if (fullProfile.learningProfile) {
          await saveLearningProfile(fullProfile.id, fullProfile.learningProfile);
        }
      } catch (err) {
        console.warn('[ProfileContext] Error syncing screening to DB:', err);
      }
    }

    return fullProfile;
  };

  const t = (key) => getTranslation(key, activeLanguage?.id || 'english');

  return (
    <ProfileContext.Provider
      value={{
        currentUser,
        userRole,
        setUserRole,
        loginAsStudent,
        loginAsTeacher,
        registerAsTeacher,
        loginTeacherDemo,
        linkStudentByKidCode,
        loginWithPhone,
        registerWithPhone,
        loginDemoJudge,
        logoutUser,
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
        saveScreeningResults,
        calculateLearningProfile,
        currentView,
        setCurrentView,
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
