import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { DEMO_PROFILES } from '../data/demoProfiles';

const ProfileContext = createContext(null);

const STORAGE_ACTIVE_KEY = 'aksharmitra_active_profile';
const STORAGE_PROFILES_KEY = 'aksharmitra_all_profiles_v2';

const AVATAR_MAP = {
  sheru: '🦁',
  mitra: '🦉',
  appu: '🐘',
  mithu: '🦜',
  ganga: '🐬',
  tara: '🦄'
};

export function ProfileProvider({ children }) {
  const [activeLanguage, setActiveLanguage] = useState(() => {
    return SUPPORTED_LANGUAGES[0]; // Default Hindi
  });

  // Multi-profile store
  const [profilesList, setProfilesList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nonDemo = parsed.filter((p) => !p.id.startsWith('demo_') && p.id !== 'aarav_demo' && p.id !== 'priya_demo');
          return [...DEMO_PROFILES, ...nonDemo];
        }
      }
    } catch (e) {}
    // Default seed with Demo Profiles
    return [...DEMO_PROFILES];
  });

  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === 'aarav_demo') return { ...DEMO_PROFILES[0] };
        if (parsed?.id === 'priya_demo') return { ...DEMO_PROFILES[1] };
        return parsed;
      }
    } catch (e) {}
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

  // Sync active profile & profiles list to localStorage
  useEffect(() => {
    try {
      if (activeProfile) {
        localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(activeProfile));
        // Keep profilesList synchronized without redundant state sets
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
    } catch (e) {}
  }, [activeProfile]);

  // Set Language by ID
  const setLanguageById = (langId) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
    if (found) {
      setActiveLanguage(found);
    }
  };

  // Switch Active Profile by ID
  const switchProfile = (profileId) => {
    const found = profilesList.find((p) => p.id === profileId);
    if (found) {
      setActiveProfile({ ...found });
      setLanguageById(found.language || 'hindi');
      setCurrentView(found.screeningCompleted ? 'landing' : 'screening');
      return found;
    }
    return null;
  };

  // Create or Update Student Profile
  const createStudentProfile = ({ name, avatar, grade, languageId }) => {
    const avatarEmoji = AVATAR_MAP[avatar] || avatar || '🦁';
    const gradeLabels = {
      grade1: 'Class 1',
      grade2: 'Class 2',
      grade3: 'Class 3',
      grade4: 'Class 4',
      grade5: 'Class 5'
    };

    const newProfile = {
      id: `student_${Date.now()}`,
      name: name.trim() || 'दोस्त (Friend)',
      avatar: avatar || 'sheru',
      avatarEmoji: avatarEmoji,
      grade: grade || 'grade2',
      gradeLabel: gradeLabels[grade] || 'Class 2',
      language: languageId || activeLanguage.id,
      stars: 15, // Starter reward
      streak: 1,
      screeningCompleted: false,
      riskLevel: 'typical',
      learningPathway: 'accelerated_fluency',
      screeningMetrics: null,
      createdAt: new Date().toISOString()
    };

    setActiveProfile(newProfile);
    setLanguageById(newProfile.language);
    setCurrentView('screening'); // Jump to screening adventure
    return newProfile;
  };

  // Delete a Custom Profile
  const deleteProfile = (profileId) => {
    setProfilesList((prev) => {
      const updated = prev.filter((p) => p.id !== profileId);
      try {
        localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (activeProfile?.id === profileId) {
      logoutProfile();
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
    } catch (e) {}
    setCurrentView('login');
    setIsParentUnlocked(false);
  };

  // Add stars reward
  const addStars = (count = 5) => {
    if (!activeProfile) return;
    setActiveProfile((prev) => ({
      ...prev,
      stars: (prev.stars || 0) + count
    }));
  };

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
        currentView,
        setCurrentView,
        isParentUnlocked,
        setIsParentUnlocked,
        showParentModal,
        setShowParentModal,
        showPitchModal,
        setShowPitchModal
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
