import React from 'react';
import { ArrowLeft, Play, Sparkles, Star, Trophy, Puzzle, Eye } from 'lucide-react';
import MascotMitra from '../components/common/MascotMitra';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

export default function GamesHub({ onSelectGame }) {
  const { activeProfile, setCurrentView, activeLanguage } = useProfile();
  const { playPop, playStarTwinkle } = useAudio();

  const isBengali = activeLanguage?.id === 'bengali';

  const handleLaunchGame = (gameId) => {
    playStarTwinkle();
    if (onSelectGame) {
      onSelectGame(gameId);
    } else {
      setCurrentView(gameId);
    }
  };

  return (
    <div className="game-viewport">
      {/* Top Header Navigation */}
      <div className="game-top-bar">
        <button
          onClick={() => {
            playPop();
            setCurrentView('landing');
          }}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>{isBengali ? 'মূল পাতা' : 'Home'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="game-stat-pill" style={{ color: '#B45309', background: '#FEF3C7', borderColor: '#FDE68A' }}>
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
            <span>{activeProfile?.stars || 0} {isBengali ? 'স্টার' : 'Stars'}</span>
          </div>
          {activeProfile && (
            <div className="game-stat-pill" style={{ color: '#4338CA', background: '#EEF2FF' }}>
              <span>{activeProfile.avatarEmoji || '🦁'} {activeProfile.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Hub Container */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 1.75rem',
          borderRadius: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
          background: 'white'
        }}
      >
        {/* Mitra Companion Welcome */}
        <MascotMitra
          state="celebrating"
          speechText={
            isBengali
              ? (activeProfile ? `গেমস জোনে স্বাগতম, ${activeProfile.name}! যেকোনো একটি মজার খেলা বেছে নাও!` : 'গেমস জোনে স্বাগতম! মজার মজার বর্ণ নিয়ে খেলতে শুরু করো!')
              : (activeProfile ? `Welcome to Remediation Games, ${activeProfile.name}! Pick a fun quest to play!` : 'Welcome to the Games Zone! Choose a game to train your eyes and ears!')
          }
          size="md"
          showBubble={true}
        />

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.35rem', color: '#1E293B' }}>
            {isBengali ? '🎮 বর্ণ ও ধ্বনি শেখার গেমস হাব' : '🎮 Remediation & Phonics Fun Hub'}
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            {isBengali
              ? 'মজার খেলার মাধ্যমে বিভ্রান্তিকর বর্ণ (ব/র/ক/ধ) চেনা ও সঠিক শব্দ গঠনের অভ্যাস করো।'
              : 'Multisensory games designed to master tricky mirror letters (b/d/p/q) and build strong reading confidence.'}
          </p>
        </div>

        {/* Game Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '960px'
          }}
        >
          {/* Game 1: Word Snapper */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
              borderRadius: '22px',
              border: '2px solid #E0E7FF',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FF 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onClick={() => handleLaunchGame('word-snapper')}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem', background: '#EEF2FF', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🧩
                </div>
                <span className="badge badge-indigo">{isBengali ? 'শব্দ গঠন' : 'Phonics Builder'}</span>
              </div>

              <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem', color: '#4338CA' }}>
                {isBengali ? 'শব্দ সাজাও (Word Snapper)' : 'Word Snapper'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                {isBengali
                  ? 'বর্ণগুলোকে নির্দিষ্ট স্থানে সাজাও, সঠিক উচ্চারণ শোনো এবং বর্ণমালা রপ্ত করো!'
                  : 'Snap letter tiles into slots, hear real phoneme sounds, and master tricky b / d / p / q words!'}
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.7rem' }}
            >
              <Play size={18} />
              <span>{isBengali ? 'শব্দ খেলা শুরু করো' : 'Play Word Snapper'}</span>
            </button>
          </div>

          {/* Game 2: Letter Hunter */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
              borderRadius: '22px',
              border: '2px solid #FEF3C7',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onClick={() => handleLaunchGame('letter-hunter')}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem', background: '#FEF3C7', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🎯
                </div>
                <span className="badge badge-amber">{isBengali ? 'দৃষ্টিগত বৈষম্য' : 'Visual Discrimination'}</span>
              </div>

              <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem', color: '#B45309' }}>
                {isBengali ? 'বর্ণ শিকারী (Letter Hunter)' : 'Letter Hunter'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                {isBengali
                  ? 'অন্যান্য বিভ্রান্তিকর বর্ণের মধ্য থেকে নির্দিষ্ট লক্ষ্য বর্ণটি দ্রুত খুঁজে বের করো!'
                  : 'Eagle-eye grid quest! Find target letters hidden among tricky mirror letters with combo streaks!'}
              </p>
            </div>

            <button
              className="btn btn-amber"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.7rem' }}
            >
              <Play size={18} />
              <span>{isBengali ? 'বর্ণ শিকার শুরু করো' : 'Play Letter Hunter'}</span>
            </button>
          </div>

          {/* Game 3: Spelling Clinic */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
              borderRadius: '22px',
              border: '2px solid #E9D5FF',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onClick={() => handleLaunchGame('spelling-clinic')}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem', background: '#F3E8FF', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🧠
                </div>
                <span className="badge badge-purple">{isBengali ? 'বানান ক্লিনিক' : 'Look-Cover-Write'}</span>
              </div>

              <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem', color: '#7E22CE' }}>
                {isBengali ? 'বানান ক্লিনিক (Spelling Clinic)' : 'Spelling Clinic'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                {isBengali
                  ? 'স্মৃতিসহায়িকা এবং ৪-লাইনের হস্তলিপি ক্যানভাসের মাধ্যমে জটিল বানানের ভুল দূর করো।'
                  : 'Master tricky words with memorable mnemonic hooks, Look-Cover-Write training, and a 4-line handwriting canvas!'}
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.7rem', background: '#9333EA', borderColor: '#9333EA' }}
            >
              <Play size={18} />
              <span>{isBengali ? 'ক্লিনিক শুরু করো' : 'Enter Spelling Clinic'}</span>
            </button>
          </div>

          {/* Game 4: Spelling Trap Challenge */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
              borderRadius: '22px',
              border: '2px solid #FECDD3',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onClick={() => handleLaunchGame('spelling-traps')}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem', background: '#FFE4E6', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ⚡
                </div>
                <span className="badge badge-rose">{isBengali ? 'বর্ণ-বদল ফাঁদ' : 'Transposition Trap'}</span>
              </div>

              <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem', color: '#BE123C' }}>
                {isBengali ? 'বানান ফাঁদ চ্যালেঞ্জ (Spelling Traps)' : 'Spelling Trap Challenge'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                {isBengali
                  ? 'FROM বনাম FORM এর মতো অক্ষর উল্টে যাওয়া ফাঁদগুলো চটজলদি চিহ্নিত করো।'
                  : 'Spot sneaky letter-swap traps like FROM vs FORM, PLAY vs PALY, and GIRL vs GRIL in fun sentence quests!'}
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.7rem', background: '#E11D48', borderColor: '#E11D48' }}
            >
              <Play size={18} />
              <span>{isBengali ? 'ফাঁদ চ্যালেঞ্জ শুরু' : 'Play Trap Challenge'}</span>
            </button>
          </div>

          {/* Game 5: ABC Fill-In */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
              borderRadius: '22px',
              border: '2px solid #A7F3D0',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onClick={() => handleLaunchGame('abc-fill-in')}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem', background: '#D1FAE5', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🚂
                </div>
                <span className="badge badge-emerald">{isBengali ? 'বর্ণমালা ট্রেন' : 'Alphabet Train'}</span>
              </div>

              <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem', color: '#047857' }}>
                {isBengali ? 'এবিসি পূরণ করো (ABC Fill-In)' : 'ABC Fill-In'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                {isBengali
                  ? 'ট্রেনের হারানো বগিগুলোতে সঠিক বর্ণ বসাও এবং বিশেষ ভিজ্যুয়াল কিবোর্ডে অনুশীলন করো।'
                  : 'Restore missing alphabet train wagons using the dyslexia-friendly keyboard with color-coded vowels and mirror guides!'}
              </p>
            </div>

            <button
              className="btn btn-emerald"
              style={{ width: '100%', borderRadius: '9999px', padding: '0.7rem' }}
            >
              <Play size={18} />
              <span>{isBengali ? 'ট্রেন খেলা শুরু করো' : 'Play ABC Fill-In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
