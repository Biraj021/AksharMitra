import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Users,
  Compass,
  KeyRound,
  BookOpen,
  Volume2
} from 'lucide-react';
import { useProfile, getAvatarEmoji, AVATAR_MAP } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { SUPPORTED_LANGUAGES } from '@backend/data/languages';

export default function AuthPage() {
  const navigate = useNavigate();
  const {
    loginAsStudent,
    loginAsTeacher,
    registerAsTeacher,
    loginTeacherDemo,
    activeLanguage,
    setLanguageById,
    t
  } = useProfile();

  const { playPop, playStarTwinkle, speakText } = useAudio();

  // Role: 'student' | 'teacher' | 'parent'
  const [selectedRole, setSelectedRole] = useState('student');

  // Teacher / Parent state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [educatorName, setEducatorName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student state
  const [studentMode, setStudentMode] = useState('id'); // 'id' | 'create'
  const [kidCodeInput, setKidCodeInput] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('sheru');
  const [selectedGrade, setSelectedGrade] = useState('grade2');
  const [selectedAgeBand, setSelectedAgeBand] = useState('5-7');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (errorMessage) setErrorMessage('');
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (studentMode === 'id') {
      const code = kidCodeInput.trim().toUpperCase();
      if (!code) {
        playPop();
        setErrorMessage(
          isHindi
            ? 'कृपया अपना किड आईडी दर्ज करें (जैसे: AM-1001)'
            : isBengali
            ? 'অনুগ্রহ করে তোমার কিডের আইডি লিখো (যেমন: AM-1001)'
            : 'Please enter your Kid ID (e.g., AM-1001)'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const student = await loginAsStudent({ kidCode: code });
        playStarTwinkle();
        const welcome = isHindi
          ? `नमस्ते ${student.name}! चलो खेल शुरू करें!`
          : isBengali
          ? `স্বাগতম ${student.name}! চলো খেলা শুরু করি!`
          : `Welcome ${student.name}! Let's start the adventure!`;
        speakText(welcome, speechLang);
        navigate('/play');
      } catch (err) {
        playPop();
        setErrorMessage(err.message || 'Kid ID not found. Try AM-1001 for demo or create a new pass.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!newStudentName.trim()) {
        playPop();
        setErrorMessage(
          isHindi
            ? 'कृपया अपना नाम दर्ज करें।'
            : isBengali
            ? 'অনুগ্রহ করে তোমার নাম লিখো।'
            : 'Please enter your name.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const student = await loginAsStudent({
          studentName: newStudentName.trim(),
          avatar: selectedAvatar,
          grade: selectedGrade,
          ageBand: selectedAgeBand
        });
        playStarTwinkle();
        const welcome = isHindi
          ? `स्वागत है ${student.name}! आपका किड आईडी है ${student.kidCode}`
          : isBengali
          ? `স্বাগতম ${student.name}! তোমার কিডের আইডি ${student.kidCode}`
          : `Welcome ${student.name}! Your Kid ID is ${student.kidCode}`;
        speakText(welcome, speechLang);
        navigate('/play');
      } catch (err) {
        playPop();
        setErrorMessage(err.message || 'Could not create student pass.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleQuickStudentDemo = async (code, name) => {
    playStarTwinkle();
    setIsSubmitting(true);
    try {
      const student = await loginAsStudent({ kidCode: code });
      const welcome = isHindi ? `नमस्ते ${name}!` : `Welcome ${name}!`;
      speakText(welcome, speechLang);
      navigate('/play');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (phone.length < 10) {
      playPop();
      setErrorMessage(
        isHindi
          ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।'
          : isBengali
          ? 'অনুগ্রহ করে ১০ সংখ্যার মোবাইল নম্বর দিন।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!password || password.length < 6) {
      playPop();
      setErrorMessage(
        isHindi
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : isBengali
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (authMode === 'register' && !educatorName.trim()) {
      playPop();
      setErrorMessage(
        isHindi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.'
      );
      return;
    }

    if (authMode === 'register' && password !== confirmPassword) {
      playPop();
      setErrorMessage(
        isHindi
          ? 'पासवर्ड मेल नहीं खाते। कृपया पुनः जांचें।'
          : isBengali
          ? 'পাসওয়ার্ড দুটি মেলেনি।'
          : 'Passwords do not match. Please verify.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        await loginAsTeacher({ phone, password });
        playStarTwinkle();
      } else {
        await registerAsTeacher({
          name: educatorName.trim(),
          phone,
          password
        });
        playStarTwinkle();
      }
      navigate('/dashboard');
    } catch (err) {
      playPop();
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherDemo = () => {
    playStarTwinkle();
    loginTeacherDemo();
    navigate('/dashboard');
  };

  const avatarKeys = Object.keys(AVATAR_MAP);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #FAF5FF 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem 3rem'
      }}
    >
      {/* Top Identity & Language Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 6px 14px rgba(79, 70, 229, 0.28)'
            }}
          >
            🦉
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E293B', margin: 0, letterSpacing: '-0.02em' }}>
              AksharMitra
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#6366F1', margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Early Literacy & Dyslexia Platform
            </p>
          </div>
        </div>

        {/* Language selector */}
        <select
          value={activeLanguage.id}
          onChange={(e) => {
            playPop();
            setLanguageById(e.target.value);
          }}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            border: '2px solid #CBD5E1',
            background: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#334155',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.flagEmoji} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Institutional Portal Box */}
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: '#FFFFFF',
          borderRadius: '32px',
          boxShadow: '0 20px 45px -10px rgba(99, 102, 241, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          padding: '2.25rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem'
        }}
      >
        {/* 1. Portal Role Switcher Tabs */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 900,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.65rem'
            }}
          >
            <Users size={15} color="#6366F1" />
            <span>Select Portal Role / पोर्टल भूमिका चुनें</span>
          </label>

          {/* Role Pill Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                playPop();
                setSelectedRole('student');
                setErrorMessage('');
              }}
              className="btn-3d"
              style={{
                padding: '0.65rem 0.35rem',
                borderRadius: '16px',
                border: selectedRole === 'student' ? '2.5px solid #16A34A' : '2px solid #E2E8F0',
                background: selectedRole === 'student' ? '#DCFCE7' : '#F8FAFC',
                color: selectedRole === 'student' ? '#15803D' : '#64748B',
                fontWeight: 900,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>🎒</span> Student
            </button>

            <button
              type="button"
              onClick={() => {
                playPop();
                setSelectedRole('teacher');
                setErrorMessage('');
              }}
              className="btn-3d"
              style={{
                padding: '0.65rem 0.35rem',
                borderRadius: '16px',
                border: selectedRole === 'teacher' ? '2.5px solid #4F46E5' : '2px solid #E2E8F0',
                background: selectedRole === 'teacher' ? '#EEF2FF' : '#F8FAFC',
                color: selectedRole === 'teacher' ? '#4338CA' : '#64748B',
                fontWeight: 900,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>👩‍🏫</span> Teacher
            </button>

            <button
              type="button"
              onClick={() => {
                playPop();
                setSelectedRole('parent');
                setErrorMessage('');
              }}
              className="btn-3d"
              style={{
                padding: '0.65rem 0.35rem',
                borderRadius: '16px',
                border: selectedRole === 'parent' ? '2.5px solid #0284C7' : '2px solid #E2E8F0',
                background: selectedRole === 'parent' ? '#E0F2FE' : '#F8FAFC',
                color: selectedRole === 'parent' ? '#0369A1' : '#64748B',
                fontWeight: 900,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>👨‍👩‍👧</span> Parent
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              background: '#FEF2F2',
              border: '2px solid #FECACA',
              color: '#B91C1C',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── 2A. STUDENT / KID PORTAL UI ── */}
        {selectedRole === 'student' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '2px solid #86EFAC',
                borderRadius: '24px',
                padding: '1.25rem 1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.1)'
              }}
            >
              <div style={{ fontSize: '2.8rem' }}>🦁</div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', color: '#14532D', fontSize: '1.25rem', fontWeight: 900 }}>
                  Kid's Play & Quest Zone
                </h3>
                <p style={{ margin: 0, color: '#166534', fontSize: '0.88rem', fontWeight: 700 }}>
                  Enter with your Kid ID to play games, letter hunts, and phonics quests!
                </p>
              </div>
            </div>

            {/* Student Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: '#F1F5F9',
                borderRadius: '18px',
                padding: '5px',
                gap: '5px',
                border: '1.5px solid #E2E8F0'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setStudentMode('id');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: studentMode === 'id' ? '#FFFFFF' : 'transparent',
                  color: studentMode === 'id' ? '#1E293B' : '#64748B',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: studentMode === 'id' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                🆔 I have a Kid ID
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setStudentMode('create');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: studentMode === 'create' ? '#FFFFFF' : 'transparent',
                  color: studentMode === 'create' ? '#1E293B' : '#64748B',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: studentMode === 'create' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                🌟 New Explorer Pass
              </button>
            </div>

            {/* Student Form */}
            <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {studentMode === 'id' ? (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.88rem',
                      fontWeight: 900,
                      color: '#1E293B',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Enter Kid ID / किड आईडी:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={kidCodeInput}
                      onChange={(e) => setKidCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. AM-1001 or AM-4821"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem 0.9rem 3rem',
                        fontSize: '1.3rem',
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        borderRadius: '18px',
                        border: '2.5px solid #CBD5E1',
                        outline: 'none',
                        color: '#1E293B',
                        background: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#16A34A')}
                      onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                    />
                    <KeyRound
                      size={22}
                      color="#16A34A"
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                  <p style={{ margin: '0.45rem 0 0', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                    💡 Tip: Ask your teacher for your Kid ID or click a demo student below!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.4rem' }}>
                      Explorer's Name / नाम:
                    </label>
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="e.g. Rahul, Sneha"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        borderRadius: '16px',
                        border: '2px solid #CBD5E1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.4rem' }}>
                      Choose Avatar Mascot:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      {avatarKeys.slice(0, 7).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            playPop();
                            setSelectedAvatar(k);
                          }}
                          className="btn-3d"
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '16px',
                            border: selectedAvatar === k ? '3px solid #16A34A' : '2px solid #E2E8F0',
                            background: selectedAvatar === k ? '#DCFCE7' : '#FFFFFF',
                            fontSize: '1.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {AVATAR_MAP[k]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem' }}>
                        Age Group:
                      </label>
                      <select
                        value={selectedAgeBand}
                        onChange={(e) => setSelectedAgeBand(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          borderRadius: '14px',
                          border: '2px solid #CBD5E1',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="5-7">Ages 5-7 (Phonics & Reading)</option>
                        <option value="2-4">Ages 2-4 (Little Explorer)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem' }}>
                        Class / Grade:
                      </label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          borderRadius: '14px',
                          border: '2px solid #CBD5E1',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="grade1">Class 1</option>
                        <option value="grade2">Class 2</option>
                        <option value="grade3">Class 3</option>
                        <option value="kg">Kindergarten</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d btn-3d-emerald"
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}
              >
                <span>{studentMode === 'id' ? '🚀 Enter Play & Screening Zone' : '✨ Get Kid ID & Start Adventure'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Quick Demo Students */}
            <div style={{ borderTop: '1.5px solid #E2E8F0', paddingTop: '1.15rem' }}>
              <p style={{ margin: '0 0 0.6rem', fontSize: '0.82rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚡ Quick 1-Click Demo Learners:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickStudentDemo('AM-1001', 'Aarav')}
                  className="quest-island-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.8rem 0.9rem',
                    borderRadius: '18px',
                    border: '2px solid #FDE68A',
                    background: '#FFFBEB',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>🦁</span>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#92400E' }}>Aarav (AM-1001)</div>
                    <div style={{ fontSize: '0.74rem', color: '#B45309' }}>Class 2 • Screening Flagged</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickStudentDemo('AM-1002', 'Priya')}
                  className="quest-island-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.8rem 0.9rem',
                    borderRadius: '18px',
                    border: '2px solid #BAE6FD',
                    background: '#F0F9FF',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>🦚</span>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#075985' }}>Priya (AM-1002)</div>
                    <div style={{ fontSize: '0.74rem', color: '#0369A1' }}>Class 3 • Fluent Reader</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 2B. TEACHER & PARENT PORTAL UI ── */}
        {(selectedRole === 'teacher' || selectedRole === 'parent') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            <div
              style={{
                background: selectedRole === 'teacher' ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                border: selectedRole === 'teacher' ? '2px solid #C7D2FE' : '2px solid #BAE6FD',
                borderRadius: '24px',
                padding: '1.25rem 1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem',
                boxShadow: '0 6px 16px rgba(79, 70, 229, 0.1)'
              }}
            >
              <div style={{ fontSize: '2.8rem' }}>{selectedRole === 'teacher' ? '👩‍🏫' : '👨‍👩‍👧'}</div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', color: selectedRole === 'teacher' ? '#312E81' : '#075985', fontSize: '1.25rem', fontWeight: 900 }}>
                  {selectedRole === 'teacher' ? 'Educator Diagnostics Portal' : 'Parent Companion Portal'}
                </h3>
                <p style={{ margin: 0, color: selectedRole === 'teacher' ? '#4338CA' : '#0369A1', fontSize: '0.88rem', fontWeight: 700 }}>
                  {selectedRole === 'teacher'
                    ? 'Classroom roster, diagnostic screening reports & student linking tools.'
                    : 'Track your child\'s reading fluency, milestones, and daily practice.'}
                </p>
              </div>
            </div>

            {/* Auth Mode Toggle */}
            <div
              style={{
                display: 'flex',
                background: '#F1F5F9',
                borderRadius: '18px',
                padding: '5px',
                gap: '5px',
                border: '1.5px solid #E2E8F0'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                  color: authMode === 'login' ? '#1E293B' : '#64748B',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                🔑 Faculty Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                  color: authMode === 'register' ? '#1E293B' : '#64748B',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                📝 Register Account
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.4rem' }}>
                    Full Name / पूरा नाम:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={educatorName}
                      onChange={(e) => setEducatorName(e.target.value)}
                      placeholder="e.g. Dr. Ananya Sharma"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 2.8rem',
                        fontSize: '1rem',
                        borderRadius: '16px',
                        border: '2px solid #CBD5E1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <User size={20} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.4rem' }}>
                  Mobile Number / मोबाइल नंबर:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.8rem',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      borderRadius: '16px',
                      border: '2px solid #CBD5E1',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Phone size={20} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.4rem' }}>
                  Password / पासवर्ड:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={{
                      width: '100%',
                      padding: '0.85rem 2.8rem 0.85rem 2.8rem',
                      fontSize: '1.05rem',
                      borderRadius: '16px',
                      border: '2px solid #CBD5E1',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={20} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.4rem' }}>
                    Confirm Password:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 2.8rem',
                        fontSize: '1.05rem',
                        borderRadius: '16px',
                        border: '2px solid #CBD5E1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Lock size={20} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d btn-3d-indigo"
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}
              >
                <span>{authMode === 'login' ? '🔐 Enter Dashboard' : '✨ Complete Registration'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Quick Demo Faculty Button */}
            <div style={{ borderTop: '1.5px solid #E2E8F0', paddingTop: '1.15rem' }}>
              <button
                type="button"
                onClick={handleTeacherDemo}
                className="btn-3d btn-3d-sky"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>⚡ Quick Evaluator Demo (Preloaded Class Roster)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
