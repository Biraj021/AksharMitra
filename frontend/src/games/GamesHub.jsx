import React, { useState } from 'react';
import { Play, Sparkles, Star, Volume2, ArrowRight, Map, Grid, CheckCircle, Trophy, Compass, Flame, Award, Lightbulb, Heart, Lock, Unlock, Crown } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';
import { getChildRecommendation } from '@ai/adaptiveLearningStrategy';
export const ADVENTURE_REALMS = [
  {
    id: 'realm-letters',
    realmNumber: 1,
    themeClass: 'biome-forest-theme',
    themeName: 'Whispering Forest',
    themeNameBn: 'মায়াবী অরণ্য',
    themeNameHi: 'जादुई वन',
    accentColor: '#10B981',
    nodeClass: 'step-node-emerald',
    icon: '🌲',
    trophy: '👑',
    nameEn: 'Letter Island',
    nameBn: 'বর্ণ দ্বীপ',
    nameHi: 'अक्षर द्वीप',
    subtitleEn: 'Master mirror letters (b/d/p/q) and trace glowing glyphs!',
    subtitleBn: 'ব বনাম র এবং দ বনাম ধ এর ধাঁধা সমাধান করো ও সুন্দর বর্ণ আঁকো!',
    subtitleHi: 'दर्पण अक्षरों (ब/भ/द) का भेद पहचानें और सुंदर अक्षर बनाएं!',
    rewardTitleEn: 'Letter Explorer Crown',
    rewardTitleBn: 'বর্ণ অভিযাত্রী মুকুট',
    rewardTitleHi: 'अक्षर खोजी मुकुट',
    nodes: [
      {
        id: 'letter-hunter',
        icon: '🦅',
        nodeNumber: '1.1',
        titleEn: 'Eagle Eye Hunt',
        titleBn: 'ঈগল চোখ বর্ণ খোঁজা',
        titleHi: 'बाज की नज़र अक्षर खोज',
        descEn: 'Spot hidden target letters among tricky mirror letters!',
        descBn: 'লুকানো বর্ণ খুঁজে বের করো এবং ব বনাম র এর ফাঁদ এড়াও!',
        descHi: 'छुपे हुए अक्षर पहचानें और ब vs भ का भेद खोजें!',
        tagEn: 'Visual Focus',
        tagBn: 'দৃষ্টিগত সন্ধান',
        tagHi: 'दृश्य खोज',
        starsReward: 10,
        alignment: 'left' // for zigzag winding trail
      },
      {
        id: 'letter-tracing',
        icon: '✍️',
        nodeNumber: '1.2',
        titleEn: 'Magic Wand Tracing',
        titleBn: 'জাদুকরী বর্ণ আঁকা',
        titleHi: 'जादुई अक्षर आलेखन',
        descEn: 'Trace letters with glowing stars and magnetic guide dots!',
        descBn: 'তারার পথ ধরে আঙুল দিয়ে সুন্দর করে বর্ণ আঁকো!',
        descHi: 'चमकते सितारों के साथ सही दिशा में अक्षर बनाएं!',
        tagEn: 'Handwriting',
        tagBn: 'হস্তলিপি',
        tagHi: 'सुलेख',
        starsReward: 15,
        alignment: 'right'
      }
    ]
  },
  {
    id: 'realm-sounds',
    realmNumber: 2,
    themeClass: 'biome-lagoon-theme',
    themeName: 'Melody Lagoon',
    themeNameBn: 'সুরের জলাশয়',
    themeNameHi: 'सुरमयी झील',
    accentColor: '#0284C7',
    nodeClass: 'step-node-sky',
    icon: '🌊',
    trophy: '🏅',
    nameEn: 'Sound Safari',
    nameBn: 'সুরের সাফারি',
    nameHi: 'ध्वनि सफारी',
    subtitleEn: 'Connect missing alphabet wagons and blend phonics into words!',
    subtitleBn: 'মন দিয়ে শব্দ শোনো এবং ট্রেনের বগি জুড়ে বর্ণ মেলাও!',
    subtitleHi: 'आवाजें ध्यान से सुनें और अक्षरों को शब्दों में जोड़ें!',
    rewardTitleEn: 'Sound Safari Medal',
    rewardTitleBn: 'সুর সাধক পদক',
    rewardTitleHi: 'ध्वनि साधक पदक',
    nodes: [
      {
        id: 'abc-fill-in',
        icon: '🚂',
        nodeNumber: '2.1',
        titleEn: 'Alphabet Train',
        titleBn: 'বর্ণমালা ট্রেন এক্সপ্রেস',
        titleHi: 'वर्णमाला ट्रेन एक्सप्रेस',
        descEn: 'Connect the missing alphabet wagons on the track!',
        descBn: 'ট্রেনের লাইনে নিখোঁজ বগিগুলো সঠিক বর্ণ দিয়ে জোড়ো!',
        descHi: 'ट्रेन की पटरी पर छूटे हुए अक्षरों को सही क्रम में जोड़ें!',
        tagEn: 'Alphabet Flow',
        tagBn: 'বর্ণের ধারাবাহিকতা',
        tagHi: 'वर्ण क्रम',
        starsReward: 10,
        alignment: 'left'
      },
      {
        id: 'word-snapper',
        icon: '🧩',
        nodeNumber: '2.2',
        titleEn: 'Word Builder Snap',
        titleBn: 'শব্দ জোড়া লাগানো',
        titleHi: 'शब्द निर्माण पहेली',
        descEn: 'Snap letters together and hear them blend into words!',
        descBn: 'বর্ণগুলো একসাথে জুড়ে সুন্দর নতুন শব্দ তৈরি করো!',
        descHi: 'अक्षरों को आपस में जोड़ें और उनकी जादुई ध्वनि सुनें!',
        tagEn: 'Phonics Blending',
        tagBn: 'ধ্বনি সম্মেলন',
        tagHi: 'ध्वनि मिलান',
        starsReward: 15,
        alignment: 'right'
      }
    ]
  },
  {
    id: 'realm-words',
    realmNumber: 3,
    themeClass: 'biome-citadel-theme',
    themeName: 'Starry Citadel',
    themeNameBn: 'নক্ষত্র দুর্গ',
    themeNameHi: 'तारों का किला',
    accentColor: '#F59E0B',
    nodeClass: 'step-node-amber',
    icon: '🏰',
    trophy: '🏆',
    nameEn: 'Word Castle',
    nameBn: 'শব্দ দুর্গ',
    nameHi: 'शब्द महल',
    subtitleEn: 'Bust tricky letter swaps like FROM/FORM & master 4-line spelling!',
    subtitleBn: 'বানানের ফাঁদ ধরো এবং কঠিন শব্দের রহস্য শেখো!',
    subtitleHi: 'वर्तनी के जालों को पकड़ें और शब्दों के जादूगर बनें!',
    rewardTitleEn: 'Word Wizard Trophy',
    rewardTitleBn: 'শব্দ জাদুকর ট্রফি',
    rewardTitleHi: 'शब्द जादूगर ट्रॉफी',
    nodes: [
      {
        id: 'spelling-traps',
        icon: '⚡',
        nodeNumber: '3.1',
        titleEn: 'Trap Buster',
        titleBn: 'বানানের ফাঁদ ধরা',
        titleHi: 'वर्तनी जाल शिकारी',
        descEn: 'Catch sneaky letter swaps like FROM and FORM!',
        descBn: 'জল বনাম লজ এর মতো চালাক ফাঁদ ধরে ফেলো!',
        descHi: 'जल और लज जैसे वर्ण-विपर्यय जालों को पकड़ें!',
        tagEn: 'Trap Spotter',
        tagBn: 'ফাঁদ শনাক্তকরণ',
        tagHi: 'जाल पहचान',
        starsReward: 15,
        alignment: 'left'
      },
      {
        id: 'spelling-clinic',
        icon: '🧠',
        nodeNumber: '3.2',
        titleEn: 'Memory Spell Wizard',
        titleBn: 'স্মৃতি বানান জাদুঘর',
        titleHi: 'स्मृति वर्तनी जादूगर',
        descEn: 'Look, cover, write, and align tricky words on 4 lines!',
        descBn: 'দেখো, ঢাকো, লেখো এবং ৪ লাইনের স্কেলে নিখুঁত করো!',
        descHi: 'देखें, ढकें, लिखें और 4 लाइनों में सटीक बनाएं!',
        tagEn: 'Memory & Lines',
        tagBn: 'স্মৃতি ও রেখা',
        tagHi: 'स्मृति व सुलेख',
        starsReward: 20,
        alignment: 'right'
      }
    ]
  }
];

export const ADVENTURE_ISLANDS = ADVENTURE_REALMS;

export default function GamesHub({ onSelectGame }) {
  const { activeProfile, setCurrentView, activeLanguage, t } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const [viewMode, setViewMode] = useState('map'); // 'map' | 'arcade'
  const recommendedActivityId = activeProfile?.learningProfile?.recommendedActivityId || 'word-snapper';
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

  const speakRealmPrompt = (realm) => {
    playPop();
    const name = isHindi ? realm.nameHi : (isBengali ? realm.nameBn : realm.nameEn);
    const desc = isHindi ? realm.subtitleHi : (isBengali ? realm.subtitleBn : realm.subtitleEn);
    speakText(`${name}! ${desc}`, speechLang);
  };

  const speakMitraGreeting = () => {
    playPop();
    const greetingText = isHindi
      ? `नमस्ते ${studentName}! आज हम जादुई अक्षर और ध्वनियों के रोमांचक रास्ते पर चलेंगे!`
      : isBengali
      ? `হ্যালো ${studentName}! আজ আমরা জাদুকরী বর্ণ ও সুরের পথে অভিযান চালাব!`
      : `Hello ${studentName}! Let's journey along the magical phonics adventure trail!`;
    speakText(greetingText, speechLang);
  };

  return (
    <div className="adventure-world-container">
      {/* ── 1. Mitra Mascot Command Center Hero Banner ── */}
      <div
        className="holo-explorer-card"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              onClick={speakMitraGreeting}
              className="avatar-halo cursor-pointer"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                fontSize: '2.4rem',
                flexShrink: 0,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
              }}
              title="Click to hear Mitra"
            >
              <span className="flame-pulsing">🦉</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ★ {isHindi ? 'अक्षरमित्र साम्राज्य' : (isBengali ? 'অক্ষরমিত্রা রাজ্য' : 'AKSHAR KINGDOM')}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#A5B4FC' }}>•</span>
                <span style={{ fontSize: '0.78rem', color: '#86EFAC', fontWeight: 800 }}>
                  {avatarEmoji} {studentName}
                </span>
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                {isHindi
                  ? `चलो ${studentName}, जादुई रास्ते पर चलें! 🚀`
                  : isBengali
                  ? `চলো ${studentName}, জাদুকরী পথে নামি! 🚀`
                  : `Let's conquer the trail, ${studentName}! 🚀`}
              </h2>
            </div>
          </div>

          {/* Quick Audio Button */}
          <button
            onClick={speakMitraGreeting}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FDE047',
              cursor: 'pointer'
            }}
          >
            <Volume2 size={18} />
          </button>
        </div>

        {/* XP, Stars & Streak Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.25)', padding: '0.65rem 1rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FDE047', fontWeight: 900, fontSize: '0.95rem' }}>
            <Star size={18} fill="#FDE047" color="#FDE047" />
            <span>{activeProfile?.stars || 15} Stars</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FDA4AF', fontWeight: 900, fontSize: '0.95rem' }}>
            <span className="flame-pulsing">🔥</span>
            <span>{activeProfile?.streak || 3} Day Streak</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A7F3D0', fontWeight: 900, fontSize: '0.95rem' }}>
            <Crown size={18} color="#34D399" />
            <span>3 Biome Realms</span>
          </div>
        </div>
      </div>

      {/* ── 2. Personalized AI Recommended Star Quest Card ── */}
      {recommendation.hasPersonalized && (
        <div
          onClick={() => handleLaunch(recommendation.activityId || 'word-snapper')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064E3B 100%)',
            border: '3px solid #34D399',
            borderRadius: '26px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 12px 28px rgba(5, 150, 105, 0.35)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="hover:scale-[1.01] transition-all"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {recommendation.icon || '🌟'}
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.06em' }}>
                {isHindi ? '🌟 आज का खास अभियान' : (isBengali ? '🌟 আজকের বিশেষ মিশন' : "🌟 TODAY'S STAR MISSION")}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>
                {recommendation.title}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#E6FFFA', marginTop: '0.15rem' }}>
                {recommendation.childPrompt}
              </div>
            </div>
          </div>

          <button
            className="btn-3d btn-3d-amber"
            style={{
              padding: '0.65rem 1.4rem',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              flexShrink: 0
            }}
          >
            <span>{isHindi ? 'अभी खेलें' : (isBengali ? 'এখনই খেলো' : 'Play Now')}</span>
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* ── 3. View Switcher (Adventure Map vs All Games Arcade) ── */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            background: '#FFFFFF',
            padding: '0.4rem',
            borderRadius: '9999px',
            gap: '0.45rem',
            border: '2.5px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)'
          }}
        >
          <button
            onClick={() => {
              playPop();
              setViewMode('map');
            }}
            className="btn-3d"
            style={{
              padding: '0.55rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'map' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'transparent',
              color: viewMode === 'map' ? 'white' : '#64748B',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: viewMode === 'map' ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none'
            }}
          >
            <Map size={18} />
            <span>{isHindi ? 'जादुई नक्शा (World Map)' : (isBengali ? 'জাদুকরী মানচিত্র' : 'Adventure Trail Map')}</span>
          </button>

          <button
            onClick={() => {
              playPop();
              setViewMode('arcade');
            }}
            className="btn-3d"
            style={{
              padding: '0.55rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'arcade' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'transparent',
              color: viewMode === 'arcade' ? 'white' : '#64748B',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: viewMode === 'arcade' ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none'
            }}
          >
            <Grid size={18} />
            <span>{isHindi ? 'सभी खेल (Arcade)' : (isBengali ? 'সব খেলা' : 'All Games')}</span>
          </button>
        </div>
      </div>

      {/* ── 4. MODE A: WINDING 3D ADVENTURE WORLD MAP ── */}
      {viewMode === 'map' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', position: 'relative' }}>
          {ADVENTURE_REALMS.map((realm, rIdx) => {
            const realmTitle = isHindi ? realm.nameHi : (isBengali ? realm.nameBn : realm.nameEn);
            const realmThemeName = isHindi ? realm.themeNameHi : (isBengali ? realm.themeNameBn : realm.themeName);
            const realmSubtitle = isHindi ? realm.subtitleHi : (isBengali ? realm.subtitleBn : realm.subtitleEn);
            const rewardTitle = isHindi ? realm.rewardTitleHi : (isBengali ? realm.rewardTitleBn : realm.rewardTitleEn);

            return (
              <div key={realm.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* 3D Biome Realm Banner Header */}
                <div className={`biome-realm-card ${realm.themeClass}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '18px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {realm.icon}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          REALM {realm.realmNumber} • {realmThemeName}
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: '0.1rem 0 0' }}>
                          {realmTitle}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => speakRealmPrompt(realm)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1.5px solid rgba(255, 255, 255, 0.35)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                      title="Listen"
                    >
                      <Volume2 size={17} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#E0E7FF', margin: 0, lineHeight: 1.45, maxWidth: '520px' }}>
                    {realmSubtitle}
                  </p>
                </div>

                {/* Winding 3D Stepping Stone Trail for this Realm */}
                <div className="biome-path-trail">
                  {/* Trail Connector Line */}
                  <div className="path-connector-line" />

                  {realm.nodes.map((node, nIdx) => {
                    const isRec = node.id === recommendedActivityId;
                    const nodeTitle = isHindi ? node.titleHi : (isBengali ? node.titleBn : node.titleEn);
                    const nodeTag = isHindi ? node.tagHi : (isBengali ? node.tagBn : node.tagEn);
                    const isLeft = node.alignment === 'left';

                    return (
                      <div
                        key={node.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isLeft ? 'flex-start' : 'flex-end',
                          width: '100%',
                          padding: isLeft ? '0 0 0 15%' : '0 15% 0 0',
                          position: 'relative'
                        }}
                      >
                        {/* Interactive 3D Stepping Stone Node Button */}
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {/* Animated Mitra Avatar on recommended node */}
                          {isRec && (
                            <div className="player-mascot-pin">
                              <div className="pin-bubble">
                                <span>👇 Play Here!</span>
                              </div>
                              <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>🦉</span>
                            </div>
                          )}

                          <button
                            onClick={() => handleLaunch(node.id)}
                            className={`biome-step-node ${realm.nodeClass}`}
                            title={nodeTitle}
                          >
                            <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{node.icon}</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 900, marginTop: '2px', opacity: 0.9 }}>{node.nodeNumber}</span>
                          </button>

                          {/* Node Title Label & Star Badge */}
                          <div
                            onClick={() => handleLaunch(node.id)}
                            style={{
                              marginTop: '0.45rem',
                              background: '#FFFFFF',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '16px',
                              border: isRec ? '2.5px solid #10B981' : '2px solid #CBD5E1',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                              textAlign: 'center',
                              cursor: 'pointer',
                              maxWidth: '170px'
                            }}
                          >
                            <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.2 }}>
                              {nodeTitle}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#D97706', fontWeight: 800, marginTop: '2px' }}>
                              <Star size={12} fill="#F59E0B" color="#F59E0B" />
                              <span>+{node.starsReward} XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Realm Boss Treasure Chest Milestone */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem',
                      zIndex: 2,
                      marginTop: '0.5rem'
                    }}
                  >
                    <div
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '24px',
                        background: 'linear-gradient(180deg, #FEF08A 0%, #F59E0B 100%)',
                        border: '3px solid #FCD34D',
                        boxShadow: '0 8px 0 #B45309, 0 12px 20px rgba(245, 158, 11, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                      }}
                    >
                      {realm.trophy}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#78350F', background: '#FEF3C7', padding: '0.2rem 0.65rem', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
                      {rewardTitle}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 5. MODE B: 3D CANDY ARCADE GRID ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', width: '100%' }}>
          {ADVENTURE_REALMS.flatMap(r => r.nodes).map((m) => {
            const isRec = m.id === recommendedActivityId;
            const title = isHindi ? m.titleHi : (isBengali ? m.titleBn : m.titleEn);
            const desc = isHindi ? m.descHi : (isBengali ? m.descBn : m.descEn);

            return (
              <div
                key={m.id}
                onClick={() => handleLaunch(m.id)}
                className="biome-realm-card"
                style={{
                  background: isRec ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : '#FFFFFF',
                  border: isRec ? '3px solid #10B981' : '2.5px solid #E2E8F0',
                  padding: '1.5rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '22px',
                    background: isRec ? '#10B981' : '#EEF2FF',
                    color: isRec ? 'white' : '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.6rem',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                  }}
                >
                  {m.icon}
                </div>

                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1E293B' }}>{title}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>{desc}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#D97706', fontWeight: 900 }}>
                  <Star size={15} fill="#F59E0B" color="#F59E0B" />
                  <span>+{m.starsReward} Stars</span>
                </div>

                <button
                  className={isRec ? 'btn-3d btn-3d-emerald' : 'btn-3d btn-3d-indigo'}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.65rem 1rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Play size={15} fill="white" color="white" />
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
