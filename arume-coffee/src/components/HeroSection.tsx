import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="
        relative
        w-full
        aspect-video
        md:aspect-auto
        md:h-screen
        overflow-hidden
        bg-[#0a0806]
      "
    >
      {/* VIDEO HERO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          object-center
        "
      >
        <source
          src="/videos/arume-hero.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay tipis */}
      <div
        className="
          absolute
          inset-0
          bg-black/10
          pointer-events-none
        "
      />

      {/* Gradient tipis bawah */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-b
          from-transparent
          via-transparent
          to-black/15
          pointer-events-none
        "
      />
    </section>
  );
};
