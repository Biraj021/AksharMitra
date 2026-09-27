import React, { useState } from 'react';
import { Play, Sparkles, Star, Volume2, ArrowRight, Map, Grid, CheckCircle, Trophy, Compass, Flame, Award, Lightbulb, Heart } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';
import { getChildRecommendation } from '@ai/adaptiveLearningStrategy';

// ── 3 Gamified Adventure Islands / Modules for Children ───────────────────────
export const ADVENTURE_ISLANDS = [
  {
    id: 'island-letters',
    islandNumber: 1,
    themeColor: '#6366F1',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
    cardBg: '#F5F3FF',
    cardBorder: '#DDD6FE',
    badgeBg: '#EEF2FF',
    badgeBorder: '#C7D2FE',
    badgeColor: '#4338CA',
    icon: '🏝️',
    trophy: '👑',
    nameEn: 'Letter Island',
    nameBn: 'বর্ণ দ্বীপ',
    nameHi: 'अक्षर द्वीप',
    subtitleEn: 'Spot & trace magical letters without mirror confusion!',
    subtitleBn: 'লুকানো বর্ণ খুঁজে বের করো এবং নিখুঁতভাবে আঁকো!',
    subtitleHi: 'छुपे हुए अक्षर पहचानें और सुंदर अक्षर बनाएं!',
    rewardTitleEn: 'Letter Explorer Crown',
    rewardTitleBn: 'বর্ণ অভিযাত্রী মুকুট',
    rewardTitleHi: 'अक्षर खोजी मुकुट',
    missions: [
      {
        id: 'letter-hunter',
        icon: '🦅',
        missionNumber: '1.1',
        titleEn: 'Eagle Eye Hunt',
        titleBn: 'ঈগল চোখ বর্ণ খোঁজা',
        titleHi: 'बाज की नज़र अक्षर खोज',
        descEn: 'Spot hidden target letters among tricky mirror letters!',
        descBn: 'লুকানো বর্ণ খুঁজে বের করো এবং ব বনাম র এর ফাঁদ এড়াও!',
        descHi: 'छुपे हुए अक्षर पहचानें और ब vs भ का भेद खोजें!',
        tagEn: 'Visual Focus',
        tagBn: 'দৃষ্টিগত সন্ধান',
        tagHi: 'दृश्य खोज',
        starsReward: 10
      },
      {
        id: 'letter-tracing',
        icon: '✍️',
        missionNumber: '1.2',
        titleEn: 'Magic Wand Tracing',
        titleBn: 'জাদুকরী বর্ণ আঁকা',
        titleHi: 'जादुई अक्षर आलेखन',
        descEn: 'Trace letters with glowing stars and magnetic guide dots!',
        descBn: 'তারার পথ ধরে আঙুল দিয়ে সুন্দর করে বর্ণ আঁকো!',
        descHi: 'चमकते सितारों के साथ सही दिशा में अक्षर बनाएं!',
        tagEn: 'Handwriting',
        tagBn: 'হস্তলিপি',
        tagHi: 'सुलेख',
        starsReward: 15
      }
    ]
  },
  {
    id: 'island-sounds',
    islandNumber: 2,
    themeColor: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    cardBg: '#ECFDF5',
    cardBorder: '#A7F3D0',
    badgeBg: '#D1FAE5',
    badgeBorder: '#6EE7B7',
    badgeColor: '#065F46',
    icon: '🎵',
    trophy: '🏅',
    nameEn: 'Sound Safari',
    nameBn: 'সুরের সাফারি',
    nameHi: 'ध्वनि सफारी',
    subtitleEn: 'Listen closely and connect letter sounds into words!',
    subtitleBn: 'মন দিয়ে শব্দ শোনো এবং ট্রেনের বগি জুড়ে বর্ণ মেলাও!',
    subtitleHi: 'आवाजें ध्यान से सुनें और अक्षरों को शब्दों में जोड़ें!',
    rewardTitleEn: 'Sound Safari Medal',
    rewardTitleBn: 'সুর সাধক পদক',
    rewardTitleHi: 'ध्वनि साधक पदक',
    missions: [
      {
        id: 'abc-fill-in',
        icon: '🚂',
        missionNumber: '2.1',
        titleEn: 'Alphabet Train',
        titleBn: 'বর্ণমালা ট্রেন এক্সপ্রেস',
        titleHi: 'वर्णमाला ट्रेन एक्सप्रेस',
        descEn: 'Connect the missing alphabet wagons on the track!',
        descBn: 'ট্রেনের লাইনে নিখোঁজ বগিগুলো সঠিক বর্ণ দিয়ে জোড়ো!',
        descHi: 'ट्रेन की पटरी पर छूटे हुए अक्षरों को सही क्रम में जोड़ें!',
        tagEn: 'Alphabet Flow',
        tagBn: 'বর্ণের ধারাবাহিকতা',
        tagHi: 'वर्ण क्रम',
        starsReward: 10
      },
      {
        id: 'word-snapper',
        icon: '🧩',
        missionNumber: '2.2',
        titleEn: 'Word Builder Snap',
        titleBn: 'শব্দ জোড়া লাগানো',
        titleHi: 'शब्द निर्माण पहेली',
        descEn: 'Snap letters together and hear them blend into words!',
        descBn: 'বর্ণগুলো একসাথে জুড়ে সুন্দর নতুন শব্দ তৈরি করো!',
        descHi: 'अक्षरों को आपस में जोड़ें और उनकी जादुई ध्वनि सुनें!',
        tagEn: 'Phonics Blending',
        tagBn: 'ধ্বনি সম্মেলন',
        tagHi: 'ध्वनि मिलान',
        starsReward: 15
      }
    ]
  },
  {
    id: 'island-words',
    islandNumber: 3,
    themeColor: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    cardBg: '#FFFBEB',
    cardBorder: '#FDE68A',
    badgeBg: '#FEF3C7',
    badgeBorder: '#FCD34D',
    badgeColor: '#92400E',
    icon: '🏰',
    trophy: '🏆',
    nameEn: 'Word Castle',
    nameBn: 'শব্দ দুর্গ',
    nameHi: 'शब्द महल',
    subtitleEn: 'Catch spelling traps and master tricky sight words!',
    subtitleBn: 'বানানের ফাঁদ ধরো এবং কঠিন শব্দের রহস্য শেখো!',
    subtitleHi: 'वर्तनी के जालों को पकड़ें और शब्दों के जादूगर बनें!',
    rewardTitleEn: 'Word Wizard Trophy',
    rewardTitleBn: 'শব্দ জাদুকর ট্রফি',
    rewardTitleHi: 'शब्द जादूगर ट्रॉफी',
    missions: [
      {
        id: 'spelling-traps',
        icon: '⚡',
        missionNumber: '3.1',
        titleEn: 'Trap Buster',
        titleBn: 'বানানের ফাঁদ ধরা',
        titleHi: 'वर्तनी जाल शिकारी',
        descEn: 'Catch sneaky letter swaps like FROM and FORM!',
        descBn: 'জল বনাম লজ এর মতো চালাক ফাঁদ ধরে ফেলো!',
        descHi: 'जल और लज जैसे वर्ण-विपर्यय जालों को पकड़ें!',
        tagEn: 'Trap Spotter',
        tagBn: 'ফাঁদ শনাক্তকরণ',
        tagHi: 'जाल पहचान',
        starsReward: 15
      },
      {
        id: 'spelling-clinic',
        icon: '🧠',
        missionNumber: '3.2',
        titleEn: 'Memory Spell Wizard',
        titleBn: 'স্মৃতি বানান জাদুঘর',
        titleHi: 'स्मृति वर्तनी जादूगर',
        descEn: 'Look, cover, write, and align tricky words on 4 lines!',
        descBn: 'দেখো, ঢাকো, লেখো এবং ৪ লাইনের স্কেলে নিখুঁত করো!',
        descHi: 'देखें, ढकें, लिखें और 4 लाइनों में सटीक बनाएं!',
        tagEn: 'Memory & Lines',
        tagBn: 'স্মৃতি ও রেখা',
        tagHi: 'स्मृति व सुलेख',
        starsReward: 20
      }
    ]
  }
];

export default function GamesHub({ onSelectGame }) {
  const { activeProfile, setCurrentView, activeLanguage, t } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const [viewMode, setViewMode] = useState('map'); // 'map' | 'arcade'
  const recommendedActivityId = activeProfile?.learningProfile?.recommendedActivityId;
  const recommendation = getChildRecommendation(activeProfile, activeLanguage?.id);

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const studentName = activeProfile?.name || (isHindi ? 'नन्हे खोजी' : (isBengali ? 'ছোট অভিযাত্রী' : 'Little Explorer'));
  const avatarEmoji = getAvatarEmoji(activeProfile?.avatar);

  const handleLaunch = (gameId) => {
    playStarTwinkle();
    if (onSelectGame) {
      onSelectGame(gameId);
    } else {
      setCurrentView(gameId);
    }
  };

  const speakIslandPrompt = (island) => {
    playPop();
    const name = isHindi ? island.nameHi : (isBengali ? island.nameBn : island.nameEn);
    const desc = isHindi ? island.subtitleHi : (isBengali ? island.subtitleBn : island.subtitleEn);
    speakText(`${name}! ${desc}`, speechLang);
  };

  const speakMitraGreeting = () => {
    playPop();
    const greetingText = isHindi
      ? `नमस्ते ${studentName}! आज हम कौन सा जादुई खेल खेलेंगे? नीचे एक द्वीप चुनें!`
      : isBengali
      ? `হ্যালো ${studentName}! আজ আমরা কোন জাদুকরী খেলা খেলব? নিচের একটি দ্বীপ বেছে নাও!`
      : `Hello ${studentName}! Which magical island quest shall we explore today?`;
    speakText(greetingText, speechLang);
  };

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.4rem',
        padding: '0.5rem 0.75rem 3.5rem'
      }}
    >
      {/* 1. Mitra Animated Mascot Greeting Card */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)',
          border: '2px solid #E0E7FF',
          borderRadius: '26px',
          padding: '1.25rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.08)',
          position: 'relative'
        }}
      >
        {/* Animated Mitra Avatar with Voice Trigger */}
        <div
          onClick={speakMitraGreeting}
          className="avatar-halo cursor-pointer"
          style={{
            position: 'relative',
            width: '68px',
            height: '68px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            boxShadow: '0 8px 18px rgba(79, 70, 229, 0.3)',
            flexShrink: 0,
            cursor: 'pointer'
          }}
          title={isHindi ? 'मित्रा की आवाज सुनें' : (isBengali ? 'মিত্রার কথা শোনো' : 'Click to hear Mitra')}
        >
          <span style={{ transform: 'scale(1)', transition: 'transform 0.2s' }}>🦉</span>
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              background: '#10B981',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <Volume2 size={12} color="white" />
          </div>
        </div>

        {/* Speech Bubble text */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isHindi ? 'मित्रा गाइड' : (isBengali ? 'মিত্রা সহকারী' : 'MITRA GUIDE')}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
              {avatarEmoji} {studentName}
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: '0 0 0.25rem', lineHeight: 1.3 }}>
            {isHindi
              ? `नमस्ते ${studentName}! तैयार हो नए रोमांच के लिए?`
              : isBengali
              ? `হ্যালো ${studentName}! নতুন অভিযানের জন্য প্রস্তুত?`
              : `Hello ${studentName}! Ready for today's adventure?`}
          </h2>

          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
            {isHindi
              ? 'द्वीप चुनें, जादुई अक्षर और ध्वनियाँ पहचानें, और नए मुकुट अनलॉक करें!'
              : isBengali
              ? 'দ্বীপ বেছে নাও, বর্ণ ও ধ্বনি মেলাও, আর নতুন মুকুট জয় করো!'
              : 'Pick an island below, solve phonics puzzles, and unlock magical crowns!'}
          </p>
        </div>

        {/* Quick Star XP & Streak mini tokens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
          <div
            className="hud-chip hud-chip-stars"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            title="Earned Stars"
          >
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
            <span>{activeProfile?.stars || 15}</span>
          </div>

          <div
            className="hud-chip hud-chip-streak"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            title="Daily Learning Streak"
          >
            <span className="flame-pulsing">🔥</span>
            <span>{activeProfile?.streak || 3}d</span>
          </div>
        </div>
      </div>

      {/* 2. Personalized AI Star Quest Callout */}
      {recommendation.hasPersonalized && (
        <div
          onClick={() => handleLaunch(recommendation.activityId || 'word-snapper')}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            borderRadius: '24px',
            padding: '1.15rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.28)',
            cursor: 'pointer',
            border: '2px solid #34D399',
            transition: 'all 0.15s ease'
          }}
          className="hover:scale-[1.01]"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '1.5px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {recommendation.icon || '🌟'}
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.06em' }}>
                {isHindi ? '🌟 आज का अनुशंसित मिशन' : (isBengali ? '🌟 আজকের বিশেষ মিশন' : "🌟 TODAY'S STAR MISSION")}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white' }}>
                {recommendation.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#E6FFFA', marginTop: '0.15rem' }}>
                {recommendation.childPrompt}
              </div>
            </div>
          </div>

          <button
            className="btn-3d btn-3d-amber"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexShrink: 0
            }}
          >
            <span>{isHindi ? 'अभी खेलें' : (isBengali ? 'এখনই খেলো' : 'Play Now')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* 3. Gamified Island Map vs Arcade Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '0.35rem',
            borderRadius: '9999px',
            gap: '0.4rem',
            border: '1.5px solid #E2E8F0',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <button
            onClick={() => {
              playPop();
              setViewMode('map');
            }}
            style={{
              padding: '0.55rem 1.4rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'map' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'transparent',
              color: viewMode === 'map' ? 'white' : '#64748B',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: viewMode === 'map' ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Map size={17} />
            <span>{isHindi ? 'द्वीप यात्रा (Islands)' : (isBengali ? 'দ্বীপ মানচিত্র' : 'Adventure Map')}</span>
          </button>

          <button
            onClick={() => {
              playPop();
              setViewMode('arcade');
            }}
            style={{
              padding: '0.55rem 1.4rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'arcade' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'transparent',
              color: viewMode === 'arcade' ? 'white' : '#64748B',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: viewMode === 'arcade' ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Grid size={17} />
            <span>{isHindi ? 'सभी खेल (Arcade)' : (isBengali ? 'সব খেলা' : 'All Games')}</span>
          </button>
        </div>
      </div>

      {/* 4. MODE A: Interactive 3D Island Adventure Modules */}
      {viewMode === 'map' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', position: 'relative' }}>
          {ADVENTURE_ISLANDS.map((island, islandIdx) => {
            const islandName = isHindi ? island.nameHi : (isBengali ? island.nameBn : island.nameEn);
            const islandSubtitle = isHindi ? island.subtitleHi : (isBengali ? island.subtitleBn : island.subtitleEn);
            const rewardTitle = isHindi ? island.rewardTitleHi : (isBengali ? island.rewardTitleBn : island.rewardTitleEn);
            const hasRecommendedMission = island.missions.some(m => m.id === recommendedActivityId);

            return (
              <div key={island.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Connecting Adventure Path Dash Line */}
                {islandIdx > 0 && (
                  <div
                    style={{
                      height: '36px',
                      width: '6px',
                      background: 'repeating-linear-gradient(to bottom, #818CF8, #818CF8 8px, transparent 8px, transparent 16px)',
                      margin: '-0.6rem 0',
                      borderRadius: '9999px'
                    }}
                  />
                )}

                {/* Island Card with 3D Depth */}
                <div
                  className="quest-island-card"
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    borderRadius: '28px',
                    border: hasRecommendedMission ? '3px solid #10B981' : `2px solid ${island.cardBorder}`,
                    boxShadow: hasRecommendedMission
                      ? '0 12px 32px rgba(16, 185, 129, 0.22)'
                      : '0 10px 28px rgba(0, 0, 0, 0.06)',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top Accent Strip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: island.gradient
                    }}
                  />

                  {/* Top Recommended Ribbon */}
                  {hasRecommendedMission && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#10B981',
                        color: 'white',
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        padding: '0.35rem 1rem',
                        borderBottomLeftRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{isHindi ? 'अनुशंसित मॉड्यूल' : (isBengali ? 'নির্দেশিত মডিউল' : 'RECOMMENDED')}</span>
                    </div>
                  )}

                  {/* Island Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        className="quest-island-icon-box"
                        style={{
                          width: '58px',
                          height: '58px',
                          borderRadius: '20px',
                          background: island.badgeBg,
                          border: `2px solid ${island.badgeBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          boxShadow: '0 6px 14px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        {island.icon}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 900,
                              color: island.badgeColor,
                              background: island.badgeBg,
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              border: `1px solid ${island.badgeBorder}`
                            }}
                          >
                            {isHindi ? `मॉड्यूल ${island.islandNumber}` : (isBengali ? `মডিউল ${island.islandNumber}` : `ISLAND ${island.islandNumber}`)}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>•</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                            {island.trophy} {rewardTitle}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E293B', margin: '0.25rem 0 0' }}>
                          {islandName}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => speakIslandPrompt(island)}
                      style={{
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#6366F1',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                      }}
                      title="Listen to Island Info"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1.25rem', lineHeight: 1.5, maxWidth: '540px' }}>
                    {islandSubtitle}
                  </p>

                  {/* Missions inside this Island */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    {island.missions.map((mission) => {
                      const isMissionRecommended = mission.id === recommendedActivityId;
                      const title = isHindi ? mission.titleHi : (isBengali ? mission.titleBn : mission.titleEn);
                      const desc = isHindi ? mission.descHi : (isBengali ? mission.descBn : mission.descEn);
                      const tag = isHindi ? mission.tagHi : (isBengali ? mission.tagBn : mission.tagEn);

                      return (
                        <div
                          key={mission.id}
                          style={{
                            background: isMissionRecommended ? '#F0FDF4' : '#F8FAFC',
                            border: isMissionRecommended ? '2.5px solid #86EFAC' : '1.5px solid #E2E8F0',
                            borderRadius: '20px',
                            padding: '1.15rem 1.15rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.9rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.6rem' }}>{mission.icon}</span>
                                <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#1E293B' }}>
                                  {title}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  color: isMissionRecommended ? '#15803D' : '#64748B',
                                  background: isMissionRecommended ? '#DCFCE7' : '#E2E8F0',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '9999px'
                                }}
                              >
                                {tag}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 0.4rem', lineHeight: 1.45 }}>
                              {desc}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#F59E0B', fontWeight: 800 }}>
                              <Star size={13} fill="#F59E0B" color="#F59E0B" />
                              <span>+{mission.starsReward} Stars</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleLaunch(mission.id)}
                            className={isMissionRecommended ? 'btn-3d btn-3d-emerald' : 'btn-3d btn-3d-indigo'}
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Play size={15} fill="white" color="white" />
                            <span>{isHindi ? 'मिशन शुरू करें' : (isBengali ? 'মিশন শুরু করো' : 'Start Mission')}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. MODE B: 3D Arcade Quick Play Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {ADVENTURE_ISLANDS.flatMap(i => i.missions).map((m) => {
            const isRec = m.id === recommendedActivityId;
            const title = isHindi ? m.titleHi : (isBengali ? m.titleBn : m.titleEn);
            const desc = isHindi ? m.descHi : (isBengali ? m.descBn : m.descEn);

            return (
              <div
                key={m.id}
                onClick={() => handleLaunch(m.id)}
                className="quest-island-card"
                style={{
                  background: isRec ? '#F0FDF4' : '#FFFFFF',
                  borderRadius: '22px',
                  border: isRec ? '2.5px solid #86EFAC' : '2px solid #E2E8F0',
                  padding: '1.4rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)'
                }}
              >
                <span style={{ fontSize: '2.8rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>{m.icon}</span>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#1E293B' }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>{desc}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#F59E0B', fontWeight: 800, marginTop: '0.2rem' }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span>+{m.starsReward} Stars</span>
                </div>

                <button
                  className={isRec ? 'btn-3d btn-3d-emerald' : 'btn-3d btn-3d-indigo'}
                  style={{
                    marginTop: '0.4rem',
                    width: '100%',
                    padding: '0.55rem 1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Play size={14} fill="white" color="white" />
                  <span>{isHindi ? 'खेलें' : (isBengali ? 'খেলো' : 'Play')}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
