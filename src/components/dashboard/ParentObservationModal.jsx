import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Shield, Sparkles } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { createEmptyParentFeedback } from '../../utils/parentFeedbackModel';

export default function ParentObservationModal({ isOpen, onClose, onSave }) {
  const { activeProfile, t, activeLanguage } = useProfile();
  const { playPop, playStarTwinkle } = useAudio();

  const isBengali = activeLanguage?.id === 'bengali';

  // Step 0: Reading | 1: Sounds | 2: Writing | 3: Understanding & Learning | 4: Optional Note | 5: Review
  const [currentStep, setCurrentStep] = useState(0);

  // Local form state
  const [formData, setFormData] = useState(() => createEmptyParentFeedback());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize or re-populate with existing activeProfile's feedback
  useEffect(() => {
    if (isOpen) {
      if (activeProfile?.parentFeedback) {
        const pf = activeProfile.parentFeedback;
        setFormData({
          ...createEmptyParentFeedback(),
          ...pf,
          reading: { ...(createEmptyParentFeedback().reading), ...(pf.reading || {}) },
          sounds: { ...(createEmptyParentFeedback().sounds), ...(pf.sounds || {}) },
          writing: { ...(createEmptyParentFeedback().writing), ...(pf.writing || {}) },
          understanding: {
            understandsInstructions: pf.understanding?.understandsInstructions ?? pf.comprehension?.understandsSpokenInstructions ?? null,
            handlesChallenge: pf.understanding?.handlesChallenge ?? pf.attention?.staysEngaged ?? null
          },
          parentObservation: pf.parentObservation || ''
        });
      } else {
        setFormData(createEmptyParentFeedback());
      }
      setCurrentStep(0);
      setSaveSuccess(false);
    }
  }, [isOpen, activeProfile]);

  if (!isOpen) return null;

  const totalSteps = 6; // 0 to 5

  const updateField = (section, field, value) => {
    playPop();
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    playPop();
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    playPop();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinalSave = () => {
    playStarTwinkle();
    const finalized = {
      ...formData,
      lastUpdatedAt: new Date().toISOString()
    };
    onSave(finalized);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1300);
  };

  // Helper renderer for option card buttons
  const renderOption = (section, field, optionValue, label) => {
    const isSelected = formData[section]?.[field] === optionValue;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={() => updateField(section, field, optionValue)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: '48px',
          padding: '0.75rem 1rem',
          borderRadius: '14px',
          border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
          background: isSelected ? '#EEF2FF' : '#FFFFFF',
          color: isSelected ? '#3730A3' : '#1E293B',
          fontSize: '0.88rem',
          fontWeight: isSelected ? '700' : '500',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease',
          outline: 'none',
          boxShadow: isSelected ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'none'
        }}
      >
        <span>{label}</span>
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: isSelected ? '2px solid #4F46E5' : '2px solid #CBD5E1',
            background: isSelected ? '#4F46E5' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {isSelected && <Check size={12} color="white" strokeWidth={3} />}
        </div>
      </button>
    );
  };

  const sectionTitles = [
    { title: t('sectionReading'), icon: '📖' },
    { title: t('sectionSounds'), icon: '🔊' },
    { title: t('sectionWriting'), icon: '✍️' },
    { title: t('sectionUnderstanding'), icon: '💡' },
    { title: t('sectionNotes'), icon: '📝' },
    { title: t('sectionReview'), icon: '📋' }
  ];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-obs-title"
      style={{
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '26px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.2)',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.15rem 1.4rem 0.9rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAFAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}
            >
              {sectionTitles[currentStep].icon}
            </div>
            <div>
              <h3 id="parent-obs-title" style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
                {t('parentObsTitle')}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.1rem 0 0' }}>
                {t('parentObsSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Dynamic Visual Progress Bar */}
        <div style={{ height: '4px', width: '100%', background: '#F1F5F9' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
              background: 'linear-gradient(90deg, #4F46E5 0%, #10B981 100%)',
              transition: 'width 0.25s ease'
            }}
          />
        </div>

        {/* Step Indicator Sub-header */}
        <div style={{ padding: '0.65rem 1.4rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {sectionTitles[currentStep].title}
          </span>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94A3B8' }}>
            {t('stepIndicator')} {currentStep + 1} {t('ofText')} {totalSteps}
          </span>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '0.9rem 1.4rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Success Banner */}
          {saveSuccess && (
            <div
              style={{
                padding: '1.1rem',
                borderRadius: '16px',
                background: '#DCFCE7',
                border: '1.5px solid #86EFAC',
                color: '#166534',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Sparkles size={18} color="#16A34A" />
              <span>{t('parentObsSavedSuccess')}</span>
            </div>
          )}

          {/* Section 1: Reading */}
          {currentStep === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.45rem' }}>
                  {t('qReadingComfort')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {renderOption('reading', 'comfort', 'comfortably', t('optReadingComfortable'))}
                  {renderOption('reading', 'comfort', 'slowly', t('optReadingSlowly'))}
                  {renderOption('reading', 'comfort', 'needs_help', t('optReadingHelp'))}
                  {renderOption('reading', 'comfort', 'struggles_independently', t('optReadingStruggle'))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.45rem' }}>
                  {t('qReadingSkipping')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                  {renderOption('reading', 'wordSkipping', 'rarely', t('optRarely'))}
                  {renderOption('reading', 'wordSkipping', 'sometimes', t('optSometimes'))}
                  {renderOption('reading', 'wordSkipping', 'often', t('optOften'))}
                  {renderOption('reading', 'wordSkipping', 'not_sure', t('optNotSure'))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Sounds & Phonics */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.45rem' }}>
                  {t('qSoundsLetter')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {renderOption('sounds', 'letterSounds', 'comfortable', t('optSoundsComfortable'))}
                  {renderOption('sounds', 'letterSounds', 'sometimes_help', t('optSoundsSometimesHelp'))}
                  {renderOption('sounds', 'letterSounds', 'often_help', t('optSoundsOftenHelp'))}
                  {renderOption('sounds', 'letterSounds', 'not_sure', t('optNotSure'))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.45rem' }}>
                  {t('qSoundsBlending')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                  {renderOption('sounds', 'blendingSounds', 'usually', t('optUsually'))}
                  {renderOption('sounds', 'blendingSounds', 'sometimes', t('optSoundsBlendingSometimes'))}
                  {renderOption('sounds', 'blendingSounds', 'needs_help', t('optSoundsBlendingHelp'))}
                  {renderOption('sounds', 'blendingSounds', 'not_sure', t('optNotSure'))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Writing & Letters */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.45rem' }}>
                  {t('qWritingTracing')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {renderOption('writing', 'tracing', 'comfortable', t('optWritingComfortable'))}
                  {renderOption('writing', 'tracing', 'developing', t('optWritingDeveloping'))}
                  {renderOption('writing', 'tracing', 'needs_help', t('optWritingHelp'))}
                  {renderOption('writing', 'tracing', 'not_sure', t('optNotSure'))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.2rem' }}>
                  {t('qWritingConfusion')}
                </label>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.45rem' }}>
                  {t('qWritingConfusionHint')}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                  {renderOption('writing', 'letterShapeConfusion', 'rarely', t('optRarely'))}
                  {renderOption('writing', 'letterShapeConfusion', 'sometimes', t('optSometimes'))}
                  {renderOption('writing', 'letterShapeConfusion', 'often', t('optOften'))}
                  {renderOption('writing', 'letterShapeConfusion', 'not_sure', t('optNotSure'))}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Understanding & Learning */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.45rem' }}>
                  {t('qUnderstandsInstructions')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {renderOption('understanding', 'understandsInstructions', 'usually', t('optUsually'))}
                  {renderOption('understanding', 'understandsInstructions', 'sometimes', t('optSometimesRepetition'))}
                  {renderOption('understanding', 'understandsInstructions', 'needs_help', t('optOftenNeedsHelp'))}
                  {renderOption('understanding', 'understandsInstructions', 'not_sure', t('optNotSure'))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.45rem' }}>
                  {t('qHandlesChallenge')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {renderOption('understanding', 'handlesChallenge', 'keeps_trying', t('optKeepsTrying'))}
                  {renderOption('understanding', 'handlesChallenge', 'needs_encouragement', t('optNeedsEncouragement'))}
                  {renderOption('understanding', 'handlesChallenge', 'needs_help', t('optUsuallyNeedsHelp'))}
                  {renderOption('understanding', 'handlesChallenge', 'not_sure', t('optNotSure'))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Optional Parent Note */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                  {t('parentNoteLabel')}
                </label>
                <span style={{ fontSize: '0.7rem', background: '#F1F5F9', color: '#64748B', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                  {t('optionalLabel')}
                </span>
              </div>

              <textarea
                value={formData.parentObservation || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, parentObservation: e.target.value }))}
                placeholder={t('parentNotePlaceholder')}
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '14px',
                  border: '1.5px solid #CBD5E1',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  lineHeight: '1.45',
                  color: '#1E293B',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0 }}>
                {isBengali
                  ? 'আপনার সন্তান কখন পড়া সহজ বোধ করে বা কোথায় বেশি সাহায্য চায়, তা নিজের ভাষায় লিখতে পারেন।'
                  : 'You can share anything in your own words that helps your child feel comfortable while learning.'}
              </p>
            </div>
          )}

          {/* Section 6: Review Observation */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>📖 {t('sectionReading')}</span>
                  <button onClick={() => setCurrentStep(0)} style={{ border: 'none', background: 'transparent', color: '#4F46E5', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>{t('editObservationBtn')}</button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>
                  <div>• {t('qReadingComfort')}: <strong style={{ color: '#1E293B' }}>{formData.reading?.comfort ? t(`optReading${formData.reading.comfort.charAt(0).toUpperCase() + formData.reading.comfort.slice(1)}`) || formData.reading.comfort : t('notAnswered')}</strong></div>
                  <div>• {t('qReadingSkipping')}: <strong style={{ color: '#1E293B' }}>{formData.reading?.wordSkipping ? t(`opt${formData.reading.wordSkipping.charAt(0).toUpperCase() + formData.reading.wordSkipping.slice(1)}`) || formData.reading.wordSkipping : t('notAnswered')}</strong></div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>🔊 {t('sectionSounds')}</span>
                  <button onClick={() => setCurrentStep(1)} style={{ border: 'none', background: 'transparent', color: '#4F46E5', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>{t('editObservationBtn')}</button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>
                  <div>• {t('qSoundsLetter')}: <strong style={{ color: '#1E293B' }}>{formData.sounds?.letterSounds ? formData.sounds.letterSounds : t('notAnswered')}</strong></div>
                  <div>• {t('qSoundsBlending')}: <strong style={{ color: '#1E293B' }}>{formData.sounds?.blendingSounds ? formData.sounds.blendingSounds : t('notAnswered')}</strong></div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>✍️ {t('sectionWriting')}</span>
                  <button onClick={() => setCurrentStep(2)} style={{ border: 'none', background: 'transparent', color: '#4F46E5', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>{t('editObservationBtn')}</button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>
                  <div>• {t('qWritingTracing')}: <strong style={{ color: '#1E293B' }}>{formData.writing?.tracing ? formData.writing.tracing : t('notAnswered')}</strong></div>
                  <div>• {t('qWritingConfusion')}: <strong style={{ color: '#1E293B' }}>{formData.writing?.letterShapeConfusion ? formData.writing.letterShapeConfusion : t('notAnswered')}</strong></div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>💡 {t('sectionUnderstanding')}</span>
                  <button onClick={() => setCurrentStep(3)} style={{ border: 'none', background: 'transparent', color: '#4F46E5', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>{t('editObservationBtn')}</button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>
                  <div>• {t('qUnderstandsInstructions')}: <strong style={{ color: '#1E293B' }}>{formData.understanding?.understandsInstructions ? formData.understanding.understandsInstructions : t('notAnswered')}</strong></div>
                  <div>• {t('qHandlesChallenge')}: <strong style={{ color: '#1E293B' }}>{formData.understanding?.handlesChallenge ? formData.understanding.handlesChallenge : t('notAnswered')}</strong></div>
                </div>
              </div>

              {formData.parentObservation && (
                <div style={{ background: '#EEF2FF', padding: '0.75rem 0.9rem', borderRadius: '14px', border: '1px solid #C7D2FE' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3730A3' }}>📝 {t('sectionNotes')}:</span>
                  <p style={{ fontSize: '0.78rem', color: '#4338CA', margin: '0.2rem 0 0', fontStyle: 'italic' }}>
                    "{formData.parentObservation.trim()}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ethical Non-Diagnostic Disclaimer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              background: '#F8FAFC',
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginTop: 'auto'
            }}
          >
            <Shield size={15} color="#64748B" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.35 }}>
              {t('parentObsDisclaimer')}
            </span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '0.85rem 1.4rem',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            background: '#FAFAFC'
          }}
        >
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              disabled={saveSuccess}
              className="btn-secondary btn-pill"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            >
              <ArrowLeft size={15} />
              <span>{t('prevBtn')}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                padding: '0.5rem 1.3rem',
                borderRadius: '9999px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              <span>{t('nextBtn')}</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleFinalSave}
              disabled={saveSuccess}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '0.6rem 1.5rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Check size={16} />
              <span>{t('saveObservationBtn')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
