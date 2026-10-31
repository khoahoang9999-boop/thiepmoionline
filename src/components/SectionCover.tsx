import React, { useState } from 'react';
import { InvitationData, ThemeConfig } from '../types/invitation';
import { CountdownTimer } from './CountdownTimer';
import { WeddingBackgroundArt } from './WeddingBackgroundArt';
import { PartyBackgroundArt } from './PartyBackgroundArt';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import { Calendar, ChevronDown, Check, Clock, Heart, Sparkles } from 'lucide-react';

interface SectionCoverProps {
  invitation: InvitationData;
  theme: ThemeConfig;
  guestName: string;
}

export const SectionCover: React.FC<SectionCoverProps> = ({
  invitation,
  theme,
  guestName
}) => {
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [copiedCalendar, setCopiedCalendar] = useState(false);

  const googleCalUrl = getGoogleCalendarUrl(invitation);

  const handleAppleCal = () => {
    downloadIcsFile(invitation);
    setShowCalendarMenu(false);
  };

  const bgStyle = invitation.backgroundArtStyle || (invitation.eventType === 'wedding' ? 'botanical-roses' : 'gold-bokeh');

  return (
    <section
      id="section-cover"
      className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden"
    >
      {/* Dynamic 16:9 Art Background: Soft Cream/Beige, Gold Bokeh Lights & Minimalist Framing */}
      {bgStyle === 'gold-bokeh' ? (
        <PartyBackgroundArt goldAccentColor={theme.accentColor} />
      ) : (
        <WeddingBackgroundArt goldAccentColor={theme.accentColor} />
      )}

      {/* Top Monogram Seal */}
      <div className="relative z-10 mb-6 flex flex-col items-center">
        <div
          className="w-14 h-14 rounded-full border border-stone-300 flex items-center justify-center bg-white shadow-xs mb-3"
          style={{ borderColor: theme.accentColor }}
        >
          <Heart className="w-6 h-6 stroke-[1.2]" style={{ color: theme.accentColor }} />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-stone-500 font-sans font-medium">
          {invitation.subTitle || 'Trân Trọng Kính Báo'}
        </span>
      </div>

      {/* Main Event Title */}
      <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-luxury font-medium tracking-tight text-stone-900 max-w-2xl text-balance">
        {invitation.eventTitle}
      </h1>

      {/* Primary Hosts */}
      <div className="relative z-10 my-4">
        <h2
          className="text-3xl sm:text-5xl md:text-6xl font-script tracking-wide"
          style={{ color: theme.accentColor }}
        >
          {invitation.primaryHosts}
        </h2>
      </div>

      {/* Wedding Parents Notice if present */}
      {invitation.eventType === 'wedding' && (invitation.parentsGroom || invitation.parentsBride) && (
        <div className="relative z-10 max-w-lg mx-auto my-3 text-xs sm:text-sm text-stone-600 space-y-1">
          {invitation.parentsGroom && <p>{invitation.parentsGroom}</p>}
          {invitation.parentsBride && <p>{invitation.parentsBride}</p>}
        </div>
      )}

      {/* Personalized Guest Invitation Card */}
      <div className="relative z-10 my-6 py-3.5 px-6 rounded-2xl bg-white/90 border border-stone-200 shadow-sm max-w-md w-full">
        <p className="text-[11px] uppercase tracking-widest text-stone-500 font-medium">
          Trân Trọng Kính Mời
        </p>
        <p className="text-xl sm:text-2xl font-luxury font-semibold text-stone-900 mt-1">
          {guestName || invitation.guestNameDefault}
        </p>
        <p className="text-xs text-stone-500 mt-1">
          Tới dự bữa tiệc thân mật và chung vui cùng chúng tôi
        </p>
      </div>

      {/* Date & Time Presentation */}
      <div className="relative z-10 flex flex-col items-center gap-1.5 my-2">
        <div className="flex items-center gap-2 text-stone-800 font-medium text-base sm:text-lg">
          <Clock className="w-4 h-4 text-stone-500" />
          <span>{invitation.displayTime}</span>
        </div>
        <p className="text-lg sm:text-xl font-luxury font-semibold text-stone-900 tracking-wide">
          {invitation.displayDate}
        </p>
        {invitation.lunarDate && (
          <p className="text-xs text-stone-500 italic">
            ({invitation.lunarDate})
          </p>
        )}
      </div>

      {/* Live Countdown Clock */}
      <div className="relative z-10 w-full max-w-md">
        <CountdownTimer targetDate={invitation.targetDateTime} accentColor={theme.accentColor} />
      </div>

      {/* Add To Calendar Button */}
      <div className="relative z-10 mt-3 mb-6">
        <div className="relative inline-block text-left">
          <button
            onClick={() => setShowCalendarMenu(!showCalendarMenu)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Thêm Vào Lịch (Nhắc Hẹn)</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showCalendarMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl bg-white shadow-xl border border-stone-200 py-1.5 z-20 text-left text-xs">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-2.5 hover:bg-stone-50 text-stone-700 transition-colors"
                onClick={() => setShowCalendarMenu(false)}
              >
                📅 Thêm vào Google Calendar
              </a>
              <button
                onClick={handleAppleCal}
                className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-stone-700 transition-colors"
              >
                🍏 Tải file .iCal (Apple Calendar / Outlook)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Hint */}
      <a
        href="#section-story"
        className="relative z-10 mt-4 text-xs tracking-widest uppercase text-stone-400 hover:text-stone-700 transition-colors flex flex-col items-center gap-1"
      >
        <span>Khám Phá Chi Tiết</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  );
};
