import React from 'react';
import { ArrowLeft, Award, CheckCircle, AlertTriangle, Printer, Sparkles, BookOpen, Volume2, Shield } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function CompanionDashboard() {
  const { activeProfile, setCurrentView, activeLanguage } = useProfile();
  const { playPop } = useAudio();

  const handleBack = () => {
    playPop();
    setCurrentView('landing');
  };

  const handlePrint = () => {
    playPop();
    window.print();
  };

  const profile = activeProfile || {
    name: 'आरव (Aarav)',
    gradeLabel: 'कक्षा २ (Class 2)',
    avatarEmoji: '🦁',
    riskLevel: 'elevated',
    riskScore: 78,
    screeningMetrics: {
      reversalIndex: 82,
      fluencyHesitation: 65,
      phonologicalScore: 58,
      tracingAccuracy: 62,
      confusionsDetected: ['ब / भ (Loop inversion)', 'द / ध (Aspiration stroke)', '३ / ६ (Mirroring)'],
      wpm: 24,
      dateCompleted: 'आज (Today)'
    },
    recommendation: 'Targeted tactile tracing for ब/भ and multisensory rhyme blending recommended. Consultation with school special educator advised.'
  };

  const isElevated = profile.riskLevel === 'elevated';
  const metrics = profile.screeningMetrics || {
    reversalIndex: 75,
    fluencyHesitation: 60,
    phonologicalScore: 50,
    tracingAccuracy: 65,
    confusionsDetected: ['ब / भ'],
    wpm: 28,
    dateCompleted: 'आज'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          onClick={handleBack}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>मुख्य पृष्ठ (Back to Main)</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handlePrint}
            className="btn-secondary btn-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#CBD5E1' }}
          >
            <Printer size={16} />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Student Assessment Card */}
      <div className="glass-card" style={{ padding: '2rem 1.75rem', background: 'white', borderRadius: '24px' }}>
        {/* Header with Avatar & Risk Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem', width: '70px', height: '70px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #F59E0B' }}>
              {profile.avatarEmoji || '🦁'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{profile.name}</h2>
                <span className="badge badge-indigo">{profile.gradeLabel || 'Grade 2'}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Screening Completed: <strong>{metrics.dateCompleted}</strong> • Language: <strong>{activeLanguage.name}</strong>
              </p>
            </div>
          </div>

          {/* Risk Band Indicator */}
          <div>
            {isElevated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEE2E2', padding: '0.6rem 1rem', borderRadius: '9999px', border: '1.5px solid #EF4444' }}>
                <AlertTriangle size={20} color="#DC2626" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#991B1B' }}>
                    Elevated Risk Observation
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#B91C1C' }}>
                    Early Multisensory Support Recommended
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#D1FAE5', padding: '0.6rem 1rem', borderRadius: '9999px', border: '1.5px solid #10B981' }}>
                <CheckCircle size={20} color="#059669" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#065F46' }}>
                    Typical Age Progression
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                    Milestones within standard range
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4-Axis Metric Bars */}
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
          📊 4-Axis Developmental Screening Vector
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Reversal Index */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Letter Reversal / Mirroring</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: metrics.reversalIndex > 60 ? '#DC2626' : '#059669' }}>
                {metrics.reversalIndex}%
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${metrics.reversalIndex}%`, background: metrics.reversalIndex > 60 ? '#EF4444' : '#10B981', borderRadius: '9999px' }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
              Confusions: {metrics.confusionsDetected ? metrics.confusionsDetected.join(', ') : 'None'}
            </p>
          </div>

          {/* Reading Fluency */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Reading Speed & Fluency</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4F46E5' }}>
                {metrics.wpm} WPM
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(metrics.wpm * 1.5, 100)}%`, background: '#4F46E5', borderRadius: '9999px' }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
              Age Target: 45+ WPM (Hesitation pauses detected)
            </p>
          </div>

          {/* Phonological Awareness */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Phonological & Rhyme Score</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: metrics.phonologicalScore < 65 ? '#D97706' : '#059669' }}>
                {metrics.phonologicalScore}%
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${metrics.phonologicalScore}%`, background: metrics.phonologicalScore < 65 ? '#F59E0B' : '#10B981', borderRadius: '9999px' }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
              Syllable beat rhythm & phoneme segmentation
            </p>
          </div>

          {/* Graphomotor Tracing */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Fine Motor & Stroke Accuracy</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10B981' }}>
                {metrics.tracingAccuracy}%
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${metrics.tracingAccuracy}%`, background: '#10B981', borderRadius: '9999px' }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
              Canvas touch-point alignment & stroke direction
            </p>
          </div>
        </div>

        {/* Actionable Guidance & Recommendations */}
        <div style={{ background: '#EEF2FF', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #C7D2FE', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <BookOpen size={18} color="#4338CA" />
            <h4 style={{ fontSize: '1rem', color: '#4338CA', margin: 0 }}>
              सुझाव व अभ्यास मार्गदर्शिका (Actionable Teacher & Home Guidance)
            </h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.5, margin: 0 }}>
            {profile.recommendation}
          </p>
        </div>

        {/* Ethical Non-Diagnostic Notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <Shield size={16} color="#64748B" />
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
            <strong>Note for Educators & Parents:</strong> This screening tool is designed for early risk identification under NEP 2020 / NIPUN Bharat. It is non-clinical and must be followed up with formal pedagogical assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
