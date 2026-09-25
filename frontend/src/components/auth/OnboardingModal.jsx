import React, { useState } from 'react';
import { X, Rocket, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import AvatarPicker from '../landing/AvatarPicker';
import { GRADES, SUPPORTED_LANGUAGES } from '@backend/data/languages';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function OnboardingModal({ isOpen, onClose }) {
  const { activeLanguage, setLanguageById, createStudentProfile, t } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('sheru');
  const [selectedGrade, setSelectedGrade] = useState('grade2');
  const [ageBand, setAgeBand] = useState('5-7');

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';

  if (!isOpen) return null;

  const handleNextStep = () => {
    playPop();
    if (!name.trim()) {
      setName(isHindi ? 'खोजी' : (isBengali ? 'অভিযাত্রী' : (ageBand === '2-4' ? 'Little Explorer' : 'Young Explorer')));
    }
    setStep(2);
  };

  const handlePrevStep = () => {
    playPop();
    setStep(1);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    playStarTwinkle();

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    const profile = await createStudentProfile({
      name: name.trim() || (isHindi ? 'खोजी' : (isBengali ? 'অভিযাত্রী' : (ageBand === '2-4' ? 'Little Explorer' : 'Young Explorer'))),
      avatar: selectedAvatar,
      grade: ageBand === '2-4' ? 'preschool' : selectedGrade,
      languageId: activeLanguage.id,
      ageBand: ageBand
    });

    onClose();
    setStep(1);

    const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');
    const welcomeMsg = ageBand === '2-4'
      ? (isHindi ? `नमस्ते! चलो खेलें!` : (isBengali ? `স্বাগতম! এসো খেলি!` : `Welcome! Let's play!`))
      : (isHindi
          ? `नमस्ते ${profile.name}! आइए सीखने का अभियान शुरू करें!`
          : (isBengali ? `স্বাগতম ${profile.name}! এসো শেখার অভিযান শুরু করি!` : `Welcome ${profile.name}! Let's start the adventure!`));
    speakText(welcomeMsg, speechLang);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✨</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {step === 1 ? t('chooseIdentity') : t('gradeAndLanguage')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {step === 1 ? t('identitySubtitle') : t('customizeSubtitle')}
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
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Name & Avatar */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                {t('whatIsName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '16px',
                  border: '2px solid var(--border-light)',
                  background: '#FFFFFF',
                  fontSize: '1.1rem',
                  fontFamily: 'inherit',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
            </div>

            <AvatarPicker selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />

            <button
              type="button"
              onClick={handleNextStep}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '16px', marginTop: '0.5rem' }}
            >
              <span>{t('nextStep')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Grade & Language */}
        {step === 2 && (
          <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Age Band Selector */}
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                {t('ageBandTitle')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setAgeBand('2-4');
                  }}
                  style={{
                    padding: '0.85rem 0.65rem',
                    borderRadius: '14px',
                    border: ageBand === '2-4' ? '2.5px solid #10B981' : '1.5px solid #E2E8F0',
                    background: ageBand === '2-4' ? '#ECFDF5' : 'white',
                    color: ageBand === '2-4' ? '#047857' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>🐣</span>
                  <div style={{ fontWeight: '800', fontSize: '0.88rem' }}>{t('ageBandExplorer')}</div>
                  <div style={{ fontSize: '0.72rem', color: ageBand === '2-4' ? '#065F46' : 'var(--text-muted)', lineHeight: '1.2' }}>
                    {t('ageBandExplorerDesc')}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setAgeBand('5-7');
                  }}
                  style={{
                    padding: '0.85rem 0.65rem',
                    borderRadius: '14px',
                    border: ageBand === '5-7' ? '2.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                    background: ageBand === '5-7' ? '#EEF2FF' : 'white',
                    color: ageBand === '5-7' ? '#4338CA' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>🎒</span>
                  <div style={{ fontWeight: '800', fontSize: '0.88rem' }}>{t('ageBandReader')}</div>
                  <div style={{ fontSize: '0.72rem', color: ageBand === '5-7' ? '#3730A3' : 'var(--text-muted)', lineHeight: '1.2' }}>
                    {t('ageBandReaderDesc')}
                  </div>
                </button>
              </div>
            </div>

            {ageBand === '5-7' && (
              <div>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                  {t('selectGrade')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {GRADES.map((g) => {
                    const isSelected = selectedGrade === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          playPop();
                          setSelectedGrade(g.id);
                        }}
                        style={{
                          padding: '0.6rem 0.5rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                          background: isSelected ? '#EEF2FF' : 'white',
                          color: isSelected ? '#4338CA' : '#334155',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div>{g.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.age}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                {t('learningLanguage')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {SUPPORTED_LANGUAGES.map((l) => {
                  const isSelected = activeLanguage.id === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        playPop();
                        setLanguageById(l.id);
                      }}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '9999px',
                        border: isSelected ? '2px solid #F59E0B' : '1.5px solid #E2E8F0',
                        background: isSelected ? '#FEF3C7' : 'white',
                        color: isSelected ? '#B45309' : '#334155',
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span>{l.flagEmoji}</span>
                      <span>{l.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn btn-secondary"
                style={{ flex: '1', borderRadius: '16px' }}
              >
                <ArrowLeft size={18} />
                <span>{t('prevStep')}</span>
              </button>

              <button
                type="submit"
                className="btn btn-primary animate-pulse-glow"
                style={{ flex: '2', borderRadius: '16px' }}
              >
                <Rocket size={20} />
                <span>{t('startAdventure')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
