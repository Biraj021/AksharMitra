import React from 'react';

export default function GameWorldBackdrop() {
  return (
    <div className="game-world-backdrop" aria-hidden="true">
      {/* Floating Animated Clouds */}
      <div className="floating-cloud floating-cloud-1" />
      <div className="floating-cloud floating-cloud-2" />
      <div className="floating-cloud floating-cloud-3" />

      {/* Twinkling Magical Stardust Particles */}
      <div className="twinkle-star-particle" style={{ top: '15%', left: '8%', animationDelay: '0s' }} />
      <div className="twinkle-star-particle" style={{ top: '25%', right: '12%', animationDelay: '1.2s' }} />
      <div className="twinkle-star-particle" style={{ top: '48%', left: '18%', animationDelay: '0.6s' }} />
      <div className="twinkle-star-particle" style={{ top: '65%', right: '22%', animationDelay: '2.1s' }} />
      <div className="twinkle-star-particle" style={{ top: '82%', left: '10%', animationDelay: '1.5s' }} />
      <div className="twinkle-star-particle" style={{ top: '35%', left: '85%', animationDelay: '2.8s' }} />
      <div className="twinkle-star-particle" style={{ top: '90%', right: '10%', animationDelay: '0.9s' }} />
    </div>
  );
}
