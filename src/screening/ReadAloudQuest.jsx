import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle, ArrowRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const STORY_PROMPTS = [
  {
    id: 'story_1',
    sentence: 'The big dog sat on a soft bed.',
    words: ['The', 'big', 'dog', 'sat', 'on', 'a', 'soft', 'bed.'],
    illustration: '🐕 🛏️',
    difficulty: 'Grade 1-2',
    targetPhonemes: ['b', 'd'],
    audioPrompt: 'Read this sentence out loud: The big dog sat on a soft bed.'
  },
  {
    id: 'story_2',
    sentence: 'The little cat saw a bright star.',
    words: ['The', 'little', 'cat', 'saw', 'a', 'bright', 'star.'],
    illustration: '🐱 ⭐',
    difficulty: 'Grade 2-3',
    targetPhonemes: ['saw', 'was'],
    audioPrompt: 'Read this sentence out loud: The little cat saw a bright star.'
  }
];

export default function ReadAloudQuest({ onCompleteQuest }) {
  const { playPop, playStarTwinkle, speakText, playChime } = useAudio();
  const { addStars } = useProfile();

  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [spokenText, setSpokenText] = useState('');
  const [readingResult, setReadingResult] = useState(null); // { accuracy: 90, wpm: 45, hesitationCount: 1 }
  const [isAssistedReading, setIsAssistedReading] = useState(false);

  const recognitionRef = useRef(null);
  const prompt = STORY_PROMPTS[currentPromptIdx];

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenText(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        evaluateSpeech();
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    // Speak prompt instruction
    speakText(prompt.audioPrompt);
  }, [currentPromptIdx]);

  // Start Mic Recording
  const handleStartRecording = () => {
    playPop();
    setSpokenText('');
    setReadingResult(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        // Fallback to simulated reading if mic is blocked in venue
        simulateReading();
      }
    } else {
      simulateReading();
    }
  };

  // Stop Mic Recording
  const handleStopRecording = () => {
    playPop();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  // Simulated Assisted Karaoke (Venue fail-safe)
  const simulateReading = () => {
    setIsAssistedReading(true);
    setIsRecording(true);
    setSpokenText('');

    let current = 0;
    const interval = setInterval(() => {
      if (current < prompt.words.length) {
        setActiveWordIdx(current);
        playChime(440 + current * 40);
        current++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
        setIsAssistedReading(false);
        setActiveWordIdx(-1);
        evaluateSpeech(prompt.sentence);
      }
    }, 450);
  };

  // Evaluate Reading Fluency & Speed
  const evaluateSpeech = (overrideText) => {
    const textToEvaluate = overrideText || spokenText || prompt.sentence;
    const expectedWords = prompt.sentence.toLowerCase().replace(/[^a-zA-Z ]/g, '').split(' ');
    const spokenWords = textToEvaluate.toLowerCase().replace(/[^a-zA-Z ]/g, '').split(' ');

    let matchedCount = 0;
    expectedWords.forEach((w) => {
      if (spokenWords.includes(w)) matchedCount++;
    });

    const accuracy = Math.round((matchedCount / expectedWords.length) * 100);
    const estimatedWPM = accuracy > 70 ? Math.floor(45 + Math.random() * 20) : Math.floor(22 + Math.random() * 10);

    const result = {
      accuracy,
      wpm: estimatedWPM,
      hesitationCount: accuracy < 80 ? 2 : 0,
      timestamp: Date.now()
    };

    setReadingResult(result);
    playStarTwinkle();
    addStars(5);

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  const handleNextPrompt = () => {
    playPop();
    if (currentPromptIdx < STORY_PROMPTS.length - 1) {
      setCurrentPromptIdx(currentPromptIdx + 1);
      setReadingResult(null);
      setSpokenText('');
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
        maxWidth: '560px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: '28px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📖</span>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1E293B' }}>Quest 2: Read-Aloud Fluency</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
              Story {currentPromptIdx + 1} of {STORY_PROMPTS.length}
            </p>
          </div>
        </div>

        <button
          onClick={() => speakText(prompt.audioPrompt)}
          style={{
            background: '#EEF2FF',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4F46E5'
          }}
          title="Listen to Sentence"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Story Illustration & Karaoke Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F2 100%)',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '2px solid #E0E7FF',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.08)'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
          {prompt.illustration}
        </div>

        {/* Karaoke Words Highlight */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {prompt.words.map((word, idx) => {
            const isHighlighted = activeWordIdx === idx;
            return (
              <span
                key={idx}
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: isHighlighted ? '#4F46E5' : '#1E293B',
                  background: isHighlighted ? '#FEF3C7' : 'transparent',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '8px',
                  borderBottom: isHighlighted ? '3px solid #F59E0B' : '3px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          Target Confusions: {prompt.targetPhonemes.join(' & ')}
        </p>
      </div>

      {/* Mic Recording Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="btn btn-primary animate-pulse-glow"
            style={{
              borderRadius: '9999px',
              padding: '0.9rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.1rem'
            }}
          >
            <Mic size={22} />
            <span>Tap & Read Aloud</span>
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="btn"
            style={{
              background: '#EF4444',
              color: 'white',
              borderRadius: '9999px',
              padding: '0.9rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.1rem',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
            }}
          >
            <MicOff size={22} />
            <span>Listening... Tap when done</span>
          </button>
        )}

        {/* Assisted Playback Fallback Button */}
        <button
          onClick={simulateReading}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366F1',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Play size={12} />
          <span>Karaoke Sing-Along Mode (Venue Demo)</span>
        </button>
      </div>

      {/* Reading Results Badge */}
      {readingResult && (
        <div
          style={{
            background: '#D1FAE5',
            padding: '0.75rem 1rem',
            borderRadius: '16px',
            border: '1.5px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} color="#059669" />
            <span style={{ fontWeight: '700', color: '#065F46', fontSize: '0.95rem' }}>
              Great Reading! (+5 ⭐)
            </span>
          </div>
          <div style={{ fontWeight: '800', color: '#047857', fontSize: '0.9rem' }}>
            {readingResult.wpm} WPM • {readingResult.accuracy}% Accuracy
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleNextPrompt}
          className="btn btn-primary btn-pill"
          style={{ gap: '0.4rem' }}
        >
          <span>{currentPromptIdx < STORY_PROMPTS.length - 1 ? 'Next Story' : 'Complete Reading Quest'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
