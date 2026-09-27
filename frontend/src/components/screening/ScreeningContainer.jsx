import React, { useState, useRef } from 'react';
import { Volume2, ArrowRight, ArrowLeft, Trophy, Sparkles, Award, CheckCircle, Brain, Target, Mic, Music, AlertCircle, Play, Star, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import MirrorLetterQuest from '../../screening/MirrorLetterQuest';
import RhymeBeatsQuest from '../../screening/RhymeBeatsQuest';
import ReadAloudQuest from '../../screening/ReadAloudQuest';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function ScreeningContainer() {
  const { activeProfile, setActiveProfile, saveScreeningResults, setCurrentView, activeLanguage, t } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  // 0: Roadmap Overview, 1: Mirror Letters, 2: Rhyme Beats, 3: Read Aloud, 4: Diagnostic Snapshot
  const [activeStep, setActiveStep] = useState(0);

  const sessionDataRef = useRef({
    mirrorLetters: null,
    rhymeBeats: null,
    readAloud: null
  });

  const [sessionData, setSessionData] = useState({
    mirrorLetters: null,
    rhymeBeats: null,
    readAloud: null
  });

  const handleStartQuest = (stepNumber) => {
    if (activeProfile?.screeningCompleted) {
      const proceed = window.confirm(
        `Screening was already completed for ${activeProfile.name}. Retaking this screening quest will update and recalculate their diagnostic indicators. Do you wish to continue?`
      );
      if (!proceed) return;
    }
    playPop();
    setActiveStep(stepNumber);
  };

  const handleQuestComplete = (data) => {
    playStarTwinkle();
    if (data.questId === 'mirror_letters') {
      sessionDataRef.current.mirrorLetters = data.metrics;
      setSessionData({ ...sessionDataRef.current });
      setActiveStep(2); // Advance to Round 2: Rhyme Beats
      speakText(
        isHindi
          ? 'पहला राउंड बहुत अच्छा रहा! अब लय और तुकबंदी का खेल शुरू करते हैं।'
          : isBengali
          ? 'প্রথম পর্ব খুব ভালো হয়েছে! এবার ছন্দের খেলা শুরু হোক।'
          : 'Great job on mirror letters! Now let us test rhyme beats.',
        speechLang
      );
    } else if (data.questId === 'rhyme_beats') {
      sessionDataRef.current.rhymeBeats = {
        score: data.score ?? 80,
        syllableAccuracy: data.syllableAccuracy ?? 80
      };
      setSessionData({ ...sessionDataRef.current });
      setActiveStep(3); // Advance to Round 3: Read Aloud
      speakText(
        isHindi
          ? 'शानदार तुकबंदी! अब मित्रा के साथ एक मजेदार कहानी ज़ोर से पढ़ें।'
          : isBengali
          ? 'চমৎকার ছন্দ! এবার মিত্রার সাথে একটি মজার গল্প জোরে পড়ো।'
          : 'Awesome rhymes! Finally, read a fun story aloud for Mitra.',
        speechLang
      );
    } else if (data.questId === 'read_aloud') {
      const result = data.result || null;
      sessionDataRef.current.readAloud = result;
      setSessionData({ ...sessionDataRef.current });
      finalizeScreening(sessionDataRef.current);
    }
  };

  const finalizeScreening = (finalData) => {
    playStarTwinkle();
    setActiveStep(4);

    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    const hasIncompleteData = !finalData.mirrorLetters || !finalData.rhymeBeats || !finalData.readAloud;

    const visualAcc = finalData.mirrorLetters?.accuracy ?? 0;
    const phonoScore = finalData.rhymeBeats?.score ?? 0;
    const readWpm = finalData.readAloud?.wpm ?? 0;
    const readAcc = finalData.readAloud?.accuracy ?? 0;

    let computedRisk = 'typical';
    let confusions = ['None significant'];
    let pathway = 'accelerated_fluency';
    let pathwayTitle = 'Track A: Foundational Fluency & Word Mastery';
    let pathwayDesc = 'All core phonological and visual orientation milestones are on target! Recommended for speed reading, vocabulary building, and advanced matra puzzles.';

    if (hasIncompleteData) {
      computedRisk = 'incomplete';
      confusions = ['Screening incomplete - cannot assess'];
      pathway = 'incomplete';
      pathwayTitle = 'Screening Incomplete';
      pathwayDesc = 'Some quests were skipped or incomplete. Please restart the screening to get an accurate recommendation.';
    } else if (visualAcc <= 70 && ((finalData.mirrorLetters?.reversalErrors || 0) > 2 || (finalData.mirrorLetters?.visualReversalScore || 0) > 25)) {
      computedRisk = 'mild_visual';
      confusions = ['b / d letter mirror reversal', 'was / saw word directionality'];
      pathway = 'multisensory_remediation';
      pathwayTitle = 'Track B: Visual-Spatial & Mirror Remediation';
      pathwayDesc = 'Visual orientation hesitation detected. Recommended for tactile tracing, high-contrast anti-glare color tint, and Lexend dyslexia-friendly typography.';
    } else if (phonoScore <= 70) {
      computedRisk = 'phonological_support';
      confusions = ['Auditory rhyme discrimination', 'Syllable rhythm isolation'];
      pathway = 'multisensory_remediation';
      pathwayTitle = 'Track B: Phonological & Syllable Support';
      pathwayDesc = 'Auditory syllable segmentation lag detected. Recommended for acoustic rhyme matching, sound snapping, and audio-reinforced phonics.';
    } else if (visualAcc <= 75 || phonoScore <= 75 || readWpm <= 35) {
      computedRisk = 'elevated';
      confusions = ['Multi-axis reading hesitation', 'b / d / p / q confusion'];
      pathway = 'multisensory_remediation';
      pathwayTitle = 'Track B: Multisensory Orton-Gillingham Remediation';
      pathwayDesc = 'Elevated reading friction across multiple cognitive signals. Recommended for step-by-step multisensory learning and educator consultation.';
    }

    if (activeProfile) {
      const updated = {
        ...activeProfile,
        screeningCompleted: true,
        stars: (activeProfile.stars || 0) + 35,
        riskLevel: computedRisk,
        learningPathway: pathway,
        screeningMetrics: {
          reversalIndex: Math.max(5, 100 - visualAcc),
          fluencyHesitation: Math.max(5, 100 - readAcc),
          phonologicalScore: phonoScore,
          tracingAccuracy: visualAcc,
          confusionsDetected: confusions,
          wpm: readWpm,
          pathway: pathway,
          pathwayTitle: pathwayTitle,
          pathwayDesc: pathwayDesc,
          dateCompleted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      };
      if (saveScreeningResults) {
        saveScreeningResults(updated);
      } else {
        setActiveProfile(updated);
      }
    }

    speakText(
      pathway === 'incomplete'
        ? 'Screening incomplete. Please restart to get your full recommendation.'
        : pathway === 'accelerated_fluency'
        ? 'Great job! You are ready for advanced fluency and word building adventures!'
        : 'Awesome effort! Mitra has prepared personalized multisensory games just for you!',
      speechLang
    );
  };

  const handleMitraIntroAudio = () => {
    playPop();
    const text = isHindi
      ? "अक्षरमित्र में आपका स्वागत है! हम अक्षरों की दिशा, तुकबंदी और कहानी पढ़ने के 3 मजेदार खेल खेलेंगे। क्या आप तैयार हैं?"
      : isBengali
      ? "অক্ষরমিত্রায় স্বাগতম! আমরা বর্ণের আকার, ছন্দ ও গল্প পড়ার ৩টি মজার খেলা খেলব। শুরু করতে প্রস্তুত?"
      : "Welcome to Akshar Island! We're going to play 3 fun games with letter shapes, rhymes, and reading aloud. Ready to explore?";
    speakText(text, speechLang);
  };

  // Metric helpers
  const visualAccuracy = sessionData.mirrorLetters?.accuracy ?? 0;
  const phonologicalScore = sessionData.rhymeBeats?.score ?? 0;
  const readingWpm = sessionData.readAloud?.wpm ?? 0;

  const isTypical = visualAccuracy >= 75 && phonologicalScore >= 75;
  const isIncomplete = !sessionData.mirrorLetters || !sessionData.rhymeBeats || !sessionData.readAloud;
  const studentName = activeProfile?.name || (isHindi ? 'नन्हे खोजी' : (isBengali ? 'অনন্য' : 'Explorer'));

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.6rem',
        padding: '0.5rem 0.5rem 3.5rem'
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          VIEW 0: SCREENING ISLAND ROADMAP
         ───────────────────────────────────────────────────────────── */}
      {activeStep === 0 && (
        <>
          {/* Top Holographic Quest Hero Banner */}
          <div className="holo-explorer-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(255, 255, 255, 0.18)',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  color: '#FDE047',
                  letterSpacing: '0.04em'
                }}
              >
                <span>🧭</span>
                <span>{t('screeningTimeEstimate')}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86EFAC', fontWeight: 900, fontSize: '0.9rem' }}>
                <Star size={16} fill="#FDE047" color="#FDE047" />
                <span>+35 Star Reward</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
              {t('screeningRoadmapTitle')}
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#E0E7FF', lineHeight: 1.5, margin: 0, maxWidth: '520px' }}>
              {t('screeningRoadmapSubtitle')}
            </p>
          </div>

          {/* Unscreened Initial Notification Banner */}
          {!activeProfile?.screeningCompleted && (
            <div
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '3px solid #F59E0B',
                borderRadius: '26px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem',
                boxShadow: '0 10px 24px rgba(245, 158, 11, 0.2)'
              }}
            >
              <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🌟</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#92400E' }}>
                  {isBengali ? `স্বাগতম ${studentName}! প্রাথমিক মূল্যায়ন আবশ্যক` : `Welcome ${studentName}! Initial Quest Required`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#B45309', marginTop: '0.2rem', lineHeight: 1.45 }}>
                  {isBengali
                    ? 'প্ল্যাটফর্মের সম্পূর্ণ অংশ আনলক করতে ও নির্দেশিত শিক্ষণ পথ সক্রিয় করতে মিত্রার সাথে ৩-ধাপের এই স্ক্রীনিং পর্বটি সম্পন্ন করো!'
                    : 'Complete this 3-step screening quest with Mitra to unlock full platform access, identify potential dyslexia risk indicators, and activate your custom learning path!'}
                </div>
              </div>
            </div>
          )}

          {/* Mitra Mascot Greeting Card */}
          <div
            className="biome-realm-card biome-citadel-theme"
            style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center'
            }}
          >
            <div
              className="avatar-halo"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                fontSize: '2.6rem',
                flexShrink: 0
              }}
            >
              <span className="flame-pulsing">🦉</span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', margin: 0 }}>
                  {isHindi ? 'मित्रा कहती है:' : (isBengali ? 'মিত্রা বলছে:' : 'Mitra says:')}
                </h4>
                <button
                  onClick={handleMitraIntroAudio}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FDE047'
                  }}
                  title={t('listen')}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#E0E7FF', lineHeight: 1.5, margin: '0 0 1rem' }}>
                {activeLanguage?.id === 'hindi'
                  ? 'अक्षरमित्र में आपका स्वागत है! हम अक्षरों की दिशा, तुकबंदी और कहानी पढ़ने के 3 मजेदार खेल खेलेंगे।'
                  : activeLanguage?.id === 'bengali'
                  ? 'অক্ষরমিত্রায় স্বাগতম! আমরা বর্ণের আকার, ছন্দ ও গল্প পড়ার ৩টি মজার খেলা খেলব।'
                  : "Welcome to Akshar Island! We're going to play 3 fun games with letter shapes, rhymes, and reading aloud."}
              </p>

              <button
                onClick={() => {
                  playStarTwinkle();
                  handleStartQuest(1);
                }}
                className="btn-3d btn-3d-amber"
                style={{
                  padding: '0.75rem 1.8rem',
                  fontSize: '0.98rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Play size={17} fill="#78350F" color="#78350F" />
                <span>{activeProfile?.screeningCompleted ? (isBengali ? 'আবার স্ক্রীনিং শুরু করো' : 'Retake 3-Step Screening') : (isBengali ? '৩-ধাপের স্ক্রীনিং শুরু করো 🚀' : 'Start 3-Step Screening 🚀')}</span>
              </button>
            </div>
          </div>

          {/* 3-Portal Trial Cards */}
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E293B', margin: '0 0 1rem' }}>
              {isHindi ? 'स्क्रीनिंग के 3 जादुई चरण' : (isBengali ? 'অভিযানের ৩টি ধাপ' : '3 Screening Quests')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Portal 1: Mirror Letter Cave */}
              <div
                onClick={() => handleStartQuest(1)}
                className="biome-realm-card"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
                  border: '3px solid #C7D2FE',
                  padding: '1.4rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    flexShrink: 0,
                    boxShadow: '0 6px 16px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  🪞
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#4F46E5', background: '#EEF2FF', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid #C7D2FE' }}>
                      TRIAL 1
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 800 }}>Visual Orientation & Tracing</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', margin: '0 0 0.2rem' }}>
                    {t('round1Title')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    {t('round1Desc')}
                  </p>
                </div>
                <div className="btn-3d btn-3d-indigo" style={{ padding: '0.55rem 0.95rem', borderRadius: '9999px' }}>
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Portal 2: Rhyme Beats */}
              <div
                onClick={() => handleStartQuest(2)}
                className="biome-realm-card"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)',
                  border: '3px solid #A7F3D0',
                  padding: '1.4rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    flexShrink: 0,
                    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  🥁
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#059669', background: '#ECFDF5', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
                      TRIAL 2
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 800 }}>Phonological Claps & Rhymes</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', margin: '0 0 0.2rem' }}>
                    {t('round2Title')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    {t('round2Desc')}
                  </p>
                </div>
                <div className="btn-3d btn-3d-emerald" style={{ padding: '0.55rem 0.95rem', borderRadius: '9999px' }}>
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Portal 3: Read Aloud */}
              <div
                onClick={() => handleStartQuest(3)}
                className="biome-realm-card"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)',
                  border: '3px solid #FDE68A',
                  padding: '1.4rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    flexShrink: 0,
                    boxShadow: '0 6px 16px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  🎙️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#D97706', background: '#FFFBEB', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
                      TRIAL 3
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 800 }}>Reading Fluency Karaoke</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', margin: '0 0 0.2rem' }}>
                    {t('round3Title')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    {t('round3Desc')}
                  </p>
                </div>
                <div className="btn-3d btn-3d-amber" style={{ padding: '0.55rem 0.95rem', borderRadius: '9999px' }}>
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ACTIVE QUESTS
         ───────────────────────────────────────────────────────────── */}
      {activeStep > 0 && activeStep < 4 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <button
            onClick={() => {
              playPop();
              setActiveStep(0);
            }}
            className="btn-secondary btn-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            <ArrowLeft size={17} />
            <span>{t('screeningMap')}</span>
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#4F46E5', background: '#EEF2FF', padding: '0.35rem 0.9rem', borderRadius: '9999px', border: '1.5px solid #C7D2FE' }}>
            {t('questWord')} {activeStep} {t('ofWord')} 3
          </span>
        </div>
      )}

      {activeStep === 1 && <MirrorLetterQuest onCompleteQuest={handleQuestComplete} />}
      {activeStep === 2 && <RhymeBeatsQuest onCompleteQuest={handleQuestComplete} />}
      {activeStep === 3 && <ReadAloudQuest onCompleteQuest={handleQuestComplete} />}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 4: CONCLUSION CELEBRATION SNAPSHOT CARD
         ───────────────────────────────────────────────────────────── */}
      {activeStep === 4 && (
        <div
          className="holo-explorer-card"
          style={{
            padding: '2.5rem 1.85rem',
            textAlign: 'center',
            borderRadius: '34px'
          }}
        >
          <div style={{ fontSize: '4.5rem', marginBottom: '0.4rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}>🏆</div>
          <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#B45309', padding: '0.4rem 1.25rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.75rem' }}>
            {t('questReward')} • +35 Stars ⭐
          </div>

          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, color: 'white', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
            {t('screeningCompleteHeader')} {studentName}!
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#E0E7FF', margin: '0 0 1.6rem', lineHeight: 1.5 }}>
            {t('mitraAnalyzedDesc')}
          </p>

          {/* Screening Snapshot Diagnostic Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '26px',
              padding: '1.5rem',
              border: '2px solid #E2E8F0',
              textAlign: 'left',
              marginBottom: '1.6rem',
              color: '#1E293B',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.95rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B' }}>{t('diagnosticSnapshotTitle')}</span>
              <span style={{ fontSize: '0.78rem', padding: '0.25rem 0.85rem', borderRadius: '9999px', background: isIncomplete ? '#F1F5F9' : isTypical ? '#D1FAE5' : '#FEF3C7', color: isIncomplete ? '#475569' : isTypical ? '#065F46' : '#92400E', fontWeight: 900 }}>
                {isIncomplete ? 'Incomplete' : isTypical ? t('typicalDevBadge') : t('targetedSupportBadge')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <span>🪞</span> {t('letterAccuracyLabel')}
                </span>
                <span style={{ fontWeight: 900, color: sessionData.mirrorLetters ? (visualAccuracy >= 75 ? '#10B981' : '#F59E0B') : '#94A3B8' }}>
                  {sessionData.mirrorLetters ? `${visualAccuracy}% ${t('accuracyUnit')}` : 'Incomplete'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <span>🥁</span> {t('phonoScoreLabel')}
                </span>
                <span style={{ fontWeight: 900, color: sessionData.rhymeBeats ? (phonologicalScore >= 75 ? '#0284C7' : '#F59E0B') : '#94A3B8' }}>
                  {sessionData.rhymeBeats ? `${phonologicalScore}% ${t('scoreUnit')}` : 'Incomplete'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <span>🎙️</span> {t('readingFluencyLabel')}
                </span>
                <span style={{ fontWeight: 900, color: sessionData.readAloud ? '#4F46E5' : '#94A3B8' }}>
                  {sessionData.readAloud ? `${readingWpm} ${t('wpmUnit')}` : 'Incomplete'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.15rem', background: isIncomplete ? '#F8FAFC' : isTypical ? '#ECFDF5' : '#EEF2FF', padding: '1.1rem', borderRadius: '20px', border: isIncomplete ? '1.5px solid #E2E8F0' : isTypical ? '2px solid #A7F3D0' : '2px solid #C7D2FE' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: isIncomplete ? '#475569' : isTypical ? '#065F46' : '#4338CA', marginBottom: '0.4rem' }}>
                {isIncomplete ? 'Screening Incomplete' : isTypical ? t('trackATitle') : t('trackBTitle')}
              </div>
              <div style={{ fontSize: '0.82rem', color: isIncomplete ? '#64748B' : isTypical ? '#047857' : '#3730A3', lineHeight: 1.55 }}>
                {isIncomplete ? (
                  'Please restart the screening to get your full recommendation.'
                ) : isTypical ? (
                  isBengali ? (
                    <>
                      → শব্দ সংগ্রাহকে দ্রুত শব্দ তৈরির অনুশীলন <strong>(Word Snapper)</strong><br />
                      → বানান ফাঁদ চ্যালেঞ্জে বিশেষ শব্দ পরিচিতি <strong>(Spelling Traps)</strong><br />
                      → দ্রুত বর্ণ ক্রম খেলা <strong>(ABC Train)</strong>
                    </>
                  ) : (
                    <>
                      → Fast-paced word blending in <strong>Word Snapper (Speed Phonics)</strong><br />
                      → Advanced sight-word spotter in <strong>Spelling Trap Challenge</strong><br />
                      → Rapid alphabet sequences in <strong>ABC Train</strong>
                    </>
                  )
                ) : (
                  isBengali ? (
                    <>
                      → কাছাকাছি বর্ণের পার্থক্য অনুশীলন <strong>(বর্ণ শিকারী ব/র/ক/ধ)</strong><br />
                      → আঙুল দিয়ে স্পর্শভিত্তিক বর্ণ লেখা <strong>(জাদুকরী বর্ণাভ্যাস)</strong><br />
                      → দেখো-ঢাকো-লেখো বানান নিরাময় <strong>(বানান ক্লিনিক)</strong>
                    </>
                  ) : (
                    <>
                      → Practice mirror letter discrimination in <strong>Letter Hunter (b/d/p/q)</strong><br />
                      → Tactile handwriting memory in <strong>Magic Letter Tracing</strong><br />
                      → Look-Cover-Write training in <strong>Spelling Clinic</strong>
                    </>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Dual Concluding Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <button
              onClick={() => {
                playPop();
                setCurrentView('games');
              }}
              className="btn-3d btn-3d-amber"
              style={{
                width: '100%',
                padding: '0.95rem',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Sparkles size={20} />
              <span>{isTypical ? t('launchTrackA') : t('launchTrackB')}</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setCurrentView('dashboard');
              }}
              className="btn-3d btn-3d-indigo"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.98rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Award size={18} />
              <span>{t('viewParentReport')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
