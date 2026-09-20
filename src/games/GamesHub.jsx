import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Star, Volume2, ArrowRight, Map, Grid, CheckCircle, Trophy, Compass, Flame, Award } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';
import { getChildRecommendation } from '../utils/adaptiveLearningStrategy';

// ── 3 Gamified Adventure Islands / Modules for Children ───────────────────────
export const ADVENTURE_ISLANDS = [
  {
    id: 'island-letters',
    islandNumber: 1,
    themeColor: '#6366F1',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
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
        tagHi: 'दृश्य खोज'
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
        tagHi: 'सुलेख'
      }
    ]
  },
  {
    id: 'island-sounds',
    islandNumber: 2,
    themeColor: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    badgeBg: '#ECFDF5',
    badgeBorder: '#A7F3D0',
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
        tagHi: 'वर्ण क्रम'
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
        tagHi: 'ध्वनि मिलान'
      }
    ]
  },
  {
    id: 'island-words',
    islandNumber: 3,
    themeColor: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    badgeBg: '#FFFBEB',
    badgeBorder: '#FDE68A',
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
        tagHi: 'जाल पहचान'
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
        tagHi: 'स्मृति व सुलेख'
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

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '0.5rem 0.5rem 2.5rem'
      }}
    >
      {/* 1. Playful Adventure Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4338CA 0%, #312E81 100%)',
          color: 'white',
          borderRadius: '28px',
          padding: '1.4rem 1.6rem',
          boxShadow: '0 12px 28px rgba(49, 46, 129, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🗺️</span>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#C7D2FE', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isHindi ? 'रोमांचक सीखने की यात्रा' : (isBengali ? 'রোমাঞ্চকর শেখার অভিযান' : 'Learning Adventure Map')}
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', margin: '0.1rem 0 0' }}>
                {isHindi ? '3 जादुई सीखने के द्वीप' : (isBengali ? '৩টি জাদুকরী শেখার দ্বীপ' : '3 Magical Learning Islands')}
              </h2>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              padding: '0.4rem 0.8rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#FDE047'
            }}
          >
            <Star size={16} fill="#FDE047" color="#FDE047" />
            <span>{activeProfile?.stars || 15}</span>
          </div>
        </div>

        <p style={{ fontSize: '0.86rem', color: '#E0E7FF', lineHeight: 1.4, margin: '0.4rem 0 0', maxWidth: '460px' }}>
          {isHindi
            ? 'हर द्वीप में एक नई महाशक्ति छिपी है! मिशन पूरे करें, सितारे जीतें और ताज अनलॉक करें!'
            : (isBengali
              ? 'প্রতিটি দ্বীপে নতুন শক্তির সন্ধান! মিশন পূরণ করো, তারা জেতো এবং মুকুট জয় করো!'
              : 'Complete missions, earn stars, and unlock crowns on your reading journey!')}
        </p>
      </div>

      {/* 2. Personalized AI Recommendation Callout (If child has personalized next adventure) */}
      {recommendation.hasPersonalized && (
        <div
          onClick={() => handleLaunch(recommendation.activityId || 'word-snapper')}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            borderRadius: '22px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px rgba(5, 150, 105, 0.25)',
            cursor: 'pointer',
            border: '2px solid #34D399',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>{recommendation.icon || '🌟'}</span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.04em' }}>
                {isHindi ? '🌟 आज का खास अभियान' : (isBengali ? '🌟 আজকের বিশেষ মিশন' : "🌟 TODAY'S STAR MISSION")}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>
                {recommendation.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#E6FFFA', marginTop: '0.15rem' }}>
                {recommendation.childPrompt}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'white',
              color: '#065F46',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              flexShrink: 0
            }}
          >
            <span>{isHindi ? 'खेलें' : (isBengali ? 'খেলো' : 'Play')}</span>
            <ArrowRight size={15} />
          </div>
        </div>
      )}

      {/* 3. Gamified Island Map vs Arcade View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.25rem', borderRadius: '9999px', gap: '0.35rem' }}>
          <button
            onClick={() => {
              playPop();
              setViewMode('map');
            }}
            style={{
              padding: '0.45rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'map' ? '#4F46E5' : 'transparent',
              color: viewMode === 'map' ? 'white' : '#64748B',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: viewMode === 'map' ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Map size={16} />
            <span>{isHindi ? 'द्वीप नक्शा (Modules)' : (isBengali ? 'দ্বীপ মানচিত্র' : 'Island Modules')}</span>
          </button>

          <button
            onClick={() => {
              playPop();
              setViewMode('arcade');
            }}
            style={{
              padding: '0.45rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'arcade' ? '#4F46E5' : 'transparent',
              color: viewMode === 'arcade' ? 'white' : '#64748B',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: viewMode === 'arcade' ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Grid size={16} />
            <span>{isHindi ? 'सभी खेल (Arcade)' : (isBengali ? 'সব খেলা' : 'All Games')}</span>
          </button>
        </div>
      </div>

      {/* 4. MODE A: Interactive Gamified Adventure Island Modules */}
      {viewMode === 'map' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          {ADVENTURE_ISLANDS.map((island, islandIdx) => {
            const islandName = isHindi ? island.nameHi : (isBengali ? island.nameBn : island.nameEn);
            const islandSubtitle = isHindi ? island.subtitleHi : (isBengali ? island.subtitleBn : island.subtitleEn);
            const rewardTitle = isHindi ? island.rewardTitleHi : (isBengali ? island.rewardTitleBn : island.rewardTitleEn);

            // Check if any mission inside this island is the AI recommended mission
            const hasRecommendedMission = island.missions.some(m => m.id === recommendedActivityId);

            return (
              <div key={island.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Connecting Adventure Path Dash Line */}
                {islandIdx > 0 && (
                  <div
                    style={{
                      height: '32px',
                      width: '4px',
                      background: 'repeating-linear-gradient(to bottom, #818CF8, #818CF8 6px, transparent 6px, transparent 12px)',
                      margin: '-0.5rem 0'
                    }}
                  />
                )}

                {/* Island Card */}
                <div
                  style={{
                    width: '100%',
                    background: 'white',
                    borderRadius: '26px',
                    border: hasRecommendedMission ? '3px solid #10B981' : '2px solid #E2E8F0',
                    boxShadow: hasRecommendedMission
                      ? '0 10px 30px rgba(16, 185, 129, 0.2)'
                      : '0 8px 24px rgba(0, 0, 0, 0.05)',
                    padding: '1.4rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top Recommended Tag */}
                  {hasRecommendedMission && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#10B981',
                        color: 'white',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '0.3rem 0.9rem',
                        borderBottomLeftRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <span>★</span>
                      <span>{isHindi ? 'अनुशंसित मॉड्यूल' : (isBengali ? 'নির্দেশিত মডিউল' : 'RECOMMENDED')}</span>
                    </div>
                  )}

                  {/* Island Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '18px',
                          background: island.badgeBg,
                          border: `2px solid ${island.badgeBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        {island.icon}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: island.badgeColor,
                              background: island.badgeBg,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px'
                            }}
                          >
                            {isHindi ? `मॉड्यूल ${island.islandNumber}` : (isBengali ? `মডিউল ${island.islandNumber}` : `MODULE ${island.islandNumber}`)}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>•</span>
                          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                            {island.trophy} {rewardTitle}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: '0.2rem 0 0' }}>
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
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748B',
                        flexShrink: 0
                      }}
                      title="Hear Island Prompt"
                    >
                      <Volume2 size={17} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 1.15rem', lineHeight: 1.4 }}>
                    {islandSubtitle}
                  </p>

                  {/* Missions inside this Island */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
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
                            border: isMissionRecommended ? '2px solid #86EFAC' : '1.5px solid #E2E8F0',
                            borderRadius: '18px',
                            padding: '0.95rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{mission.icon}</span>
                                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E293B' }}>
                                  {title}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: isMissionRecommended ? '#15803D' : '#64748B',
                                  background: isMissionRecommended ? '#DCFCE7' : '#E2E8F0',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '9999px'
                                }}
                              >
                                {tag}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.35 }}>
                              {desc}
                            </p>
                          </div>

                          <button
                            onClick={() => handleLaunch(mission.id)}
                            style={{
                              width: '100%',
                              background: isMissionRecommended
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '0.6rem',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              boxShadow: isMissionRecommended
                                ? '0 3px 10px rgba(16, 185, 129, 0.3)'
                                : '0 3px 10px rgba(79, 70, 229, 0.25)'
                            }}
                          >
                            <Play size={14} fill="white" color="white" />
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
        /* 5. MODE B: Arcade Quick Play Grid for Direct Access */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          {ADVENTURE_ISLANDS.flatMap(i => i.missions).map((m) => {
            const isRec = m.id === recommendedActivityId;
            const title = isHindi ? m.titleHi : (isBengali ? m.titleBn : m.titleEn);
            const desc = isHindi ? m.descHi : (isBengali ? m.descBn : m.descEn);

            return (
              <div
                key={m.id}
                onClick={() => handleLaunch(m.id)}
                style={{
                  background: isRec ? '#F0FDF4' : 'white',
                  borderRadius: '20px',
                  border: isRec ? '2px solid #86EFAC' : '1.5px solid #E2E8F0',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '2.4rem' }}>{m.icon}</span>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>{title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.3 }}>{desc}</div>
                <div
                  style={{
                    marginTop: '0.5rem',
                    background: isRec ? '#10B981' : '#4F46E5',
                    color: 'white',
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Play size={13} fill="white" color="white" />
                  <span>{isHindi ? 'खेलें' : (isBengali ? 'খেলো' : 'Play')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
