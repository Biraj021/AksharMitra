import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Target, Star, Sparkles, RefreshCw, Volume2, 
  Zap, Trophy, ChevronRight, HelpCircle, CheckCircle, Home, BookOpen, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LETTER_HUNTER_CONTENT, buildFiniteSessionChallenges } from '@backend/data/letterHunterData';
import MascotMitra from '../components/common/MascotMitra';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

export default function LetterHunter({ onBack, adaptiveConfig }) {
  const { activeProfile, addStars, recordActivityCompletion, activeLanguage, setCurrentView } = useProfile();
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();

  // Language content setup
  const langKey = activeLanguage?.id || 'english';
  const content = LETTER_HUNTER_CONTENT[langKey] || LETTER_HUNTER_CONTENT.english;
  const isBengali = langKey === 'bengali';
  const isHindi = langKey === 'hindi';
  const speechLang = isBengali ? 'bn-IN' : (isHindi ? 'hi-IN' : 'en-US');

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
      if (recordActivityCompletion) {
        const totalAttempts = (session.totalFoundCount || 0) + (session.totalMistakes || 0) || 1;
        const accuracyRate = Math.round(((session.totalFoundCount || 1) / totalAttempts) * 100);
        // Direct mathematical measurement: Reversal error rate is inverse of identification accuracy
        const measuredReversalRate = Math.max(10, Math.min(85, Math.round(100 - accuracyRate)));

        recordActivityCompletion({
          activityId: 'letter-hunter',
          starsEarned: session.starsEarned || 5,
          metricUpdates: {
            reversalIndex: measuredReversalRate,
            letterHunterAccuracy: accuracyRate
          }
        });
      }
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
      <div className="game-viewport" style={{ maxWidth: '640px', padding: '1rem 0' }}>
        <div
          className="holo-explorer-card"
          style={{
            padding: '2.5rem 1.75rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            width: '100%'
          }}
        >
          {/* Celebrating Mascot */}
          <MascotMitra
            state="celebrating"
            speechText={
              isBengali
                ? `অসাধারণ দৃষ্টি, ${activeProfile?.name || 'বন্ধু'}! তুমি গ্রিডের সবকটি বর্ণ নিখুঁতভাবে খুঁজে পেয়েছ!`
                : (isHindi
                  ? `शानदार नज़र, ${activeProfile?.name || 'दोस्त'}! आपने ग्रिड के सभी छुपे हुए अक्षर ढूंढ लिए!`
                  : `Eagle eyes, ${activeProfile?.name || 'Explorer'}! You spotted all the target letters!`)
            }
            size="md"
            showBubble={true}
          />

          <div>
            <h2 style={{ fontSize: '2.2rem', color: '#4338CA', margin: '0 0 0.4rem', fontWeight: 900 }}>
              {content.completion.title}
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', margin: 0, fontWeight: 700 }}>
              {content.completion.subtitle}
            </p>
          </div>

          {/* Key Stat Badges - Unified 3D Tier Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '460px'
            }}
          >
            {/* Card 1: Stars */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                padding: '1.1rem 0.5rem',
                borderRadius: '22px',
                border: '2px solid #FDE68A',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 6px 0 #D97706, 0 10px 18px rgba(245, 158, 11, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>⭐</div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#B45309',
                  margin: '0.35rem 0 0.2rem',
                  whiteSpace: 'nowrap'
                }}
              >
                +{session.starsEarned}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#92400E',
                  lineHeight: 1.2
                }}
              >
                {content.completion.starsEarned}
              </div>
            </div>

            {/* Card 2: Letters Found */}
            <div
              style={{
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                padding: '1.1rem 0.5rem',
                borderRadius: '22px',
                border: '2px solid #C7D2FE',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 6px 0 #4F46E5, 0 10px 18px rgba(79, 70, 229, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>🎯</div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#3730A3',
                  margin: '0.35rem 0 0.2rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {session.totalFoundCount}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#312E81',
                  lineHeight: 1.2
                }}
              >
                {content.completion.lettersFound}
              </div>
            </div>

            {/* Card 3: Accuracy */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                padding: '1.1rem 0.5rem',
                borderRadius: '22px',
                border: '2px solid #A7F3D0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 6px 0 #059669, 0 10px 18px rgba(16, 185, 129, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>✨</div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#065F46',
                  margin: '0.35rem 0 0.2rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {accuracyPercent}%
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#047857',
                  lineHeight: 1.2
                }}
              >
                {content.completion.accuracy}
              </div>
            </div>
          </div>

          {/* Practiced Concepts Box */}
          <div
            style={{
              background: 'rgba(248, 250, 252, 0.9)',
              border: '2px solid #E2E8F0',
              borderRadius: '22px',
              padding: '1.2rem 1.5rem',
              width: '100%',
              maxWidth: '460px',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E293B', marginBottom: '0.65rem' }}>
              {content.completion.practicedTitle}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {content.completion.practiceItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    fontSize: '0.88rem',
                    color: '#475569',
                    fontWeight: 600
                  }}
                >
                  <span style={{ color: '#10B981', fontWeight: 900, fontSize: '1.1rem' }}>✓</span>
                  <span>{item.replace(/^✓\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Practice Again | Continue Learning | Back Home */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '460px' }}>
            <button
              onClick={handlePracticeAgain}
              className="btn-3d-amber"
              style={{ width: '100%', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
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
              className="btn-3d-indigo"
              style={{ width: '100%', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
            >
              <BookOpen size={18} />
              <span>{content.completion.btnContinueLearning}</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setCurrentView('landing');
              }}
              className="btn-3d-mint"
              style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
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
      <div className="game-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={() => {
            playPop();
            onBack ? onBack() : setCurrentView('games');
          }}
          className="btn-3d-indigo"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>{isBengali ? 'গেমস হাব' : 'Games Hub'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {session.streak > 1 && (
            <div className="hud-chip hud-chip-flame">
              <Zap size={15} />
              <span>{content.comboLabel(session.streak)}</span>
            </div>
          )}

          {/* Finite Progress Tracker: Challenge X of Y */}
          <div className="hud-chip hud-chip-indigo">
            <span>
              {content.progressLabel(session.currentChallengeIndex + 1, session.challenges.length)}
            </span>
          </div>

          {/* Star Counter */}
          <div className="hud-chip hud-chip-amber">
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
            <span>{(activeProfile?.stars || 0) + session.starsEarned}</span>
          </div>
        </div>
      </div>

      {/* Main Sonar Radar Pod */}
      <div className="sonar-radar-stage">
        {/* Mitra Mascot Live Guidance */}
        <MascotMitra
          state={isRoundFinished ? 'celebrating' : 'talking'}
          speechText={mascotMessage}
          size="sm"
          showBubble={true}
        />

        {/* Target Letter Spotlight Banner */}
        <div className="arcade-hologram-pod" style={{ padding: '1.25rem 1.5rem', maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                className="candy-tile-3d is-hint-target"
                style={{
                  width: '56px',
                  height: '56px',
                  fontSize: '2.2rem'
                }}
              >
                {currentChallenge.target}
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {content.targetLabel}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 800 }}>
                  {remainingTargets > 0 
                    ? content.findMore(remainingTargets, currentChallenge.target)
                    : content.allFound}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  playPop();
                  speakText(currentChallenge.target, speechLang);
                }}
                className="btn-3d-mint"
                style={{ padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                title="Hear sound"
              >
                <Volume2 size={16} />
                <span>{content.hearBtn}</span>
              </button>

              <button
                onClick={handleOpenHelp}
                className="btn-3d-amber"
                style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                title="Help Me"
              >
                <HelpCircle size={16} />
                <span>{content.helpBtn}</span>
              </button>
            </div>
          </div>

          {/* Hint Mnemonic Badge */}
          <div style={{ fontSize: '0.88rem', color: '#92400E', background: '#FEF3C7', padding: '0.45rem 1.25rem', borderRadius: '9999px', border: '1.5px solid #FDE68A', fontWeight: 700, width: '100%', textAlign: 'center' }}>
            💡 {currentChallenge.hint}
          </div>
        </div>

        {/* 4x4 Sonar Radar 3D Bubble Grid */}
        <div className="sonar-radar-grid">
          {gridTiles.map((tile, index) => {
            const isFound = foundIndices.includes(index);
            const isMistake = mistakeIndex === index;

            return (
              <div
                key={tile.id}
                className={`bubble-tile-3d ${isFound ? 'found' : ''} ${isMistake ? 'mistake' : ''}`}
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
              className="btn-3d-amber"
              style={{
                fontSize: '1.25rem',
                padding: '0.85rem 2.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <span>{content.nextChallengeBtn}</span>
              <ChevronRight size={24} />
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
