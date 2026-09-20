import React, { useState } from 'react';
import { X, Flame, CheckCircle, Calendar, Sparkles, Award, ArrowRight, Clock } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import {
  formatDateKey,
  getRecentCalendarDays,
  getMonthAttendanceGrid,
  calculateStreakStats,
  DAY_NAMES
} from '../../utils/streakUtils';

export default function StreakCalendarModal({ isOpen, onClose }) {
  const { activeProfile, activeLanguage, setCurrentView, t } = useProfile();
  const { playPop } = useAudio();
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'

  if (!isOpen || !activeProfile) return null;

  const langId = activeLanguage?.id || 'english';
  const isBengali = langId === 'bengali';
  const isHindi = langId === 'hindi';

  const attendanceHistory = activeProfile.attendanceHistory || [];
  const stats = calculateStreakStats(attendanceHistory);
  const currentStreak = activeProfile.streak || stats.currentStreak || 1;
  const todayKey = formatDateKey();
  const recentDays = getRecentCalendarDays(7, langId);
  const monthData = getMonthAttendanceGrid(attendanceHistory, langId);
  const attendedSet = new Set(attendanceHistory);

  const handleStartPractice = () => {
    playPop();
    onClose();
    // Launch child's recommended activity or games hub
    const target = activeProfile?.learningProfile?.recommendedActivityId || 'games';
    setCurrentView(target);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
          borderRadius: '28px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.35), 0 0 0 1px rgba(251, 191, 36, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)',
            color: 'white',
            padding: '1.5rem 1.5rem 1.75rem',
            position: 'relative',
            textAlign: 'center'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.25)',
              border: 'none',
              borderRadius: '9999px',
              width: '34px',
              height: '34px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>

          {/* Flame Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.22)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
              margin: '0 auto 0.75rem',
              border: '2px solid rgba(255, 255, 255, 0.4)'
            }}
          >
            <Flame size={40} fill="#FEF08A" color="#FEF08A" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {currentStreak} {isHindi ? 'दिनों का पठन सिलसिला' : (isBengali ? 'দিনের ধারাবাহিকতা' : 'Day Learning Streak')} 🔥
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#FEF3C7', fontWeight: 600 }}>
            {stats.attendedToday
              ? (isHindi ? '🎉 आपने आज अभ्यास पूरा कर लिया है!' : (isBengali ? '🎉 তুমি আজ পড়াশোনা সম্পন্ন করেছো!' : "🎉 You've practiced today! Streak is burning bright!"))
              : (isHindi ? '⏳ आज का अभ्यास करें और सिलसिला जारी रखें!' : (isBengali ? '⏳ আজকের অনুশীলন করো এবং ধারা বজায় রাখো!' : "⏳ Practice today to keep your streak burning!"))}
          </p>
        </div>

        {/* View Toggle Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0.85rem 1.25rem 0',
            gap: '0.5rem'
          }}
        >
          <button
            onClick={() => setViewMode('week')}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: viewMode === 'week' ? '#EA580C' : '#F1F5F9',
              color: viewMode === 'week' ? 'white' : '#64748B',
              transition: 'all 0.2s ease'
            }}
          >
            {isHindi ? 'पिछले 7 दिन' : (isBengali ? 'গত ৭ দিন' : 'Past 7 Days')}
          </button>
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: viewMode === 'month' ? '#EA580C' : '#F1F5F9',
              color: viewMode === 'month' ? 'white' : '#64748B',
              transition: 'all 0.2s ease'
            }}
          >
            {isHindi ? 'मासिक कैलेंडर' : (isBengali ? 'মাসিক ক্যালেন্ডার' : 'Month Calendar')}
          </button>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {viewMode === 'week' ? (
            /* 7-Day Visual Row */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem' }}>
                {recentDays.map((d) => {
                  const isAttended = attendedSet.has(d.dateKey);
                  return (
                    <div
                      key={d.dateKey}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.65rem 0.25rem',
                        borderRadius: '16px',
                        background: isAttended
                          ? '#DCFCE7'
                          : (d.isToday ? '#FEF3C7' : '#F8FAFC'),
                        border: isAttended
                          ? '2px solid #86EFAC'
                          : (d.isToday ? '2px solid #F59E0B' : '1px solid #E2E8F0'),
                        boxShadow: isAttended ? '0 4px 10px rgba(34, 197, 94, 0.15)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isAttended ? '#166534' : '#64748B' }}>
                        {d.dayLabel}
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1E293B' }}>
                        {d.dayNumber}
                      </span>
                      <div style={{ height: '22px', display: 'flex', alignItems: 'center' }}>
                        {isAttended ? (
                          <span style={{ fontSize: '1rem' }}>🔥</span>
                        ) : d.isToday ? (
                          <span style={{ fontSize: '0.85rem' }}>⏳</span>
                        ) : (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E1' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attendance Status Legend */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.25rem',
                  fontSize: '0.75rem',
                  color: '#64748B',
                  marginTop: '0.85rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🔥 <strong>{isHindi ? 'अभ्यास किया' : (isBengali ? 'উপস্থিত' : 'Attended')}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ⏳ <strong>{isHindi ? 'आज का बाकी' : (isBengali ? 'আজ বাকি' : 'Today Pending')}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ⚪ <strong>{isHindi ? 'छूट गया' : (isBengali ? 'মিস হয়েছে' : 'Rest Day')}</strong>
                </span>
              </div>
            </div>
          ) : (
            /* Month Calendar Grid View */
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem', textAlign: 'center' }}>
                {monthData.monthName}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  textAlign: 'center'
                }}
              >
                {(DAY_NAMES[langId] || DAY_NAMES.english).map((label, idx) => (
                  <div key={idx} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', padding: '2px 0' }}>
                    {label}
                  </div>
                ))}
                {monthData.days.map((item, idx) => {
                  if (item.isBlank) {
                    return <div key={item.id} />;
                  }
                  return (
                    <div
                      key={item.dateKey}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        background: item.attended
                          ? '#DCFCE7'
                          : (item.isToday ? '#FEF3C7' : 'transparent'),
                        color: item.attended ? '#166534' : (item.isToday ? '#B45309' : '#475569'),
                        border: item.isToday ? '1.5px solid #F59E0B' : '1px solid transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1px'
                      }}
                    >
                      <span>{item.day}</span>
                      {item.attended && <span style={{ fontSize: '0.65rem' }}>🔥</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3 Quick Stats Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.6rem',
              background: '#F8FAFC',
              padding: '0.85rem',
              borderRadius: '20px',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#EA580C' }}>
                {currentStreak}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
                {isHindi ? 'वर्तमान सिलसिला' : (isBengali ? 'বর্তমান ধারা' : 'Current Streak')}
              </div>
            </div>

            <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669' }}>
                {stats.totalDaysAttended || currentStreak}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
                {isHindi ? 'कुल दिन' : (isBengali ? 'মোট দিন' : 'Total Days')}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4F46E5' }}>
                {stats.bestStreak || currentStreak}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
                {isHindi ? 'सर्वश्रेष्ठ रिकॉर्ड' : (isBengali ? 'সেরা রেকর্ড' : 'Best Streak')}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartPractice}
            style={{
              width: '100%',
              padding: '0.9rem 1.25rem',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 16px rgba(249, 115, 22, 0.25)'
            }}
          >
            <span>{isHindi ? 'सिलसिला जारी रखने के लिए खेलें' : (isBengali ? 'ধারা বজায় রাখতে খেলা শুরু করো' : 'Keep Your Streak Burning!')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
