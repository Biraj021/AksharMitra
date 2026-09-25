import React, { useState } from 'react';
import Header from './components/common/Header';
import LoginPage from './components/auth/LoginPage';
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
import PitchModal from './components/common/PitchModal';
import ParentPinModal from './components/auth/ParentPinModal';
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
  const {
    currentView,
    setCurrentView,
    activeLanguage,
    activeProfile,
    showStreakModal,
    setShowStreakModal,
    showEditProfileModal,
    setShowEditProfileModal
  } = useProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  // Little Explorer mode check (ages 2-4)
  const isLittleExplorer = activeProfile?.ageBand === '2-4';

  // Stable key: changing language resets game session cleanly
  const langKey = activeLanguage?.id || 'english';

  // Mandatory gating: 5-7 readers must complete screening quest first (never for Little Explorers)
  const isScreeningGated = !isLittleExplorer && activeProfile && !activeProfile.screeningCompleted && currentView !== 'login';

  // Compute deterministic adaptive learning parameters from active profile
  const adaptiveConfig = getAdaptiveLearningConfig(activeProfile);

  return (
    <div
      className={`app-container ${activeLanguage?.id === 'hindi' ? 'lang-hindi' : (activeLanguage?.id === 'bengali' ? 'lang-bengali' : 'lang-english')}`}
      lang={activeLanguage?.id === 'hindi' ? 'hi' : (activeLanguage?.id === 'bengali' ? 'bn' : 'en')}
      style={{ paddingBottom: isLittleExplorer ? '20px' : '75px', minHeight: '100vh' }}
    >
      {/* Universal Header */}
      <Header onOpenProfileSelector={() => setShowProfileSelector(true)} />

      {/* Main Dynamic Viewport */}
      <main className="main-content">
        {(currentView === 'login' || !activeProfile) && <LoginPage />}
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
        {!isLittleExplorer && !isScreeningGated && activeProfile && currentView === 'dashboard' && <CompanionDashboard />}
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

      {/* Modals & Wizards */}
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

      <PitchModal />
      <ParentPinModal />
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

      {/* Sticky Bottom Navigation Bar (5-7 Readers Only) */}
      {!isLittleExplorer && <BottomNav />}
    </div>
  );
}
