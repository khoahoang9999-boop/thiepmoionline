import React, { useState, useEffect } from 'react';
import { WeddingData, SideType, getAdjustedImageStyle, getGroomAvatarPosition, getBrideAvatarPosition } from '../../types/wedding';
import { DEFAULT_WEDDING_DATA } from '../../data/weddingDefault';
import { WeddingPhotoGallery } from './WeddingPhotoGallery';
import { formatVietnameseLunarDate, formatVietnameseSolarDate } from '../../utils/lunarCalendar';
import { normalizeRelativeAssetUrl } from '../../utils/shareLinkCodec';
import { Navigation, User } from 'lucide-react';

interface ImperialDragonCardProps {
  data: WeddingData;
  activeSide: SideType;
  onChangeSide: (side: SideType) => void;
  guestName?: string;
}

export const ImperialDragonCard: React.FC<ImperialDragonCardProps> = ({
  data,
  activeSide
}) => {
  // Thiệp Nhà Trai (groom) -> Chú Rể & Nhà Trai lên trước
  // Thiệp Nhà Gái (bride) -> Cô Dâu & Nhà Gái lên trước
  const isGroom = activeSide === 'groom';
  const isBrideFirst = activeSide === 'bride';

  const partyInfo =
    (isGroom ? data?.partyGroom : data?.partyBride) ||
    (isGroom ? DEFAULT_WEDDING_DATA.partyGroom : DEFAULT_WEDDING_DATA.partyBride);

  const ceremonyInfo =
    (isGroom ? (data?.ceremonyGroom || data?.ceremony) : (data?.ceremonyBride || data?.ceremony)) ||
    (isGroom ? DEFAULT_WEDDING_DATA.ceremonyGroom : DEFAULT_WEDDING_DATA.ceremonyBride);

  // Real-time Countdown calculation for party date & time
  const targetDateStr = `${partyInfo?.date || '2026-11-29'}T${partyInfo?.time || '16:00'}:00`;
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDateStr).getTime() - new Date().getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  // Dynamic party date parsing
  const partyDateObj = partyInfo?.date ? new Date(partyInfo.date + 'T00:00:00') : new Date('2026-11-29T00:00:00');
  const partyDay = partyDateObj.getDate() || 29;
  const partyMonth = partyDateObj.getMonth() + 1 || 11;
  const partyYear = partyDateObj.getFullYear() || 2026;
  const dayOfWeekNames = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
  const partyDayOfWeek = dayOfWeekNames[partyDateObj.getDay()] || 'CHỦ NHẬT';

  // Automatic Lunar Date string: "(Tức ngày 21 tháng 10 năm Bính Ngọ)"
  const partyLunarDateStr = formatVietnameseLunarDate(partyInfo?.date || '2026-11-29', true);
  const ceremonyLunarDateStr = formatVietnameseLunarDate(ceremonyInfo?.date || '2026-11-29', true);

  // Mini Calendar generation for the party's month & year
  const daysInMonth = new Date(partyYear, partyMonth, 0).getDate();
  const firstDayIndex = (new Date(partyYear, partyMonth - 1, 1).getDay() + 6) % 7; // Mon = 0, Sun = 6
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${partyInfo.mapCoordinates.lat},${partyInfo.mapCoordinates.lng}`;

  const partyTypeLabel =
    partyInfo.partyType === 'reception'
      ? 'TIỆC BÁO HỶ'
      : partyInfo.partyType === 'engagement'
      ? 'TIỆC ĐÍNH HÔN'
      : 'TIỆC CƯỚI';

  const firstShortName = isBrideFirst
    ? (data.brideShortName || 'Minh Tuệ')
    : (data.groomShortName || 'Quang Hưng');
  const secondShortName = isBrideFirst
    ? (data.groomShortName || 'Quang Hưng')
    : (data.brideShortName || 'Minh Tuệ');

  const normalizedHeroPhoto = normalizeRelativeAssetUrl(data.heroPhotoUrl);

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#F4F1E8] text-[#1C3766] font-serif shadow-2xl relative overflow-hidden select-none border-x border-stone-300">
      
      {/* ================= SECTION 1: HEADER WITH DRAGON BROCADE & AVATARS ================= */}
      <header className="relative w-full pb-2">
        {/* Navy Blue Dragon Pattern Top Banner */}
        <div className="w-full h-24 sm:h-32 bg-[#1C3766] relative overflow-hidden flex items-center justify-center">
          {/* Dragon Jacquard Vector Simulation */}
          <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 800 200">
            <path
              d="M0,100 C150,20 250,180 400,100 C550,20 650,180 800,100 L800,0 L0,0 Z"
              fill="#2A4B82"
            />
            <circle cx="100" cy="50" r="30" fill="none" stroke="#E5C378" strokeWidth="2" strokeDasharray="4 6" opacity="0.6" />
            <circle cx="300" cy="60" r="45" fill="none" stroke="#E5C378" strokeWidth="2" strokeDasharray="4 6" opacity="0.6" />
            <circle cx="500" cy="50" r="35" fill="none" stroke="#E5C378" strokeWidth="2" strokeDasharray="4 6" opacity="0.6" />
            <circle cx="700" cy="60" r="40" fill="none" stroke="#E5C378" strokeWidth="2" strokeDasharray="4 6" opacity="0.6" />
          </svg>
        </div>

        {/* Cream Spacer between Top Banner and Song Hỷ Ribbon */}
        <div className="w-full h-6 sm:h-8 bg-[#F4F1E8]" />

        {/* Song Hỷ Ribbon + 2 Circular Avatars (Ordered by activeSide: Nhà Trai -> Chú Rể trước; Nhà Gái -> Cô Dâu trước) */}
        <div className="relative w-full">
          {/* Navy Horizontal Stripe positioned behind the middle of the circular avatars */}
          <div className="absolute left-0 right-0 top-5 sm:top-6 h-14 sm:h-16 bg-[#1C3766] flex items-center justify-center z-10">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E5C378_1px,transparent_1px)] [background-size:12px_12px]" />
          </div>

          {/* 3-Column Grid: [ Left Avatar ] - [ Center 囍 ] - [ Right Avatar ] */}
          {(() => {
            const person1Name = firstShortName;
            const person1Avatar = normalizeRelativeAssetUrl(isBrideFirst ? data.brideAvatarUrl : data.groomAvatarUrl);
            const person1Fallback = isBrideFirst ? DEFAULT_WEDDING_DATA.brideAvatarUrl : DEFAULT_WEDDING_DATA.groomAvatarUrl;
            const person1Adj = isBrideFirst ? getBrideAvatarPosition(data, activeSide) : getGroomAvatarPosition(data, activeSide);

            const person2Name = secondShortName;
            const person2Avatar = normalizeRelativeAssetUrl(isBrideFirst ? data.groomAvatarUrl : data.brideAvatarUrl);
            const person2Fallback = isBrideFirst ? DEFAULT_WEDDING_DATA.groomAvatarUrl : DEFAULT_WEDDING_DATA.brideAvatarUrl;
            const person2Adj = isBrideFirst ? getGroomAvatarPosition(data, activeSide) : getBrideAvatarPosition(data, activeSide);

            return (
              <div className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-start gap-1.5 sm:gap-4 px-2.5 sm:px-8">
                {/* Left Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3.5px] border-white shadow-lg bg-white relative flex items-center justify-center">
                    {person1Avatar ? (
                      <img
                        src={person1Avatar}
                        alt={person1Name}
                        style={getAdjustedImageStyle(person1Adj)}
                        decoding="async"
                        onError={(e) => {
                          if (person1Fallback && e.currentTarget.src !== person1Fallback) {
                            e.currentTarget.src = person1Fallback;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-300 p-2 text-center">
                        <User className="w-8 h-8 stroke-1" />
                        <span className="text-[9px] font-sans text-stone-400 mt-0.5">Ảnh đại diện</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-base sm:text-xl font-serif font-extrabold text-[#0F2A56] mt-2.5 whitespace-nowrap">
                    {person1Name.normalize('NFC')}
                  </h2>
                </div>

                {/* Center Song Hỷ (囍) — Always clearly visible on the navy stripe */}
                <div className="h-24 sm:h-28 flex items-center justify-center px-1.5 sm:px-3">
                  <div className="text-2xl sm:text-4xl font-serif font-bold text-[#F5DFAC] drop-shadow-md select-none leading-none">
                    囍
                  </div>
                </div>

                {/* Right Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3.5px] border-white shadow-lg bg-white relative flex items-center justify-center">
                    {person2Avatar ? (
                      <img
                        src={person2Avatar}
                        alt={person2Name}
                        style={getAdjustedImageStyle(person2Adj)}
                        decoding="async"
                        onError={(e) => {
                          if (person2Fallback && e.currentTarget.src !== person2Fallback) {
                            e.currentTarget.src = person2Fallback;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-300 p-2 text-center">
                        <User className="w-8 h-8 stroke-1" />
                        <span className="text-[9px] font-sans text-stone-400 mt-0.5">Ảnh đại diện</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-base sm:text-xl font-serif font-extrabold text-[#0F2A56] mt-2.5 whitespace-nowrap">
                    {person2Name.normalize('NFC')}
                  </h2>
                </div>
              </div>
            );
          })()}
        </div>
      </header>

      {/* Ảnh đầu thiệp (Hiển thị đúng tỉ lệ khung điều chỉnh 310:360 để lấy được trọn vẹn ảnh) */}
      {data.showHeroPhoto && normalizedHeroPhoto && (
        <section className="px-4 sm:px-8 pt-4">
          <div className="rounded-2xl overflow-hidden border-2 border-[#1C3766]/20 shadow-lg bg-white max-w-[340px] sm:max-w-[380px] mx-auto">
            <div className="w-full aspect-[310/360] overflow-hidden relative flex items-center justify-center bg-stone-50">
              <img
                src={normalizedHeroPhoto}
                alt="Ảnh đầu thiệp cưới"
                style={getAdjustedImageStyle(data.heroPhotoPosition)}
                decoding="async"
                onError={(e) => {
                  if (DEFAULT_WEDDING_DATA.heroPhotoUrl && e.currentTarget.src !== DEFAULT_WEDDING_DATA.heroPhotoUrl) {
                    e.currentTarget.src = DEFAULT_WEDDING_DATA.heroPhotoUrl;
                  }
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION 2: THÔNG TIN LỄ VỀ CHUNG MỘT NHÀ ================= */}
      <section className="mt-8">
        {/* Blue Banner Header (Shared Title) */}
        <div className="w-full bg-[#1C3766] py-2.5 px-4 text-center shadow-xs">
          <h3 className="text-sm sm:text-base font-serif font-bold tracking-normal text-[#F5DFAC] uppercase">
            {(data.ceremony?.title || ceremonyInfo.title || 'THÔNG TIN LỄ VỀ CHUNG MỘT NHÀ').normalize('NFC')}
          </h3>
        </div>

        <div className="p-6 sm:p-8 text-center relative">
          {/* Dragon Watermark in Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="w-80 h-80">
              <circle cx="200" cy="200" r="180" fill="none" stroke="#1C3766" strokeWidth="4" strokeDasharray="10 15" />
            </svg>
          </div>

          {/* Two Family Columns (Ordered automatically by activeSide: Nhà Trai -> Nhà Trai bên trái; Nhà Gái -> Nhà Gái bên trái) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10 text-xs sm:text-sm">
            {isBrideFirst ? (
              // Thiệp Nhà Gái -> Nhà Gái đứng cột bên trái (trước)
              <div className="space-y-1 min-w-0">
                <p className="font-serif font-bold text-[#B91C1C] uppercase tracking-wider text-[11px] sm:text-xs">
                  {data.brideFamily.title || 'Ông Bà'} (Nhà Gái)
                </p>
                <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                  {(data.brideFamily.fatherName || 'Hoàng Hiếu Luân').normalize('NFC')}
                </p>
                {data.brideFamily.motherName && (
                  <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                    {data.brideFamily.motherName.normalize('NFC')}
                  </p>
                )}
                <p className="text-xs text-[#1C3766] font-medium pt-1 leading-snug">
                  {data.brideFamily.address}
                </p>
              </div>
            ) : (
              // Thiệp Nhà Trai -> Nhà Trai đứng cột bên trái (trước)
              <div className="space-y-1 min-w-0">
                <p className="font-serif font-bold text-[#B91C1C] uppercase tracking-wider text-[11px] sm:text-xs">
                  {data.groomFamily.title || 'Ông Bà'} (Nhà Trai)
                </p>
                <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                  {(data.groomFamily.fatherName || 'Phùng Văn Vượng').normalize('NFC')}
                </p>
                {data.groomFamily.motherName && (
                  <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                    {data.groomFamily.motherName.normalize('NFC')}
                  </p>
                )}
                <p className="text-xs text-[#1C3766] font-medium pt-1 leading-snug">
                  {data.groomFamily.address}
                </p>
              </div>
            )}

            {/* Column 2 */}
            <div className="border-l border-[#1C3766]/25 pl-3 sm:pl-4 space-y-1 min-w-0">
              {isBrideFirst ? (
                // Thiệp Nhà Gái -> Nhà Trai đứng cột bên phải (sau)
                <>
                  <p className="font-serif font-bold text-[#B91C1C] uppercase tracking-wider text-[11px] sm:text-xs">
                    {data.groomFamily.title || 'Ông Bà'} (Nhà Trai)
                  </p>
                  <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                    {(data.groomFamily.fatherName || 'Phùng Văn Vượng').normalize('NFC')}
                  </p>
                  {data.groomFamily.motherName && (
                    <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                      {data.groomFamily.motherName.normalize('NFC')}
                    </p>
                  )}
                  <p className="text-xs text-[#1C3766] font-medium pt-1 leading-snug">
                    {data.groomFamily.address}
                  </p>
                </>
              ) : (
                // Thiệp Nhà Trai -> Nhà Gái đứng cột bên phải (sau)
                <>
                  <p className="font-serif font-bold text-[#B91C1C] uppercase tracking-wider text-[11px] sm:text-xs">
                    {data.brideFamily.title || 'Ông Bà'} (Nhà Gái)
                  </p>
                  <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                    {(data.brideFamily.fatherName || 'Hoàng Hiếu Luân').normalize('NFC')}
                  </p>
                  {data.brideFamily.motherName && (
                    <p className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#0F2A56] whitespace-nowrap overflow-visible">
                      {data.brideFamily.motherName.normalize('NFC')}
                    </p>
                  )}
                  <p className="text-xs text-[#1C3766] font-medium pt-1 leading-snug">
                    {data.brideFamily.address}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Announcement Message — Prominent Crimson "TRÂN TRỌNG BÁO TIN" */}
          <div className="my-8 relative z-10 space-y-2">
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1.5px] w-8 sm:w-12 bg-[#B91C1C]/60 rounded-full" />
              <p className="text-sm sm:text-base tracking-[0.22em] font-serif uppercase text-[#B91C1C] font-extrabold drop-shadow-2xs">
                TRÂN TRỌNG BÁO TIN
              </p>
              <span className="h-[1.5px] w-8 sm:w-12 bg-[#B91C1C]/60 rounded-full" />
            </div>
            <p className="text-xs sm:text-sm tracking-normal font-serif uppercase text-[#0F2A56] font-extrabold">
              {((data.announcementText || 'DỰ LỄ VỀ CHUNG MỘT NHÀ CỦA CON CHÚNG TÔI')
                .replace(/^TRÂN TRỌNG BÁO TIN\s*/i, '') || 'DỰ LỄ VỀ CHUNG MỘT NHÀ CỦA CON CHÚNG TÔI').normalize('NFC')}
            </p>
          </div>

          {/* Big Names Presentation - STRICTLY 1 SINGLE LINE (Ordered by activeSide: Nhà Trai -> Chú Rể trên; Nhà Gái -> Cô Dâu trên) */}
          <div className="space-y-3 relative z-10 my-6">
            {isBrideFirst ? (
              <>
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-[#991B1B] tracking-normal whitespace-nowrap overflow-visible px-2 text-center drop-shadow-2xs">
                  {(data.brideName || 'Hoàng Minh Tuệ').normalize('NFC')}
                </h4>
                <div className="font-serif italic font-bold text-2xl sm:text-3xl text-[#D97706]">&amp;</div>
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-[#0F2A56] tracking-normal whitespace-nowrap overflow-visible px-2 text-center drop-shadow-2xs">
                  {(data.groomName || 'Phùng Văn Hưng').normalize('NFC')}
                </h4>
              </>
            ) : (
              <>
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-[#0F2A56] tracking-normal whitespace-nowrap overflow-visible px-2 text-center drop-shadow-2xs">
                  {(data.groomName || 'Phùng Văn Hưng').normalize('NFC')}
                </h4>
                <div className="font-serif italic font-bold text-2xl sm:text-3xl text-[#D97706]">&amp;</div>
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-[#991B1B] tracking-normal whitespace-nowrap overflow-visible px-2 text-center drop-shadow-2xs">
                  {(data.brideName || 'Hoàng Minh Tuệ').normalize('NFC')}
                </h4>
              </>
            )}
          </div>

          {/* Ceremony time and address if enabled */}
          {ceremonyInfo.enabled && ceremonyInfo.address && (
            <div className="pt-3.5 border-t border-[#1C3766]/20 text-xs sm:text-sm font-serif text-[#0F2A56] font-semibold italic max-w-md mx-auto space-y-1">
              <div>
                Lễ cử hành vào lúc <strong className="text-[#B91C1C] font-extrabold">{ceremonyInfo.time}</strong> ngày <strong className="text-[#B91C1C] font-extrabold">{formatVietnameseSolarDate(ceremonyInfo.date)}</strong> tại <span className="font-bold">{ceremonyInfo.address}</span>
              </div>
              {ceremonyLunarDateStr && (
                <div className="text-xs text-[#9A3412] font-bold">
                  {ceremonyLunarDateStr}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================= SECTION 3: ALBUM ẢNH CƯỚI ================= */}
      {data.showGallery && data.galleryPhotos && data.galleryPhotos.length > 0 && (
        <section className="my-4">
          <div className="w-full bg-[#1C3766] py-2.5 px-4 text-center shadow-xs">
            <h3 className="text-sm sm:text-base font-serif font-bold tracking-wider text-[#F5DFAC] uppercase">
              {'ALBUM ẢNH'.normalize('NFC')}
            </h3>
          </div>

          <div className="p-4 sm:p-6">
            <WeddingPhotoGallery
              photos={data.galleryPhotos}
              type={data.galleryType || '3d'}
              autoPlay={data.autoPlay3dGallery !== false}
            />
          </div>
        </section>
      )}

      {/* ================= SECTION 4: THÔNG TIN TIỆC VỀ CHUNG NHÀ ================= */}
      <section className="my-4">
        <div className="w-full bg-[#1C3766] py-2.5 px-4 text-center shadow-xs">
          <h3 className="text-sm sm:text-base font-serif font-bold tracking-normal text-[#F5DFAC] uppercase">
            {(data.partyGroom?.title || partyInfo.title || 'THÔNG TIN TIỆC VỀ CHUNG NHÀ').normalize('NFC')}
          </h3>
        </div>

        <div className="p-6 sm:p-8 text-center space-y-3">
          <p className="text-sm sm:text-base uppercase tracking-wide text-[#0F2A56] font-serif font-extrabold">
            {partyTypeLabel} SẼ DIỄN RA VÀO LÚC:
          </p>

          <div className="text-3xl sm:text-4xl font-serif font-extrabold text-[#B91C1C]">
            {partyInfo.time}
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base font-serif font-bold text-[#0F2A56] py-1">
            <span className="uppercase">{partyDayOfWeek}</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-[#B91C1C] px-3.5 sm:px-5 border-x-2 border-[#1C3766]/40 leading-none">
              {partyDay}
            </span>
            <span className="uppercase">THÁNG {partyMonth}</span>
          </div>

          <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#0F2A56]">
            {partyYear}
          </div>

          {/* TỰ ĐỘNG HIỂN THỊ LỊCH ÂM NỔI BẬT */}
          {partyLunarDateStr && (
            <div className="text-xs sm:text-sm font-serif font-bold text-[#9A3412] pt-0.5">
              {partyLunarDateStr}
            </div>
          )}

          {partyInfo.showWelcomeDiningTimes && (
            <div className="pt-2">
              <div className="text-xs font-sans uppercase tracking-wider text-[#B91C1C] font-bold">
                KHAI TIỆC
              </div>
              <div className="text-lg font-serif font-extrabold text-[#0F2A56]">
                {partyInfo.diningTime || '16:30'}
              </div>
            </div>
          )}

          {/* CÙNG ĐẾM NGƯỢC */}
          {partyInfo.showCountdown && (
            <div className="my-5 pt-2">
              <p className="text-xs font-serif uppercase tracking-[0.2em] text-[#0F2A56] font-extrabold">
                CÙNG ĐẾM NGƯỢC
              </p>
              <p className="text-base sm:text-lg font-serif font-extrabold text-[#B91C1C] mt-1">
                {timeLeft.days} ngày {timeLeft.hours} giờ {timeLeft.minutes} phút {timeLeft.seconds} giây
              </p>
            </div>
          )}

          {/* MINI CALENDAR THÁNG / NĂM WITH RED HEART BADGE */}
          <div className="w-full max-w-[320px] mx-auto bg-white/70 rounded-2xl p-4 border-2 border-[#1C3766]/30 shadow-xs my-4 select-none">
            <div className="text-center font-serif text-sm sm:text-base font-extrabold text-[#0F2A56] mb-2">
              Tháng {partyMonth} / {partyYear}
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#B91C1C] pb-1 border-b border-stone-300">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>
            <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs mt-2 font-serif text-[#0F2A56] font-semibold">
              {calendarCells.map((d, i) => {
                if (d === null) return <div key={i} className="h-7" />;
                const isSelected = d === partyDay;
                return (
                  <div key={i} className="h-7 flex items-center justify-center">
                    {isSelected ? (
                      <div className="relative flex items-center justify-center w-7 h-7">
                        {/* Red Heart Shape */}
                        <svg viewBox="0 0 24 24" fill="#DC2626" className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-xs">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="absolute text-[10px] sm:text-[11px] font-bold text-white font-sans leading-none pt-0.5">
                          {d}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold">{d}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Link: Thêm vào lịch */}
          <div className="pt-2 max-w-xs mx-auto">
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Tiệc cưới ${firstShortName} & ${secondShortName}`)}&location=${encodeURIComponent(partyInfo.venueAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs sm:text-sm font-serif font-bold text-[#B91C1C] underline hover:opacity-80 block"
            >
              + Thêm vào lịch hẹn
            </a>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: ĐỊA ĐIỂM & BẢN ĐỒ GOOGLE MAPS ================= */}
      <section className="my-4">
        {/* Banner with host's house name */}
        <div className="w-full bg-[#1C3766] py-2.5 px-4 text-center shadow-xs">
          <h3 className="text-xs sm:text-sm font-serif font-bold tracking-normal text-[#F5DFAC] uppercase px-2">
            {(partyInfo.venueHeader || (isGroom
              ? 'TIỆC SẼ TỔ CHỨC TẠI NHÀ ÔNG BÀ PHÙNG VĂN VƯỢNG'
              : 'TIỆC SẼ TỔ CHỨC TẠI NHÀ ÔNG BÀ HOÀNG HIẾU LUÂN')).normalize('NFC')}
          </h3>
        </div>

        <div className="p-6 text-center space-y-4">
          <p className="text-sm sm:text-base font-serif text-[#0F2A56] font-bold leading-relaxed max-w-md mx-auto px-2">
            {(partyInfo.venueAddress || (!isGroom
              ? 'Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang'
              : 'Số nhà 10, Đường số 4, thôn Đằng Xã, xã Hoằng Hóa, tỉnh Thanh Hóa')).normalize('NFC')}
          </p>

          {/* Embedded Google Maps with real pin */}
          <div className="rounded-2xl overflow-hidden border border-stone-300 h-72 sm:h-80 shadow-inner bg-stone-100 relative">
            <iframe
              key={`${partyInfo.mapCoordinates.lat}-${partyInfo.mapCoordinates.lng}`}
              title="Bản đồ vị trí tổ chức tiệc"
              src={partyInfo.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Button: Chỉ đường */}
          <div className="pt-2">
            <a
              href={googleDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-7 py-3 rounded-full bg-[#B91C1C] text-white text-xs sm:text-sm font-sans font-bold hover:bg-[#991B1B] shadow-md transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Chỉ đường Google Maps</span>
            </a>
          </div>

          {/* LỜI CẢM ƠN NỔI BẬT, CỠ CHỮ LỚN */}
          {data.showThankYou && (
            <div className="mt-6 mb-2 mx-auto max-w-lg rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FDF5E6] border-2 border-[#D4AF37]/70 px-5 py-6 shadow-md space-y-2.5">
              <div className="flex items-center justify-center gap-3">
                <span className="h-[1.5px] w-10 sm:w-14 bg-[#B91C1C]/50 rounded-full" />
                <span className="text-[#B91C1C] text-base leading-none">❦</span>
                <span className="h-[1.5px] w-10 sm:w-14 bg-[#B91C1C]/50 rounded-full" />
              </div>
              <p className="text-base sm:text-lg md:text-xl font-serif font-bold italic text-[#991B1B] leading-relaxed px-2">
                "{(data.thankYouText || 'Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!').normalize('NFC')}"
              </p>
              <div className="flex items-center justify-center gap-3 pt-0.5">
                <span className="h-[1px] w-16 bg-[#D4AF37]/70 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Navy Blue Dragon Brocade Pattern Border */}
      <footer className="w-full h-20 bg-[#1C3766] relative overflow-hidden flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full opacity-30 -scale-y-100" preserveAspectRatio="none" viewBox="0 0 800 200">
          <path d="M0,100 C150,20 250,180 400,100 C550,20 650,180 800,100 L800,0 L0,0 Z" fill="#2A4B82" />
        </svg>
        <span className="relative z-10 text-xs font-sans font-bold text-[#F5DFAC] tracking-widest uppercase">
          {firstShortName} &amp; {secondShortName} · {partyDay}.{partyMonth}.{partyYear}
        </span>
      </footer>

    </div>
  );
};
