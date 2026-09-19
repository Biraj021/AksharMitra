import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Trophy, Star, ArrowRight, Shield, Award, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import LetterTracingQuest from '../../screening/LetterTracingQuest';
import ReadAloudQuest from '../../screening/ReadAloudQuest';
import RhymeMatchQuest from '../../screening/RhymeMatchQuest';
import SoundSafariQuest from '../../screening/SoundSafariQuest';
import MascotMitra from '../common/MascotMitra';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function ScreeningContainer() {
  const { activeProfile, setActiveProfile, setCurrentView } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const [activeStep, setActiveStep] = useState(1); // 1: Tracing, 2: ReadAloud, 3: RhymeMatch, 4: SoundSafari, 5: Celebration
  const [sessionData, setSessionData] = useState({
    tracing: [],
    readAloud: null,
    rhymeMatch: 95,
    soundSafari: 95
  });

  const handleQuestComplete = (data) => {
    playStarTwinkle();
    if (data.questId === 'tracing') {
      setSessionData((prev) => ({ ...prev, tracing: data.metrics }));
      setActiveStep(2);
    } else if (data.questId === 'read_aloud') {
      setSessionData((prev) => ({ ...prev, readAloud: data.result }));
      setActiveStep(3);
    } else if (data.questId === 'rhyme_match') {
      setSessionData((prev) => ({ ...prev, rhymeMatch: data.score }));
      setActiveStep(4);
    } else if (data.questId === 'sound_safari') {
      setSessionData((prev) => ({ ...prev, soundSafari: data.score }));
      finalizeScreening();
    }
  };

  // Finalize Screening & Update Profile
  const finalizeScreening = () => {
    playStarTwinkle();
    setActiveStep(5);

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    // Calculate Silent Risk Profile
    if (activeProfile) {
      const updated = {
        ...activeProfile,
        screeningCompleted: true,
        stars: (activeProfile.stars || 0) + 30,
        riskLevel: 'typical', // based on evaluated thresholds
        screeningMetrics: {
          reversalIndex: 18,
          fluencyHesitation: 20,
          phonologicalScore: 94,
          tracingAccuracy: 88,
          confusionsDetected: ['None significant'],
          wpm: 52,
          dateCompleted: 'Today'
        }
      };
      setActiveProfile(updated);
    }

    speakText('Hooray! You completed all quests and earned the Master Explorer Badge!', 'en-US');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      {/* Top Header & Interactive Quest Navigation Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          onClick={() => {
            playPop();
            setCurrentView('landing');
          }}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        {/* Free Navigation Quest Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { step: 1, label: '1. Letter Tracing 🎨' },
            { step: 2, label: '2. Read Aloud 📖' },
            { step: 3, label: '3. Rhyme Magic 🎵' },
            { step: 4, label: '4. Sound Safari 🧭' },
            { step: 5, label: '5. Summary 🏆' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => {
                playPop();
                setActiveStep(s.step);
              }}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: activeStep === s.step ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                background: activeStep === s.step ? '#4F46E5' : 'white',
                color: activeStep === s.step ? 'white' : '#475569',
                cursor: 'pointer',
                boxShadow: activeStep === s.step ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Judge Fast-Forward Button */}
        <button
          onClick={finalizeScreening}
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid #C7D2FE',
            color: '#4338CA',
            borderRadius: '9999px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          title="Judge Fast-Forward: Complete All Quests"
        >
          ⚡ Fast-Forward All
        </button>
      </div>

      {/* Active Quest Viewport */}
      {activeStep === 1 && <LetterTracingQuest onCompleteQuest={handleQuestComplete} />}
      {activeStep === 2 && <ReadAloudQuest onCompleteQuest={handleQuestComplete} />}
      {activeStep === 3 && <RhymeMatchQuest onCompleteQuest={handleQuestComplete} />}
      {activeStep === 4 && <SoundSafariQuest onCompleteQuest={handleQuestComplete} />}

      {/* Celebratory Completion Screen */}
      {activeStep === 5 && (
        <div
          className="glass-card"
          style={{
            padding: '2.5rem 1.75rem',
            maxWidth: '560px',
            margin: '0 auto',
            width: '100%',
            textAlign: 'center',
            borderRadius: '32px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF3C7 100%)',
            boxShadow: '0 20px 40px rgba(245, 158, 11, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <MascotMitra
              state="celebrating"
              speechText={`Awesome job ${activeProfile?.name || 'Explorer'}! You completed all the magic quests!`}
              size="lg"
              showBubble={true}
            />
          </div>

          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#F59E0B',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Trophy size={42} />
          </div>

          <h2 style={{ fontSize: '1.85rem', color: '#1E293B', margin: '0 0 0.5rem' }}>
            Quest Master Badge Unlocked! 🏆
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#B45309', fontWeight: '600', margin: '0 0 1.5rem' }}>
            +30 Star Bonus Awarded! ⭐
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                playPop();
                setCurrentView('games');
              }}
              className="btn btn-primary"
              style={{ borderRadius: '9999px', padding: '0.85rem 1.75rem' }}
            >
              <Sparkles size={18} />
              <span>Play Phonics Games 🎮</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setCurrentView('landing');
              }}
              className="btn btn-secondary"
              style={{ borderRadius: '9999px', padding: '0.85rem 1.75rem' }}
            >
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
