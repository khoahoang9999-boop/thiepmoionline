import React from 'react';
import { Volume2, VolumeX, Sparkles, SlidersHorizontal, ArrowUp } from 'lucide-react';

interface FloatingMusicPetalBarProps {
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  isPetalsActive: boolean;
  onTogglePetals: () => void;
  onOpenStudio: () => void;
}

export const FloatingMusicPetalBar: React.FC<FloatingMusicPetalBarProps> = ({
  isPlayingMusic,
  onToggleMusic,
  isPetalsActive,
  onTogglePetals,
  onOpenStudio
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      {/* Audio Play/Pause Button */}
      <button
        onClick={onToggleMusic}
        title={isPlayingMusic ? 'Tắt nhạc nền' : 'Bật nhạc nền lãng mạn'}
        className={`p-3 rounded-full shadow-lg border transition-all ${
          isPlayingMusic
            ? 'bg-amber-800 text-white border-amber-900 animate-pulse'
            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
        }`}
      >
        {isPlayingMusic ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>

      {/* Petals Toggle */}
      <button
        onClick={onTogglePetals}
        title={isPetalsActive ? 'Tắt cánh hoa rơi' : 'Bật cánh hoa rơi'}
        className={`p-3 rounded-full shadow-lg border transition-all ${
          isPetalsActive
            ? 'bg-rose-100 text-rose-700 border-rose-300'
            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
        }`}
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        title="Lên đầu trang"
        className="p-3 rounded-full bg-white text-stone-700 border border-stone-200 shadow-lg hover:bg-stone-50 transition-colors hidden sm:flex items-center justify-center"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Open Designer Studio CTA */}
      <button
        onClick={onOpenStudio}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-stone-900 text-white text-xs font-medium shadow-xl hover:bg-stone-800 transition-all hover:scale-105"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">Studio & Tư Vấn UX/UI</span>
      </button>
    </div>
  );
};
