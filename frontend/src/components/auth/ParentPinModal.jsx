import React, { useState } from 'react';
import { X, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function ParentPinModal() {
  const { showParentModal, setShowParentModal, setIsParentUnlocked, setCurrentView } = useProfile();
  const { playPop, playChime } = useAudio();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!showParentModal) return null;

  const handleClose = () => {
    playPop();
    setShowParentModal(false);
    setPin('');
    setError(false);
  };

  const handleNumberClick = (num) => {
    playPop();
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  const handleDelete = () => {
    playPop();
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const validatePin = (inputPin) => {
    // Default demo PIN: 1234
    if (inputPin === '1234') {
      playChime(659.25);
      setIsParentUnlocked(true);
      setShowParentModal(false);
      setCurrentView('dashboard');
      setPin('');
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ margin: '0 auto 1rem', width: '56px', height: '56px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
          <Lock size={28} />
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>अभिभावक / शिक्षक पोर्टल</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Enter Parent PIN to view developmental analytics <br />
          <span style={{ fontSize: '0.75rem', color: '#6366F1' }}>(Demo PIN: <strong>1234</strong>)</span>
        </p>
        <div style={{ background: '#FFFBEB', padding: '0.5rem', borderRadius: '8px', border: '1px solid #FDE68A', marginBottom: '1.25rem', fontSize: '0.75rem', color: '#92400E' }}>
          <strong>Note:</strong> This is a placeholder gate for demonstration purposes, not a real security feature. Any 4-digit PIN will unlock the dashboard.
        </div>

        {/* PIN Dot Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: error ? '2px solid #EF4444' : '2px solid #CBD5E1',
                background: pin.length > idx ? '#4F46E5' : error ? '#FEE2E2' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem' }}>
            गलत पिन! Please try PIN: 1234
          </p>
        )}

        {/* Numeric Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', maxWidth: '240px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              style={{
                height: '52px',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                background: '#F8FAFC',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1E293B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => validatePin('1234')}
            style={{
              height: '52px',
              borderRadius: '16px',
              border: 'none',
              background: '#EEF2FF',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#4F46E5',
              cursor: 'pointer'
            }}
          >
            Auto 1234
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            style={{
              height: '52px',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1E293B',
              cursor: 'pointer'
            }}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            style={{
              height: '52px',
              borderRadius: '16px',
              border: 'none',
              background: '#FEE2E2',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#EF4444',
              cursor: 'pointer'
            }}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
