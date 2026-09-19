import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

/**
 * Tracing definitions for letters with mirror/reversal patterns (e.g. 'b' vs 'd')
 * Coordinates normalized to 300x300 canvas
 */
const TRACING_TARGETS = [
  {
    id: 'letter_b',
    char: 'b',
    name: 'Letter b',
    instruction: "Trace the letter 'b'! Start from the top dot and go straight down, then make the belly on the right!",
    audioText: "Trace the letter b! Start at the top, draw straight down, then circle to the right!",
    // Starting point
    startPoint: { x: 90, y: 50 },
    // Key path checkpoints to detect stroke order and orientation
    downStroke: { from: { x: 90, y: 50 }, to: { x: 90, y: 240 } },
    bellyOrientation: 'right', // Correct is right side: x > 90
    guideDots: [
      { x: 90, y: 50, label: 'Start 1' },
      { x: 90, y: 140 },
      { x: 90, y: 240, label: '2' },
      { x: 130, y: 150 },
      { x: 170, y: 190 },
      { x: 130, y: 235 },
      { x: 90, y: 235, label: '3' }
    ]
  },
  {
    id: 'letter_d',
    char: 'd',
    name: 'Letter d',
    instruction: "Trace the letter 'd'! Make the round belly on the left first, then go all the way up and down!",
    audioText: "Trace the letter d! Make the round belly on the left, then draw the tall line down!",
    startPoint: { x: 210, y: 50 },
    downStroke: { from: { x: 210, y: 50 }, to: { x: 210, y: 240 } },
    bellyOrientation: 'left', // Correct is left side: x < 210
    guideDots: [
      { x: 170, y: 150, label: 'Start 1' },
      { x: 130, y: 190 },
      { x: 170, y: 235 },
      { x: 210, y: 240, label: '2' },
      { x: 210, y: 50, label: '3' },
      { x: 210, y: 140 }
    ]
  }
];

export default function LetterTracingQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const canvasRef = useRef(null);
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokePoints, setStrokePoints] = useState([]);
  const [tracingStatus, setTracingStatus] = useState('idle'); // 'idle' | 'tracing' | 'success' | 'reversal_detected'
  const [metricsCollected, setMetricsCollected] = useState([]);

  const currentTarget = TRACING_TARGETS[currentTargetIdx];

  // Speak instructions on target change
  useEffect(() => {
    speakText(currentTarget.audioText);
    resetCanvas();
  }, [currentTargetIdx]);

  // Canvas drawing & Touch setup
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setTracingStatus('tracing');
    setStrokePoints([coords]);
    playPop();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setStrokePoints((prev) => [...prev, coords]);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Glowing vibrant child brush
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.shadowColor = '#818CF8';
    ctx.shadowBlur = 8;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    evaluateStroke();
  };

  // Evaluate stroke for reversals, orientation, and completion
  const evaluateStroke = () => {
    if (strokePoints.length < 10) return;

    let isReversal = false;
    let rightSidePoints = 0;
    let leftSidePoints = 0;

    strokePoints.forEach((p) => {
      if (p.x > 150) rightSidePoints++;
      if (p.x < 150) leftSidePoints++;
    });

    // Check orientation match
    if (currentTarget.bellyOrientation === 'right' && leftSidePoints > rightSidePoints * 1.5) {
      isReversal = true; // Child drew loop on the left instead of right (d instead of b)
    } else if (currentTarget.bellyOrientation === 'left' && rightSidePoints > leftSidePoints * 1.5) {
      isReversal = true; // Child drew loop on the right instead of left (b instead of d)
    }

    const metric = {
      target: currentTarget.char,
      isReversal,
      strokePointCount: strokePoints.length,
      timestamp: Date.now()
    };

    setMetricsCollected((prev) => [...prev, metric]);

    if (isReversal) {
      setTracingStatus('reversal_detected');
      playChime(350);
      speakText("Good try! Let's watch the magic dots carefully!");
    } else {
      setTracingStatus('success');
      playStarTwinkle();
      addStars(5);

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokePoints([]);
    setTracingStatus('idle');
  };

  const handleNextTarget = () => {
    playPop();
    if (currentTargetIdx < TRACING_TARGETS.length - 1) {
      setCurrentTargetIdx(currentTargetIdx + 1);
    } else {
      // Completed all tracing targets -> proceed to next quest
      if (onCompleteQuest) {
        onCompleteQuest({
          questId: 'tracing',
          metrics: metricsCollected
        });
      }
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.75rem',
        maxWidth: '560px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: '28px'
      }}
    >
      {/* Quest Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎨</span>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1E293B' }}>Quest 1: Magic Letter Tracing</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
              Letter {currentTargetIdx + 1} of {TRACING_TARGETS.length}
            </p>
          </div>
        </div>

        <button
          onClick={() => speakText(currentTarget.audioText)}
          style={{
            background: '#EEF2FF',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4F46E5'
          }}
          title="Hear Instruction Again"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Instruction Banner */}
      <div
        style={{
          background: '#FEF3C7',
          padding: '0.65rem 1rem',
          borderRadius: '16px',
          border: '1.5px solid #FDE68A',
          marginBottom: '1.25rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#92400E'
        }}
      >
        {currentTarget.instruction}
      </div>

      {/* Canvas Tracing Arena */}
      <div
        style={{
          position: 'relative',
          width: '300px',
          height: '300px',
          margin: '0 auto 1.25rem',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '3px dashed #CBD5E1',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)',
          touchAction: 'none'
        }}
      >
        {/* Background Target Letter Watermark & Guide Dots */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <span
            style={{
              fontSize: '180px',
              fontFamily: "'Lexend', sans-serif",
              fontWeight: '700',
              color: 'rgba(226, 232, 240, 0.75)',
              lineHeight: 1
            }}
          >
            {currentTarget.char}
          </span>
        </div>

        {/* Guide Path Dots */}
        {currentTarget.guideDots.map((dot, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${dot.x}px`,
              top: `${dot.y}px`,
              transform: 'translate(-50%, -50%)',
              width: dot.label ? '22px' : '10px',
              height: dot.label ? '22px' : '10px',
              borderRadius: '50%',
              background: dot.label ? '#F59E0B' : '#94A3B8',
              border: '2px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              animation: dot.label ? 'gentle-bounce 2s infinite' : 'none'
            }}
          >
            {dot.label ? dot.label.split(' ')[1] || '1' : ''}
          </div>
        ))}

        {/* Active Drawing HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'crosshair',
            zIndex: 10
          }}
        />
      </div>

      {/* Dynamic Encouragement Feedback */}
      {tracingStatus === 'success' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            color: '#059669',
            fontWeight: '700',
            fontSize: '1.05rem',
            marginBottom: '1rem'
          }}
        >
          <CheckCircle size={20} color="#10B981" />
          <span>Wonderful job! Perfect stroke! (+5 ⭐)</span>
        </div>
      )}

      {tracingStatus === 'reversal_detected' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            color: '#B45309',
            fontWeight: '600',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}
        >
          <span>✨ Nice attempt! Notice which side the belly goes!</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={resetCanvas}
          className="btn btn-secondary btn-pill"
          style={{ gap: '0.35rem' }}
        >
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>

        <button
          onClick={handleNextTarget}
          className="btn btn-primary btn-pill"
          style={{
            gap: '0.4rem',
            background: tracingStatus === 'success' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : undefined
          }}
        >
          <span>{currentTargetIdx < TRACING_TARGETS.length - 1 ? 'Next Letter' : 'Complete Tracing Quest'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
