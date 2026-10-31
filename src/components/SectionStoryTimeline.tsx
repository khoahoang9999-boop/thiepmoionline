import React from 'react';
import { InvitationData, ThemeConfig } from '../types/invitation';
import { Sparkles, Utensils, Music, GlassWater, Award, Camera, HeartHandshake } from 'lucide-react';

interface SectionStoryTimelineProps {
  invitation: InvitationData;
  theme: ThemeConfig;
}

export const SectionStoryTimeline: React.FC<SectionStoryTimelineProps> = ({
  invitation,
  theme
}) => {
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <GlassWater className="w-4 h-4" />;
      case 'ceremony':
        return <HeartHandshake className="w-4 h-4" />;
      case 'feast':
        return <Utensils className="w-4 h-4" />;
      case 'speech':
        return <Award className="w-4 h-4" />;
      case 'photo':
        return <Camera className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  return (
    <section id="section-story" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Editorial Chapter Header */}
      <div className="text-center mb-14">
        <span className="text-xs uppercase tracking-[0.25em] text-stone-400 font-sans font-medium">
          Trang 2 · Khoảnh Khắc & Lịch Trình
        </span>
        <h2 className="text-3xl sm:text-4xl font-luxury font-medium text-stone-900 mt-2 tracking-tight">
          {invitation.storyTitle}
        </h2>
        <div className="w-12 h-px bg-stone-300 mx-auto my-4" />
      </div>

      {/* Quote Banner */}
      {invitation.quote && (
        <div className="max-w-2xl mx-auto mb-12 text-center px-4">
          <blockquote className="text-lg sm:text-xl font-luxury italic text-stone-700 leading-relaxed">
            {invitation.quote}
          </blockquote>
        </div>
      )}

      {/* Story Content with Editorial Drop Cap */}
      <div className="max-w-2xl mx-auto mb-16 p-6 sm:p-8 rounded-2xl bg-white/70 border border-stone-200/80 shadow-xs">
        <p className="text-stone-700 leading-relaxed text-sm sm:text-base first-letter:text-4xl first-letter:font-luxury first-letter:font-semibold first-letter:float-left first-letter:mr-2.5 first-letter:text-stone-900">
          {invitation.welcomeMessage}
        </p>
        {invitation.storyBody && (
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base mt-4">
            {invitation.storyBody}
          </p>
        )}
      </div>

      {/* Detailed Program Timeline */}
      <div className="my-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-luxury font-medium text-stone-900">
            Lịch Trình Chi Tiết
          </h3>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
            Chương Trình Diễn Ra Trong Buổi Tiệc
          </p>
        </div>

        <div className="relative border-l border-stone-300 ml-4 sm:ml-32 md:ml-48 space-y-8 pb-4">
          {invitation.timeline.map((item, index) => (
            <div key={item.id || index} className="relative pl-6 sm:pl-8 group">
              {/* Bullet Node */}
              <div
                className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-stone-700 shadow-xs transition-transform group-hover:scale-110"
                style={{ borderColor: theme.accentColor }}
              >
                {getTimelineIcon(item.iconType)}
              </div>

              {/* Time Marker - On desktop positioned to the left */}
              <div className="sm:absolute sm:-left-36 md:-left-44 top-0.5 text-xs sm:text-sm font-semibold tracking-wider font-mono text-stone-800">
                {item.time}
              </div>

              {/* Card info */}
              <div className="bg-white rounded-xl p-4 border border-stone-200/70 shadow-xs group-hover:border-stone-300 transition-colors">
                <h4 className="text-base sm:text-lg font-luxury font-semibold text-stone-900">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dress Code Section */}
      <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone-500 font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>{invitation.dressCodeTitle}</span>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 mb-6">
          {invitation.dressCodeNote}
        </p>

        {/* Color Palette Swatches */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {invitation.dressCodeColors.map((color, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-stone-300 shadow-inner transition-transform hover:scale-105"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[11px] font-medium text-stone-700">
                {color.name}
              </span>
              <span className="text-[10px] font-mono text-stone-400 uppercase">
                {color.hex}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
