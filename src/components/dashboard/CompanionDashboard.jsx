import React, { useState } from 'react';
import { ArrowLeft, Award, CheckCircle, AlertTriangle, Printer, Sparkles, BookOpen, Volume2, Shield, Zap, Target, Mic, Music, Flame, Star } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function CompanionDashboard() {
  const { activeProfile, setCurrentView, activeLanguage, t } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();
  const [viewMode, setViewMode] = useState('educator'); // 'kid' | 'educator'

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

  const handleMitraCoachAudio = () => {
    playPop();
    const coachText = isElevated
      ? (isBengali ? t('mitraCoachDescElevated') : t('mitraCoachDescElevated'))
      : (isBengali ? t('mitraCoachDescTypical') : t('mitraCoachDescTypical'));
    speakText(coachText, isBengali ? 'bn-IN' : 'en-US');
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
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.6rem 1rem', borderRadius: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F87171' }}>
                  {profile.streakDays || 4} 🔥
                </div>
                <div style={{ fontSize: '0.7rem', color: '#E0E7FF' }}>{isBengali ? 'দিনের ধারা' : 'Streak Days'}</div>
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
                      {(metrics.reversalIndex || 0) <= 30 ? (isBengali ? 'দক্ষতা অর্জন ✅' : 'Mastered ✅') : (isBengali ? 'অনুশীলন চলছে 🎯' : 'Training 🎯')}
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
                      {metrics.phonologicalScore || 80}% {isBengali ? 'স্কোর' : 'Score'}
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
                      {metrics.wpm || 30} {isBengali ? 'শব্দ/মি' : 'WPM'}
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
                      {metrics.tracingAccuracy || 85}% {isBengali ? 'নির্ভুল' : 'Accurate'}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: '#DB2777', marginTop: '0.4rem', margin: 0 }}>
                      {t('powerMagicPenDesc')}
                    </p>
                  </div>
                </div>
              </div>

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
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 0.2rem', color: 'white' }}>
                    {t('missionTodayTitle')}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#D1FAE5', margin: 0 }}>
                    {isElevated
                      ? (isBengali ? 'বর্ণ শিকারী ও বানান নিরাময় খেলে নতুন স্টার আনলক করো!' : 'Play Letter Hunter & Spelling Clinic to boost your superpowers!')
                      : (isBengali ? 'ওয়ার্ড স্ন্যাপার ও দ্রুত গল্প পড়ার খেলায় যোগ দাও!' : 'Play Word Snapper speed challenges and earn 50+ stars!')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playStarTwinkle();
                    setCurrentView('games');
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
                  {t('playMissionBtn')}
                </button>
              </div>
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
                  {t('screeningCompletedLabel')} <strong>{isCompleted ? (metrics.dateCompleted || 'Completed') : (isBengali ? 'এখনও সম্পন্ন হয়নি' : 'Pending')}</strong> • {isBengali ? 'ভাষা' : 'Language'}: <strong>{activeLanguage.name}</strong>
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
                      {isElevated ? (isBengali ? 'ট্র্যাক খ: নির্দেশিত মাল্টি-সেন্সরি অর্থন-গিলিংহাম শিক্ষণ পথ' : 'Track B: Targeted Multisensory Orton-Gillingham Plan') : (isBengali ? 'ট্র্যাক ক: দ্রুত পঠন দক্ষতা ও শব্দচর্চা পথ' : 'Track A: Foundational Literacy & Speed Mastery')}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: isElevated ? '#FEF3C7' : '#DCFCE7', color: isElevated ? '#B45309' : '#166534' }}>
                    {t('nepAligned')}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: isElevated ? '#78350F' : '#15803D', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                  {profile.recommendation || (isElevated
                    ? (isBengali
                        ? 'নির্দিষ্ট স্পর্শভিত্তিক বর্ণাভ্যাস, উচ্চ-বৈসাদৃশ্য ডিসলেক্সিয়া-বান্ধব ফন্ট ব্যবহারের মাধ্যমে কাছাকাছি বর্ণের স্থানিক বৈষম্য দূর করার পরামর্শ দেওয়া হচ্ছে।'
                        : 'Targeted tactile letter tracing, high-contrast visual tint, and Lexend dyslexia-friendly font recommended to strengthen spatial letter discrimination.')
                    : (isBengali
                        ? 'ধ্বনিগত ও দৃষ্টিগত অবস্থান চেনার ক্ষেত্রে দৃঢ় দক্ষতা পরিলক্ষিত হয়েছে। দ্রুত পঠন চ্যালেঞ্জ ও উন্নত গল্প পড়ার জন্য প্রস্তুত।'
                        : 'Demonstrates solid phonological and visual orientation mastery. Ready for speed reading challenges and advanced story reading.'))}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '0.78rem' }}>
                  <div style={{ background: 'white', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ color: '#1E293B' }}>{isBengali ? 'শ্রেণীকক্ষের কৌশল:' : 'Classroom Strategy:'}</strong>
                    <div style={{ color: '#64748B', marginTop: '0.2rem' }}>
                      {isElevated
                        ? (isBengali ? 'মাল্টি-সেন্সরি স্যান্ড ট্রে ও রঙের সহায়তায় বর্ণ পার্থক্য অভ্যাস করান।' : 'Use multi-sensory sand tray & color-coded visual anchors.')
                        : (isBengali ? 'স্বতন্ত্র গল্প পাঠ ও সাবলীল শব্দ পঠন উৎসাহিত করুন।' : 'Encourage independent story reading and timed sight-word fluency.')}
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ color: '#1E293B' }}>{isBengali ? 'বাড়ির কার্যক্রম:' : 'Home Activity:'}</strong>
                    <div style={{ color: '#64748B', marginTop: '0.2rem' }}>
                      {isElevated
                        ? (isBengali ? 'প্রতিদিন ১০ মিনিট ম্যাজিক বর্ণ ট্রেসিং ও ছন্দের খেলা খেলুন।' : '10 mins daily with Magic Letter Tracing & Rhyme Beats.')
                        : (isBengali ? 'প্রতিদিন ১৫ মিনিট ওয়ার্ড স্ন্যাপার স্পিড চ্যালেঞ্জ খেলুন।' : '15 mins daily with Word Snapper speed challenges.')}
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
              <strong>{isBengali ? 'শিক্ষক ও অভিভাবকদের জন্য তথ্য:' : 'Note for Educators & Parents:'}</strong> {isBengali ? 'এই স্ক্রীনিং টুলটি NEP ২০২০ / নিপুণ ভারত নির্দেশিকা অনুযায়ী প্রাথমিক পর্যবেক্ষণ প্রদান করে। এটি কোনো ক্লিনিক্যাল ডায়াগনোসিস নয়, বরং সময়োপযোগী দিকনির্দেশনা প্রদানকারী সহায়ক প্ল্যাটফর্ম।' : 'This screening tool is designed for early risk identification under NEP 2020 / NIPUN Bharat. It is non-clinical and provides low-barrier triage to empower educators and families with timely insights.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
