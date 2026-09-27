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
import GameWorldBackdrop from './components/common/GameWorldBackdrop';

import { useProfile } from './context/ProfileContext';
import { getAdaptiveLearningConfig } from '@ai/adaptiveLearningStrategy';

export default function App() {
  const { activeLanguage } = useProfile();
  
  return (
    <div
      className={`app-container ${activeLanguage?.id === 'hindi' ? 'lang-hindi' : (activeLanguage?.id === 'bengali' ? 'lang-bengali' : 'lang-english')}`}
      lang={activeLanguage?.id === 'hindi' ? 'hi' : (activeLanguage?.id === 'bengali' ? 'bn' : 'en')}
    >
      <GameWorldBackdrop />
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

    if (userRole === 'teacher' || currentUser?.role === 'teacher') {
      if (!isDashboardRoute) navigate('/dashboard', { replace: true });
    } else if (activeProfile) {
      if (!isPlayRoute) navigate('/play', { replace: true });
    } else {
      if (!isAuthRoute) navigate('/auth', { replace: true });
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

  // If no student profile is active, redirect to auth / student portal
  if (!activeProfile) {
    return <Navigate to="/auth" replace />;
  }

  const isLittleExplorer = activeProfile?.ageBand === '2-4';
  const langKey = activeLanguage?.id || 'english';
  const isScreeningGated = !isLittleExplorer && !activeProfile.screeningCompleted;
  const adaptiveConfig = getAdaptiveLearningConfig(activeProfile);

  // Fallback view if currentView is missing or undefined
  const effectiveView = currentView && currentView !== 'login' && currentView !== 'picker'
    ? currentView
    : (isScreeningGated ? 'screening' : 'games');

  return (
    <>
      <Header onOpenProfileSelector={() => setShowProfileSelector(true)} />
      
      <main className="main-content" style={{ paddingBottom: isLittleExplorer ? '20px' : '75px' }}>
        {/* ── Screening Gated for Unscreened Students ── */}
        {isScreeningGated ? (
          <ScreeningContainer key={`screening-${langKey}`} />
        ) : (
          <>
            {/* ── Little Explorer Mode (Ages 2-4) ── */}
            {isLittleExplorer && (effectiveView === 'landing' || effectiveView === 'games' || effectiveView === 'dashboard' || effectiveView === 'screening') && (
              <ExplorerHome onSelectActivity={(actId) => setCurrentView(actId)} />
            )}
            {isLittleExplorer && effectiveView === 'sound-match' && (
              <SoundMatchPlay onBack={() => setCurrentView('landing')} />
            )}
            {isLittleExplorer && effectiveView === 'rhyme-party' && (
              <RhymeParty onBack={() => setCurrentView('landing')} />
            )}
            {isLittleExplorer && effectiveView === 'name-picture' && (
              <NameThatPicture onBack={() => setCurrentView('landing')} />
            )}

            {/* ── 5-7 Reader Flow (Games, Quests, Trail Map & Dashboard) ── */}
            {!isLittleExplorer && effectiveView === 'landing' && (
              <LandingHero
                onStartOnboarding={() => setShowOnboarding(true)}
                onOpenProfileSelector={() => setShowProfileSelector(true)}
              />
            )}
            {!isLittleExplorer && effectiveView === 'games' && (
              <GamesHub onSelectGame={(gameId) => setCurrentView(gameId)} />
            )}
            {!isLittleExplorer && effectiveView === 'word-snapper' && (
              <WordSnapper key={`ws-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
            )}
            {!isLittleExplorer && effectiveView === 'letter-hunter' && (
              <LetterHunter key={`lh-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
            )}
            {!isLittleExplorer && effectiveView === 'spelling-clinic' && (
              <SpellingClinic key={`sc-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
            )}
            {!isLittleExplorer && effectiveView === 'spelling-traps' && (
              <SpellingTrapChallenge key={`st-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
            )}
            {!isLittleExplorer && effectiveView === 'abc-fill-in' && (
              <AbcFillIn key={`af-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
            )}
            {!isLittleExplorer && effectiveView === 'letter-tracing' && (
              <LetterTracingQuest key={`lt-${langKey}`} onBack={() => setCurrentView('games')} adaptiveConfig={adaptiveConfig} />
            )}
            {!isLittleExplorer && effectiveView === 'dashboard' && (
              <CompanionDashboard />
            )}
            {!isLittleExplorer && effectiveView === 'screening' && (
              <ScreeningContainer key={`screening-${langKey}`} />
            )}
          </>
        )}
      </main>

      {!isLittleExplorer && activeProfile && <BottomNav />}
    </>
  );
}
