import React, { useState } from 'react';
import Header from './components/common/Header';
import LandingHero from './components/landing/LandingHero';
import CompanionDashboard from './components/dashboard/CompanionDashboard';
import ScreeningContainer from './components/screening/ScreeningContainer';
import GamesHub from './games/GamesHub';
import WordSnapper from './games/WordSnapper';
import LetterHunter from './games/LetterHunter';
import ParentPinModal from './components/auth/ParentPinModal';
import PitchModal from './components/common/PitchModal';
import OnboardingModal from './components/auth/OnboardingModal';
import ProfileSelectorModal from './components/auth/ProfileSelectorModal';
import { useProfile } from './context/ProfileContext';

export default function App() {
  const { currentView, setCurrentView, activeLanguage } = useProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  // Stable key: changing language resets game session cleanly
  const langKey = activeLanguage?.id || 'english';

  return (
    <div className="app-container">
      {/* Universal Header */}
      <Header />

      {/* Main Dynamic Viewport */}
      <main className="main-content">
        {currentView === 'landing' && (
          <LandingHero
            onStartOnboarding={() => setShowOnboarding(true)}
            onOpenProfileSelector={() => setShowProfileSelector(true)}
          />
        )}
        {currentView === 'screening' && <ScreeningContainer />}
        {currentView === 'dashboard' && <CompanionDashboard />}
        {currentView === 'games' && <GamesHub onSelectGame={(gameId) => setCurrentView(gameId)} />}
        {currentView === 'word-snapper' && (
          <WordSnapper key={`ws-${langKey}`} onBack={() => setCurrentView('games')} />
        )}
        {currentView === 'letter-hunter' && (
          <LetterHunter key={`lh-${langKey}`} onBack={() => setCurrentView('games')} />
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

      <ParentPinModal />
      <PitchModal />
    </div>
  );
}
