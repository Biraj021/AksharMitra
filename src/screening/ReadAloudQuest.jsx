import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, ArrowRight, Play, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const STORY_PROMPTS = [
  {
    id: 'story_1',
    title: 'The Big Dog',
    sentence: 'The big dog sat on a red bed.',
    words: ['The', 'big', 'dog', 'sat', 'on', 'a', 'red', 'bed.'],
    cleanWords: ['the', 'big', 'dog', 'sat', 'on', 'a', 'red', 'bed'],
    illustration: '🐕 🛏️',
    difficulty: 'Grade 1-2',
    targetPhonemes: ['b', 'd'],
    audioPrompt: 'Read this sentence out loud: The big dog sat on a red bed.'
  },
  {
    id: 'story_2',
    title: 'The Cat & Star',
    sentence: 'The little cat saw a bright star.',
    words: ['The', 'little', 'cat', 'saw', 'a', 'bright', 'star.'],
    cleanWords: ['the', 'little', 'cat', 'saw', 'a', 'bright', 'star'],
    illustration: '🐱 ⭐',
    difficulty: 'Grade 2-3',
    targetPhonemes: ['saw', 'was', 'st'],
    audioPrompt: 'Read this sentence out loud: The little cat saw a bright star.'
  },
  {
    id: 'story_3',
    title: 'Sunny Garden',
    sentence: 'Birds sing in the tall green tree.',
    words: ['Birds', 'sing', 'in', 'the', 'tall', 'green', 'tree.'],
    cleanWords: ['birds', 'sing', 'in', 'the', 'tall', 'green', 'tree'],
    illustration: '🐦 🌳',
    difficulty: 'Grade 2-3',
    targetPhonemes: ['b', 'd', 'gr', 'tr'],
    audioPrompt: 'Read this sentence out loud: Birds sing in the tall green tree.'
  }
];

// Clean word normalization
const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Levenshtein distance for forgiving speech-to-text matching
const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// Accurate & forgiving phonetic word matcher
const isWordMatch = (spokenToken, targetWord) => {
  const s = normalize(spokenToken);
  const t = normalize(targetWord);
  if (!s || !t) return false;

  // Exact match
  if (s === t) return true;

  // Child speech phonetic aliases & Web Speech approximations
  const aliases = {
    a: ['uh', 'ah', 'ay', 'an', '8', 'ey'],
    the: ['da', 'dee', 'th', 'tha', 'de'],
    to: ['two', 'too', '2', 'tu'],
    dog: ['dark', 'doc', 'duck', 'doggie', 'god'],
    sat: ['set', 'sad', 'seat', 'sit'],
    on: ['un', 'an', 'in', 'one'],
    red: ['read', 'rad', 'rid'],
    bed: ['bad', 'bet', 'head', 'fed'],
    cat: ['cut', 'cap', 'kat', 'chat'],
    saw: ['see', 'seen', 'so', 'sah', 'was'],
    star: ['start', 'stars', 'tar', 'stor'],
    bright: ['bite', 'right', 'brite', 'bride'],
    birds: ['bird', 'buds', 'words', 'burds'],
    sing: ['singing', 'sang', 'song', 'sin'],
    tree: ['three', 'free', 'tre'],
    tall: ['toll', 'all', 'tal', 'call'],
    green: ['grin', 'grain', 'grene', 'jean']
  };

  if (aliases[t] && aliases[t].includes(s)) return true;

  // Substring/stem match (e.g. "birds" vs "bird", "sing" vs "singing")
  if ((s.startsWith(t) || t.startsWith(s)) && Math.abs(s.length - t.length) <= 3) {
    return true;
  }

  // Levenshtein distance tolerance
  const dist = levenshtein(s, t);
  if (t.length <= 2) {
    return dist === 0;
  } else if (t.length <= 4) {
    return dist <= 1;
  } else {
    return dist <= 2;
  }
};

export default function ReadAloudQuest({ onCompleteQuest }) {
  const { playPop, playStarTwinkle, speakText, playChime } = useAudio();
  const { addStars } = useProfile();

  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completedIndices, setCompletedIndices] = useState(new Set());
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [readingResult, setReadingResult] = useState(null);
  const [micError, setMicError] = useState('');
  const [isKaraokeRunning, setIsKaraokeRunning] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const completedIndicesRef = useRef(new Set());
  const promptRef = useRef(STORY_PROMPTS[0]);
  const recordingStartTimeRef = useRef(null);

  const prompt = STORY_PROMPTS[currentPromptIdx];

  // Stop listening helper
  const stopListening = () => {
    isListeningRef.current = false;
    setIsRecording(false);
    clearTimeout(restartTimeoutRef.current);

    if (recognitionRef.current) {
      try {
        const rec = recognitionRef.current;
        rec.onend = null;
        rec.onerror = null;
        rec.onresult = null;
        rec.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Reset reading state helper
  const resetReadingState = () => {
    setCompletedIndices(new Set());
    setCurrentWordIdx(0);
    setLiveTranscript('');
    setReadingResult(null);
    setIsKaraokeRunning(false);
    completedIndicesRef.current = new Set();
    recordingStartTimeRef.current = null;
  };

  // Finalize reading session with real measured WPM
  const finalizeReadingSession = (count) => {
    stopListening();

    const totalWords = promptRef.current.cleanWords.length;
    const completedCount = count !== undefined ? count : completedIndicesRef.current.size;
    const accuracy = Math.min(100, Math.max(25, Math.round((completedCount / totalWords) * 100)));

    // Real measured WPM based on actual elapsed speech duration:
    const elapsedSeconds = recordingStartTimeRef.current
      ? Math.max(3, (Date.now() - recordingStartTimeRef.current) / 1000)
      : 14;
    const measuredWpm = Math.round((completedCount / (elapsedSeconds / 60)));
    const finalWpm = Math.min(110, Math.max(15, measuredWpm));

    const result = {
      accuracy,
      wpm: finalWpm,
      hesitationCount: finalWpm < 35 || accuracy < 75 ? 2 : 0,
      timestamp: Date.now()
    };

    setReadingResult(result);
    playStarTwinkle();
    addStars(5);

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // Auto-Karaoke Sing-Along Demo Mode (and fallback when mic is unavailable)
  const runKaraokeDemo = () => {
    if (isKaraokeRunning) return;
    stopListening();
    resetReadingState();
    setIsKaraokeRunning(true);
    setIsRecording(true);
    recordingStartTimeRef.current = Date.now();

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < prompt.words.length) {
        const cIdx = idx;
        const next = new Set(completedIndicesRef.current).add(cIdx);
        completedIndicesRef.current = next;
        setCompletedIndices(new Set(next));
        setCurrentWordIdx(cIdx + 1);
        playChime(420 + cIdx * 30);
        idx++;
      } else {
        clearInterval(interval);
        setIsKaraokeRunning(false);
        setIsRecording(false);
        finalizeReadingSession(prompt.words.length);
      }
    }, 450);
  };

  const startListeningInternal = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Speech recognition not supported in this browser. Please use Chrome/Edge or Sing-Along demo!');
      runKaraokeDemo();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        const cleanText = fullTranscript.trim();
        setLiveTranscript(cleanText);
        evaluateSpokenTranscript(cleanText);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone permission blocked. Please allow mic in browser settings, or use Sing-Along demo!');
          stopListening();
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              startListeningInternal();
            }
          }, 200);
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
    }
  };

  const startListening = () => {
    playPop();
    setMicError('');
    if (readingResult) resetReadingState();

    stopListening();
    isListeningRef.current = true;
    setIsRecording(true);
    recordingStartTimeRef.current = Date.now();
    startListeningInternal();
  };

  // Sequential evaluation of spoken transcript against target words
  const evaluateSpokenTranscript = (transcript) => {
    if (!transcript) return;
    const tokens = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
    if (!tokens.length) return;

    const currentPrompt = promptRef.current;
    const cleanTargets = currentPrompt.cleanWords;
    const currentCompleted = completedIndicesRef.current;

    // Find first uncompleted index
    let firstUncompleted = 0;
    while (firstUncompleted < cleanTargets.length && currentCompleted.has(firstUncompleted)) {
      firstUncompleted++;
    }

    // Match Strategy 1: Match from index 0
    let matchFromZero = new Set(currentCompleted);
    let ptrZ = 0;
    for (const token of tokens) {
      while (ptrZ < cleanTargets.length && !isWordMatch(token, cleanTargets[ptrZ])) {
        if (matchFromZero.has(ptrZ)) {
          ptrZ++;
        } else {
          break;
        }
      }
      if (ptrZ < cleanTargets.length && isWordMatch(token, cleanTargets[ptrZ])) {
        matchFromZero.add(ptrZ);
        ptrZ++;
      }
    }

    // Match Strategy 2: Match from first uncompleted index
    let matchFromUncompleted = new Set(currentCompleted);
    let ptrU = firstUncompleted;
    for (const token of tokens) {
      while (ptrU < cleanTargets.length && !isWordMatch(token, cleanTargets[ptrU])) {
        if (matchFromUncompleted.has(ptrU)) {
          ptrU++;
        } else {
          break;
        }
      }
      if (ptrU < cleanTargets.length && isWordMatch(token, cleanTargets[ptrU])) {
        matchFromUncompleted.add(ptrU);
        ptrU++;
      }
    }

    const bestSet = matchFromZero.size >= matchFromUncompleted.size ? matchFromZero : matchFromUncompleted;

    if (bestSet.size > currentCompleted.size) {
      setCompletedIndices(new Set(bestSet));
      completedIndicesRef.current = bestSet;

      // Find next target word to highlight in yellow
      let nextTarget = cleanTargets.length;
      for (let i = 0; i < cleanTargets.length; i++) {
        if (!bestSet.has(i)) {
          nextTarget = i;
          break;
        }
      }
      setCurrentWordIdx(nextTarget);
      playPop();

      if (bestSet.size >= cleanTargets.length) {
        finalizeReadingSession(cleanTargets.length);
      }
    }
  };

  // Interactive Tap-to-Read Word Card
  const handleWordClick = (word, idx) => {
    playPop();
    speakText(word, 'en-US');
    if (!recordingStartTimeRef.current) {
      recordingStartTimeRef.current = Date.now();
    }

    setCompletedIndices((prev) => {
      const next = new Set(prev).add(idx);
      completedIndicesRef.current = next;

      const cleanTargets = promptRef.current.cleanWords;
      let nextTarget = cleanTargets.length;
      for (let i = 0; i < cleanTargets.length; i++) {
        if (!next.has(i)) {
          nextTarget = i;
          break;
        }
      }
      setCurrentWordIdx(nextTarget);

      if (next.size >= cleanTargets.length) {
        finalizeReadingSession(cleanTargets.length);
      }
      return next;
    });
  };

  // Keep refs in sync with state
  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  useEffect(() => {
    completedIndicesRef.current = completedIndices;
  }, [completedIndices]);

  // Clean setup / teardown on prompt switch
  useEffect(() => {
    stopListening();
    resetReadingState();
    speakText(prompt.audioPrompt, 'en-US');

    return () => {
      stopListening();
    };
  }, [currentPromptIdx]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const handleReset = () => {
    playPop();
    stopListening();
    resetReadingState();
  };

  const handleNextPrompt = () => {
    playPop();
    stopListening();
    if (currentPromptIdx < STORY_PROMPTS.length - 1) {
      setCurrentPromptIdx(currentPromptIdx + 1);
    } else {
      if (onCompleteQuest) {
        onCompleteQuest({
          questId: 'read_aloud',
          result: readingResult
        });
      }
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.75rem',
        maxWidth: '620px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: '28px'
      }}
    >
      {/* Header with Story Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📖</span>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1E293B' }}>Quest 3: Read-Aloud Fluency</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
              Story {currentPromptIdx + 1} of {STORY_PROMPTS.length} • {prompt.title}
            </p>
          </div>
        </div>

        {/* Story Selector Pills */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {STORY_PROMPTS.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                playPop();
                stopListening();
                setCurrentPromptIdx(idx);
              }}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                border: currentPromptIdx === idx ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                background: currentPromptIdx === idx ? '#EEF2FF' : 'white',
                color: currentPromptIdx === idx ? '#4338CA' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Story {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Story Illustration Card & Interactive Karaoke Word Tiles */}
      <div
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F2 100%)',
          borderRadius: '24px',
          padding: '1.75rem 1.25rem',
          border: '2px solid #E0E7FF',
          marginBottom: '1rem',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08)'
        }}
      >
        <div style={{ fontSize: '3.2rem', marginBottom: '1rem', animation: 'gentle-bounce 3s infinite ease-in-out' }}>
          {prompt.illustration}
        </div>

        {/* Interactive Word Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
          {prompt.words.map((word, idx) => {
            const isCompleted = completedIndices.has(idx);
            const isTarget = currentWordIdx === idx && !isCompleted;

            return (
              <button
                key={idx}
                onClick={() => handleWordClick(word, idx)}
                style={{
                  fontSize: '1.45rem',
                  fontFamily: "'Lexend', sans-serif",
                  fontWeight: '700',
                  color: isCompleted ? '#065F46' : isTarget ? '#92400E' : '#1E293B',
                  background: isCompleted ? '#D1FAE5' : isTarget ? '#FEF3C7' : '#FFFFFF',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '16px',
                  border: isCompleted ? '2.5px solid #10B981' : isTarget ? '2.5px solid #F59E0B' : '2px solid #E2E8F0',
                  boxShadow: isTarget ? '0 0 16px rgba(245, 158, 11, 0.55)' : '0 2px 6px rgba(0,0,0,0.04)',
                  transform: isTarget ? 'scale(1.12)' : 'scale(1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                title="Click to hear and mark this word"
              >
                <span>{word}</span>
                {isCompleted ? (
                  <span style={{ fontSize: '0.85rem' }}>✅</span>
                ) : isTarget ? (
                  <span style={{ fontSize: '0.85rem', animation: 'gentle-bounce 1s infinite' }}>👇</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Live Heard Subtitle */}
        {liveTranscript && (
          <div
            style={{
              background: '#F8FAFC',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              fontSize: '0.82rem',
              color: '#475569',
              display: 'inline-block',
              margin: '0 auto 0.5rem'
            }}
          >
            🎙️ <strong>Heard:</strong> "{liveTranscript}"
          </div>
        )}

        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
          💡 <em>Tip: Speak into the mic, or tap each word to hear and advance!</em>
        </p>
      </div>

      {/* Mic Error Banner */}
      {micError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#DC2626', background: '#FEE2E2', padding: '0.5rem 0.75rem', borderRadius: '12px', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={16} />
          <span>{micError}</span>
        </div>
      )}

      {/* Mic Recording Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {!isRecording ? (
          <button
            onClick={startListening}
            className="btn btn-primary animate-pulse-glow"
            style={{
              borderRadius: '9999px',
              padding: '1rem 2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.25rem',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
              border: 'none',
              background: '#4F46E5',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <Mic size={24} />
            <span>{currentWordIdx > 0 && currentWordIdx < prompt.words.length ? 'Resume Reading' : 'Tap & Read Aloud'}</span>
          </button>
        ) : (
          <button
            onClick={stopListening}
            style={{
              background: '#EF4444',
              color: 'white',
              borderRadius: '9999px',
              padding: '1rem 2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.2rem',
              border: 'none',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.45)',
              animation: 'pulse-glow 1.5s infinite',
              cursor: 'pointer'
            }}
          >
            <MicOff size={24} />
            <span>Listening... Tap to Pause</span>
          </button>
        )}

        {/* Karaoke Demo Button */}
        <button
          onClick={runKaraokeDemo}
          disabled={isKaraokeRunning}
          style={{
            background: '#EEF2FF',
            border: '1.5px solid #C7D2FE',
            color: '#4338CA',
            borderRadius: '9999px',
            padding: '0.35rem 0.9rem',
            fontSize: '0.82rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Play size={14} />
          <span>Karaoke Sing-Along (Auto Demo)</span>
        </button>
      </div>

      {/* Real-time Reading Result Card */}
      {readingResult && (
        <div
          style={{
            background: '#D1FAE5',
            padding: '0.85rem 1.25rem',
            borderRadius: '18px',
            border: '2px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={22} color="#059669" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', color: '#065F46', fontSize: '1rem' }}>
                Wonderful Reading! (+5 ⭐)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                Fluency Score: {readingResult.accuracy}%
              </div>
            </div>
          </div>
          <div style={{ fontWeight: '800', color: '#047857', fontSize: '1.1rem' }}>
            {readingResult.wpm} WPM
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
        <button
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            border: '1px solid #E2E8F0',
            background: 'white',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={15} />
          <span>Reset</span>
        </button>

        <button
          onClick={handleNextPrompt}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            border: 'none',
            background: '#4F46E5',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          <span>{currentPromptIdx < STORY_PROMPTS.length - 1 ? 'Next Story' : 'Finish Reading Quest'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}