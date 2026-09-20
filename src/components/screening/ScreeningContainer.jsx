import React, { useState, useRef } from 'react';
import { Volume2, ArrowRight, ArrowLeft, Trophy, Sparkles, Award, CheckCircle, Brain, Target, Mic, Music, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import MirrorLetterQuest from '../../screening/MirrorLetterQuest';
import RhymeBeatsQuest from '../../screening/RhymeBeatsQuest';
import ReadAloudQuest from '../../screening/ReadAloudQuest';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function ScreeningContainer() {
  const { activeProfile, setActiveProfile, setCurrentView, activeLanguage, t } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();
  const isBengali = activeLanguage?.id === 'bengali';

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
    const isBengali = activeLanguage?.id === 'bengali';
    const isHindi = activeLanguage?.id === 'hindi';
    const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

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
      const result = data.result || { accuracy: 25, wpm: 20, hesitationCount: 4 };
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

    const visualAcc = finalData.mirrorLetters?.accuracy ?? 50;
    const phonoScore = finalData.rhymeBeats?.score ?? 50;
    const readWpm = finalData.readAloud?.wpm ?? 20;
    const readAcc = finalData.readAloud?.accuracy ?? 50;

    let computedRisk = 'typical';
    let confusions = ['None significant'];
    let pathway = 'accelerated_fluency';
    let pathwayTitle = 'Track A: Foundational Fluency & Word Mastery';
    let pathwayDesc = 'All core phonological and visual orientation milestones are on target! Recommended for speed reading, vocabulary building, and advanced matra puzzles.';

    if (visualAcc <= 70 && ((finalData.mirrorLetters?.reversalErrors || 0) > 2 || (finalData.mirrorLetters?.visualReversalScore || 0) > 25)) {
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
      setActiveProfile(updated);
    }

    speakText(
      pathway === 'accelerated_fluency'
        ? 'Great job! You are ready for advanced fluency and word building adventures!'
        : 'Awesome effort! Mitra has prepared personalized multisensory games just for you!',
      'en-US'
    );
  };

  const handleMitraIntroAudio = () => {
    playPop();
    const isBengali = activeLanguage?.id === 'bengali';
    const isHindi = activeLanguage?.id === 'hindi';
    const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');
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

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '0.5rem 0.25rem 2rem'
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          VIEW 0: SCREENING ISLAND ROADMAP (Exact Screenshot 3)
         ───────────────────────────────────────────────────────────── */}
      {activeStep === 0 && (
        <>
          {/* Top Deep Purple Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #312E81 100%)',
              color: 'white',
              borderRadius: '28px',
              padding: '1.5rem',
              boxShadow: '0 12px 28px rgba(79, 70, 229, 0.25)'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#E0E7FF',
                marginBottom: '0.85rem',
                letterSpacing: '0.04em'
              }}
            >
              <span>🧭</span>
              <span>{t('screeningTimeEstimate')}</span>
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'white', margin: '0 0 0.4rem', fontFamily: "'Lexend', sans-serif" }}>
              {t('screeningRoadmapTitle')}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#C7D2FE', lineHeight: 1.45, margin: 0 }}>
              {t('screeningRoadmapSubtitle')}
            </p>
          </div>

          {/* Unscreened Initial Onboarding Banner */}
          {!activeProfile?.screeningCompleted && (
            <div
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '1.5px solid #F59E0B',
                borderRadius: '20px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>🌟</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#92400E' }}>
                  {isBengali ? `স্বাগতম ${activeProfile?.name || 'অভিযাত্রী'}! প্রাথমিক মূল্যায়ন আবশ্যক` : `Welcome ${activeProfile?.name || 'Explorer'}! Initial Quest Required`}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '0.15rem', lineHeight: 1.4 }}>
                  {isBengali
                    ? 'প্ল্যাটফর্মের সম্পূর্ণ অংশ আনলক করতে ও ডিসলেক্সিয়া সংক্রান্ত নির্দেশিত শিক্ষণ পথ সক্রিয় করতে মিত্রার সাথে ৩-ধাপের এই স্ক্রীনিং পর্বটি সম্পন্ন করুন!'
                    : 'Complete this 3-step screening quest with Mitra to unlock full platform access, identify potential dyslexia risk indicators, and activate your custom learning path!'}
                </div>
              </div>
            </div>
          )}

          {/* Screening Completed Notification Guard */}
          {activeProfile?.screeningCompleted && (
            <div
              style={{
                background: '#ECFDF5',
                border: '1.5px solid #10B981',
                borderRadius: '20px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.6rem' }}>✅</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#065F46' }}>
                    {isBengali ? `${activeProfile.name}-এর স্ক্রীনিং ইতিমধ্যে সম্পন্ন হয়েছে!` : `Screening Already Completed for ${activeProfile.name}!`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                    {isBengali ? 'ডায়াগনস্টিক প্রোফাইল ও নির্দেশিত শিক্ষণ পথ ড্যাশবোর্ডে সক্রিয়।' : 'Diagnostic profile & learning pathway are active on the dashboard.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    playPop();
                    setCurrentView('dashboard');
                  }}
                  style={{
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isBengali ? 'রিপোর্ট দেখুন' : 'View My Report'}
                </button>
                <button
                  onClick={() => handleStartQuest(1)}
                  style={{
                    background: 'white',
                    color: '#065F46',
                    border: '1px solid #10B981',
                    borderRadius: '9999px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isBengali ? 'আবার খেলো' : 'Retake Quest'}
                </button>
              </div>
            </div>
          )}

          {/* Mitra Greeting Card */}
          <div
            style={{
              background: '#F0F4FF',
              border: '1.5px solid #DBEAFE',
              borderRadius: '24px',
              padding: '1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ fontSize: '2.5rem', lineHeight: 1, userSelect: 'none' }}>🦉</div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  {isBengali ? 'মিত্রা বলছে:' : 'Mitra says:'}
                </h4>
                <button
                  onClick={handleMitraIntroAudio}
                  style={{
                    background: 'white',
                    border: '1px solid #CBD5E1',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title={t('listen')}
                >
                  <Volume2 size={15} color="#4F46E5" />
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, margin: '0 0 0.85rem' }}>
                {activeLanguage?.id === 'hindi'
                  ? 'अक्षरमित्र में आपका स्वागत है! हम अक्षरों की दिशा, तुकबंदी और कहानी पढ़ने के 3 मजेदार खेल खेलेंगे। क्या आप तैयार हैं?'
                  : activeLanguage?.id === 'bengali'
                  ? 'অক্ষরমিত্রায় স্বাগতম! আমরা বর্ণের আকার, ছন্দ ও গল্প পড়ার ৩টি মজার খেলা খেলব। শুরু করতে প্রস্তুত?'
                  : "Welcome to Akshar Island! We're going to play 3 fun games with letter shapes, rhymes, and reading aloud. Ready to explore?"}
              </p>

              <button
                onClick={() => {
                  playStarTwinkle();
                  handleStartQuest(1); // Start with Quest 1: Mirror Letters
                }}
                className="animate-pulse-glow"
                style={{
                  background: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.55rem 1.35rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}
              >
                {activeProfile?.screeningCompleted ? (isBengali ? 'আবার স্ক্রীনিং শুরু করো' : 'Retake 3-Step Screening') : (isBengali ? '৩-ধাপের স্ক্রীনিং শুরু করো 🚀' : 'Start 3-Step Screening 🚀')}
              </button>
            </div>
          </div>

          {/* Quest Roadmap Section */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.85rem' }}>
              {isBengali ? 'অভিযানের ধাপসমূহ' : 'Quest Roadmap'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Quest 1: Mirror Letters */}
              <div
                onClick={() => handleStartQuest(1)}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1rem 1.15rem',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ fontSize: '2rem' }}>🪞</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.15rem' }}>
                    {t('round1Title')}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                    {t('round1Desc')}
                  </p>
                </div>
                <ArrowRight size={18} color="#94A3B8" />
              </div>

              {/* Quest 2: Rhyme Beats */}
              <div
                onClick={() => handleStartQuest(2)}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1rem 1.15rem',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ fontSize: '2rem' }}>🥁</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.15rem' }}>
                    {t('round2Title')}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                    {t('round2Desc')}
                  </p>
                </div>
                <ArrowRight size={18} color="#94A3B8" />
              </div>

              {/* Quest 3: Read Aloud */}
              <div
                onClick={() => handleStartQuest(3)}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1rem 1.15rem',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ fontSize: '2rem' }}>🎙️</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.15rem' }}>
                    {t('round3Title')}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                    {t('round3Desc')}
                  </p>
                </div>
                <ArrowRight size={18} color="#94A3B8" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ACTIVE QUESTS (1: Mirror Letters, 2: Rhymes, 3: Read-Aloud)
         ───────────────────────────────────────────────────────────── */}
      {activeStep > 0 && activeStep < 4 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <button
            onClick={() => {
              playPop();
              setActiveStep(0);
            }}
            className="btn-secondary btn-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>{t('screeningMap')}</span>
          </button>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
            {t('questWord')} {activeStep} {t('ofWord')} 3
          </span>
        </div>
      )}

      {activeStep === 1 && <MirrorLetterQuest onCompleteQuest={handleQuestComplete} />}
      {activeStep === 2 && <RhymeBeatsQuest onCompleteQuest={handleQuestComplete} />}
      {activeStep === 3 && <ReadAloudQuest onCompleteQuest={handleQuestComplete} />}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 4: CONCLUSION SNAPSHOT CARD (Cross-Signal Diagnosis)
         ───────────────────────────────────────────────────────────── */}
      {activeStep === 4 && (
        <div
          className="glass-card"
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            borderRadius: '28px',
            background: 'white',
            boxShadow: '0 16px 36px rgba(79, 70, 229, 0.12)',
            border: '2px solid #E0E7FF'
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem' }}>🏆</div>
          <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#B45309', padding: '0.3rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {t('questReward')}
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem' }}>
            {t('screeningCompleteHeader')} {activeProfile?.name || (isBengali ? 'অনন্য' : 'Explorer')}!
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem' }}>
            {t('mitraAnalyzedDesc')}
          </p>

          {/* Screening Snapshot Card */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '20px',
              padding: '1.25rem',
              border: '1.5px solid #E2E8F0',
              textAlign: 'left',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>{t('diagnosticSnapshotTitle')}</span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: isTypical ? '#D1FAE5' : '#FEF3C7', color: isTypical ? '#065F46' : '#92400E', fontWeight: 700 }}>
                {isTypical ? t('typicalDevBadge') : t('targetedSupportBadge')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🪞</span> {t('letterAccuracyLabel')}
                </span>
                <span style={{ fontWeight: 800, color: visualAccuracy >= 75 ? '#10B981' : '#F59E0B' }}>
                  {visualAccuracy}% {t('accuracyUnit')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🥁</span> {t('phonoScoreLabel')}
                </span>
                <span style={{ fontWeight: 800, color: phonologicalScore >= 75 ? '#0284C7' : '#F59E0B' }}>
                  {phonologicalScore}% {t('scoreUnit')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🎙️</span> {t('readingFluencyLabel')}
                </span>
                <span style={{ fontWeight: 800, color: '#4F46E5' }}>
                  {readingWpm} {t('wpmUnit')}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '0.85rem', background: isTypical ? '#ECFDF5' : '#EEF2FF', padding: '0.85rem', borderRadius: '14px', border: isTypical ? '1.5px solid #A7F3D0' : '1.5px solid #C7D2FE' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isTypical ? '#065F46' : '#4338CA', marginBottom: '0.25rem' }}>
                {isTypical ? t('trackATitle') : t('trackBTitle')}
              </div>
              <div style={{ fontSize: '0.75rem', color: isTypical ? '#047857' : '#3730A3', lineHeight: 1.45 }}>
                {isTypical ? (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={() => {
                playPop();
                setCurrentView('games');
              }}
              style={{
                width: '100%',
                background: isTypical ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: isTypical ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Sparkles size={18} />
              <span>{isTypical ? t('launchTrackA') : t('launchTrackB')}</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setCurrentView('dashboard');
              }}
              style={{
                width: '100%',
                background: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.8rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
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
