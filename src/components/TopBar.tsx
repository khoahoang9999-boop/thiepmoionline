import React from 'react';
import { InvitationData, ThemeConfig } from '../types/invitation';
import { SlidersHorizontal } from 'lucide-react';

interface TopBarProps {
  invitation: InvitationData;
  theme: ThemeConfig;
  onOpenStudio: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  invitation,
  theme,
  onOpenStudio
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (one line, display face) */}
        <a
          href="#section-cover"
          className="text-base sm:text-lg font-luxury font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          {invitation.primaryHosts}
        </a>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-600">
          <a
            href="#section-cover"
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
          >
            Bìa Thiệp
          </a>
          <a
            href="#section-story"
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
          >
            Lịch Trình
          </a>
          <a
            href="#section-venue"
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
          >
            Bản Đồ
          </a>
          <a
            href="#section-rsvp"
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
          >
            Xác Nhận RSVP
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenStudio}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tư Vấn UX/UI & Đổi Mẫu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
