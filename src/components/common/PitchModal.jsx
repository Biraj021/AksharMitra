import React from 'react';
import { X, CheckCircle, Award, Cpu, ShieldAlert, Sparkles } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function PitchModal() {
  const { showPitchModal, setShowPitchModal } = useProfile();
  const { playPop } = useAudio();

  if (!showPitchModal) return null;

  const handleClose = () => {
    playPop();
    setShowPitchModal(false);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🏆</span>
            <div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>AksharMitra — Hacksynthesis Pitch Deck</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Gamified, Script-Native Assistive Tech for Dyslexia Screening
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Value Proposition Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '16px', border: '1px solid #C7D2FE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4338CA', fontWeight: '700', marginBottom: '0.25rem' }}>
              <Sparkles size={18} />
              <span>Self-Serve Play</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>
              Child plays 3 stealth mini-games; clinical metrics are calculated silently without testing anxiety or stigma.
            </p>
          </div>

          <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: '16px', border: '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309', fontWeight: '700', marginBottom: '0.25rem' }}>
              <Cpu size={18} />
              <span>Script-Native</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>
              Tailored for Indic scripts (ब/भ, द/ध, matras) rather than translating Latin b/d research.
            </p>
          </div>

          <div style={{ background: '#D1FAE5', padding: '1rem', borderRadius: '16px', border: '1px solid #A7F3D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065F46', fontWeight: '700', marginBottom: '0.25rem' }}>
              <CheckCircle size={18} />
              <span>Offline-First PWA</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>
              Runs on shared low-end budget phones with Web Audio synthesis and zero mandatory server latency.
            </p>
          </div>
        </div>

        {/* Competitive Differentiation Matrix */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>🎯 Landscape & Competitive Gap</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem', borderBottom: '2px solid #E2E8F0' }}>Platform</th>
                  <th style={{ padding: '0.6rem', borderBottom: '2px solid #E2E8F0' }}>Target</th>
                  <th style={{ padding: '0.6rem', borderBottom: '2px solid #E2E8F0' }}>Key Limitation</th>
                  <th style={{ padding: '0.6rem', borderBottom: '2px solid #E2E8F0' }}>AksharMitra Edge</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', fontWeight: '600' }}>DALI</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0' }}>Assessment</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', color: '#DC2626' }}>Requires trained professional</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', color: '#059669', fontWeight: '600' }}>Self-administered via fun quests</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', fontWeight: '600' }}>PRASHAST</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0' }}>Govt. Checklist</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', color: '#DC2626' }}>Admin survey, not a learning app</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', color: '#059669', fontWeight: '600' }}>Integrated gamified remediation</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', fontWeight: '600' }}>DIKSHA</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0' }}>Curriculum</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', color: '#DC2626' }}>General, not dyslexia-specific</td>
                  <td style={{ padding: '0.6rem', borderBottom: '1px solid #E2E8F0', color: '#059669', fontWeight: '600' }}>Phoneme/matra confusion tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ethical Non-Diagnostic Guardrail Notice */}
        <div style={{ background: '#FFFBEB', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #FDE68A', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <ShieldAlert size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.8rem', color: '#92400E', margin: 0, lineHeight: 1.4 }}>
            <strong>Ethical Guardrail:</strong> AksharMitra does not issue clinical diagnoses. It provides low-barrier risk screening and flagged observations to empower parents, teachers, and ASHA workers to seek timely professional guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
