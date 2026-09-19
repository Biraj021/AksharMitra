import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Target, Star, Sparkles, RefreshCw, Volume2, 
  Zap, Trophy, ChevronRight, HelpCircle, CheckCircle, Home, BookOpen, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LETTER_HUNTER_CONTENT, buildFiniteSessionChallenges } from '../data/letterHunterData';
import MascotMitra from '../components/common/MascotMitra';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

export default function LetterHunter({ onBack, adaptiveConfig }) {
  const { activeProfile, addStars, activeLanguage, setCurrentView } = useProfile();
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();

  // Language content setup
  const langKey = activeLanguage?.id || 'english';
  const content = LETTER_HUNTER_CONTENT[langKey] || LETTER_HUNTER_CONTENT.english;
  const isBengali = langKey === 'bengali';
  const speechLang = isBengali ? 'bn-IN' : (langKey === 'hindi' ? 'hi-IN' : 'en-US');

  // Finite Session State
  const [session, setSession] = useState(() => ({
    sessionId: `lh_${Date.now()}`,
    challenges: [],
    currentChallengeIndex: 0,
    completedChallenges: [],
    totalFoundCount: 0,
    totalMistakes: 0,
    streak: 0,
    starsEarned: 0,
    helpRequestsCount: 0,
    isComplete: false,
    startedAt: new Date().toISOString(),
    completedAt: null
  }));

  // Current Round Grid State
  const [gridTiles, setGridTiles] = useState([]);
  const [foundIndices, setFoundIndices] = useState([]);
  const [mistakeIndex, setMistakeIndex] = useState(null);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [mascotMessage, setMascotMessage] = useState('');
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Initialize or Restart a Finite Learning Session
  const startNewSession = useCallback((excludeIds = []) => {
    const selectedChallenges = buildFiniteSessionChallenges(
      langKey,
      activeProfile?.grade || 'grade2',
      excludeIds
    );

    setSession({
      sessionId: `lh_${Date.now()}`,
      challenges: selectedChallenges,
      currentChallengeIndex: 0,
      completedChallenges: [],
      totalFoundCount: 0,
      totalMistakes: 0,
      streak: 0,
      starsEarned: 0,
      helpRequestsCount: 0,
      isComplete: false,
      startedAt: new Date().toISOString(),
      completedAt: null
    });
    setConsecutiveMistakes(0);
  }, [langKey, activeProfile?.grade]);

  // Start initial session on mount or language switch
  useEffect(() => {
    startNewSession();
  }, [startNewSession]);

  // Active Challenge in current round
  const currentChallenge = session.challenges[session.currentChallengeIndex] || null;

  // Initialize Grid when active challenge changes
  const setupRoundGrid = useCallback(() => {
    if (!currentChallenge || session.isComplete) return;

    setFoundIndices([]);
    setMistakeIndex(null);
    setIsRoundFinished(false);
    setShowHelpModal(false);

    const totalCells = currentChallenge.gridSize || 16;
    const targetCount = currentChallenge.targetCount || 4;

    // Pick unique random positions for target letters
    const targetPositions = new Set();
    while (targetPositions.size < Math.min(targetCount, totalCells)) {
      targetPositions.add(Math.floor(Math.random() * totalCells));
    }

    const tiles = [];
    for (let i = 0; i < totalCells; i++) {
      if (targetPositions.has(i)) {
        tiles.push({
          id: `tile_${currentChallenge.target}_${i}_${Date.now()}`,
          char: currentChallenge.target,
          isTarget: true
        });
      } else {
        const randomDistractor = currentChallenge.distractors[
          Math.floor(Math.random() * currentChallenge.distractors.length)
        ];
        tiles.push({
          id: `tile_${randomDistractor}_${i}_${Date.now()}`,
          char: randomDistractor,
          isTarget: false
        });
      }
    }

    setGridTiles(tiles);
    setMascotMessage(content.mascotStart(currentChallenge.target, targetCount));

    // Announce target letter
    speakText(currentChallenge.target, speechLang);
  }, [currentChallenge, session.isComplete, content, speakText, speechLang]);

  useEffect(() => {
    setupRoundGrid();
  }, [setupRoundGrid]);

  // Handle Tile Click in Grid
  const handleTileClick = (tile, index) => {
    if (isRoundFinished || session.isComplete || foundIndices.includes(index)) return;

    if (tile.isTarget) {
      // Correct target letter spotted!
      const newFound = [...foundIndices, index];
      setFoundIndices(newFound);
      setConsecutiveMistakes(0);

      const newStreak = session.streak + 1;
      setSession(prev => ({
        ...prev,
        totalFoundCount: prev.totalFoundCount + 1,
        streak: newStreak
      }));

      // Multi-tone chime ascending with streak
      const noteFreq = 440 + Math.min(newStreak, 6) * 65;
      playChime(noteFreq);
      speakText(tile.char, speechLang);

      // Check if all targets for this round are found
      if (newFound.length >= currentChallenge.targetCount) {
        handleRoundSuccess(newStreak);
      } else {
        const remaining = currentChallenge.targetCount - newFound.length;
        setMascotMessage(content.mascotFound(currentChallenge.target, remaining));
      }
    } else {
      // Distractor letter tapped - Gentle Failure UX
      playPop();
      setMistakeIndex(index);
      setTimeout(() => setMistakeIndex(null), 500);

      const newMistakesCount = consecutiveMistakes + 1;
      setConsecutiveMistakes(newMistakesCount);

      setSession(prev => ({
        ...prev,
        totalMistakes: prev.totalMistakes + 1,
        streak: 0
      }));

      setMascotMessage(content.mascotDistractor(tile.char, currentChallenge.target));
      speakText(tile.char, speechLang);

      // Offer gentle Help Me automatically if child struggles (adjust based on adaptiveConfig)
      const mistakeThreshold = adaptiveConfig?.showExtraHints ? 2 : 3;
      if (newMistakesCount >= mistakeThreshold) {
        setTimeout(() => {
          setShowHelpModal(true);
        }, 600);
      }
    }
  };

  // Round Success Logic
  const handleRoundSuccess = (currentStreak) => {
    setIsRoundFinished(true);
    playStarTwinkle();

    const roundStarReward = 5 + Math.min(currentStreak, 3);
    addStars(roundStarReward);

    setSession(prev => ({
      ...prev,
      starsEarned: prev.starsEarned + roundStarReward,
      completedChallenges: [...prev.completedChallenges, currentChallenge.id]
    }));

    setMascotMessage(content.mascotWinRound(currentChallenge.target));

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // Move to Next Round or Finalize Session (NO INFINITE LOOP GUARD)
  const handleNextChallenge = () => {
    playPop();
    const nextIndex = session.currentChallengeIndex + 1;

    // Check if we reached the end of this finite session
    if (nextIndex >= session.challenges.length) {
      // SESSION COMPLETE!
      setSession(prev => ({
        ...prev,
        isComplete: true,
        completedAt: new Date().toISOString()
      }));

      playStarTwinkle();
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (e) {}
    } else {
      // Advance to next challenge in session
      setSession(prev => ({
        ...prev,
        currentChallengeIndex: nextIndex
      }));
    }
  };

  // User explicitly starts a fresh practice session
  const handlePracticeAgain = () => {
    playPop();
    // Exclude previously completed challenge IDs so next session gets fresh variety
    startNewSession(session.completedChallenges);
  };

  // Handle Help Me Modal Trigger
  const handleOpenHelp = () => {
    playPop();
    setSession(prev => ({ ...prev, helpRequestsCount: prev.helpRequestsCount + 1 }));
    setShowHelpModal(true);
  };

  // Remaining target count in active round
  const remainingTargets = currentChallenge 
    ? Math.max(0, currentChallenge.targetCount - foundIndices.length)
    : 0;

  // Compute accuracy for final completion card
  const totalAttempts = session.totalFoundCount + session.totalMistakes;
  const accuracyPercent = totalAttempts > 0 
    ? Math.round((session.totalFoundCount / totalAttempts) * 100) 
    : 100;

  // =========================================================================
  // VIEW: 4. COMPLETION SCREEN (Session Ended)
  // =========================================================================
  if (session.isComplete) {
    return (
      <div className="game-viewport" style={{ maxWidth: '640px' }}>
        <div
          className="glass-card"
          style={{
            padding: '2.5rem 1.75rem',
            textAlign: 'center',
            borderRadius: '28px',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: '0 16px 40px rgba(99, 102, 241, 0.15)'
          }}
        >
          {/* Celebrating Mascot */}
          <MascotMitra
            state="celebrating"
            speechText={
              isBengali
                ? `অভিনন্দন ${activeProfile?.name || 'বন্ধু'}! আজকের বর্ণ শিকার মিশন সম্পূর্ণ হয়েছে!`
                : `Superstar ${activeProfile?.name || 'Explorer'}! Today's Letter Hunt is complete!`
            }
            size="md"
            showBubble={true}
          />

          <div>
            <h2 style={{ fontSize: '2.2rem', color: '#4F46E5', margin: '0 0 0.4rem' }}>
              {content.completion.title}
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#64748B', margin: 0 }}>
              {content.completion.subtitle}
            </p>
          </div>

          {/* Key Stat Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '460px'
            }}
          >
            <div style={{ background: '#FEF3C7', padding: '1rem 0.5rem', borderRadius: '18px', border: '1.5px solid #FDE68A' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#B45309' }}>
                ⭐ +{session.starsEarned}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400E' }}>
                {content.completion.starsEarned}
              </div>
            </div>

            <div style={{ background: '#EEF2FF', padding: '1rem 0.5rem', borderRadius: '18px', border: '1.5px solid #C7D2FE' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#4338CA' }}>
                🎯 {session.totalFoundCount}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3730A3' }}>
                {content.completion.lettersFound}
              </div>
            </div>

            <div style={{ background: '#D1FAE5', padding: '1rem 0.5rem', borderRadius: '18px', border: '1.5px solid #A7F3D0' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#065F46' }}>
                ✨ {accuracyPercent}%
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#047857' }}>
                {content.completion.accuracy}
              </div>
            </div>
          </div>

          {/* Practiced Concepts Box */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '18px',
              padding: '1.25rem 1.5rem',
              width: '100%',
              maxWidth: '460px',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1E293B', marginBottom: '0.5rem' }}>
              {content.completion.practicedTitle}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#64748B' }}>
              {content.completion.practiceItems.map((item, idx) => (
                <div key={idx}>{item}</div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Practice Again | Continue Learning | Back Home */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px' }}>
            <button
              onClick={handlePracticeAgain}
              className="btn btn-amber animate-pulse-glow"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.85rem' }}
            >
              <Sparkles size={18} />
              <span>{content.completion.btnPracticeAgain}</span>
            </button>

            <button
              onClick={() => {
                playPop();
                if (onBack) onBack();
                else setCurrentView('games');
              }}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.85rem' }}
            >
              <BookOpen size={18} />
              <span>{content.completion.btnContinueLearning}</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setCurrentView('landing');
              }}
              className="btn btn-secondary"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.75rem' }}
            >
              <Home size={18} />
              <span>{content.completion.btnBackHome}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If challenges loading / empty fallback
  if (!currentChallenge) {
    return (
      <div className="game-viewport" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p>Setting up your Letter Hunt challenges...</p>
        <button onClick={() => startNewSession()} className="btn btn-primary" style={{ borderRadius: '9999px' }}>
          Start Hunt
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ACTIVE CHALLENGE ROUND
  // =========================================================================
  return (
    <div className="game-viewport">
      {/* Top Header & Progress Indicators */}
      <div className="game-top-bar">
        <button
          onClick={() => {
            playPop();
            onBack ? onBack() : setCurrentView('games');
          }}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>{isBengali ? 'গেমস হাব' : 'Games Hub'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {session.streak > 1 && (
            <div className="combo-badge">
              <Zap size={14} />
              <span>{content.comboLabel(session.streak)}</span>
            </div>
          )}

          {/* Finite Progress Tracker: Challenge X of Y */}
          <div className="game-stat-pill" style={{ color: '#4338CA', background: '#EEF2FF', borderColor: '#C7D2FE' }}>
            <span>
              {content.progressLabel(session.currentChallengeIndex + 1, session.challenges.length)}
            </span>
          </div>

          {/* Star Counter */}
          <div className="game-stat-pill" style={{ color: '#B45309', background: '#FEF3C7', borderColor: '#FDE68A' }}>
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
            <span>{(activeProfile?.stars || 0) + session.starsEarned}</span>
          </div>
        </div>
      </div>

      {/* Main Play Card */}
      <div
        className="glass-card"
        style={{
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          borderRadius: '28px',
          background: 'white',
          position: 'relative'
        }}
      >
        {/* Mitra Mascot Live Guidance */}
        <MascotMitra
          state={isRoundFinished ? 'celebrating' : 'talking'}
          speechText={mascotMessage}
          size="sm"
          showBubble={true}
        />

        {/* Target Letter Spotlight Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            padding: '1rem 1.75rem',
            borderRadius: '20px',
            border: '2px solid #C7D2FE',
            width: '100%',
            maxWidth: '440px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#4F46E5',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                fontWeight: '800',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
              }}
            >
              {currentChallenge.target}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase' }}>
                {content.targetLabel}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: '600' }}>
                {remainingTargets > 0 
                  ? content.findMore(remainingTargets, currentChallenge.target)
                  : content.allFound}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => {
                playPop();
                speakText(currentChallenge.target, speechLang);
              }}
              className="btn-primary btn-pill"
              style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Hear sound"
            >
              <Volume2 size={16} />
              <span>{content.hearBtn}</span>
            </button>

            <button
              onClick={handleOpenHelp}
              className="btn-secondary btn-pill"
              style={{ padding: '0.4rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: '#FDE68A', background: '#FFFBEB' }}
              title="Help Me"
            >
              <HelpCircle size={16} color="#D97706" />
              <span style={{ color: '#B45309', fontWeight: '700' }}>{content.helpBtn}</span>
            </button>
          </div>
        </div>

        {/* Hint Mnemonic Badge */}
        <div style={{ fontSize: '0.84rem', color: '#92400E', background: '#FEF3C7', padding: '0.4rem 1.15rem', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
          💡 {currentChallenge.hint}
        </div>

        {/* 4x4 Interactive Letter Grid */}
        <div
          className="hunter-grid-container"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
        >
          {gridTiles.map((tile, index) => {
            const isFound = foundIndices.includes(index);
            const isMistake = mistakeIndex === index;

            return (
              <div
                key={tile.id}
                className={`hunter-tile ${isFound ? 'found' : ''} ${isMistake ? 'gentle-mistake' : ''}`}
                onClick={() => handleTileClick(tile, index)}
              >
                {isFound ? '⭐' : tile.char}
              </div>
            );
          })}
        </div>

        {/* Round Complete -> Advance to Next Challenge in Finite Session */}
        {isRoundFinished && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              animation: 'scale-up 0.3s ease-out'
            }}
          >
            <button
              onClick={handleNextChallenge}
              className="btn btn-amber animate-pulse-glow"
              style={{
                fontSize: '1.2rem',
                padding: '0.85rem 2.25rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <span>{content.nextChallengeBtn}</span>
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          HELP ME MODAL (Child-Friendly Support)
         ========================================================================= */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
            <button
              onClick={() => setShowHelpModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ margin: '0 auto 0.75rem', width: '54px', height: '54px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <HelpCircle size={30} />
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#1E293B', marginBottom: '0.25rem' }}>
              {content.helpTitle}
            </h3>

            {/* Visual Contrast Demonstration */}
            <div
              style={{
                background: '#EEF2FF',
                border: '2px solid #C7D2FE',
                borderRadius: '20px',
                padding: '1.25rem',
                margin: '1rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#4338CA' }}>
                {currentChallenge.helpDetails?.visualDemo || currentChallenge.target}
              </div>

              <p style={{ fontSize: '0.9rem', color: '#1E293B', margin: 0, fontWeight: '600', lineHeight: 1.4 }}>
                {currentChallenge.helpDetails?.targetRule || currentChallenge.hint}
              </p>

              {currentChallenge.helpDetails?.contrastRule && (
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  {currentChallenge.helpDetails.contrastRule}
                </p>
              )}
            </div>

            {/* Hear sound button */}
            <button
              onClick={() => {
                playPop();
                speakText(currentChallenge.target, speechLang);
              }}
              className="btn btn-secondary"
              style={{ borderRadius: '9999px', padding: '0.6rem 1.5rem', marginBottom: '1rem', width: '100%' }}
            >
              <Volume2 size={18} color="#4F46E5" />
              <span>{isBengali ? 'উচ্চারণ শুনো' : 'Hear Sound'}</span>
            </button>

            {/* Close / Return Button */}
            <button
              onClick={() => {
                playPop();
                setShowHelpModal(false);
              }}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.75rem' }}
            >
              <CheckCircle size={18} />
              <span>{content.helpClose}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
