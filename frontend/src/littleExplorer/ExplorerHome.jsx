import React, { useEffect } from 'react';
import MascotMitra from '../components/common/MascotMitra';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

export default function ExplorerHome({ onSelectActivity }) {
  const { activeLanguage, t } = useProfile();
  const { playPop, playChime, speakText } = useAudio();

  const speechLang = activeLanguage?.id === 'hindi' ? 'hi-IN' : (activeLanguage?.id === 'bengali' ? 'bn-IN' : 'en-US');

  // Friendly audio greeting on initial mount
  useEffect(() => {
    const greetingText = t('explorerHomeGreeting');
    const timer = setTimeout(() => {
      speakText(greetingText, speechLang);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeLanguage]);

  const activities = [
    {
      id: 'sound-match',
      title: t('explorerSoundMatchTitle'),
      subtitle: t('explorerSoundMatchDesc'),
      emoji: '🐱',
      accentEmoji: '🎵',
      gradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
      borderColor: '#38BDF8',
      textColor: '#0369A1',
      badgeBg: '#0284C7',
      speechPrompt: activeLanguage?.id === 'hindi'
        ? 'ध्वनि पहचान! आवाज़ सुनो और चित्र ढूंढो!'
        : (activeLanguage?.id === 'bengali' ? 'শব্দ মেলানো! শব্দ শুনে ছবি মেলাও!' : 'Sound Match! Listen and find the picture!')
    },
    {
      id: 'rhyme-party',
      title: t('explorerRhymePartyTitle'),
      subtitle: t('explorerRhymePartyDesc'),
      emoji: '🎩',
      accentEmoji: '🎈',
      gradient: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
      borderColor: '#F472B6',
      textColor: '#BE185D',
      badgeBg: '#DB2777',
      speechPrompt: activeLanguage?.id === 'hindi'
        ? 'तुकांत खेल! क्या इनकी आवाज़ मिलती है?'
        : (activeLanguage?.id === 'bengali' ? 'ছন্দের আসর! চলো ছন্দে ছন্দে মেলাই!' : 'Rhyme Party! Do these words rhyme?')
    },
    {
      id: 'name-picture',
      title: t('explorerNamePictureTitle'),
      subtitle: t('explorerNamePictureDesc'),
      emoji: '🍎',
      accentEmoji: '🗣️',
      gradient: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
      borderColor: '#4ADE80',
      textColor: '#15803D',
      badgeBg: '#16A34A',
      speechPrompt: activeLanguage?.id === 'hindi'
        ? 'चित्र पहचानो! टैप करो और नाम सुनो!'
        : (activeLanguage?.id === 'bengali' ? 'ছবি দেখে নাম! ট্যাপ করে নাম শোনো!' : 'Name That Picture! Tap and hear the word!')
    }
  ];

  const handleTileClick = (act) => {
    playPop();
    speakText(act.speechPrompt, speechLang);
    if (onSelectActivity) {
      onSelectActivity(act.id);
    }
  };

  return (
    <div
      className="little-explorer-container"
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '1.25rem 1rem 3rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.75rem'
      }}
    >
      {/* Friendly Mascot Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '0.5rem'
        }}
      >
        <MascotMitra
          state="waving"
          size="md"
          speechText={t('explorerHomeGreeting')}
          showBubble={true}
          onSpeechClick={() => playChime(523)}
        />
      </div>

      {/* 3 Large, Colorful Activity Tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          width: '100%',
          maxWidth: '680px'
        }}
      >
        {activities.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => handleTileClick(act)}
            style={{
              background: act.gradient,
              border: `3.5px solid ${act.borderColor}`,
              borderRadius: '28px',
              padding: '1.5rem 1.25rem',
              minHeight: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)',
              transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.06)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            }}
          >
            {/* Tile Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{act.accentEmoji}</span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: act.textColor,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {act.title}
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: act.textColor,
                  opacity: 0.88,
                  lineHeight: '1.3'
                }}
              >
                {act.subtitle}
              </p>
            </div>

            {/* Giant Graphic Tap Target */}
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '22px',
                background: 'rgba(255, 255, 255, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.8rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                marginLeft: '0.75rem'
              }}
            >
              {act.emoji}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
