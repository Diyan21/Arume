import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
    >
      {/* VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/videos/arume-hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay tipis */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Gradient bawah biar transisi ke section berikutnya halus */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
      </div>
    </section>
  );
};
