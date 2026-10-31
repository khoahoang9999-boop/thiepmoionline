import React from 'react';

interface WeddingBackgroundArtProps {
  className?: string;
  goldAccentColor?: string;
}

export const WeddingBackgroundArt: React.FC<WeddingBackgroundArtProps> = ({
  className = '',
  goldAccentColor = '#C5A880'
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Soft Romantic Ambient Lighting Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-amber-100/40 via-rose-50/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tl from-amber-100/40 via-amber-50/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-white/70 blur-2xl pointer-events-none" />

      {/* Subtle fine paper linen texture overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay">
        <filter id="linenTexture">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#linenTexture)" />
      </svg>

      {/* Elegant Arch Frame with Delicate Double Gold Line */}
      <svg
        className="absolute inset-2 sm:inset-6 md:inset-10 w-[calc(100%-16px)] sm:w-[calc(100%-48px)] md:w-[calc(100%-80px)] h-[calc(100%-16px)] sm:h-[calc(100%-48px)] md:h-[calc(100%-80px)]"
        viewBox="0 0 800 1000"
        fill="none"
        preserveAspectRatio="none"
      >
        <rect
          x="10"
          y="10"
          width="780"
          height="980"
          rx="32"
          stroke={goldAccentColor}
          strokeWidth="0.85"
          strokeOpacity="0.45"
        />
        <rect
          x="18"
          y="18"
          width="764"
          height="964"
          rx="26"
          stroke={goldAccentColor}
          strokeWidth="0.5"
          strokeDasharray="4 4"
          strokeOpacity="0.3"
        />
      </svg>

      {/* TOP-LEFT BOTANICAL & WHITE ROSE FLOURISH */}
      <div className="absolute top-0 left-0 w-44 sm:w-64 md:w-80 h-44 sm:h-64 md:h-80 opacity-90 transition-opacity">
        <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
          {/* Gold Leaf Spray Branch */}
          <path
            d="M-20,-20 Q80,40 140,110 T220,180"
            stroke={goldAccentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          {/* Gold leaves */}
          <path d="M40,20 Q65,15 70,35 Q50,45 40,20 Z" fill={goldAccentColor} fillOpacity="0.35" stroke={goldAccentColor} strokeWidth="0.8" />
          <path d="M85,55 Q115,50 120,70 Q100,85 85,55 Z" fill={goldAccentColor} fillOpacity="0.4" stroke={goldAccentColor} strokeWidth="0.8" />
          <path d="M130,95 Q165,95 165,120 Q145,130 130,95 Z" fill={goldAccentColor} fillOpacity="0.35" stroke={goldAccentColor} strokeWidth="0.8" />
          <path d="M175,145 Q210,150 205,175 Q185,180 175,145 Z" fill={goldAccentColor} fillOpacity="0.3" stroke={goldAccentColor} strokeWidth="0.8" />

          {/* Eucalyptus Leaf Branch */}
          <path
            d="M-10,30 Q40,120 110,160"
            stroke="#97998D"
            strokeWidth="0.9"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />
          <circle cx="20" cy="60" r="10" fill="#D3DAC9" fillOpacity="0.5" stroke="#878A7A" strokeWidth="0.6" />
          <circle cx="45" cy="95" r="13" fill="#D3DAC9" fillOpacity="0.55" stroke="#878A7A" strokeWidth="0.6" />
          <circle cx="75" cy="130" r="11" fill="#D3DAC9" fillOpacity="0.5" stroke="#878A7A" strokeWidth="0.6" />
          <circle cx="105" cy="155" r="9" fill="#D3DAC9" fillOpacity="0.45" stroke="#878A7A" strokeWidth="0.6" />

          {/* White Rose Illustration (Delicate Petals) */}
          <g transform="translate(45, 45)">
            {/* Outer Rose Petals */}
            <path
              d="M0,0 C-20,-15 -35,10 -25,30 C-15,50 15,50 30,35 C45,20 40,-15 20,-25 C5,-30 -10,-25 0,0 Z"
              fill="#FFFFFF"
              fillOpacity="0.92"
              stroke={goldAccentColor}
              strokeWidth="0.75"
              strokeOpacity="0.6"
            />
            {/* Middle Petals */}
            <path
              d="M-5,-5 C-15,-2 5,-20 20,-8 C30,2 18,25 0,22 C-15,20 -15,-5 -5,-5 Z"
              fill="#FBF8F3"
              stroke={goldAccentColor}
              strokeWidth="0.7"
              strokeOpacity="0.7"
            />
            {/* Center Rose Spiral */}
            <path
              d="M3,0 C-3,-6 -8,4 -1,6 C6,8 10,-2 4,-5 C0,-7 -4,-1 0,1"
              stroke={goldAccentColor}
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              strokeOpacity="0.85"
            />
          </g>

          {/* Second Smaller Blossom */}
          <g transform="translate(110, 30) scale(0.65)">
            <path
              d="M0,0 C-15,-10 -25,10 -15,25 C-5,40 20,35 25,20 C30,5 15,-15 0,0 Z"
              fill="#FFFFFF"
              fillOpacity="0.88"
              stroke={goldAccentColor}
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
            <path
              d="M2,-2 C-3,-5 -6,2 0,5 C5,6 6,-2 2,-2"
              stroke={goldAccentColor}
              strokeWidth="0.8"
              fill="none"
            />
          </g>

          {/* Floating Gold Foil Sparkles */}
          <circle cx="90" cy="115" r="2" fill={goldAccentColor} fillOpacity="0.7" />
          <circle cx="150" cy="70" r="1.5" fill={goldAccentColor} fillOpacity="0.6" />
          <circle cx="180" cy="130" r="2.2" fill={goldAccentColor} fillOpacity="0.8" />
          <circle cx="60" cy="160" r="1.8" fill={goldAccentColor} fillOpacity="0.65" />
        </svg>
      </div>

      {/* TOP-RIGHT BOTANICAL & WHITE ROSE FLOURISH */}
      <div className="absolute top-0 right-0 w-44 sm:w-64 md:w-80 h-44 sm:h-64 md:h-80 opacity-90 transition-opacity">
        <svg viewBox="0 0 300 300" fill="none" className="w-full h-full -scale-x-100">
          <path
            d="M-20,-20 Q80,40 140,110 T220,180"
            stroke={goldAccentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <path d="M40,20 Q65,15 70,35 Q50,45 40,20 Z" fill={goldAccentColor} fillOpacity="0.35" stroke={goldAccentColor} strokeWidth="0.8" />
          <path d="M85,55 Q115,50 120,70 Q100,85 85,55 Z" fill={goldAccentColor} fillOpacity="0.4" stroke={goldAccentColor} strokeWidth="0.8" />
          <path d="M130,95 Q165,95 165,120 Q145,130 130,95 Z" fill={goldAccentColor} fillOpacity="0.35" stroke={goldAccentColor} strokeWidth="0.8" />
          
          <path
            d="M-10,30 Q40,120 110,160"
            stroke="#97998D"
            strokeWidth="0.9"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />
          <circle cx="20" cy="60" r="10" fill="#D3DAC9" fillOpacity="0.5" stroke="#878A7A" strokeWidth="0.6" />
          <circle cx="45" cy="95" r="13" fill="#D3DAC9" fillOpacity="0.55" stroke="#878A7A" strokeWidth="0.6" />
          <circle cx="75" cy="130" r="11" fill="#D3DAC9" fillOpacity="0.5" stroke="#878A7A" strokeWidth="0.6" />

          <g transform="translate(50, 45)">
            <path
              d="M0,0 C-20,-15 -35,10 -25,30 C-15,50 15,50 30,35 C45,20 40,-15 20,-25 C5,-30 -10,-25 0,0 Z"
              fill="#FFFFFF"
              fillOpacity="0.92"
              stroke={goldAccentColor}
              strokeWidth="0.75"
              strokeOpacity="0.6"
            />
            <path
              d="M-5,-5 C-15,-2 5,-20 20,-8 C30,2 18,25 0,22 C-15,20 -15,-5 -5,-5 Z"
              fill="#FBF8F3"
              stroke={goldAccentColor}
              strokeWidth="0.7"
              strokeOpacity="0.7"
            />
            <path
              d="M3,0 C-3,-6 -8,4 -1,6 C6,8 10,-2 4,-5 C0,-7 -4,-1 0,1"
              stroke={goldAccentColor}
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              strokeOpacity="0.85"
            />
          </g>

          <circle cx="100" cy="120" r="2" fill={goldAccentColor} fillOpacity="0.75" />
          <circle cx="160" cy="80" r="1.5" fill={goldAccentColor} fillOpacity="0.6" />
        </svg>
      </div>

      {/* BOTTOM-LEFT BOTANICAL FLOURISH */}
      <div className="absolute bottom-0 left-0 w-44 sm:w-60 md:w-72 h-44 sm:h-60 md:h-72 opacity-90 transition-opacity">
        <svg viewBox="0 0 300 300" fill="none" className="w-full h-full -scale-y-100">
          <path
            d="M-20,-20 Q80,40 140,110 T200,160"
            stroke={goldAccentColor}
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          <path d="M50,25 Q75,20 80,40 Q60,50 50,25 Z" fill={goldAccentColor} fillOpacity="0.35" stroke={goldAccentColor} strokeWidth="0.8" />
          <path d="M100,65 Q130,60 135,80 Q115,95 100,65 Z" fill={goldAccentColor} fillOpacity="0.4" stroke={goldAccentColor} strokeWidth="0.8" />

          <g transform="translate(45, 45)">
            <path
              d="M0,0 C-20,-15 -35,10 -25,30 C-15,50 15,50 30,35 C45,20 40,-15 20,-25 C5,-30 -10,-25 0,0 Z"
              fill="#FFFFFF"
              fillOpacity="0.92"
              stroke={goldAccentColor}
              strokeWidth="0.75"
              strokeOpacity="0.6"
            />
            <path
              d="M3,0 C-3,-6 -8,4 -1,6 C6,8 10,-2 4,-5 C0,-7 -4,-1 0,1"
              stroke={goldAccentColor}
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              strokeOpacity="0.8"
            />
          </g>
          <circle cx="130" cy="90" r="2" fill={goldAccentColor} fillOpacity="0.7" />
        </svg>
      </div>

      {/* BOTTOM-RIGHT BOTANICAL FLOURISH */}
      <div className="absolute bottom-0 right-0 w-44 sm:w-60 md:w-72 h-44 sm:h-60 md:h-72 opacity-90 transition-opacity">
        <svg viewBox="0 0 300 300" fill="none" className="w-full h-full -scale-x-100 -scale-y-100">
          <path
            d="M-20,-20 Q80,40 140,110 T200,160"
            stroke={goldAccentColor}
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          <path d="M50,25 Q75,20 80,40 Q60,50 50,25 Z" fill={goldAccentColor} fillOpacity="0.35" stroke={goldAccentColor} strokeWidth="0.8" />
          <path d="M100,65 Q130,60 135,80 Q115,95 100,65 Z" fill={goldAccentColor} fillOpacity="0.4" stroke={goldAccentColor} strokeWidth="0.8" />

          <g transform="translate(45, 45)">
            <path
              d="M0,0 C-20,-15 -35,10 -25,30 C-15,50 15,50 30,35 C45,20 40,-15 20,-25 C5,-30 -10,-25 0,0 Z"
              fill="#FFFFFF"
              fillOpacity="0.92"
              stroke={goldAccentColor}
              strokeWidth="0.75"
              strokeOpacity="0.6"
            />
            <path
              d="M3,0 C-3,-6 -8,4 -1,6 C6,8 10,-2 4,-5 C0,-7 -4,-1 0,1"
              stroke={goldAccentColor}
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              strokeOpacity="0.8"
            />
          </g>
          <circle cx="130" cy="90" r="2" fill={goldAccentColor} fillOpacity="0.7" />
        </svg>
      </div>
    </div>
  );
};
