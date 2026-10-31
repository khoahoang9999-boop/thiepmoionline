import React, { useState } from 'react';
import { InvitationData, ThemeConfig } from '../types/invitation';
import { acousticAudio } from '../utils/audioPlayer';
import confetti from 'canvas-confetti';
import { Mail, Sparkles, Volume2 } from 'lucide-react';

interface EnvelopeModalProps {
  invitation: InvitationData;
  theme: ThemeConfig;
  isOpen: boolean;
  onOpenInvitation: () => void;
  guestName: string;
}

export const EnvelopeModal: React.FC<EnvelopeModalProps> = ({
  invitation,
  theme,
  isOpen,
  onOpenInvitation,
  guestName
}) => {
  const [isOpening, setIsOpening] = useState(false);

  if (!isOpen) return null;

  const handleOpen = () => {
    setIsOpening(true);
    // Start ambient acoustic chord music
    try {
      acousticAudio.play();
    } catch (e) {
      console.warn('Audio play error', e);
    }

    // Sparkle burst
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#D4AF37', '#FAF8F5', '#F9CBD3', '#B26B79']
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      onOpenInvitation();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md transition-opacity duration-500">
      <div
        className={`relative w-full max-w-lg mx-auto bg-gradient-to-b from-[#FBF9F6] to-[#F5EFE6] rounded-2xl p-6 sm:p-10 shadow-2xl border border-amber-200/50 text-center transition-all duration-700 ${
          isOpening ? 'scale-95 opacity-0 -translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Envelope Floral Top Ribbon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center shadow-xs">
            <Mail className="w-8 h-8 text-amber-800/80 stroke-[1.5]" />
          </div>
        </div>

        {/* Personalized guest badge */}
        <div className="inline-block py-1 px-4 mb-3 rounded-full bg-amber-100/60 border border-amber-200/60 text-xs tracking-wider text-amber-900 font-medium">
          THIỆP MỜI TRỰC TUYẾN
        </div>

        <h1 className="text-2xl sm:text-3xl font-luxury font-medium text-stone-900 tracking-tight mb-2">
          {invitation.eventTitle}
        </h1>

        <p className="text-base sm:text-lg font-script text-amber-900/80 mb-4">
          {invitation.primaryHosts}
        </p>

        <div className="my-6 p-4 rounded-xl bg-white/70 border border-amber-200/40">
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-1">
            Trân trọng kính mời
          </p>
          <p className="text-lg sm:text-xl font-medium text-stone-800">
            {guestName || invitation.guestNameDefault}
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Đến chung vui cùng chúng tôi vào {invitation.displayDate}
          </p>
        </div>

        {/* Wax Seal Click Button */}
        <div className="flex flex-col items-center justify-center gap-3">
          <button
            onClick={handleOpen}
            className="group relative flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: theme.accentColor }}
          >
            {/* Simulated Wax Seal Emblem */}
            <span className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <span className="tracking-wide text-sm font-medium">
              Chạm Để Mở Thiệp Mời
            </span>
          </button>

          <p className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
            <span>Kèm giai điệu âm nhạc lãng mạn du dương</span>
          </p>
        </div>
      </div>
    </div>
  );
};
