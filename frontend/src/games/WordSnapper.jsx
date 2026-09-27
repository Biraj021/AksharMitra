/**
 * WordSnapper.jsx  ·  Word Builder — Finite Session
 * ==================================================
 * Rules enforced here:
 *  1. Session language is LOCKED at mount (sessionLang ref).
 *     Changing the profile language starts a NEW session via key prop in App.
 *  2. Session word list is built ONCE (useRef) and never regenerated mid-session.
 *  3. currentWordIndex never resets to 0 automatically.
 *     When index >= sessionWords.length → completeSession() is called exactly once.
 *  4. All UI text, audio, and hints come from the locked language's content object.
 *     There is ZERO fallback to another language.
 *  5. Audio uses the language-specific BCP-47 code.
 *     If no suitable voice exists a graceful text notice is shown.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Volume2, Sparkles, Star, HelpCircle,
  ChevronRight, Lightbulb, BookOpen, Home, X, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { buildWordBuilderSession } from '@backend/data/wordBuilderData';
import MascotMitra from '../components/common/MascotMitra';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

export default function WordSnapper({ onBack, adaptiveConfig }) {
  const { activeProfile, addStars, recordActivityCompletion, activeLanguage, setCurrentView } = useProfile();
  const { playPop, playChime, playStarTwinkle } = useAudio();

  // ── Session language is LOCKED at mount. Any language change should unmount
  //    this component (via key prop in App.jsx) to start a fresh session. ──
  const sessionLangRef = useRef(activeLanguage?.id || 'english');
  const langId = sessionLangRef.current;

  // ── Build the finite session ONCE. Never rebuilt during the session. ──────
  // New state: index of the next letter the child must place.
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  // Temporary ID of a tile that was selected incorrectly (for feedback).
  const [incorrectTileId, setIncorrectTileId] = useState(null);
  // Show hint (brown highlight on correct tile) after a wrong guess or in guided mode
  const [showHint, setShowHint] = useState(Boolean(adaptiveConfig?.showExtraHints));
  // Simple lock to prevent rapid double‑clicks from advancing the index twice.
  const [isProcessing, setIsProcessing] = useState(false);

  const sessionRef = useRef(null);
  if (sessionRef.current === null) {
    sessionRef.current = buildWordBuilderSession(
      langId,
      activeProfile?.grade || 'grade2'
    );
  }
  const sessionData = sessionRef.current; // { words, ui, speechLang, speechLangFallback } | null


  // ── Check for unsupported language (strict: no silent fallback) ───────────
  if (!sessionData) {
    return (
      <div className="game-viewport" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
        <h2 style={{ color: '#1E293B', marginBottom: '0.5rem' }}>
          Language Not Available
        </h2>
        <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
          Word Builder content for <strong>{langId}</strong> is not available yet.
          Please select English or Bengali to play.
        </p>
        <button
          onClick={() => { playPop(); onBack ? onBack() : setCurrentView('games'); }}
          className="btn btn-primary"
          style={{ borderRadius: '9999px' }}
        >
          <ArrowLeft size={18} /> Back to Games
        </button>
      </div>
    );
  }

  const { words: sessionWords, ui, speechLang, speechLangFallback } = sessionData;

  // ── Audio voice availability ──────────────────────────────────────────────
  const [audioAvailable, setAudioAvailable] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setAudioAvailable(false);
      return;
    }
    const checkVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const primary = voices.some(v => v.lang.startsWith(speechLang.split('-')[0]));
      const fallback = speechLangFallback
        ? voices.some(v => v.lang.startsWith(speechLangFallback.split('-')[0]))
        : false;
      if (!primary && !fallback) setAudioAvailable(false);
    };
    // Voices may load asynchronously
    checkVoice();
    window.speechSynthesis.addEventListener('voiceschanged', checkVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', checkVoice);
  }, [speechLang, speechLangFallback]);

  /**
   * speak() — uses the locked session language BCP-47 code.
   * Falls back to speechLangFallback only if explicitly provided in content.
   * Never silently uses English for Bengali/Hindi content.
   */
  const speak = useCallback((text) => {
    if (!audioAvailable) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = speechLang;
      utt.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const exact = voices.find(v => v.lang === speechLang);
      const primary = exact || voices.find(v => v.lang.startsWith(speechLang.split('-')[0]));
      if (primary) {
        utt.voice = primary;
      } else if (speechLangFallback) {
        const fb = voices.find(v => v.lang.startsWith(speechLangFallback.split('-')[0]));
        if (fb) utt.voice = fb;
        else { setAudioAvailable(false); return; }
      } else {
        setAudioAvailable(false);
        return;
      }
      window.speechSynthesis.speak(utt);
    } catch (e) {
      setAudioAvailable(false);
    }
  }, [audioAvailable, speechLang, speechLangFallback]);

  // ── Word-level state ──────────────────────────────────────────────────────
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [placedLetters, setPlacedLetters]       = useState([]);
  const [tileBank, setTileBank]                 = useState([]);
  const [isWordSolved, setIsWordSolved]         = useState(false);
  const [showMnemonic, setShowMnemonic]         = useState(true);
  const [mascotMessage, setMascotMessage]       = useState('');
  const [isWiggling, setIsWiggling]             = useState(false);
  const [showHelpModal, setShowHelpModal]       = useState(false);

  // ── Session-level state ───────────────────────────────────────────────────
  const [sessionStars, setSessionStars]         = useState(0);
  const [wordsBuiltCount, setWordsBuiltCount]   = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  // IDs built in this session (used to pass to next session as excludeIds)
  const completedIdsRef = useRef([]);

  // ── Current word ──────────────────────────────────────────────────────────
  const currentWord = sessionWords[currentWordIndex] ?? null;

  // ── Initialise tile bank whenever currentWordIndex changes ────────────────
  useEffect(() => {
    if (!currentWord || isSessionComplete) return;

    setPlacedLetters(new Array(currentWord.letters.length).fill(null));
    setIsWordSolved(false);
    setShowHelpModal(false);
    setShowMnemonic(true);
    setShowHint(false);

    // Correct tiles (one per letter position — stable ids using index + timestamp)
    const ts = Date.now();
    const correctTiles = currentWord.letters.map((char, i) => ({
      id: `tile_${char}_${i}_${ts}`,
      char,
      targetIndex: i,
      isDistractor: false,
      used: false
    }));

    // Distractor tiles (at most 2)
    const distractorTiles = (currentWord.confusingAlternatives || [])
      .slice(0, 2)
      .map((char, i) => ({
        id: `dist_${char}_${i}_${ts}`,
        char,
        targetIndex: -1,
        isDistractor: true,
        used: false
      }));

    const allTiles = [...correctTiles, ...distractorTiles].sort(() => Math.random() - 0.5);
    setTileBank(allTiles);

    const msg = ui.buildPrompt(currentWord.word);
    setMascotMessage(msg);
    speak(currentWord.word);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex, isSessionComplete]);
  // NOTE: speak is stable (useCallback), ui is from the frozen sessionRef.

  // ── Validate completed word ───────────────────────────────────────────────
  const validateWord = useCallback((slots) => {
    if (!currentWord) return;
    const constructed = slots.map(s => s?.char ?? '').join('');
    if (constructed === currentWord.word) {
      // ✅ SUCCESS
      setIsWordSolved(true);
      playStarTwinkle();
      const earned = 5;
      addStars(earned);
      setSessionStars(prev => prev + earned);
      setWordsBuiltCount(prev => prev + 1);
      completedIdsRef.current.push(currentWord.id);

      setMascotMessage(ui.successMsg(currentWord.word));
      speak(ui.successSpeak(currentWord.word));
      setCurrentItemIndex(0);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (_) {}
    } else {
      // ❌ GENTLE FAILURE — no penalty
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 600);
      setMascotMessage(ui.retryMsg);
      speak(ui.retrySpeak);
    }
  }, [currentWord, ui, addStars, playStarTwinkle, speak]);

  // ── Place a tile into a specific slot ────────────────────────────────────
  const placeTileAtSlot = useCallback((tile, slotIndex) => {
    playChime(650);
    setPlacedLetters(prev => {
      const next = [...prev];
      next[slotIndex] = tile;
      return next;
    });
    setTileBank(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));

    // Check if all slots are now filled (we need the latest placed state)
    setPlacedLetters(prev => {
      const isFull = prev.every(s => s !== null);
      if (isFull) {
        // Defer validation to avoid reading stale state
        setTimeout(() => validateWord(prev), 0);
      }
      return prev;
    });
  }, [playChime, validateWord]);

  // ── Tap tile from bank → auto-fill first empty slot ──────────────────────
  const handleTileClick = useCallback((tile) => {
    if (isWordSolved || isProcessing) return;
    if (tile.targetIndex !== currentItemIndex) {
      // ❌ Incorrect feedback for this tile only
      setIncorrectTileId(tile.id);
      setTimeout(() => setIncorrectTileId(null), 800);
      setShowHint(true);
      // Keep current target unchanged
      return;
    }
    // ✅ Correct tile for the current position
    setIsProcessing(true);
    setShowHint(false);
    playPop();
    speak(tile.char);
    setPlacedLetters(prev => {
      const emptyIdx = prev.findIndex(s => s === null);
      const next = [...prev];
      next[emptyIdx] = tile;
      
      const isFull = next.every(s => s !== null);
      if (isFull) {
        setTimeout(() => validateWord(next), 0);
      }
      return next;
    });
    setTileBank(bank => bank.map(t => t.id === tile.id ? { ...t, used: true } : t));
    playChime(650);
    // Advance index after placement
    setCurrentItemIndex(prev => prev + 1);
    setIsProcessing(false);
  }, [isWordSolved, isProcessing, playPop, playChime, speak, currentItemIndex, validateWord]);

  // ── Tap a filled slot → return tile to bank ───────────────────────────────
  const handleSlotClick = useCallback((slotIndex) => {
    if (isWordSolved) return;
    setPlacedLetters(prev => {
      const tile = prev[slotIndex];
      if (!tile) return prev;
      playPop();
      setTileBank(bank => bank.map(t => t.id === tile.id ? { ...t, used: false } : t));
      const next = [...prev];
      next[slotIndex] = null;
      
      const newIdx = next.findIndex(s => s === null);
      if (newIdx !== -1) {
        setCurrentItemIndex(newIdx);
      }
      return next;
    });
  }, [isWordSolved, playPop]);



  // ── Move to NEXT word or COMPLETE session ─────────────────────────────────
  const handleNextWord = useCallback(() => {
    playPop();
    const nextIndex = currentWordIndex + 1;

    if (nextIndex >= sessionWords.length) {
      // ── SESSION COMPLETE — never auto-loop ──
      setIsSessionComplete(true);
      playStarTwinkle();
      if (recordActivityCompletion) {
        recordActivityCompletion({
          activityId: 'word-snapper',
          starsEarned: 10,
          metricUpdates: {
            wpm: Math.min(65, (activeProfile?.screeningMetrics?.wpm || 30) + 3),
            phonologicalScore: Math.min(100, (activeProfile?.screeningMetrics?.phonologicalScore || 70) + 4)
          }
        });
      }
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
      } catch (_) {}
    } else {
      // Advance to next word
      setCurrentWordIndex(nextIndex);
      setCurrentItemIndex(0);
      setIsWordSolved(false);
    }
  }, [currentWordIndex, sessionWords.length, playPop, playStarTwinkle, recordActivityCompletion, activeProfile]);

  // ── Practice Again — build a NEW session, excluding just-done words ───────
  const handlePracticeAgain = useCallback(() => {
    playPop();
    const newSession = buildWordBuilderSession(
      langId,
      activeProfile?.grade || 'grade2',
      completedIdsRef.current   // exclude previously practiced words
    );
    if (!newSession) return;    // language still unavailable — shouldn't happen

    sessionRef.current = newSession;     // replace frozen session
    completedIdsRef.current = [];

    setCurrentWordIndex(0);
    setSessionStars(0);
    setWordsBuiltCount(0);
    setIsSessionComplete(false);
    setIsWordSolved(false);
    setShowHelpModal(false);
    setCurrentItemIndex(0);
  }, [langId, activeProfile?.grade, playPop]);

  // ── Drag-and-drop support ─────────────────────────────────────────────────
  const handleDragStart = (e, tile) => e.dataTransfer.setData('text/plain', tile.id);
  const handleDragOver  = (e) => e.preventDefault();
  const handleDrop = useCallback((e, slotIndex) => {
    e.preventDefault();
    if (isWordSolved || isProcessing || slotIndex !== currentItemIndex) return;

    const tileId = e.dataTransfer.getData('text/plain');
    const tile   = tileBank.find(t => t.id === tileId && !t.used);
    if (!tile) return;

    if (tile.targetIndex !== currentItemIndex) {
      setIncorrectTileId(tile.id);
      setTimeout(() => setIncorrectTileId(null), 800);
      setShowHint(true);
      return;
    }

    setIsProcessing(true);
    setShowHint(false);
    playPop();
    speak(tile.char);
    setTileBank(prev => prev.map(t => t.id === tileId ? { ...t, used: true } : t));
    setPlacedLetters(prev => {
      const next = [...prev];
      next[slotIndex] = tile;
      const isFull = next.every(s => s !== null);
      if (isFull) setTimeout(() => validateWord(next), 0);
      return next;
    });
    playChime(650);
    setCurrentItemIndex(prev => prev + 1);
    setIsProcessing(false);
  }, [isWordSolved, isProcessing, currentItemIndex, tileBank, validateWord, playChime, playPop, speak]);

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: SESSION COMPLETE
  // ─────────────────────────────────────────────────────────────────────────
  if (isSessionComplete) {
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
          <MascotMitra
            state="celebrating"
            speechText={
              langId === 'bengali'
                ? `দারুণ কাজ, ${activeProfile?.name || 'বন্ধু'}! তুমি চমৎকার সব শব্দ তৈরি করেছ!`
                : (langId === 'hindi'
                  ? `शाबाश, ${activeProfile?.name || 'दोस्त'}! आपने कमाल के शब्द बनाए हैं!`
                  : `Awesome job, ${activeProfile?.name || 'Explorer'}! You snapped all the words together!`)
            }
            size="md"
            showBubble={true}
          />

          <div>
            <h2 style={{ fontSize: '2.2rem', color: '#4338CA', margin: '0 0 0.4rem', fontWeight: 900 }}>
              {ui.completionTitle}
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', margin: 0, fontWeight: 700 }}>
              {ui.completionSub}
            </p>
          </div>

          {/* Stats - Unified 3D Tier Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '400px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                padding: '1.1rem 0.75rem',
                borderRadius: '24px',
                border: '2px solid #FDE68A',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 6px 0 #D97706, 0 10px 20px rgba(245, 158, 11, 0.2)'
              }}
            >
              <div style={{ fontSize: '2rem', lineHeight: 1 }}>⭐</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#B45309', margin: '0.35rem 0 0.2rem', whiteSpace: 'nowrap' }}>
                +{sessionStars}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400E', lineHeight: 1.2 }}>
                {ui.starsEarnedLabel}
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                padding: '1.1rem 0.75rem',
                borderRadius: '24px',
                border: '2px solid #C7D2FE',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 6px 0 #4F46E5, 0 10px 20px rgba(79, 70, 229, 0.2)'
              }}
            >
              <div style={{ fontSize: '2rem', lineHeight: 1 }}>🧩</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#3730A3', margin: '0.35rem 0 0.2rem', whiteSpace: 'nowrap' }}>
                {wordsBuiltCount}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#312E81', lineHeight: 1.2 }}>
                {ui.wordsBuiltLabel}
              </div>
            </div>
          </div>

          {/* What they practiced */}
          <div style={{
            background: 'rgba(248, 250, 252, 0.9)', border: '2px solid #E2E8F0',
            borderRadius: '22px', padding: '1.25rem 1.5rem',
            width: '100%', maxWidth: '400px', textAlign: 'left'
          }}>
            <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#1E293B', marginBottom: '0.5rem' }}>
              {ui.practicedTitle}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
              {ui.practiceItems.map((item, i) => <div key={i}>✨ {item}</div>)}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '400px' }}>
            <button
              onClick={handlePracticeAgain}
              className="btn-3d-amber"
              style={{ width: '100%', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
            >
              <Sparkles size={18} />
              <span>{ui.btnPracticeAgain}</span>
            </button>

            <button
              onClick={() => { playPop(); onBack ? onBack() : setCurrentView('games'); }}
              className="btn-3d-indigo"
              style={{ width: '100%', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
            >
              <BookOpen size={18} />
              <span>{ui.btnContinueLearning}</span>
            </button>

            <button
              onClick={() => { playPop(); setCurrentView('landing'); }}
              className="btn-3d-mint"
              style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
            >
              <Home size={18} />
              <span>{ui.btnBackHome}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Safety: should not happen, but prevents crash if somehow index overflows
  if (!currentWord) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: ACTIVE WORD
  // ─────────────────────────────────────────────────────────────────────────
  const targetMnemonicEntry = currentWord.letterDetails.find(d => d.isTarget && d.mnemonic);

  return (
    <div className="game-viewport">
      {/* ── Top bar ── */}
      <div className="game-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={() => { playPop(); onBack ? onBack() : setCurrentView('games'); }}
          className="btn-3d-indigo"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>{ui.backBtn}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="hud-chip hud-chip-amber">
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
            <span>{(activeProfile?.stars || 0)} {ui.starsLabel}</span>
          </div>
          {/* Finite progress indicator */}
          <div className="hud-chip hud-chip-indigo">
            <span>{ui.wordOf(currentWordIndex + 1, sessionWords.length)}</span>
          </div>
        </div>
      </div>

      {/* ── Main Phonics Arcade Stage ── */}
      <div className="arcade-phonics-stage">
        {/* Mascot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MascotMitra
            state={isWordSolved ? 'celebrating' : 'talking'}
            speechText={mascotMessage}
            size="sm"
            showBubble={true}
          />
        </div>

        {/* Holographic Phonics Pod */}
        <div className="arcade-hologram-pod">
          {/* 3D Floating Emoji Sphere */}
          <div className="emoji-floating-sphere">
            {currentWord.emoji}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Hear Sound */}
            {audioAvailable ? (
              <button
                onClick={() => { playPop(); speak(currentWord.word); }}
                className="btn-3d-mint"
                style={{ padding: '0.45rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}
              >
                <Volume2 size={18} />
                <span>{ui.hearSoundBtn}</span>
              </button>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', padding: '0.4rem 0.75rem',
                background: '#F1F5F9', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {ui.audioUnavailable}
              </span>
            )}

            <button
              onClick={() => { playPop(); setShowMnemonic(v => !v); }}
              className="btn-3d-amber"
              style={{ padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}
            >
              <Lightbulb size={16} />
              <span>{showMnemonic ? ui.hideHintBtn : ui.showHintBtn}</span>
            </button>

            <button
              onClick={() => { playPop(); setShowHelpModal(true); }}
              className="btn-3d-coral"
              style={{ padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}
            >
              <HelpCircle size={16} />
              <span>{ui.helpBtn}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0.35rem 0 0', textAlign: 'center', fontWeight: 600 }}>
            {currentWord.meaning}
          </p>
        </div>

        {/* Mnemonic hint */}
        {showMnemonic && (
          <div className="mnemonic-box" style={{ width: '100%', maxWidth: '480px', borderRadius: '20px', border: '2px solid #FDE68A', background: '#FFFBEB' }}>
            <HelpCircle size={22} style={{ flexShrink: 0, color: '#B45309' }} />
            <div>
              <strong style={{ color: '#92400E' }}>{ui.hintLabel}</strong>{' '}
              {targetMnemonicEntry?.mnemonic || ui.hintFallback}
            </div>
          </div>
        )}

        {/* Magnetic Neon Receptor Slots */}
        <div className={`magnetic-slots-row ${isWiggling ? 'animate-wiggle' : ''}`}>
          {(() => {
            const nextEmptyIndex = placedLetters.findIndex(s => s === null);
            return placedLetters.map((slot, index) => {
              const isActiveSlot = !isWordSolved && index === nextEmptyIndex;
              const isFilled = Boolean(slot);
              return (
                <div
                  key={index}
                  className={`magnetic-receptor-slot ${isFilled ? 'filled' : ''} ${isActiveSlot ? 'active-target' : ''}`}
                  onClick={() => handleSlotClick(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  title={slot ? ui.slotTitle(index) : ui.slotEmpty(index)}
                >
                  {slot ? (
                    <span>{slot.char}</span>
                  ) : (
                    <span style={{ fontSize: '1.1rem', color: isActiveSlot ? '#D97706' : '#94A3B8', fontWeight: 800 }}>
                      {ui.slotEmpty(index)}
                    </span>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Candy 3D Tile Bank */}
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569', marginBottom: '0.65rem', textAlign: 'center' }}>
            {ui.tilesInstruction}
          </div>
          <div className="candy-tile-bank">
            {tileBank.map((tile) => {
              const isCurrent = tile.targetIndex === currentItemIndex && !tile.used;
              
              let stateClass = '';
              if (tile.used) {
                stateClass = 'used';
              } else if (incorrectTileId === tile.id) {
                stateClass = 'incorrect';
              } else if (isCurrent && showHint) {
                stateClass = 'is-hint-target';
              }

              return (
                <div
                  key={tile.id}
                  className={`candy-tile-3d ${stateClass}`}
                  draggable={!tile.used && !isWordSolved}
                  onDragStart={(e) => handleDragStart(e, tile)}
                  onClick={() => !tile.used && handleTileClick(tile)}
                >
                  <span>{tile.char}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next word button (shown after word is solved) */}
        {isWordSolved && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            animation: 'scale-up 0.3s ease-out', marginTop: '0.75rem'
          }}>
            <button
              onClick={handleNextWord}
              className="btn-3d-amber"
              style={{ fontSize: '1.25rem', padding: '0.85rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <span>{ui.nextWordBtn}</span>
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* ── Help modal ── */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px', textAlign: 'center', position: 'relative' }}
          >
            <button
              onClick={() => setShowHelpModal(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: '#F1F5F9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ margin: '0 auto 0.75rem', width: '54px', height: '54px', borderRadius: '50%',
              background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <HelpCircle size={30} />
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#1E293B', marginBottom: '0.25rem' }}>
              {ui.helpTitle}
            </h3>

            {/* Word display */}
            <div style={{ fontSize: '3.5rem', margin: '0.5rem 0' }}>{currentWord.emoji}</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4F46E5', marginBottom: '0.5rem' }}>
              {currentWord.word}
            </div>

            {/* Mnemonic hint */}
            <div style={{
              background: '#EEF2FF', border: '2px solid #C7D2FE',
              borderRadius: '20px', padding: '1.25rem', margin: '1rem 0',
              fontSize: '0.9rem', color: '#1E293B', fontWeight: '600', lineHeight: 1.5
            }}>
              {targetMnemonicEntry?.mnemonic || ui.helpHintFallback}
            </div>

            {/* Hear sound */}
            {audioAvailable ? (
              <button
                onClick={() => { playPop(); speak(currentWord.word); }}
                className="btn btn-secondary"
                style={{ borderRadius: '9999px', padding: '0.6rem 1.5rem', marginBottom: '1rem', width: '100%' }}
              >
                <Volume2 size={18} color="#4F46E5" />
                <span>{ui.helpHearBtn}</span>
              </button>
            ) : (
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {ui.audioUnavailable}
              </p>
            )}

            <button
              onClick={() => { playPop(); setShowHelpModal(false); }}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.75rem' }}
            >
              <CheckCircle size={18} />
              <span>{ui.helpCloseBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
