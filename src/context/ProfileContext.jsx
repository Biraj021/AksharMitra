import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { DEMO_PROFILES } from '../data/demoProfiles';

const ProfileContext = createContext(null);

const STORAGE_KEY = 'aksharmitra_active_profile';

export function ProfileProvider({ children }) {
  const [activeLanguage, setActiveLanguage] = useState(() => {
    return SUPPORTED_LANGUAGES[0]; // Default Hindi
  });

  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Navigation / View states: 'landing' | 'screening' | 'remediation' | 'dashboard' | 'game'
  const [currentView, setCurrentView] = useState('landing');
  
  // Parent / Teacher Companion Mode Modal & Auth state
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeProfile));
    }
  }, [activeProfile]);

  // Set Language by ID
  const setLanguageById = (langId) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.id === langId);
    if (found) {
      setActiveLanguage(found);
    }
  };

  // Create or Update Student Profile
  const createStudentProfile = ({ name, avatar, grade, languageId }) => {
    const newProfile = {
      id: `student_${Date.now()}`,
      name: name.trim() || 'दोस्त (Friend)',
      avatar: avatar || 'sheru',
      grade: grade || 'grade2',
      language: languageId || activeLanguage.id,
      stars: 10, // Starter gift
      streak: 1,
      screeningCompleted: false,
      screeningMetrics: null,
      createdAt: new Date().toISOString()
    };
    setActiveProfile(newProfile);
    setLanguageById(newProfile.language);
    setCurrentView('screening'); // Proceed to screening adventure
    return newProfile;
  };

  // Load Judge Demo Profile (Aarav or Priya)
  const loadDemoProfile = (demoId) => {
    const demo = DEMO_PROFILES.find(p => p.id === demoId) || DEMO_PROFILES[0];
    setActiveProfile({ ...demo });
    setLanguageById(demo.language);
    setCurrentView('dashboard'); // Jump straight to companion dashboard for demo analysis
  };

  // Logout / Reset to Landing
  const logoutProfile = () => {
    setActiveProfile(null);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentView('landing');
    setIsParentUnlocked(false);
  };

  // Add stars reward
  const addStars = (count = 5) => {
    if (!activeProfile) return;
    setActiveProfile(prev => ({
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
        createStudentProfile,
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
