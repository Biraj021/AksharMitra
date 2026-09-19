import React from 'react';
import { Volume2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';

/**
 * Animated Mitra Mascot with reactive expressions:
 * 'waving' | 'talking' | 'celebrating' | 'curious' | 'idle'
 */
export default function MascotMitra({
  state = 'waving',
  speechText = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  showBubble = true,
  onSpeechClick
}) {
  const { speakText, playPop } = useAudio();
  const { activeLanguage } = useProfile();

  const handleSpeak = () => {
    playPop();
    if (speechText) {
      const speechLang = activeLanguage?.id === 'bengali' ? 'bn-IN' : 'en-US';
      speakText(speechText, speechLang);
    }
    if (onSpeechClick) onSpeechClick();
  };

  const sizeClasses = {
    sm: { width: 90, height: 90 },
    md: { width: 140, height: 140 },
    lg: { width: 200, height: 200 }
  }[size] || { width: 140, height: 140 };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>
      {/* Mascot Animated Body */}
      <div
        className={`mascot-container ${state === 'celebrating' ? 'animate-float' : ''}`}
        style={{
          width: sizeClasses.width,
          height: sizeClasses.height,
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0
        }}
        onClick={handleSpeak}
        title="Click to hear Mitra speak!"
      >
        <svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(99, 102, 241, 0.2))' }}
        >
          {/* Outer Glow Halo */}
          <circle cx="100" cy="100" r="90" fill="url(#mitraHalo)" opacity="0.4" />

          {/* Ears / Antennae with Twinkling Stars */}
          <circle cx="50" cy="55" r="22" fill="#F59E0B" />
          <circle cx="50" cy="55" r="14" fill="#FEF3C7" />
          <circle cx="150" cy="55" r="22" fill="#F59E0B" />
          <circle cx="150" cy="55" r="14" fill="#FEF3C7" />

          {/* Main Friendly Head / Body */}
          <rect
            x="35"
            y="45"
            width="130"
            height="120"
            rx="45"
            fill="url(#mitraBody)"
            stroke="#4338CA"
            strokeWidth="4"
          />

          {/* Cheerful Blush Cheeks */}
          <ellipse cx="60" cy="115" rx="14" ry="8" fill="#F43F5E" opacity="0.45" />
          <ellipse cx="140" cy="115" rx="14" ry="8" fill="#F43F5E" opacity="0.45" />

          {/* Big Wonder-Filled Eyes */}
          <g>
            <ellipse cx="72" cy="92" rx="13" ry="16" fill="#1E293B" />
            <circle cx="76" cy="86" r="5" fill="#FFFFFF" />
            <circle cx="70" cy="98" r="2" fill="#FFFFFF" />

            <ellipse cx="128" cy="92" rx="13" ry="16" fill="#1E293B" />
            <circle cx="132" cy="86" r="5" fill="#FFFFFF" />
            <circle cx="126" cy="98" r="2" fill="#FFFFFF" />
          </g>

          {/* Friendly Eyebrows */}
          <path
            d="M 60 72 Q 72 65 84 72"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 116 72 Q 128 65 140 72"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Smile / Talking Mouth */}
          {state === 'talking' ? (
            <ellipse cx="100" cy="120" rx="16" ry="12" fill="#BE123C" className="animate-wiggle" />
          ) : (
            <path
              d="M 82 114 Q 100 134 118 114"
              stroke="#BE123C"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="#F43F5E"
            />
          )}

          {/* Magic Badge on Forehead / Chest */}
          <circle cx="100" cy="52" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
          <text
            x="100"
            y="57"
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            fill="#D97706"
            fontFamily="Fredoka, sans-serif"
          >
            {activeLanguage?.id === 'bengali' ? 'অ' : 'M'}
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="mitraBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <radialGradient id="mitraHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Floating Twinkle Star */}
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            fontSize: '1.4rem',
            animation: 'gentle-bounce 2s infinite ease-in-out'
          }}
        >
          ✨
        </span>
      </div>

      {/* Speech Bubble */}
      {showBubble && speechText && (
        <div
          className="glass-card speech-bubble"
          onClick={handleSpeak}
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '20px',
            position: 'relative',
            maxWidth: '340px',
            background: 'white',
            border: '2px solid #E0E7FF',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Arrow Pointer */}
          <div
            style={{
              position: 'absolute',
              left: '-10px',
              top: '50%',
              transform: 'translateY(-50%) rotate(45deg)',
              width: '16px',
              height: '16px',
              background: 'white',
              borderLeft: '2px solid #E0E7FF',
              borderBottom: '2px solid #E0E7FF'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <p
              style={{
                fontSize: '1.05rem',
                fontWeight: '600',
                color: '#1E293B',
                lineHeight: 1.4,
                margin: 0
              }}
            >
              {speechText}
            </p>
            <button
              style={{
                background: '#EEF2FF',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4F46E5',
                flexShrink: 0
              }}
              title="Click to Listen"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
