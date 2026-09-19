import React from 'react';
import { ArrowLeft, Award, CheckCircle, AlertTriangle, Printer, Sparkles, BookOpen, Volume2, Shield } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function CompanionDashboard() {
  const { activeProfile, setCurrentView, activeLanguage, t } = useProfile();
  const { playPop } = useAudio();

  const handleBack = () => {
    playPop();
    setCurrentView('landing');
  };

  const handlePrint = () => {
    playPop();
    window.print();
  };

  const profile = activeProfile;

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
          <span>{t('backToMain')}</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handlePrint}
            disabled={!isCompleted}
            className="btn-secondary btn-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: '#CBD5E1',
              opacity: isCompleted ? 1 : 0.5,
              cursor: isCompleted ? 'pointer' : 'not-allowed'
            }}
          >
            <Printer size={16} />
            <span>{t('printReportPdf')}</span>
          </button>
        </div>
      </div>

      {/* Main Student Assessment Card */}
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
                {t('screeningCompletedLabel')} <strong>{isCompleted ? (metrics.dateCompleted || 'Completed') : t('notYetCompleted')}</strong> • {t('language')}: <strong>{activeLanguage.name}</strong>
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
          /* Empty State: Prompt to complete screening */
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
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
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
                  {t('reversalSummary')} {metrics.confusionsDetected ? metrics.confusionsDetected.join(', ') : 'None'}
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
                    {isElevated ? 'Track B: Targeted Multisensory Support Plan' : 'Track A: Foundational Literacy & Speed Mastery'}
                  </h4>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: isElevated ? '#FEF3C7' : '#DCFCE7', color: isElevated ? '#B45309' : '#166534' }}>
                  {t('nepAligned')}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: isElevated ? '#78350F' : '#15803D', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                {profile.recommendation || (isElevated
                  ? (activeLanguage?.id === 'bengali'
                      ? 'নির্দিষ্ট স্পর্শভিত্তিক বর্ণাভ্যাস, উচ্চ-বৈসাদৃশ্য ডিসলেক্সিয়া-বান্ধব ফন্ট ব্যবহারের মাধ্যমে কাছাকাছি বর্ণের স্থানিক বৈষম্য দূর করার পরামর্শ দেওয়া হচ্ছে।'
                      : 'Targeted tactile letter tracing, high-contrast visual tint, and Lexend dyslexia-friendly font recommended to strengthen spatial letter discrimination.')
                  : (activeLanguage?.id === 'bengali'
                      ? 'ধ্বনিগত ও দৃষ্টিগত অবস্থান চেনার ক্ষেত্রে দৃঢ় দক্ষতা পরিলক্ষিত হয়েছে। দ্রুত পঠন চ্যালেঞ্জ ও উন্নত গল্প পড়ার জন্য প্রস্তুত।'
                      : 'Demonstrates solid phonological and visual orientation mastery. Ready for speed reading challenges and advanced story reading.'))}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '0.78rem' }}>
                <div style={{ background: 'white', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#1E293B' }}>{activeLanguage?.id === 'bengali' ? 'শ্রেণীকক্ষের কৌশল:' : 'Classroom Strategy:'}</strong>
                  <div style={{ color: '#64748B', marginTop: '0.2rem' }}>
                    {isElevated
                      ? (activeLanguage?.id === 'bengali' ? 'মাল্টি-সেন্সরি স্যান্ড ট্রে ও রঙের সহায়তায় বর্ণ পার্থক্য অভ্যাস করান।' : 'Use multi-sensory sand tray & color-coded visual anchors.')
                      : (activeLanguage?.id === 'bengali' ? 'স্বতন্ত্র গল্প পাঠ ও সাবলীল শব্দ পঠন উৎসাহিত করুন।' : 'Encourage independent story reading and timed sight-word fluency.')}
                  </div>
                </div>
                <div style={{ background: 'white', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#1E293B' }}>{activeLanguage?.id === 'bengali' ? 'বাড়ির কার্যক্রম:' : 'Home Activity:'}</strong>
                  <div style={{ color: '#64748B', marginTop: '0.2rem' }}>
                    {isElevated
                      ? (activeLanguage?.id === 'bengali' ? 'প্রতিদিন ১০ মিনিট ম্যাজিক বর্ণ ট্রেসিং ও ছন্দের খেলা খেলুন।' : '10 mins daily with Magic Letter Tracing & Rhyme Beats.')
                      : (activeLanguage?.id === 'bengali' ? 'প্রতিদিন ১৫ মিনিট ওয়ার্ড স্ন্যাপার স্পিড চ্যালেঞ্জ খেলুন।' : '15 mins daily with Word Snapper speed challenges.')}
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
            <strong>Note for Educators & Parents:</strong> This screening tool is designed for early risk identification under NEP 2020 / NIPUN Bharat. It is non-clinical and provides low-barrier triage to empower educators and families with timely insights.
          </p>
        </div>
      </div>
    </div>
  );
}
