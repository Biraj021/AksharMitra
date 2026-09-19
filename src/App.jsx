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
import { useProfile } from './context/ProfileContext';

export default function App() {
  const { currentView, setCurrentView, activeLanguage, activeProfile } = useProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  // Stable key: changing language resets game session cleanly
  const langKey = activeLanguage?.id || 'english';

  return (
    <div className="app-container" style={{ paddingBottom: '75px', minHeight: '100vh' }}>
      {/* Universal Header */}
      <Header onOpenProfileSelector={() => setShowProfileSelector(true)} />

      {/* Main Dynamic Viewport */}
      <main className="main-content">
        {(currentView === 'login' || !activeProfile) && <LoginPage />}
        {activeProfile && currentView === 'landing' && (
          <LandingHero
            onStartOnboarding={() => setShowOnboarding(true)}
            onOpenProfileSelector={() => setShowProfileSelector(true)}
          />
        )}
        {activeProfile && currentView === 'screening' && <ScreeningContainer key={`screening-${langKey}`} />}
        {activeProfile && currentView === 'dashboard' && <CompanionDashboard />}
        {activeProfile && currentView === 'games' && <GamesHub onSelectGame={(gameId) => setCurrentView(gameId)} />}
        {activeProfile && currentView === 'word-snapper' && (
          <WordSnapper key={`ws-${langKey}`} onBack={() => setCurrentView('games')} />
        )}
        {activeProfile && currentView === 'letter-hunter' && (
          <LetterHunter key={`lh-${langKey}`} onBack={() => setCurrentView('games')} />
        )}
        {activeProfile && currentView === 'spelling-clinic' && (
          <SpellingClinic key={`sc-${langKey}`} onBack={() => setCurrentView('games')} />
        )}
        {activeProfile && currentView === 'spelling-traps' && (
          <SpellingTrapChallenge key={`st-${langKey}`} onBack={() => setCurrentView('games')} />
        )}
        {activeProfile && currentView === 'abc-fill-in' && (
          <AbcFillIn key={`af-${langKey}`} onBack={() => setCurrentView('games')} />
        )}
        {activeProfile && currentView === 'letter-tracing' && (
          <LetterTracingQuest key={`lt-${langKey}`} onBack={() => setCurrentView('games')} />
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

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
