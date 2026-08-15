import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="
        relative
        w-full
        h-[75svh]
        md:h-screen
        overflow-hidden
        bg-[#0a0806]
      "
    >
      {/* VIDEO HERO */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="
            w-full
            h-full
            object-contain
            object-center
            md:object-cover
          "
        >
          <source
            src="/videos/arume-hero.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* OVERLAY TIPIS */}
      <div className="absolute inset-0 z-[1] bg-black/10 pointer-events-none" />

      {/* GRADIENT BAWAH */}
      <div
        className="
          absolute
          inset-0
          z-[1]
          bg-gradient-to-b
          from-transparent
          via-transparent
          to-black/20
          pointer-events-none
        "
      />
    </section>
  );
};
