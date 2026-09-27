import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import Header from './components/common/Header';
import AuthPage from './components/auth/AuthPage';
import LandingHero from './components/landing/LandingHero';
import ScreeningContainer from './components/screening/ScreeningContainer';
import GamesHub from './games/GamesHub';
import WordSnapper from './games/WordSnapper';
import LetterHunter from './games/LetterHunter';
import SpellingClinic from './games/SpellingClinic';
import SpellingTrapChallenge from './games/SpellingTrapChallenge';
import AbcFillIn from './games/AbcFillIn';
import LetterTracingQuest from './screening/LetterTracingQuest';
import CompanionDashboard from './components/dashboard/CompanionDashboard';
import BottomNav from './components/common/BottomNav';
import OnboardingModal from './components/auth/OnboardingModal';
import ProfileSelectorModal from './components/auth/ProfileSelectorModal';
import ReadingRuler from './components/common/ReadingRuler';
import DyslexiaSettingsModal from './components/common/DyslexiaSettingsModal';
import StreakCalendarModal from './components/common/StreakCalendarModal';
import EditProfileModal from './components/auth/EditProfileModal';
import ExplorerHome from './littleExplorer/ExplorerHome';
import SoundMatchPlay from './littleExplorer/SoundMatchPlay';
import RhymeParty from './littleExplorer/RhymeParty';
import NameThatPicture from './littleExplorer/NameThatPicture';

import { useProfile } from './context/ProfileContext';
import { getAdaptiveLearningConfig } from '@ai/adaptiveLearningStrategy';

export default function App() {
  const { activeLanguage } = useProfile();
  
  return (
    <div
      className={`app-container ${activeLanguage?.id === 'hindi' ? 'lang-hindi' : (activeLanguage?.id === 'bengali' ? 'lang-bengali' : 'lang-english')}`}
      lang={activeLanguage?.id === 'hindi' ? 'hi' : (activeLanguage?.id === 'bengali' ? 'bn' : 'en')}
      style={{ minHeight: '100vh', background: '#F8FAFC' }}
    >
      <AppRouter />
    </div>
  );
}

function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    userRole,
    currentView,
    setCurrentView,
    activeProfile,
    showStreakModal,
    setShowStreakModal,
    showEditProfileModal,
    setShowEditProfileModal
  } = useProfile();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  // Structural Routing Sync: Strict Window Separation
  useEffect(() => {
    const isAuthRoute = location.pathname === '/auth';
    const isDashboardRoute = location.pathname.startsWith('/dashboard');
    const isPlayRoute = location.pathname.startsWith('/play');

    if (!currentUser && !activeProfile) {
      if (!isAuthRoute) navigate('/auth', { replace: true });
    } else if (userRole === 'teacher' || currentUser?.role === 'teacher') {
      if (!isDashboardRoute) navigate('/dashboard', { replace: true });
    } else if (userRole === 'student') {
      if (!isPlayRoute) navigate('/play', { replace: true });
    }
  }, [currentUser, userRole, activeProfile, location.pathname, navigate]);

  // Sync back from URL to state
  useEffect(() => {
    if (location.pathname === '/dashboard' && currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
  }, [location.pathname, currentView, setCurrentView]);

  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/dashboard" element={
          <>
            <Header />
            <main className="main-content" style={{ paddingBottom: '75px' }}>
              <CompanionDashboard />
            </main>
          </>
        } />

        <Route path="/play/*" element={
          <PlayEnvironment 
            showOnboarding={showOnboarding} 
            setShowOnboarding={setShowOnboarding}
            setShowProfileSelector={setShowProfileSelector}
          />
        } />
        
        <Route path="*" element={<Navigate to={userRole === 'teacher' ? "/dashboard" : (activeProfile ? "/play" : "/auth")} replace />} />
      </Routes>

      {/* Student Global Modals */}
      {userRole === 'student' && (
        <>
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />
          <ProfileSelectorModal
            isOpen={showProfileSelector}
            onClose={() => setShowProfileSelector(false)}
            onAddNew={() => {
              setShowProfileSelector(false);
              setShowOnboarding(true);
            }}
          />
        </>
      )}
      <DyslexiaSettingsModal />
      <ReadingRuler />
      <StreakCalendarModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
      />
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
    </>
  );
}

function PlayEnvironment({ showOnboarding, setShowOnboarding, setShowProfileSelector }) {
  const {
    activeProfile,
    currentView,
    setCurrentView,
    activeLanguage
  } = useProfile();

  const isLittleExplorer = activeProfile?.ageBand === '2-4';
  const langKey = activeLanguage?.id || 'english';
  const isScreeningGated = !isLittleExplorer && activeProfile && !activeProfile.screeningCompleted && currentView !== 'login' && currentView !== 'picker';
  const adaptiveConfig = getAdaptiveLearningConfig(activeProfile);

  return (
    <>
      <Header onOpenProfileSelector={() => setShowProfileSelector(true)} />
      
      <main className="main-content" style={{ paddingBottom: isLittleExplorer ? '20px' : '75px' }}>
        {isScreeningGated && <ScreeningContainer key={`screening-${langKey}`} />}

        {/* ── Little Explorer Mode (Ages 2-4) ── */}
        {isLittleExplorer && activeProfile && (currentView === 'landing' || currentView === 'games' || currentView === 'dashboard' || currentView === 'screening') && (
          <ExplorerHome onSelectActivity={(actId) => setCurrentView(actId)} />
        )}
        {isLittleExplorer && activeProfile && currentView === 'sound-match' && (
          <SoundMatchPlay onBack={() => setCurrentView('landing')} />
        )}
        {isLittleExplorer && activeProfile && currentView === 'rhyme-party' && (
          <RhymeParty onBack={() => setCurrentView('landing')} />
        )}
        {isLittleExplorer && activeProfile && currentView === 'name-picture' && (
          <NameThatPicture onBack={() => setCurrentView('landing')} />
        )}

        {/* ── 5-7 Reader Flow ── */}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'landing' && (
          <LandingHero
            onStartOnboarding={() => setShowOnboarding(true)}
            onOpenProfileSelector={() => setShowProfileSelector(true)}
          />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'screening' && (
          <ScreeningContainer key={`screening-${langKey}`} />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'dashboard' && (
          <CompanionDashboard />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'games' && <GamesHub onSelectGame={(gameId) => setCurrentView(gameId)} />}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'word-snapper' && (
          <WordSnapper key={`ws-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'letter-hunter' && (
          <LetterHunter key={`lh-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'spelling-clinic' && (
          <SpellingClinic key={`sc-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'spelling-traps' && (
          <SpellingTrapChallenge key={`st-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'abc-fill-in' && (
          <AbcFillIn key={`af-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
        )}
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'letter-tracing' && (
          <LetterTracingQuest key={`lt-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
        )}
      </main>

      {!isLittleExplorer && activeProfile && <BottomNav />}
    </>
  );
}
