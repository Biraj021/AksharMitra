import React, { useState } from 'react';
import { UserPlus, Star, ArrowRight, Trash2, CheckCircle, Sparkles, BookOpen, Shield, Globe, Award } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { SUPPORTED_LANGUAGES } from '@backend/data/languages';
import OnboardingModal from './OnboardingModal';

export default function LoginPage() {
  const {
    profilesList,
    switchProfile,
    deleteProfile,
    loadDemoProfile,
    activeLanguage,
    setLanguageById,
    t
  } = useProfile();

  const { playPop, playStarTwinkle, speakText } = useAudio();
  const [showAddModal, setShowAddModal] = useState(false);

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const handleSelectStudent = (profileId, name) => {
    playStarTwinkle();
    const welcomeMsg = isHindi
      ? `वापसी पर स्वागत है, ${name}! आइए अपना अभियान शुरू करें!`
      : (isBengali ? `স্বাগতম ${name}! এসো আমাদের পড়ার অভিযান শুরু করি!` : `Welcome back, ${name}! Let's start our adventure!`);
    speakText(welcomeMsg, speechLang);
    switchProfile(profileId);
  };

  const handleQuickDemo = (demoId, demoName) => {
    playStarTwinkle();
    const demoMsg = isHindi
      ? `${demoName} का डायग्नोस्टिक मूल्यांकन डैशबोर्ड लोड हो रहा है!`
      : (isBengali ? `${demoName}-এর ডায়াগনস্টিক রিপোর্ট লোড করা হচ্ছে!` : `Loading ${demoName}'s diagnostic evaluation dashboard!`);
    speakText(demoMsg, speechLang);
    loadDemoProfile(demoId);
  };

  const handleDeleteStudent = (e, profileId, name) => {
    e.stopPropagation();
    playPop();
    if (window.confirm(`${t('deleteProfileConfirm')} (${name})`)) {
      deleteProfile(profileId);
    }
  };

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '1.5rem 1rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem'
      }}
    >
      {/* 1. Header Banner with Mitra Owl Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #312E81 100%)',
          color: 'white',
          borderRadius: '32px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          boxShadow: '0 16px 36px rgba(49, 46, 129, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Language selector in top right */}
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <select
            value={activeLanguage.id}
            onChange={(e) => {
              playPop();
              setLanguageById(e.target.value);
            }}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '9999px',
              border: '1.5px solid rgba(255,255,255,0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              fontFamily: 'inherit',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} style={{ color: '#1E293B', background: 'white' }}>
                {lang.flagEmoji} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '3.8rem', marginBottom: '0.4rem', animation: 'gentle-bounce 2.5s infinite ease-in-out' }}>
          🦉
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white', margin: '0 0 0.35rem' }}>
          {t('whoIsLearning')}
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#C7D2FE', margin: '0 auto', maxWidth: '440px', lineHeight: 1.45 }}>
          {t('loginSubtitle')}
        </p>
      </div>

      {/* 2. Active Student Profiles Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎒</span>
            <span>{t('studentsAndExplorers')}</span>
            <span style={{ fontSize: '0.78rem', background: '#EEF2FF', color: '#4F46E5', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
              {profilesList.length} {t('active')}
            </span>
          </h3>

          <button
            onClick={() => {
              playPop();
              setShowAddModal(true);
            }}
            className="btn btn-primary"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            <UserPlus size={16} />
            <span>{t('addNewStudent')}</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}
        >
          {profilesList.map((profile) => {
            const isCompleted = profile.screeningCompleted;
            const isAtRisk = profile.riskLevel && profile.riskLevel !== 'typical';
            const isCustom = !profile.id.startsWith('demo_');

            return (
              <div
                key={profile.id}
                onClick={() => handleSelectStudent(profile.id, profile.name)}
                className="glass-card"
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '1.25rem',
                  border: isAtRisk ? '2px solid #FCD34D' : '2px solid #E2E8F0',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(79, 70, 229, 0.15)';
                  e.currentTarget.style.borderColor = '#4F46E5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = isAtRisk ? '#FCD34D' : '#E2E8F0';
                }}
              >
                {/* Top Avatar & Name Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      fontSize: '2.4rem',
                      width: '58px',
                      height: '58px',
                      borderRadius: '18px',
                      background: isAtRisk ? '#FEF3C7' : '#EEF2FF',
                      border: isAtRisk ? '2px solid #F59E0B' : '2px solid #C7D2FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getAvatarEmoji(profile.avatarEmoji || profile.avatar)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', background: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                        {profile.gradeLabel || 'Grade 2'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B45309' }}>
                        {profile.stars || 15} {t('stars')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {profile.streak || 1} {t('streakDay')}
                      </span>
                    </div>
                  </div>

                  {/* Delete button for custom student profiles */}
                  {isCustom && (
                    <button
                      onClick={(e) => handleDeleteStudent(e, profile.id, profile.name)}
                      style={{
                        background: '#FEE2E2',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#DC2626',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title={t('deleteProfileConfirm')}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Status / Pathway Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isCompleted ? (
                      <span style={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={14} />
                        <span>{isAtRisk ? (isHindi ? 'ट्रैक ख (उपचार)' : (isBengali ? 'ট্র্যাক খ (নিরাময়)' : 'Track B (Remediation)')) : (isHindi ? 'ट्रैक क (प्रवाह)' : (isBengali ? 'ট্র্যাক ক (সাবলীলতা)' : 'Track A (Fluency)'))}</span>
                      </span>
                    ) : (
                      <span style={{ color: '#4F46E5', fontWeight: 700 }}>
                        🧭 {isHindi ? 'स्क्रीनिंग तैयार (5 मिनट)' : (isBengali ? 'স্ক্রীনিং প্রস্তুত (৫ মিনিট)' : 'Screening Ready (5 Min)')}
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#4F46E5', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>{isHindi ? 'शुरू करें' : (isBengali ? 'শুরু' : 'Play')}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Judge & Teacher Benchmark Sandbox (Instant Compare) */}
      <div
        style={{
          background: '#F8FAFC',
          borderRadius: '24px',
          padding: '1.25rem',
          border: '1.5px solid #E2E8F0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Award size={18} color="#4F46E5" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {t('judgeDemoTitle')}
          </h4>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.85rem' }}>
          {t('judgeDemoSubtitle')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          <button
            onClick={() => handleQuickDemo('demo_aarav', 'Aarav (Flagged Demo)')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '16px',
              border: '1.5px solid #FCD34D',
              background: '#FFFBEB',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#92400E' }}>
                🦁 {isHindi ? 'आरव शर्मा (जोखिम डेमो)' : (isBengali ? 'আরভ শর্মা (ঝুঁকিপূর্ণ ডেমো)' : 'Aarav Sharma (At-Risk Demo)')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#B45309' }}>
                {isHindi ? 'अक्षर उलट-फेर चिह्नित • ट्रैक ख उपचार' : (isBengali ? 'বর্ণ বিভ্রান্তি চিহ্নিত • ট্র্যাক খ নিরাময়' : 'Letter reversal flagged • Track B Remediation')}
              </div>
            </div>
            <ArrowRight size={16} color="#B45309" />
          </button>

          <button
            onClick={() => handleQuickDemo('demo_priya', 'Priya (Typical Demo)')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '16px',
              border: '1.5px solid #A7F3D0',
              background: '#ECFDF5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065F46' }}>
                🦚 {isHindi ? 'प्रिया पटेल (सामान्य पाठक डेमो)' : (isBengali ? 'প্রিয়া প্যাটেল (স্বাভাবিক ডেমো)' : 'Priya Patel (Typical Reader Demo)')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                {isHindi ? 'माइलस्टोन सामान्य • ट्रैक क त्वरित पठन' : (isBengali ? 'দক্ষতা স্বাভাবিক • ট্র্যাক ক দ্রুত পঠন' : 'Milestones typical • Track A Accelerated')}
              </div>
            </div>
            <ArrowRight size={16} color="#047857" />
          </button>
        </div>
      </div>

      {/* Onboarding / Create New Profile Modal */}
      <OnboardingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
