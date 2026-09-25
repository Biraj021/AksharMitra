import React, { useState, useEffect } from 'react';
import { ArrowLeft, Award, CheckCircle, AlertTriangle, Printer, Sparkles, BookOpen, Volume2, Shield, Zap, Target, Mic, Music, Flame, Star, MessageSquare, Calendar, ArrowRight, Check, X } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import ParentObservationModal from './ParentObservationModal';
import { hasParentFeedbackData } from '@ai/parentFeedbackModel';
import { getChildRecommendation, CHILD_ACTIVITY_METADATA } from '@ai/adaptiveLearningStrategy';
import { getRecentCalendarDays, formatDateKey } from '@backend/streakUtils';

export default function CompanionDashboard() {
  const { activeProfile, setCurrentView, activeLanguage, t, updateParentFeedback, calculateLearningProfile, setShowStreakModal } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();
  const [viewMode, setViewMode] = useState('educator'); // 'kid' | 'educator'
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [feedbackSaveToast, setFeedbackSaveToast] = useState(null); // { activityTitle, icon } | null


  const handleBack = () => {
    playPop();
    setCurrentView('landing');
  };

  const handlePrint = () => {
    playPop();
    window.print();
  };

  const profile = activeProfile;
  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  if (!profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '3rem 1rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem', background: 'white', borderRadius: '24px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>{t('noProfileSelected')}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {t('noProfileDesc')}
          </p>
          <button onClick={handleBack} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            {t('goToHome')}
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = Boolean(profile.screeningCompleted);
  const isElevated = profile.riskLevel && profile.riskLevel !== 'typical';
  const metrics = profile.screeningMetrics || {};

  const learningProfile = profile.learningProfile || (calculateLearningProfile ? calculateLearningProfile(profile) : null);
  const parentFeedback = profile.parentFeedback;
  const hasFeedback = hasParentFeedbackData(parentFeedback);
  const parentSignals = learningProfile?.parentObservation || {};

  const getStatusBadge = (status) => {
    if (status === 'needs_support') {
      return { label: t('statusNeedsSupport'), bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', dot: '🔴' };
    }
    if (status === 'developing') {
      return { label: t('statusDeveloping'), bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', dot: '🟡' };
    }
    if (status === 'comfortable') {
      return { label: t('statusComfortable'), bg: '#DCFCE7', color: '#166534', border: '#86EFAC', dot: '🟢' };
    }
    return { label: t('statusNotObserved'), bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0', dot: '⚪' };
  };

  const handleMitraCoachAudio = () => {
    playPop();
    const coachText = isElevated
      ? t('mitraCoachDescElevated')
      : t('mitraCoachDescTypical');
    speakText(coachText, speechLang);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      {/* Top Navigation & Mode Switcher Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          onClick={handleBack}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>{t('backToMain')}</span>
        </button>

        {/* Dual-View Mode Switcher Toggle */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid #E2E8F0'
          }}
        >
          <button
            onClick={() => {
              playPop();
              setViewMode('kid');
            }}
            style={{
              padding: '0.4rem 0.95rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'kid' ? '#4F46E5' : 'transparent',
              color: viewMode === 'kid' ? 'white' : '#64748B',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🧒</span>
            <span>{t('viewModeKids')}</span>
          </button>

          <button
            onClick={() => {
              playPop();
              setViewMode('educator');
            }}
            style={{
              padding: '0.4rem 0.95rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'educator' ? '#4F46E5' : 'transparent',
              color: viewMode === 'educator' ? 'white' : '#64748B',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🎓</span>
            <span>{t('viewModeEducator')}</span>
          </button>
        </div>

        {viewMode === 'educator' && (
          <button
            onClick={handlePrint}
            disabled={!isCompleted}
            className="btn-secondary btn-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              borderColor: '#CBD5E1',
              opacity: isCompleted ? 1 : 0.5,
              cursor: isCompleted ? 'pointer' : 'not-allowed'
            }}
          >
            <Printer size={16} />
            <span>{t('printReportPdf')}</span>
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          KIDS VIEW: Superpowers, Star Vault & Cheerful Missions
         ───────────────────────────────────────────────────────────── */}
      {viewMode === 'kid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Kids Hero Banner */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: 'white',
              padding: '1.75rem',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              boxShadow: '0 12px 28px rgba(79, 70, 229, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  fontSize: '3rem',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}
              >
                {getAvatarEmoji(profile.avatarEmoji || profile.avatar)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'white' }}>
                    {profile.name}
                  </h2>
                  <span style={{ background: 'rgba(255, 255, 255, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {profile.gradeLabel || 'Grade 2'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#E0E7FF' }}>
                  ⭐ {t('levelTitle')}: <strong>{isCompleted ? (isElevated ? 'Champion Explorer' : 'Master Reader') : 'Novice Explorer'}</strong>
                </p>
              </div>
            </div>

            {/* Quick Kid Metrics Counter */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.6rem 1rem', borderRadius: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FEF08A' }}>
                  {profile.stars || 45} 🌟
                </div>
                <div style={{ fontSize: '0.7rem', color: '#E0E7FF' }}>{t('starVaultTitle')}</div>
              </div>
              <div
                onClick={() => {
                  playPop();
                  if (setShowStreakModal) setShowStreakModal(true);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  padding: '0.6rem 1rem',
                  borderRadius: '18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
                title={isHindi ? 'दैनिक उपस्थिति कैलेंडर देखें' : (isBengali ? 'উপস্থিতির ক্যালেন্ডার দেখো' : 'View Attendance Calendar')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F87171' }}>
                  {profile.streak || profile.streakDays || 2} 🔥
                </div>
                <div style={{ fontSize: '0.7rem', color: '#E0E7FF' }}>{isHindi ? 'लगातार दिन 📅' : (isBengali ? 'দিনের ধারা 📅' : 'Streak Days 📅')}</div>
              </div>
            </div>
          </div>

          {!isCompleted ? (
            /* Kid Unscreened Prompt */
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏝️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem' }}>{t('screeningNotCompletedTitle')}</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                {profile.name} {t('screeningNotCompletedDesc')}
              </p>
              <button
                onClick={() => {
                  playPop();
                  setCurrentView('screening');
                }}
                className="btn btn-primary animate-pulse-glow"
                style={{ padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: 800 }}
              >
                <span>{t('startScreeningNow')}</span>
              </button>
            </div>
          ) : (
            <>
              {/* 4 Superpower Badges Grid */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E293B', margin: '0 0 0.25rem' }}>
                  {t('mySuperpowersTitle')}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem' }}>
                  {t('mySuperpowersSubtitle')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                  {/* Superpower 1: Letter Vision */}
                  <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '20px', border: '2px solid #C7D2FE', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>🪞</div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#3730A3', margin: '0 0 0.2rem' }}>
                      {t('powerEagleEye')}
                    </h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: (metrics.reversalIndex || 0) <= 30 ? '#DCFCE7' : '#FEF3C7', color: (metrics.reversalIndex || 0) <= 30 ? '#166534' : '#B45309' }}>
                      {(metrics.reversalIndex || 0) <= 30 ? (isHindi ? 'महारत हासिल ✅' : (isBengali ? 'দক্ষতা অর্জন ✅' : 'Mastered ✅')) : (isHindi ? 'अभ्यास जारी 🎯' : (isBengali ? 'অনুশীলন চলছে 🎯' : 'Training 🎯'))}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: '#6366F1', marginTop: '0.4rem', margin: 0 }}>
                      {t('powerEagleEyeDesc')}
                    </p>
                  </div>

                  {/* Superpower 2: Rhythm Beats */}
                  <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '20px', border: '2px solid #BBF7D0', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>🥁</div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', margin: '0 0 0.2rem' }}>
                      {t('powerRhythmMaster')}
                    </h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: (metrics.phonologicalScore || 0) >= 70 ? '#DCFCE7' : '#FEF3C7', color: (metrics.phonologicalScore || 0) >= 70 ? '#166534' : '#B45309' }}>
                      {metrics.phonologicalScore || 80}% {isHindi ? 'स्कोर' : (isBengali ? 'স্কোর' : 'Score')}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '0.4rem', margin: 0 }}>
                      {t('powerRhythmMasterDesc')}
                    </p>
                  </div>

                  {/* Superpower 3: Story Speaker */}
                  <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '20px', border: '2px solid #FDE68A', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>🎙️</div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#92400E', margin: '0 0 0.2rem' }}>
                      {t('powerStorySpeaker')}
                    </h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: '#FEF3C7', color: '#92400E' }}>
                      {metrics.wpm || 30} {isHindi ? 'शब्द/मिनट' : (isBengali ? 'শব্দ/মি' : 'WPM')}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '0.4rem', margin: 0 }}>
                      {t('powerStorySpeakerDesc')}
                    </p>
                  </div>

                  {/* Superpower 4: Magic Pen */}
                  <div style={{ background: '#FDF2F8', padding: '1rem', borderRadius: '20px', border: '2px solid #FBCFE8', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>✍️</div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#9D174D', margin: '0 0 0.2rem' }}>
                      {t('powerMagicPen')}
                    </h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: '#FCE7F3', color: '#9D174D' }}>
                      {metrics.tracingAccuracy || 85}% {isHindi ? 'सटीक' : (isBengali ? 'নির্ভুল' : 'Accurate')}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: '#DB2777', marginTop: '0.4rem', margin: 0 }}>
                      {t('powerMagicPenDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Practice & Attendance Tracker Card */}
              {(() => {
                const attendedSet = new Set(profile.attendanceHistory || []);
                const days = getRecentCalendarDays(7, activeLanguage?.id);
                return (
                  <div
                    style={{
                      background: 'white',
                      borderRadius: '24px',
                      padding: '1.25rem',
                      border: '2px solid #FED7AA',
                      boxShadow: '0 4px 14px rgba(249, 115, 22, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Flame size={20} fill="#EA580C" color="#EA580C" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                            {isHindi ? 'दैनिक उपस्थिति व अभ्यास का सिलसिला' : (isBengali ? 'দৈনিক উপস্থিতি ও অনুশীলনের ধারা' : 'Daily Attendance & Practice Streak')}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {profile.streak || 2} {isHindi ? 'दिनों का लगातार रिकॉर्ड' : (isBengali ? 'দিনের ধারাবাহিক রেকর্ড' : 'Consecutive Days Active')} 🔥
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          playPop();
                          if (setShowStreakModal) setShowStreakModal(true);
                        }}
                        style={{
                          background: '#FFF7ED',
                          border: '1.5px solid #FDBA74',
                          color: '#C2410C',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Calendar size={14} />
                        <span>{isHindi ? 'पूरा कैलेंडर देखें 📊' : (isBengali ? 'সম্পূর্ণ ক্যালেন্ডার দেখো 📊' : 'View Full Calendar 📊')}</span>
                      </button>
                    </div>

                    {/* 7-Day Visual Strip */}
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'space-between' }}>
                      {days.map((d) => {
                        const isAttended = attendedSet.has(d.dateKey);
                        return (
                          <div
                            key={d.dateKey}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '0.5rem 0.2rem',
                              borderRadius: '14px',
                              background: isAttended ? '#DCFCE7' : (d.isToday ? '#FEF3C7' : '#F8FAFC'),
                              border: isAttended ? '1.5px solid #86EFAC' : (d.isToday ? '1.5px solid #F59E0B' : '1px solid #E2E8F0')
                            }}
                          >
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isAttended ? '#166534' : '#64748B' }}>
                              {d.dayLabel}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1E293B', margin: '2px 0' }}>
                              {d.dayNumber}
                            </span>
                            <div style={{ fontSize: '0.85rem' }}>
                              {isAttended ? '🔥' : (d.isToday ? '⏳' : '⚪')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Mitra's Audio Coaching Note */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '1.25rem',
                  border: '2px solid #E0E7FF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08)'
                }}
              >
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🦉</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                      {t('mitraCoachTitle')}
                    </h4>
                    <button
                      onClick={handleMitraCoachAudio}
                      style={{
                        background: '#EEF2FF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title={t('listen')}
                    >
                      <Volume2 size={16} color="#4F46E5" />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    {isElevated ? t('mitraCoachDescElevated') : t('mitraCoachDescTypical')}
                  </p>
                </div>
              </div>

              {/* Kid Mission Launcher Action Card */}
              {(() => {
                const kidRec = getChildRecommendation(profile, activeLanguage?.id);
                return (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      borderRadius: '24px',
                      padding: '1.25rem 1.5rem',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span style={{ fontSize: '2rem' }}>{kidRec.icon || '🌟'}</span>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.04em' }}>
                          {isHindi ? '🌟 आज का विशेष मिशन' : (isBengali ? '🌟 আজকের বিশেষ মিশন' : '🌟 YOUR ADVENTURE MISSION')}
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0.1rem 0 0.2rem', color: 'white' }}>
                          {kidRec.title}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#D1FAE5', margin: 0 }}>
                          {kidRec.childPrompt}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playStarTwinkle();
                        if (kidRec.activityId && kidRec.activityId !== 'games') {
                          setCurrentView(kidRec.activityId);
                        } else {
                          setCurrentView('games');
                        }
                      }}
                      className="animate-pulse-glow"
                      style={{
                        background: 'white',
                        color: '#065F46',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '0.65rem 1.4rem',
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      {kidRec.buttonText || t('playMissionBtn')}
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          JUDGES / EDUCATORS / PARENTS VIEW: 4-Axis Clinical IEP Vector
         ───────────────────────────────────────────────────────────── */}
      {viewMode === 'educator' && (
        <div className="glass-card" style={{ padding: '2rem 1.75rem', background: 'white', borderRadius: '24px' }}>
          {/* Header with Avatar & Risk Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #F59E0B',
                  flexShrink: 0,
                  overflow: 'hidden',
                  lineHeight: 1
                }}
              >
                {getAvatarEmoji(profile.avatarEmoji || profile.avatar)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{profile.name}</h2>
                  <span className="badge badge-indigo">{profile.gradeLabel || 'Grade 2'}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  {t('screeningCompletedLabel')} <strong>{isCompleted ? (metrics.dateCompleted || 'Completed') : (isHindi ? 'अभी पूरा नहीं हुआ' : (isBengali ? 'এখনও সম্পন্ন হয়নি' : 'Pending'))}</strong> • {isHindi ? 'भाषा' : (isBengali ? 'ভাষা' : 'Language')}: <strong>{activeLanguage.name}</strong>
                </p>
              </div>
            </div>

            {/* Risk Band Indicator */}
            <div>
              {!isCompleted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF3C7', padding: '0.6rem 1rem', borderRadius: '9999px', border: '1.5px solid #F59E0B' }}>
                  <Sparkles size={20} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#92400E' }}>
                      {t('screeningPendingLabel')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#B45309' }}>
                      {t('assessmentRequiredLabel')}
                    </div>
                  </div>
                </div>
              ) : isElevated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEE2E2', padding: '0.6rem 1rem', borderRadius: '9999px', border: '1.5px solid #EF4444' }}>
                  <AlertTriangle size={20} color="#DC2626" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#991B1B' }}>
                      {t('elevatedRiskLabel')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#B91C1C' }}>
                      {t('earlyMultisensoryLabel')}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#D1FAE5', padding: '0.6rem 1rem', borderRadius: '9999px', border: '1.5px solid #10B981' }}>
                  <CheckCircle size={20} color="#059669" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#065F46' }}>
                      {t('typicalProgressionLabel')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                      {t('milestonesStandardLabel')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ✅ Post-Save Success Toast: Recommendation Updated */}
          {feedbackSaveToast && (
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1.5px solid #34D399',
                borderRadius: '18px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                animation: 'fadeInDown 0.3s ease',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)'
              }}
            >
              <span style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>{feedbackSaveToast.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ✅ {isHindi ? 'लर्निंग प्रोफ़ाइल अपडेट हो गई!' : (isBengali ? 'লার্নিং প্রোফাইল আপডেট হয়েছে!' : "Learning Profile Updated!")}
                  </span>
                  <button
                    onClick={() => setFeedbackSaveToast(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '2px' }}
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#065F46' }}>
                  {isHindi
                    ? `अनुशंसित अभ्यास: ${feedbackSaveToast.activityTitle}`
                    : isBengali
                      ? `প্রস্তাবিত অনুশীলন: ${feedbackSaveToast.activityTitle}`
                      : `Recommended Practice: ${feedbackSaveToast.activityTitle}`}
                </div>
                {feedbackSaveToast.childPrompt && (
                  <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    {feedbackSaveToast.childPrompt}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              PARENT OBSERVATIONS & CROSS-SIGNAL INTELLIGENCE
             ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Header: Title, Last Updated & Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🏠</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
                    {t('parentDashboardTitle')}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.1rem 0 0' }}>
                    {t('lastUpdatedLabel')} <strong>{parentFeedback?.lastUpdatedAt ? new Date(parentFeedback.lastUpdatedAt).toLocaleDateString(speechLang, { month: 'short', day: 'numeric', year: 'numeric' }) : (isHindi ? 'अभी तक कोई अवलोकन दर्ज नहीं' : (isBengali ? 'এখনও কোনো তথ্য নেই' : 'No observations recorded yet'))}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playPop();
                  setShowObservationModal(true);
                }}
                className="btn btn-primary"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                }}
              >
                <MessageSquare size={14} />
                <span>{hasFeedback ? t('updateObservationBtn') : t('provideObservationBtn')}</span>
              </button>
            </div>

            {/* 4 Observed Areas Grid */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('areasObservedTitle')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                {[
                  { name: t('sectionReading'), status: parentSignals.reading, icon: '📖' },
                  { name: t('sectionSounds'), status: parentSignals.speech, icon: '🔊' },
                  { name: t('sectionWriting'), status: parentSignals.tracing, icon: '✍️' },
                  { name: t('sectionUnderstanding'), status: parentSignals.understanding ?? parentSignals.comprehension, icon: '💡' }
                ].map((item, idx) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'white',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          width: 'fit-content'
                        }}
                      >
                        <span>{badge.dot}</span>
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rule-based Semantic Reasoning Panel */}
            {learningProfile?.localAiReasoning && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                  color: 'white',
                  borderRadius: '18px',
                  padding: '1.15rem 1.25rem',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 14px rgba(49, 46, 129, 0.25)',
                  border: '1px solid #4338CA'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>🤖</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#A5B4FC', letterSpacing: '0.04em' }}>
                        {isHindi ? 'ऑन-डिवाइस स्थानीय एआई विश्लेषण' : (isBengali ? 'অন-ডিভাইস লোকাল এআই বিশ্লেষণ' : 'LOCAL AI ON-DEVICE REASONING')}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>
                        {learningProfile.localAiReasoning.model || 'Rule-based keyword classifier'}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: 'rgba(79, 70, 229, 0.4)',
                      border: '1px solid #6366F1',
                      borderRadius: '9999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#E0E7FF'
                    }}
                  >
                    🔒 {isHindi ? '100% निजी ऑन-डिवाइस' : (isBengali ? '১০০% প্রাইভেট অন-ডিভাইস' : '100% Edge Offline (Zero Cloud)')}
                  </span>
                </div>

                {/* Extracted Concept Tags */}
                {learningProfile.localAiReasoning.extractedConcepts && learningProfile.localAiReasoning.extractedConcepts.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {learningProfile.localAiReasoning.extractedConcepts.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          padding: '0.15rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#FDE047'
                        }}
                      >
                        ⚡ {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Semantic Affinity Vector Bars */}
                {learningProfile.localAiReasoning.affinityScores && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.65rem 0.75rem', borderRadius: '12px', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#C7D2FE', marginBottom: '0.15rem' }}>
                        <span>📖 {isHindi ? 'पठन' : (isBengali ? 'পঠন' : 'Reading')}</span>
                        <strong style={{ color: 'white' }}>{Math.round((learningProfile.localAiReasoning.affinityScores.reading || 0) * 100)}%</strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((learningProfile.localAiReasoning.affinityScores.reading || 0) * 100)}%`, background: '#60A5FA', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#C7D2FE', marginBottom: '0.15rem' }}>
                        <span>🗣️ {isHindi ? 'ध्वनि' : (isBengali ? 'ধ্বনি' : 'Phonics')}</span>
                        <strong style={{ color: 'white' }}>{Math.round((learningProfile.localAiReasoning.affinityScores.speech || 0) * 100)}%</strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((learningProfile.localAiReasoning.affinityScores.speech || 0) * 100)}%`, background: '#F59E0B', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#C7D2FE', marginBottom: '0.15rem' }}>
                        <span>✍️ {isHindi ? 'ट्रेसिंग' : (isBengali ? 'ট্রেসিং' : 'Tracing')}</span>
                        <strong style={{ color: 'white' }}>{Math.round((learningProfile.localAiReasoning.affinityScores.tracing || 0) * 100)}%</strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((learningProfile.localAiReasoning.affinityScores.tracing || 0) * 100)}%`, background: '#34D399', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#C7D2FE', marginBottom: '0.15rem' }}>
                        <span>🧠 {isHindi ? 'गति' : (isBengali ? 'প্যাসিং' : 'Pacing')}</span>
                        <strong style={{ color: 'white' }}>{Math.round((learningProfile.localAiReasoning.affinityScores.understanding || 0) * 100)}%</strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((learningProfile.localAiReasoning.affinityScores.understanding || 0) * 100)}%`, background: '#A78BFA', borderRadius: '9999px' }} />
                      </div>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: '0.8rem', color: '#E0E7FF', margin: 0, lineHeight: 1.45 }}>
                  {isHindi
                    ? (learningProfile.localAiReasoning.aiSummaryHi || learningProfile.localAiReasoning.aiSummary)
                    : (isBengali
                      ? (learningProfile.localAiReasoning.aiSummaryBn || learningProfile.localAiReasoning.aiSummary)
                      : learningProfile.localAiReasoning.aiSummary)}
                </p>
              </div>
            )}

            {/* Synthesis: What AksharMitra Noticed & What We Recommend Next */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '16px', border: '1px solid #C7D2FE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🦉</span>
                  <strong style={{ fontSize: '0.85rem', color: '#3730A3' }}>{t('whatAksharMitraNoticed')}</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#4338CA', lineHeight: 1.45, margin: 0 }}>
                  {learningProfile?.observedPattern || (isHindi ? 'अवलोकन डेटा संसाधित हो रहा है।' : (isBengali ? 'পর্যবেক্ষণের তথ্য প্রক্রিয়া করা হচ্ছে।' : 'Observations are being processed.'))}
                </p>
              </div>

              <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '16px', border: '1px solid #A7F3D0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🎯</span>
                    <strong style={{ fontSize: '0.85rem', color: '#065F46' }}>{t('whatWeRecommendNext')}</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#047857', lineHeight: 1.45, margin: '0 0 0.6rem' }}>
                    {learningProfile?.recommendedPractice || (isHindi ? 'व्यक्तिगत अभ्यास योजना तैयार हो रही है।' : (isBengali ? 'ব্যক্তিগত পাঠপরিকল্পনা তৈরি হচ্ছে।' : 'Preparing personalized practice plan.'))}
                  </p>
                </div>

                {learningProfile?.recommendedActivityId && learningProfile.recommendedActivityId !== 'screening' && (
                  <button
                    onClick={() => {
                      playPop();
                      setCurrentView(learningProfile.recommendedActivityId);
                    }}
                    style={{
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '0.45rem 1rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      width: 'fit-content',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <span>{t('playRecommendedPractice')}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Evidence & Context Box */}
            {((learningProfile?.evidence?.appActivity && learningProfile.evidence.appActivity.length > 0) ||
              (learningProfile?.evidence?.parentObservation && learningProfile.evidence.parentObservation.length > 0)) && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '0.85rem 1rem', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Target size={14} color="#4F46E5" />
                  <span>{t('evidenceTitle')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
                  {learningProfile.evidence.appActivity?.map((item, i) => (
                    <div key={`app-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#475569' }}>
                      <span style={{ background: '#EEF2FF', color: '#4338CA', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                        {t('sourceAppActivity')}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {learningProfile.evidence.parentObservation?.map((item, i) => (
                    <div key={`parent-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#475569' }}>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                        {t('sourceParentObs')}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isCompleted ? (

            /* Empty State for Educators */
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: '#F8FAFC',
                borderRadius: '20px',
                border: '1.5px dashed #CBD5E1'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏝️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem' }}>
                {t('screeningNotCompletedTitle')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                {profile.name} {t('screeningNotCompletedDesc')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', maxWidth: '520px', margin: '0 auto 1.5rem', textAlign: 'left', fontSize: '0.8rem' }}>
                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#1E293B' }}>🪞 {t('round1Title')}</strong>
                  <div style={{ color: '#64748B', marginTop: '0.2rem' }}>{t('round1Desc')}</div>
                </div>
                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#1E293B' }}>🥁 {t('round2Title')}</strong>
                  <div style={{ color: '#64748B', marginTop: '0.2rem' }}>{t('round2Desc')}</div>
                </div>
                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#1E293B' }}>🎙️ {t('round3Title')}</strong>
                  <div style={{ color: '#64748B', marginTop: '0.2rem' }}>{t('round3Desc')}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  playPop();
                  setCurrentView('screening');
                }}
                style={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Sparkles size={18} />
                <span>{t('startScreeningNow')}</span>
              </button>
            </div>
          ) : (
            <>
              {/* 4-Axis Metric Bars */}
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>
                📊 {t('vectorTitle')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Reversal Index */}
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t('letterReversal')}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: (metrics.reversalIndex || 0) > 60 ? '#DC2626' : '#059669' }}>
                      {metrics.reversalIndex || 0}%
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${metrics.reversalIndex || 0}%`, background: (metrics.reversalIndex || 0) > 60 ? '#EF4444' : '#10B981', borderRadius: '9999px' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
                    {t('reversalSummary')} {metrics.confusionsDetected ? metrics.confusionsDetected.join(', ') : 'None significant'}
                  </p>
                </div>

                {/* Reading Fluency */}
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t('readingFluency')}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4F46E5' }}>
                      {metrics.wpm || 0} WPM
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((metrics.wpm || 0) * 1.5, 100)}%`, background: '#4F46E5', borderRadius: '9999px' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
                    {t('readingTarget')}
                  </p>
                </div>

                {/* Phonological Awareness */}
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t('phonologicalScore')}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: (metrics.phonologicalScore || 0) < 65 ? '#D97706' : '#059669' }}>
                      {metrics.phonologicalScore || 0}%
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${metrics.phonologicalScore || 0}%`, background: (metrics.phonologicalScore || 0) < 65 ? '#F59E0B' : '#10B981', borderRadius: '9999px' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
                    {t('rhymeSummary')}
                  </p>
                </div>

                {/* Graphomotor Tracing */}
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t('fineMotorAccuracy')}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10B981' }}>
                      {metrics.tracingAccuracy || 0}%
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${metrics.tracingAccuracy || 0}%`, background: '#10B981', borderRadius: '9999px' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
                    {t('tracingSummary')}
                  </p>
                </div>
              </div>

              {/* Dual-Track NEP 2020 Learning Roadmap Section */}
              <div style={{ background: isElevated ? '#FFFBEB' : '#F0FDF4', padding: '1.25rem', borderRadius: '18px', border: isElevated ? '1.5px solid #FDE68A' : '1.5px solid #BBF7D0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{isElevated ? '🧠' : '🚀'}</span>
                    <h4 style={{ fontSize: '1rem', color: isElevated ? '#92400E' : '#14532D', margin: 0, fontWeight: 800 }}>
                      {isElevated ? (isHindi ? 'ट्रैक ख: लक्षित बहु-संवेदी ऑर्टन-गिलिंगहैम योजना' : (isBengali ? 'ট্র্যাক খ: নির্দেশিত মাল্টি-সেন্সরি অর্থন-গিলিংহাম শিক্ষণ পথ' : 'Track B: Targeted Multisensory Orton-Gillingham Plan')) : (isHindi ? 'ट्रैक क: बुनियादी साक्षरता और प्रवाह प्रवीणता' : (isBengali ? 'ট্র্যাক ক: দ্রুত পঠন দক্ষতা ও শব্দচর্চা পথ' : 'Track A: Foundational Literacy & Speed Mastery'))}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: isElevated ? '#FEF3C7' : '#DCFCE7', color: isElevated ? '#B45309' : '#166534' }}>
                    {t('nepAligned')}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: isElevated ? '#78350F' : '#15803D', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                  {profile.recommendation || (isElevated
                    ? (isHindi
                        ? 'अक्षरों के स्थानिक भ्रम को दूर करने के लिए लक्षित स्पर्श-आधारित अक्षर अनुरेखण, उच्च-कंट्रास्ट दृश्य रंग और डिस्लेक्सिया-अनुकूल फ़ॉन्ट की सिफारिश की जाती है।'
                        : (isBengali
                            ? 'নির্দিষ্ট স্পর্শভিত্তিক বর্ণাভ্যাস, উচ্চ-বৈসাদৃশ্য ডিসলেক্সিয়া-বান্ধব ফন্ট ব্যবহারের মাধ্যমে কাছাকাছি বর্ণের স্থানিক বৈষম্য দূর করার পরামর্শ দেওয়া হচ্ছে।'
                            : 'Targeted tactile letter tracing, high-contrast visual tint, and Lexend dyslexia-friendly font recommended to strengthen spatial letter discrimination.'))
                    : (isHindi
                        ? 'ध्वन्यात्मक और दृश्य अभिविन्यास में मजबूत दक्षता प्रदर्शित करता है। गति पठन चुनौतियों और उन्नत कहानी पढ़ने के लिए तैयार।'
                        : (isBengali
                            ? 'ধ্বনিগত ও দৃষ্টিগত অবস্থান চেনার ক্ষেত্রে দৃঢ় দক্ষতা পরিলক্ষিত হয়েছে। দ্রুত পঠন চ্যালেঞ্জ ও উন্নত গল্প পড়ার জন্য প্রস্তুত।'
                            : 'Demonstrates solid phonological and visual orientation mastery. Ready for speed reading challenges and advanced story reading.')))}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '0.78rem' }}>
                  <div style={{ background: 'white', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ color: '#1E293B' }}>{isHindi ? 'कक्षा रणनीति:' : (isBengali ? 'শ্রেণীকক্ষের কৌশল:' : 'Classroom Strategy:')}</strong>
                    <div style={{ color: '#64748B', marginTop: '0.2rem' }}>
                      {isElevated
                        ? (isHindi ? 'बहु-संवेदी सैंड ट्रे और रंग-कोडित दृश्य संकेतों का प्रयोग करें।' : (isBengali ? 'মাল্টি-সেন্সরি স্যান্ড ট্রে ও রঙের সহায়তায় বর্ণ পার্থক্য অভ্যাস করান।' : 'Use multi-sensory sand tray & color-coded visual anchors.'))
                        : (isHindi ? 'स्वतंत्र कहानी पठन और दृष्टि-शब्द प्रवाह को प्रोत्साहित करें।' : (isBengali ? 'স্বতন্ত্র গল্প পাঠ ও সাবলীল শব্দ পঠন উৎসাহিত করুন।' : 'Encourage independent story reading and timed sight-word fluency.'))}
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ color: '#1E293B' }}>{isHindi ? 'गृह गतिविधि:' : (isBengali ? 'বাড়ির কার্যক্রম:' : 'Home Activity:')}</strong>
                    <div style={{ color: '#64748B', marginTop: '0.2rem' }}>
                      {isElevated
                        ? (isHindi ? 'प्रतिदिन 10 मिनट जादुई अक्षर अनुरेखण और तुकबंदी की धुन खेलें।' : (isBengali ? 'প্রতিদিন ১০ মিনিট ম্যাজিক বর্ণ ট্রেসিং ও ছন্দের খেলা খেলুন।' : '10 mins daily with Magic Letter Tracing & Rhyme Beats.'))
                        : (isHindi ? 'प्रतिदिन 15 मिनट वर्ड स्नैपर गति चुनौती खेलें।' : (isBengali ? 'প্রতিদিন ১৫ মিনিট ওয়ার্ড স্ন্যাপার স্পিড চ্যালেঞ্জ খেলুন।' : '15 mins daily with Word Snapper speed challenges.'))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Ethical Non-Diagnostic Notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Shield size={16} color="#64748B" />
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
              <strong>{isHindi ? 'शिक्षक और अभिभावकों के लिए सूचना:' : (isBengali ? 'শিক্ষক ও অভিভাবকদের জন্য তথ্য:' : 'Note for Educators & Parents:')}</strong> {isHindi ? 'यह स्क्रीनिंग टूल एनईपी 2020 / निपुण भारत दिशानिर्देशों के तहत प्रारंभिक जोखिम पहचान प्रदान करता है। यह कोई नैदानिक निदान नहीं है, बल्कि समय पर मार्गदर्शन प्रदान करने वाला सहायक प्लेटफॉर्म है।' : (isBengali ? 'এই স্ক্রীনিং টুলটি NEP ২০২০ / নিপুণ ভারত নির্দেশিকা অনুযায়ী প্রাথমিক পর্যবেক্ষণ প্রদান করে। এটি কোনো ক্লিনিক্যাল ডায়াগনোসিস নয়, বরং সময়োপযোগী দিকনির্দেশনা প্রদানকারী সহায়ক প্ল্যাটফর্ম।' : 'This screening tool is designed for early risk identification under NEP 2020 / NIPUN Bharat. It is non-clinical and provides low-barrier triage to empower educators and families with timely insights.')}
            </p>
          </div>
        </div>
      )}

      {/* Parent Observation Modal Wizard */}
      <ParentObservationModal
        isOpen={showObservationModal}
        onClose={() => setShowObservationModal(false)}
        onSave={async (data) => {
          if (updateParentFeedback) {
            const updatedProfile = await updateParentFeedback(data);
            // Show toast with new recommended activity
            if (updatedProfile?.learningProfile?.recommendedActivityId) {
              const activityId = updatedProfile.learningProfile.recommendedActivityId;
              const meta = CHILD_ACTIVITY_METADATA[activityId];
              const langId = activeLanguage?.id;
              const isBengali = langId === 'bengali';
              const isHindi = langId === 'hindi';
              setFeedbackSaveToast({
                icon: meta?.icon || '🎯',
                activityTitle: isHindi ? (meta?.titleHi || meta?.titleEn) : (isBengali ? meta?.titleBn : meta?.titleEn) || activityId,
                childPrompt: isHindi ? (meta?.childPromptHi || meta?.childPromptEn) : (isBengali ? meta?.childPromptBn : meta?.childPromptEn) || ''
              });
              setTimeout(() => setFeedbackSaveToast(null), 5000);
            }
          }
        }}
      />
    </div>
  );
}

