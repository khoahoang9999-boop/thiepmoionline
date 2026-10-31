import React from 'react';

interface PartyBackgroundArtProps {
  className?: string;
  goldAccentColor?: string;
}

export const PartyBackgroundArt: React.FC<PartyBackgroundArtProps> = ({
  className = '',
  goldAccentColor = '#D4AF37'
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Soft Cream and Beige Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F2] via-[#F6EFE6] to-[#ECE2D2] opacity-95" />

      {/* Warm Ambient Illumination Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-amber-100/40 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-50/50 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] rounded-full bg-white/70 blur-2xl" />

      {/* Subtle Gold Bokeh Lights - Layered Depth */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          {/* Radial Gradients for Realistic Bokeh Orbs */}
          <radialGradient id="bokehGlow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE8A3" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#DFB76C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#DFB76C" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bokehGlow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F5D77F" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F5D77F" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bokehGlow3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDF9E" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#C59A45" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C59A45" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Large Diffused Bokeh Balls (Top & Perimeter) */}
        <circle cx="12%" cy="18%" r="65" fill="url(#bokehGlow1)" opacity="0.75" />
        <circle cx="88%" cy="16%" r="80" fill="url(#bokehGlow1)" opacity="0.7" />
        <circle cx="8%" cy="82%" r="75" fill="url(#bokehGlow3)" opacity="0.65" />
        <circle cx="92%" cy="80%" r="90" fill="url(#bokehGlow1)" opacity="0.7" />

        {/* Medium Floating Bokeh Orbs */}
        <circle cx="22%" cy="30%" r="38" fill="url(#bokehGlow2)" opacity="0.8" />
        <circle cx="78%" cy="28%" r="44" fill="url(#bokehGlow2)" opacity="0.85" />
        <circle cx="18%" cy="70%" r="35" fill="url(#bokehGlow2)" opacity="0.75" />
        <circle cx="82%" cy="68%" r="40" fill="url(#bokehGlow2)" opacity="0.8" />
        <circle cx="50%" cy="10%" r="32" fill="url(#bokehGlow3)" opacity="0.6" />
        <circle cx="50%" cy="92%" r="36" fill="url(#bokehGlow3)" opacity="0.6" />

        {/* Small Crisp Glistening Bokeh Specks */}
        <circle cx="28%" cy="15%" r="14" fill="url(#bokehGlow2)" opacity="0.9" />
        <circle cx="72%" cy="18%" r="16" fill="url(#bokehGlow2)" opacity="0.85" />
        <circle cx="15%" cy="45%" r="18" fill="url(#bokehGlow1)" opacity="0.7" />
        <circle cx="85%" cy="48%" r="20" fill="url(#bokehGlow1)" opacity="0.75" />
        <circle cx="30%" cy="85%" r="15" fill="url(#bokehGlow2)" opacity="0.85" />
        <circle cx="70%" cy="82%" r="17" fill="url(#bokehGlow2)" opacity="0.8" />

        {/* Tiny Gold Starlight Particles */}
        <circle cx="24%" cy="22%" r="3" fill="#FFFFFF" opacity="0.95" />
        <circle cx="76%" cy="25%" r="3" fill="#FFFFFF" opacity="0.95" />
        <circle cx="16%" cy="60%" r="2.5" fill="#FFEAA7" opacity="0.9" />
        <circle cx="84%" cy="58%" r="2.5" fill="#FFEAA7" opacity="0.9" />
        <circle cx="32%" cy="78%" r="2.8" fill="#FFFFFF" opacity="0.9" />
        <circle cx="68%" cy="75%" r="2.8" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {/* Elegant Minimalist Framing (Modern Double Gold Border & Notched Corners) */}
      <svg
        className="absolute inset-3 sm:inset-6 md:inset-10 w-[calc(100%-24px)] sm:w-[calc(100%-48px)] md:w-[calc(100%-80px)] h-[calc(100%-24px)] sm:h-[calc(100%-48px)] md:h-[calc(100%-80px)]"
        viewBox="0 0 1000 700"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Outer Hairline Frame */}
        <rect
          x="15"
          y="15"
          width="970"
          height="670"
          rx="24"
          stroke={goldAccentColor}
          strokeWidth="0.85"
          strokeOpacity="0.45"
        />

        {/* Inner Refined Border */}
        <rect
          x="26"
          y="26"
          width="948"
          height="648"
          rx="18"
          stroke={goldAccentColor}
          strokeWidth="0.6"
          strokeOpacity="0.3"
        />

        {/* Modern Geometric Corner Notches */}
        {/* Top-Left Corner Bracket */}
        <path d="M10,40 L10,10 L40,10" stroke={goldAccentColor} strokeWidth="1.8" strokeLinecap="square" strokeOpacity="0.75" />
        <circle cx="10" cy="10" r="2" fill={goldAccentColor} />

        {/* Top-Right Corner Bracket */}
        <path d="M960,10 L990,10 L990,40" stroke={goldAccentColor} strokeWidth="1.8" strokeLinecap="square" strokeOpacity="0.75" />
        <circle cx="990" cy="10" r="2" fill={goldAccentColor} />

        {/* Bottom-Left Corner Bracket */}
        <path d="M10,660 L10,690 L40,690" stroke={goldAccentColor} strokeWidth="1.8" strokeLinecap="square" strokeOpacity="0.75" />
        <circle cx="10" cy="690" r="2" fill={goldAccentColor} />

        {/* Bottom-Right Corner Bracket */}
        <path d="M960,690 L990,690 L990,660" stroke={goldAccentColor} strokeWidth="1.8" strokeLinecap="square" strokeOpacity="0.75" />
        <circle cx="990" cy="690" r="2" fill={goldAccentColor} />
      </svg>

      {/* Subtle fine paper texture */}
      <div className="absolute inset-0 bg-stone-900/[0.015] mix-blend-multiply" />
    </div>
  );
};
