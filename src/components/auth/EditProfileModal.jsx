import React, { useState, useEffect } from 'react';
import { X, User, Check, CloudCheck, ShieldCheck, Database, Sparkles, BookOpen, Globe, Award, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import AvatarPicker from '../landing/AvatarPicker';
import { GRADES, SUPPORTED_LANGUAGES } from '../../data/languages';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function EditProfileModal({ isOpen, onClose }) {
  const {
    activeProfile,
    activeLanguage,
    updateStudentProfile,
    dbStatus,
    t
  } = useProfile();

  const { playPop, playStarTwinkle, speakText } = useAudio();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('sheru');
  const [grade, setGrade] = useState('grade2');
  const [languageId, setLanguageId] = useState('english');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when activeProfile or modal opens
  useEffect(() => {
    if (activeProfile && isOpen) {
      setName(activeProfile.name || '');
      setAvatar(activeProfile.avatar || 'sheru');
      setGrade(activeProfile.grade || 'grade2');
      setLanguageId(activeProfile.language || activeLanguage?.id || 'english');
      setSaveSuccess(false);
    }
  }, [activeProfile, isOpen, activeLanguage]);

  if (!isOpen || !activeProfile) return null;

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';

  const handleSave = async (e) => {
    e.preventDefault();
    playStarTwinkle();
    setIsSaving(true);

    try {
      await updateStudentProfile({
        name: name.trim() || activeProfile.name,
        avatar,
        grade,
        languageId
      });

      setSaveSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) { }

      const speechLang = languageId === 'hindi' ? 'hi-IN' : (languageId === 'bengali' ? 'bn-IN' : 'en-US');
      const updatedMsg = languageId === 'hindi'
        ? `प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!`
        : (languageId === 'bengali' ? `প্রোফাইল সফলভাবে আপডেট করা হয়েছে!` : `Profile updated successfully!`);
      speakText(updatedMsg, speechLang);

      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setIsSaving(false);
    }
  };

  const isCloudSynced = dbStatus === 'online' || dbStatus === 'synced';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>✏️</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
                {isHindi ? 'प्रोफ़ाइल संपादित करें' : (isBengali ? 'প্রোফাইল সম্পাদনা করুন' : 'Edit Learner Profile')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                {isHindi ? 'नाम, साथी अवतार, कक्षा और भाषा बदलें' : (isBengali ? 'নাম, বন্ধু অবতার, শ্রেণি ও ভাষা পরিবর্তন করুন' : 'Update name, avatar companion, grade & language')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPop();
              onClose();
            }}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Data Storage & Security Status Pill */}
        <div
          style={{
            background: isCloudSynced ? '#F0FDF4' : '#F8FAFC',
            border: isCloudSynced ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
            borderRadius: '16px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              background: isCloudSynced ? '#DCFCE7' : '#E2E8F0',
              color: isCloudSynced ? '#15803D' : '#475569',
              borderRadius: '10px',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isCloudSynced ? <ShieldCheck size={20} /> : <Database size={20} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isCloudSynced ? '#15803D' : '#334155' }}>
                {isCloudSynced
                  ? (isHindi ? '🟢 डेटा क्लाउड सुरक्षित (Supabase डेटाबेस)' : (isBengali ? '🟢 ডেটা ক্লাউড সুরক্ষিত (Supabase ডেটাবেস)' : '🟢 Cloud Database Active (Supabase)'))
                  : (isHindi ? '💾 डेटा स्थानीय रूप से सुरक्षित (सुरक्षित डिवाइस स्टोरेज)' : (isBengali ? '💾 ডেটা স্থানীয়ভাবে সুরক্ষিত (নিরাপদ ডিভাইস স্টোরেজ)' : '💾 Safe Local Device Storage Active'))}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: '1.3' }}>
              {isHindi
                ? 'आपकी सभी प्रगति, अर्जित सितारे (⭐), उपस्थिति सिलसिला और माता-पिता के सुझाव स्वचालित रूप से स्थायी रूप से सहेजे जाते हैं।'
                : (isBengali
                  ? 'তোমার সমস্ত অগ্রগতি, অর্জিত তারা (⭐), উপস্থিতির ধারা এবং পিতামাতার পর্যবেক্ষণ স্থায়ীভাবে সংরক্ষিত।'
                  : 'All your learning progress, stars (⭐), reading streaks, and parent observations are securely stored and preserved.')}
            </p>
          </div>
        </div>

        {/* Current Stats Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}
        >
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '14px',
              padding: '0.6rem 0.5rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '1rem' }}>⭐</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#92400E' }}>
              {activeProfile.stars || 15}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#B45309', fontWeight: 600 }}>
              {isHindi ? 'कुल सितारे' : (isBengali ? 'মোট তারা' : 'Total Stars')}
            </div>
          </div>

          <div
            style={{
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              borderRadius: '14px',
              padding: '0.6rem 0.5rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '1rem' }}>🔥</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#C2410C' }}>
              {activeProfile.streak || 2} {isHindi ? 'दिन' : (isBengali ? 'দিন' : 'Days')}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#EA580C', fontWeight: 600 }}>
              {isHindi ? 'सिलसिला' : (isBengali ? 'ধারা' : 'Streak')}
            </div>
          </div>

          <div
            style={{
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '14px',
              padding: '0.6rem 0.5rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '1rem' }}>🎯</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#3730A3' }}>
              {activeProfile.screeningCompleted ? (isHindi ? 'जाँच पूर्ण' : (isBengali ? 'সম্পূর্ণ' : 'Screened')) : (isHindi ? 'प्रारंभिक' : (isBengali ? 'প্রস্তুত' : 'Ready'))}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#4F46E5', fontWeight: 600 }}>
              {isHindi ? 'स्थिति' : (isBengali ? 'অবস্থা' : 'Status')}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* 1. Student Name */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#334155', marginBottom: '0.4rem' }}>
              {isHindi ? 'विद्यार्थी का नाम' : (isBengali ? 'শিক্ষার্থীর নাম' : "Learner's Name")}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isHindi ? 'उदा. आरव, खुशी' : (isBengali ? 'উদা. আরভ, অনন্যা' : 'e.g. Aarav, Maya')}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '14px',
                  border: '2px solid #E2E8F0',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  color: '#1E293B',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4F46E5'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
              />
            </div>
          </div>

          {/* 2. Avatar Companion Selection */}
          <div>
            <AvatarPicker selectedAvatar={avatar} onSelectAvatar={(avId) => setAvatar(avId)} />
          </div>

          {/* 3. Class / Grade Selection */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#334155', marginBottom: '0.4rem' }}>
              {isHindi ? 'कक्षा / ग्रेड' : (isBengali ? 'শ্রেণি / গ্রেড' : 'Class / Grade Level')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {GRADES.map((g) => {
                const isSelected = grade === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      playPop();
                      setGrade(g.id);
                    }}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                      background: isSelected ? '#EEF2FF' : '#FFFFFF',
                      color: isSelected ? '#4338CA' : '#334155',
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>{g.label}</div>
                    <div style={{ fontSize: '0.72rem', color: isSelected ? '#6366F1' : '#94A3B8' }}>{g.age}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Preferred Learning Language */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#334155', marginBottom: '0.4rem' }}>
              {isHindi ? 'सीखने की प्राथमिक भाषा' : (isBengali ? 'শেখার প্রধান ভাষা' : 'Primary Learning Language')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = languageId === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      playPop();
                      setLanguageId(lang.id);
                    }}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                      background: isSelected ? '#EEF2FF' : '#FFFFFF',
                      color: isSelected ? '#4338CA' : '#334155',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{lang.flagEmoji}</span>
                    <span>{lang.name}</span>
                    <span style={{ fontSize: '0.68rem', color: isSelected ? '#6366F1' : '#94A3B8' }}>
                      {lang.englishName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save / Cancel Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                playPop();
                onClose();
              }}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: '14px',
                border: '1.5px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#64748B',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {isHindi ? 'रद्द करें' : (isBengali ? 'বাতিল' : 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 2,
                padding: '0.85rem',
                borderRadius: '14px',
                border: 'none',
                background: saveSuccess ? '#10B981' : 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: isSaving ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {saveSuccess ? (
                <>
                  <Check size={18} />
                  <span>{isHindi ? 'सहेज लिया गया! ✓' : (isBengali ? 'সংরক্ষিত! ✓' : 'Saved! ✓')}</span>
                </>
              ) : isSaving ? (
                <span>{isHindi ? 'सहेजा जा रहा है...' : (isBengali ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...')}</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{isHindi ? 'प्रोफ़ाइल सहेजें' : (isBengali ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
