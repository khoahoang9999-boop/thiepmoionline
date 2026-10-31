import React, { useState } from 'react';
import { InvitationData, ThemeConfig } from '../types/invitation';
import { MapPin, Navigation, Copy, Check, Car, Building2, ExternalLink } from 'lucide-react';

interface SectionVenueMapProps {
  invitation: InvitationData;
  theme: ThemeConfig;
}

export const SectionVenueMap: React.FC<SectionVenueMapProps> = ({
  invitation,
  theme
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(invitation.venueAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="section-venue" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Chapter Title */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.25em] text-stone-400 font-sans font-medium">
          Trang 3 · Địa Điểm & Bản Đồ
        </span>
        <h2 className="text-3xl sm:text-4xl font-luxury font-medium text-stone-900 mt-2 tracking-tight">
          Không Gian Tiếp Đón
        </h2>
        <div className="w-12 h-px bg-stone-300 mx-auto my-4" />
      </div>

      {/* Main Venue Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Venue Info Top Section */}
        <div className="p-6 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 text-stone-700 mb-4">
            <Building2 className="w-6 h-6 stroke-[1.5]" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-luxury font-semibold text-stone-900">
            {invitation.venueName}
          </h3>

          {invitation.venueRoom && (
            <p className="text-sm sm:text-base font-medium text-amber-900/80 mt-1">
              {invitation.venueRoom}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-stone-600 mt-3 text-sm sm:text-base max-w-xl mx-auto">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
            <span>{invitation.venueAddress}</span>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a
              href={invitation.mapExternalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: theme.accentColor }}
            >
              <Navigation className="w-4 h-4" />
              <span>Chỉ Đường Trên Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-stone-800 text-xs sm:text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors border border-stone-200"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Đã sao chép địa chỉ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>Sao Chép Địa Chỉ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Google Maps Embed Frame */}
        <div className="relative w-full h-72 sm:h-96 border-t border-b border-stone-200 bg-stone-100">
          <iframe
            title="Google Maps Location"
            src={invitation.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale-[25%] contrast-[1.05]"
          />
        </div>

        {/* Practical Venue Guidance */}
        <div className="p-6 sm:p-8 bg-stone-50/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-stone-600">
          <div className="flex items-start gap-3">
            <Car className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800">Bãi Đỗ Xe Tiện Lợi</p>
              <p className="mt-0.5 text-stone-500">
                Có bãi đỗ xe ô tô và xe máy an toàn tại tầng hầm tòa nhà. Nhân viên bảo vệ sẽ hướng dẫn quý khách khi đến nơi.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800">Lối Lên Sảnh Tiệc</p>
              <p className="mt-0.5 text-stone-500">
                Quý khách sử dụng thang máy chính tại sảnh đón để lên thẳng khu vực sảnh tiệc. Lễ tân sẵn sàng đón tiếp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
