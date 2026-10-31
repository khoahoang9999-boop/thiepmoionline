import React, { useState } from 'react';
import { WeddingData, SideType, getAdjustedImageStyle } from '../../types/wedding';
import { DEFAULT_WEDDING_DATA } from '../../data/weddingDefault';
import { MiniCalendarWidget } from './MiniCalendarWidget';
import { WeddingPhotoGallery } from './WeddingPhotoGallery';
import { CountdownTimer } from '../CountdownTimer';
import { formatVietnameseLunarDate, formatVietnameseSolarDate } from '../../utils/lunarCalendar';
import { normalizeRelativeAssetUrl } from '../../utils/shareLinkCodec';
import { 
  Heart, 
  Navigation, 
  Copy, 
  Check, 
  Users
} from 'lucide-react';

interface WeddingPreviewProps {
  data: WeddingData;
  activeSide: SideType;
  onChangeSide: (side: SideType) => void;
  guestName?: string;
  onOpenMusicModal?: () => void;
}

export const WeddingPreview: React.FC<WeddingPreviewProps> = ({
  data,
  activeSide
}) => {
  const [copiedAddr, setCopiedAddr] = useState(false);

  const isGroomSide = activeSide === 'groom';
  const partyInfo =
    (isGroomSide ? data?.partyGroom : data?.partyBride) ||
    (isGroomSide ? DEFAULT_WEDDING_DATA.partyGroom : DEFAULT_WEDDING_DATA.partyBride);

  const ceremonyInfo =
    (isGroomSide ? (data?.ceremonyGroom || data?.ceremony) : (data?.ceremonyBride || data?.ceremony)) ||
    (isGroomSide ? DEFAULT_WEDDING_DATA.ceremonyGroom : DEFAULT_WEDDING_DATA.ceremonyBride);

  // Unified announcement text
  const announcement = data?.announcementText || 'TRÂN TRỌNG BÁO TIN LỄ VỀ CHUNG MỘT NHÀ CỦA CON CHÚNG TÔI';
  // Thiệp Nhà Trai -> Chú Rể & Nhà Trai lên trước; Thiệp Nhà Gái -> Cô Dâu & Nhà Gái lên trước
  const isBrideFirst = activeSide === 'bride';

  // Dynamic party date parsing
  const partyDateObj = partyInfo?.date ? new Date(partyInfo.date + 'T00:00:00') : new Date('2026-11-29T00:00:00');
  const partyDay = partyDateObj.getDate() || 29;
  const partyMonth = partyDateObj.getMonth() + 1 || 11;
  const partyYear = partyDateObj.getFullYear() || 2026;
  const dayOfWeekNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const partyDayOfWeek = dayOfWeekNames[partyDateObj.getDay()] || 'Chủ Nhật';
  const partyLunarDateStr = formatVietnameseLunarDate(partyInfo?.date || '2026-11-29', true);
  const ceremonyLunarDateStr = formatVietnameseLunarDate(ceremonyInfo?.date || '2026-11-29', true);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(partyInfo?.venueAddress || '');
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2200);
  };

  const normalizedHeroPhoto = normalizeRelativeAssetUrl(data.heroPhotoUrl);

  return (
    <div className="w-full min-h-screen bg-[#F7F4EE] text-stone-900 font-serif flex flex-col items-center py-6 px-3 sm:px-6">
      
      {/* Main Wedding Invitation Card Wrapper (Burgundy / Maroon Luxury Theme) */}
      <div className="w-full max-w-[440px] bg-[#FAF8F5] shadow-2xl rounded-3xl border border-stone-200 overflow-hidden relative pb-12">
        
        {/* Architectural sketch watermark background */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#58181E_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* 1. TOP HEADER: SAVE THE DATE */}
        <div className="text-center pt-10 pb-4 px-6 relative z-10">
          <p className="text-xs uppercase tracking-[0.3em] font-sans font-semibold text-[#8C3A42]">
            {data.introText || 'SAVE THE DATE'}
          </p>
        </div>

        {/* 2. ENVELOPE WITH COUPLE PHOTO CARD (Ảnh Đầu Thiếp) */}
        {data.showHeroPhoto && (
          <div className="relative mx-auto my-4 w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Burgundy Envelope Back Flap Graphic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 300 260" className="w-full h-full drop-shadow-md">
                <path d="M15,60 L150,150 L285,60 L285,245 L15,245 Z" fill="#58181E" />
                <path d="M15,60 L150,5 L285,60 Z" fill="#461217" opacity="0.9" />
              </svg>
            </div>

            {/* Couple Photo Card Peeking Out */}
            <div className="relative z-20 w-52 sm:w-56 aspect-[310/360] rounded-xl overflow-hidden bg-white p-2 shadow-xl -translate-y-4 rotate-[-1.5deg] border border-stone-200">
              <div className="w-full h-full rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center relative">
                {normalizedHeroPhoto ? (
                  <img
                    src={normalizedHeroPhoto}
                    alt="Ảnh cưới cô dâu chú rể"
                    style={getAdjustedImageStyle(data.heroPhotoPosition)}
                    decoding="async"
                    onError={(e) => {
                      if (DEFAULT_WEDDING_DATA.heroPhotoUrl && e.currentTarget.src !== DEFAULT_WEDDING_DATA.heroPhotoUrl) {
                        e.currentTarget.src = DEFAULT_WEDDING_DATA.heroPhotoUrl;
                      }
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-stone-400">
                    <Users className="w-8 h-8 mx-auto mb-1 stroke-1" />
                    <span className="text-[10px] font-sans">Chưa có ảnh đầu thiệp</span>
                  </div>
                )}
              </div>
            </div>

            {/* Wax Seal with Heart Emblem on Envelope Flap */}
            <div className="absolute bottom-6 z-30 w-12 h-12 rounded-full bg-gradient-to-br from-[#DFB76C] to-[#9E732B] shadow-lg flex items-center justify-center border border-amber-200">
              <Heart className="w-5 h-5 text-white fill-white/80" />
            </div>
          </div>
        )}

        {/* 3. COUPLE NAMES HEADLINE (Ordered by data.displayOrder) */}
        <div className="text-center my-6 px-4">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#461217] font-medium tracking-tight">
            {!isBrideFirst ? (
              <>
                <span>{data.groomShortName || data.groomName}</span>
                <span className="block font-script text-2xl text-[#8C3A42] my-0.5">&amp;</span>
                <span>{data.brideShortName || data.brideName}</span>
              </>
            ) : (
              <>
                <span>{data.brideShortName || data.brideName}</span>
                <span className="block font-script text-2xl text-[#8C3A42] my-0.5">&amp;</span>
                <span>{data.groomShortName || data.groomName}</span>
              </>
            )}
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] font-sans text-stone-500 mt-2">
            Hân Hoan Báo Hỷ
          </p>
        </div>

        {/* 4. MAROON CARD 1: THÔNG TIN LỄ CƯỚI & GIA ĐÌNH */}
        <div className="relative mx-4 my-6 p-6 sm:p-7 rounded-3xl bg-[#52161B] text-[#FAF5EF] shadow-xl overflow-hidden border border-[#7A2830]">
          {/* Gold Rose Flourish on the right side */}
          <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 300" className="w-full h-full" fill="none">
              <path d="M50,20 Q80,60 90,120 T60,200 Q40,240 80,280" stroke="#DFB76C" strokeWidth="1.5" strokeOpacity="0.7" />
              <circle cx="70" cy="50" r="14" fill="#6B1D2F" stroke="#DFB76C" strokeWidth="1" />
              <circle cx="80" cy="130" r="16" fill="#6B1D2F" stroke="#DFB76C" strokeWidth="1" />
              <circle cx="65" cy="220" r="14" fill="#6B1D2F" stroke="#DFB76C" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10 text-center">
            {/* Header Title (Shared) */}
            <h3 className="text-sm sm:text-base font-serif font-bold tracking-[0.15em] text-[#DFB76C] uppercase mb-5">
              {(data.ceremony?.title || ceremonyInfo.title || 'THÔNG TIN LỄ VỀ CHUNG MỘT NHÀ').normalize('NFC')}
            </h3>

            {/* FAMILY INFORMATION: NHÀ TRAI & NHÀ GÁI (Ordered by data.displayOrder) */}
            {data.showFamily && (
              <div className="grid grid-cols-2 gap-3 text-center border-b border-[#73222A] pb-5 mb-5 text-[11px] sm:text-xs">
                {/* Column 1 */}
                {!isBrideFirst ? (
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-[#DFB76C] font-semibold mb-1">
                      {data.groomFamily.title || 'Nhà Trai'}
                    </p>
                    <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                      {(data.groomFamily.fatherName || 'Phùng Văn Vượng').normalize('NFC')}
                    </p>
                    {data.groomFamily.motherName && (
                      <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                        {data.groomFamily.motherName.normalize('NFC')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-[#DFB76C] font-semibold mb-1">
                      {data.brideFamily.title || 'Nhà Gái'}
                    </p>
                    <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                      {(data.brideFamily.fatherName || 'Hoàng Hiếu Luân').normalize('NFC')}
                    </p>
                    <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                      {(data.brideFamily.motherName || 'Nguyễn Thị Phánh').normalize('NFC')}
                    </p>
                  </div>
                )}

                {/* Column 2 */}
                {!isBrideFirst ? (
                  <div className="min-w-0 space-y-0.5 border-l border-[#73222A]/60 pl-2">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-[#DFB76C] font-semibold mb-1">
                      {data.brideFamily.title || 'Nhà Gái'}
                    </p>
                    <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                      {(data.brideFamily.fatherName || 'Hoàng Hiếu Luân').normalize('NFC')}
                    </p>
                    <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                      {(data.brideFamily.motherName || 'Nguyễn Thị Phánh').normalize('NFC')}
                    </p>
                  </div>
                ) : (
                  <div className="min-w-0 space-y-0.5 border-l border-[#73222A]/60 pl-2">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-[#DFB76C] font-semibold mb-1">
                      {data.groomFamily.title || 'Nhà Trai'}
                    </p>
                    <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                      {(data.groomFamily.fatherName || 'Phùng Văn Vượng').normalize('NFC')}
                    </p>
                    {data.groomFamily.motherName && (
                      <p className="text-stone-200 font-bold whitespace-nowrap overflow-visible">
                        {data.groomFamily.motherName.normalize('NFC')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ANNOUNCEMENT TEXT — Prominent Gold/Crimson */}
            {data.showAnnouncement && (
              <div className="my-5 space-y-1.5">
                <div className="flex items-center justify-center gap-2.5">
                  <span className="h-[1px] w-7 bg-[#DFB76C]/60" />
                  <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-[#DFB76C] font-serif font-extrabold">
                    TRÂN TRỌNG BÁO TIN
                  </p>
                  <span className="h-[1px] w-7 bg-[#DFB76C]/60" />
                </div>
                <p className="text-[11px] uppercase tracking-widest text-white font-sans font-semibold">
                  {announcement.replace(/^TRÂN TRỌNG BÁO TIN\s*/i, '') || 'DỰ LỄ VỀ CHUNG MỘT NHÀ CỦA CON CHÚNG TÔI'}
                </p>
              </div>
            )}

            {/* BRIDE & GROOM FULL NAMES WITH ROLES - STRICTLY 1 SINGLE LINE */}
            <div className="space-y-4 my-6">
              {!isBrideFirst ? (
                <>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-normal whitespace-nowrap overflow-visible px-2 text-center">
                      {(data.groomName || 'Phùng Văn Hưng').normalize('NFC')}
                    </h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#DFB76C] font-sans font-medium mt-0.5">
                      {data.groomRole || 'TRƯỞNG NAM'}
                    </p>
                  </div>
                  <div className="font-script text-2xl text-[#DFB76C] leading-none">&amp;</div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-normal whitespace-nowrap overflow-visible px-2 text-center">
                      {(data.brideName || 'Hoàng Minh Tuệ').normalize('NFC')}
                    </h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#DFB76C] font-sans font-medium mt-0.5">
                      {data.brideRole || 'ÚT NỮ'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-normal whitespace-nowrap overflow-visible px-2 text-center">
                      {(data.brideName || 'Hoàng Minh Tuệ').normalize('NFC')}
                    </h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#DFB76C] font-sans font-medium mt-0.5">
                      {data.brideRole || 'ÚT NỮ'}
                    </p>
                  </div>
                  <div className="font-script text-2xl text-[#DFB76C] leading-none">&amp;</div>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-normal whitespace-nowrap overflow-visible px-2 text-center">
                      {(data.groomName || 'Phùng Văn Hưng').normalize('NFC')}
                    </h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#DFB76C] font-sans font-medium mt-0.5">
                      {data.groomRole || 'TRƯỞNG NAM'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Ceremony at home address if enabled */}
            {ceremonyInfo.enabled && ceremonyInfo.address && (
              <div className="pt-3 border-t border-[#73222A] text-[11px] text-[#DFCCA8] space-y-0.5">
                <div>Lễ cưới cử hành vào lúc {ceremonyInfo.time} ngày {formatVietnameseSolarDate(ceremonyInfo.date)} tại {ceremonyInfo.address}</div>
                {ceremonyLunarDateStr && (
                  <div className="text-[10px] text-[#DFCCA8]/80 italic">{ceremonyLunarDateStr}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. MAROON CARD 2: THÔNG TIN TIỆC CƯỚI & LỊCH MINI */}
        {partyInfo?.enabled && (
          <div className="relative mx-4 my-6 p-6 sm:p-7 rounded-3xl bg-[#52161B] text-[#FAF5EF] shadow-xl overflow-hidden border border-[#7A2830]">
            <div className="relative z-10 text-center">
              <h3 className="text-sm sm:text-base font-serif font-bold tracking-[0.15em] text-[#DFB76C] uppercase mb-3">
                {data.partyGroom?.title || partyInfo.title || 'THÔNG TIN TIỆC CƯỚI'}
              </h3>

              <p className="text-xs uppercase tracking-wider text-stone-200 font-sans mb-3">
                Tiệc sẽ diễn ra vào lúc:
              </p>

              {/* Day & Date Highlight */}
              <div className="my-3">
                <div className="text-xs uppercase tracking-widest text-[#DFB76C] font-sans font-semibold">
                  {partyDayOfWeek}
                </div>
                <div className="flex items-center justify-center gap-3 my-1">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-white leading-none">
                    {partyDay}
                  </span>
                  <div className="text-left text-xs uppercase tracking-wider leading-tight text-stone-200 font-sans">
                    <div>Tháng {partyMonth}</div>
                    <div>{partyYear}</div>
                  </div>
                </div>
                {partyLunarDateStr && (
                  <div className="text-xs font-serif text-[#DFCCA8] mt-1">
                    {partyLunarDateStr}
                  </div>
                )}
              </div>

              {/* Time Details */}
              <div className="my-4 py-2 px-4 rounded-xl bg-black/20 text-xs font-sans inline-block">
                <span>{partyInfo.time}</span>
                {partyInfo.showWelcomeDiningTimes && (
                  <span className="text-stone-300">
                    {' · '}Đón khách: {partyInfo.welcomeTime} · Khai tiệc: {partyInfo.diningTime}
                  </span>
                )}
              </div>

              {/* MINI CALENDAR WIDGET */}
              <MiniCalendarWidget dateStr={partyInfo.date} />

              {/* Live Countdown Timer */}
              {partyInfo.showCountdown && (
                <div className="my-4">
                  <CountdownTimer targetDate={`${partyInfo.date}T${partyInfo.time}:00`} accentColor="#DFB76C" />
                </div>
              )}

              {/* Button: Add to Calendar */}
              <div className="flex flex-col gap-2.5 mt-5 max-w-xs mx-auto">
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Tiệc Cưới ${data.groomShortName} & ${data.brideShortName}`)}&dates=20261122T030000Z/20261122T070000Z&location=${encodeURIComponent(partyInfo.venueAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-sans text-[#DFCCA8] hover:text-white underline transition-colors"
                >
                  Thêm vào lịch hẹn
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 6. VENUE & GOOGLE MAPS SECTION */}
        <div className="mx-4 my-6 p-6 rounded-3xl bg-white border border-stone-200 text-center shadow-xs">
          <p className="text-[11px] uppercase tracking-widest text-[#8C3A42] font-sans font-semibold mb-1">
            {partyInfo.venueHeader || 'Tiệc cưới sẽ tổ chức tại'}
          </p>
          <h4 className="text-xl font-serif font-bold text-stone-900">
            {partyInfo.venueName}
          </h4>
          {partyInfo.venueRoom && (
            <p className="text-xs font-sans text-stone-600 font-medium mt-0.5">
              {partyInfo.venueRoom}
            </p>
          )}
          <p className="text-xs text-stone-500 font-sans mt-2 leading-relaxed">
            {partyInfo.venueAddress}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 font-sans text-xs">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${partyInfo.mapCoordinates.lat},${partyInfo.mapCoordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-full bg-[#58181E] text-white font-medium flex items-center gap-1.5 shadow-xs hover:bg-[#461217] transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ đường Google Maps</span>
            </a>

            <button
              onClick={handleCopyAddress}
              className="py-2.5 px-4 rounded-full bg-stone-100 text-stone-700 font-medium border border-stone-300 flex items-center gap-1.5 hover:bg-stone-200 transition-colors"
            >
              {copiedAddr ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép địa chỉ</span>
                </>
              )}
            </button>
          </div>

          {/* Google Maps iFrame */}
          {partyInfo.showMap && (
            <div className="mt-5 rounded-2xl overflow-hidden border border-stone-200 h-60 bg-stone-100">
              <iframe
                title="Bản đồ chỉ đường"
                src={partyInfo.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* 7. ALBUM ẢNH CƯỚI (GALLERY) */}
        {data.showGallery && data.galleryPhotos.length > 0 && (
          <div className="my-8 px-4 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8C3A42] font-sans font-semibold">
              Kỷ Niệm Đẹp
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1 mb-2">
              Album Ảnh Cưới
            </h3>
            <div className="w-10 h-0.5 bg-[#8C3A42] mx-auto mb-4" />

            <WeddingPhotoGallery
              photos={data.galleryPhotos}
              type={data.galleryType}
              autoPlay={data.autoPlay3dGallery !== false}
            />
          </div>
        )}

        {/* 8. LỜI CẢM ƠN (THANK YOU NOTE NỔI BẬT, CỠ CHỮ LỚN) */}
        {data.showThankYou && (
          <div className="mx-4 my-8 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FDF5E6] border-2 border-[#D4AF37]/70 px-5 py-6 text-center shadow-md space-y-2.5">
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1.5px] w-10 bg-[#8C3A42]/50 rounded-full" />
              <span className="text-[#8C3A42] text-base leading-none">❦</span>
              <span className="h-[1.5px] w-10 bg-[#8C3A42]/50 rounded-full" />
            </div>
            <p className="text-base sm:text-lg md:text-xl font-serif font-bold italic text-[#58181E] leading-relaxed">
              "{(data.thankYouText || 'Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!').normalize('NFC')}"
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
