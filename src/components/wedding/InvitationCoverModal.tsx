import React, { useState, useEffect, useRef } from 'react';
import { WeddingData, SideType, CardOpeningStyle } from '../../types/wedding';
import { DEFAULT_WEDDING_DATA, COVER_BACKGROUNDS } from '../../data/weddingDefault';
import { acousticAudio } from '../../utils/audioPlayer';
import { normalizeRelativeAssetUrl } from '../../utils/shareLinkCodec';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

interface InvitationCoverModalProps {
  data: WeddingData;
  activeSide: SideType;
  guestName?: string;
  isOpen: boolean;
  onOpenCard: () => void;
  onMusicStarted?: () => void;
  onSelectCoverBg?: (url: string) => void;
  embedded?: boolean;
  autoPlayAnimation?: boolean;
}

type CoverPhase = 'closed' | 'opening' | 'screen-revealed' | 'fading' | 'done';

export const InvitationCoverModal: React.FC<InvitationCoverModalProps> = ({
  data,
  activeSide,
  guestName,
  isOpen,
  onOpenCard,
  onMusicStarted,
  embedded = false
}) => {
  // 3-Phase cinematic automated journey:
  // 1. 'closed' -> closed envelope/doors/curtains/scroll (400ms)
  // 2. 'opening' -> slowly, gently swings open like a window (3000ms)
  // 3. 'screen-revealed' -> reveals the luxury background screen with couple names & date (1800ms)
  // 4. 'fading' -> smooth crossfade dissolve into the main card (1200ms)
  // 5. 'done' -> finished, invokes onOpenCard()
  const [phase, setPhase] = useState<CoverPhase>('closed');
  const timerSequenceRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const openingStyle: CardOpeningStyle = data.cardOpeningStyle || 'default';

  // Thiệp Nhà Trai -> Chú Rể lên trước; Thiệp Nhà Gái -> Cô Dâu lên trước
  const isGroom = activeSide === 'groom';
  const partyInfo =
    (isGroom ? data?.partyGroom : data?.partyBride) ||
    (isGroom ? DEFAULT_WEDDING_DATA.partyGroom : DEFAULT_WEDDING_DATA.partyBride);

  const partyDateObj = partyInfo?.date
    ? new Date(partyInfo.date + 'T00:00:00')
    : new Date('2026-11-29T00:00:00');
  const partyDay = partyDateObj.getDate() || 29;
  const partyMonth = partyDateObj.getMonth() + 1 || 11;
  const partyYear = partyDateObj.getFullYear() || 2026;

  const firstShortName = isGroom
    ? (data.groomShortName || 'Quang Hưng')
    : (data.brideShortName || 'Minh Tuệ');
  const secondShortName = isGroom
    ? (data.brideShortName || 'Minh Tuệ')
    : (data.groomShortName || 'Quang Hưng');

  const activeBgUrl = normalizeRelativeAssetUrl(data.coverBackgroundUrl || COVER_BACKGROUNDS[0].url) || COVER_BACKGROUNDS[0].url;
  const hasBuiltInTopSeal = activeBgUrl.includes('36ff6f2f');

  const clearAllTimers = () => {
    timerSequenceRef.current.forEach((t) => clearTimeout(t));
    timerSequenceRef.current = [];
  };

  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => acousticAudio.getIsPlaying());

  useEffect(() => {
    const unsub = acousticAudio.subscribe((playing) => {
      setIsMusicPlaying(playing);
      if (playing && onMusicStarted) {
        onMusicStarted();
      }
    });
    return unsub;
  }, [onMusicStarted]);

  const handleSkipOrFastForward = () => {
    clearAllTimers();
    setPhase('fading');
    setTimeout(() => {
      setPhase('done');
      onOpenCard();
    }, 400);
  };

  const handleContainerTouch = () => {
    if (!embedded && !acousticAudio.getIsPlaying()) {
      acousticAudio.play();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
      setPhase('closed');
      return;
    }

    clearAllTimers();
    setPhase('closed');

    // BẮT ĐẦU PHÁT NHẠC NGAY LẬP TỨC KHI VÀO LINK / GIAO DIỆN MỞ THIỆP
    if (!embedded) {
      try {
        acousticAudio.setTrack(data.selectedMusicId || 'acoustic-romance', data.customAudioUrl);
        acousticAudio.play();
      } catch {
        // ignore autoplay policy
      }
    }

    // TỰ ĐỘNG CHẠY TOÀN BỘ QUY TRÌNH - KHÔNG CẦN BẤM NÚT MỞ THIỆP
    // Bước 1: Giữ bìa thiệp trong 450ms để khách chiêm ngưỡng
    const t1 = setTimeout(() => {
      setPhase('opening');

      // Ngay khi hiệu ứng mở thiệp bắt đầu bật ra: kích hoạt phát nhạc
      if (!embedded) {
        acousticAudio.play();

        try {
          confetti({
            particleCount: 45,
            spread: 75,
            origin: { y: 0.65 },
            colors: ['#EAD298', '#D4AF37', '#FFF8E7', '#C59A45', '#FF6B8B']
          });
        } catch {
          // ignore
        }
      }

      // Bước 2: Hiệu ứng từ từ mở ra chậm rãi trong 3000ms (3 giây thư thái)
      // Hé lộ trọn vẹn Giao diện Ảnh Nền Màn Hình Chào Đón
      const t2 = setTimeout(() => {
        setPhase('screen-revealed');

        // Bước 3: Để khách chiêm ngưỡng Ảnh Nền Màn Hình trong 1800ms
        const t3 = setTimeout(() => {
          setPhase('fading');

          // Bước 4: Từ từ hòa tan mờ (crossfade) vào trang thiệp chính (1200ms)
          const t4 = setTimeout(() => {
            setPhase('done');
            onOpenCard();
          }, 1200);

          timerSequenceRef.current.push(t4);
        }, 1800);

        timerSequenceRef.current.push(t3);
      }, 3000);

      timerSequenceRef.current.push(t2);
    }, 450);

    timerSequenceRef.current.push(t1);

    return () => {
      clearAllTimers();
    };
  }, [isOpen, openingStyle, data.coverBackgroundUrl]);

  if (!isOpen) return null;

  const isOpeningOrBeyond = phase === 'opening' || phase === 'screen-revealed' || phase === 'fading' || phase === 'done';
  const isRevealedOrBeyond = phase === 'screen-revealed' || phase === 'fading' || phase === 'done';
  const isFading = phase === 'fading' || phase === 'done';

  const containerClasses = embedded
    ? `absolute inset-0 z-40 bg-[#0A170F]/95 flex flex-col items-center justify-center p-2 overflow-hidden select-none rounded-[28px] transition-all duration-[1200ms] ease-in-out ${
        isFading ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`
    : `fixed inset-0 z-[70] bg-[#0A170F]/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none transition-all duration-[1200ms] ease-in-out ${
        isFading ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`;

  return (
    <div
      onClick={handleContainerTouch}
      onTouchStart={handleContainerTouch}
      onPointerDown={handleContainerTouch}
      className={containerClasses}
      style={{ perspective: '1600px' }}
      title="Chạm bất kỳ đâu để bật nhạc du dương"
    >
      {/* Ambient Floating Song Hỷ (囍) & Golden Stardust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-[12%] right-[7%] text-[#C8B06B]/50 text-xl font-serif rotate-6 animate-pulse">
          囍
        </span>
        <span className="absolute bottom-[18%] left-[6%] text-[#C8B06B]/60 text-2xl font-serif -rotate-6 animate-pulse">
          囍
        </span>
        <span className="absolute bottom-[22%] right-[18%] text-[#C8B06B]/65 text-2xl font-serif rotate-12 animate-pulse">
          囍
        </span>
        <span className="absolute top-[20%] left-[8%] text-[#C8B06B]/40 text-base font-serif rotate-12">
          囍
        </span>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] rounded-full bg-[#EAD298]/15 blur-3xl pointer-events-none" />
      </div>

      {/* 3D Perspective Stage Container */}
      <div 
        className={`relative w-full ${embedded ? 'max-w-[340px] scale-[0.88] sm:scale-95' : 'max-w-[580px]'} aspect-[4/3] flex items-center justify-center transition-all`}
        style={{ transformStyle: 'preserve-3d' }}
      >

        {/* ==============================================================
            STYLE 1: DEFAULT (1. MỞ MẶC ĐỊNH - NẮP PHONG BÌ HOÀNG GIA 3D)
            Chuyển động 3.000ms mở từ từ hé lộ Ảnh nền màn hình
           ============================================================== */}
        {openingStyle === 'default' && (
          <div
            className={`relative w-full h-full rounded-2xl border border-[#7A693E]/80 shadow-[0_0_80px_rgba(234,210,152,0.28)] flex flex-col items-center justify-center px-6 py-6 sm:px-10 sm:py-8 text-center overflow-hidden transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpeningOrBeyond ? 'scale-[1.02] translate-y-0' : 'scale-100 translate-y-0'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Background Image (Ảnh nền màn hình chào đón) */}
            <img
              src={activeBgUrl}
              alt="Ảnh nền màn hình mở thiệp"
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-all duration-[3000ms] ease-out ${
                isRevealedOrBeyond ? 'scale-105 filter-none brightness-105' : 'scale-100 brightness-95'
              }`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,23,15,0.35)_0%,rgba(10,23,15,0.15)_70%)] pointer-events-none" />

            {/* Top 3D Envelope Flap that flips open upward slowly like a gentle window opening */}
            <div 
              className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#183625] via-[#10251A] to-transparent z-20 origin-top transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                isOpeningOrBeyond ? '-rotate-x-180 opacity-0' : 'rotate-x-0 opacity-90'
              }`}
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                borderTop: '2px solid #EAD298'
              }}
            />

            {/* Content Body on the Revealed Screen */}
            <CoverCardContent
              hasBuiltInTopSeal={hasBuiltInTopSeal}
              firstShortName={firstShortName}
              secondShortName={secondShortName}
              partyDay={partyDay}
              partyMonth={partyMonth}
              partyYear={partyYear}
              guestName={guestName}
              isOpening={isOpeningOrBeyond}
              isRevealed={isRevealedOrBeyond}
              embedded={embedded}
            />
          </div>
        )}

        {/* ==============================================================
            STYLE 2: DOUBLE-DOOR (2. MỞ CÁNH CỬA 3D - CÁNH CỬA SỔ HOÀNG GIA)
            Từ từ mở ra trong 3.000ms như cánh cửa sổ nhẹ nhàng hé mở đón bình minh
           ============================================================== */}
        {openingStyle === 'double-door' && (
          <div 
            className="relative w-full h-full rounded-2xl border-2 border-[#D4AF37] shadow-[0_0_90px_rgba(212,175,55,0.35)] flex items-center justify-center overflow-hidden bg-[#0A170F]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Background Card (Ảnh nền màn hình) revealed inside when doors swing open */}
            <img
              src={activeBgUrl}
              alt="Ảnh nền màn hình mở thiệp"
              className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-[3000ms] ease-out ${
                isRevealedOrBeyond ? 'scale-105 brightness-105' : 'scale-100 brightness-95'
              }`}
            />
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />

            {/* Inner Content that brightens smoothly as doors open */}
            <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center px-4 transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRevealedOrBeyond ? 'opacity-100 scale-100' : 'opacity-85 scale-95'
            }`}>
              <CoverCardContent
                hasBuiltInTopSeal={hasBuiltInTopSeal}
                firstShortName={firstShortName}
                secondShortName={secondShortName}
                partyDay={partyDay}
                partyMonth={partyMonth}
                partyYear={partyYear}
                guestName={guestName}
                isOpening={isOpeningOrBeyond}
                isRevealed={isRevealedOrBeyond}
                embedded={embedded}
              />
            </div>

            {/* LEFT DOOR / WINDOW LEAF (Cánh cửa sổ trái - từ từ mở ra trong 3.000ms) */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1/2 z-20 origin-left transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none border-r border-[#D4AF37]/80 ${
                isOpeningOrBeyond ? '-rotate-y-115 -translate-z-10 opacity-10' : 'rotate-y-0 translate-z-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(135deg, #1C0A0A 0%, #381216 45%, #240A0D 100%)',
                boxShadow: isOpeningOrBeyond ? 'none' : 'inset -4px 0 16px rgba(0,0,0,0.8), 6px 0 20px rgba(0,0,0,0.5)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Wood & Gold Ornamental Door Trim */}
              <div className="absolute inset-2 sm:inset-3 border-2 border-[#D4AF37]/50 rounded-l-lg pointer-events-none flex flex-col justify-between p-2">
                <span className="text-[#EAD298]/40 text-xs font-serif">囍</span>
                <div className="text-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full border border-[#D4AF37]/60 flex items-center justify-center text-[#EAD298] font-serif text-xs">
                    ✦
                  </div>
                </div>
                <span className="text-[#EAD298]/40 text-xs font-serif text-right">囍</span>
              </div>

              {/* Left Door Knocker Handle */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#FFE5A3] via-[#D4AF37] to-[#8C6D1F] border border-[#FFF0C9] shadow-lg flex items-center justify-center text-[#3D2505] font-serif font-bold text-xs">
                  ❖
                </div>
              </div>
            </div>

            {/* RIGHT DOOR / WINDOW LEAF (Cánh cửa sổ phải - từ từ mở ra trong 3.000ms) */}
            <div
              className={`absolute top-0 bottom-0 right-0 w-1/2 z-20 origin-right transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none border-l border-[#D4AF37]/80 ${
                isOpeningOrBeyond ? 'rotate-y-115 -translate-z-10 opacity-10' : 'rotate-y-0 translate-z-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(225deg, #1C0A0A 0%, #381216 45%, #240A0D 100%)',
                boxShadow: isOpeningOrBeyond ? 'none' : 'inset 4px 0 16px rgba(0,0,0,0.8), -6px 0 20px rgba(0,0,0,0.5)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Wood & Gold Ornamental Door Trim */}
              <div className="absolute inset-2 sm:inset-3 border-2 border-[#D4AF37]/50 rounded-r-lg pointer-events-none flex flex-col justify-between p-2">
                <span className="text-[#EAD298]/40 text-xs font-serif text-right">囍</span>
                <div className="text-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full border border-[#D4AF37]/60 flex items-center justify-center text-[#EAD298] font-serif text-xs">
                    ✦
                  </div>
                </div>
                <span className="text-[#EAD298]/40 text-xs font-serif">囍</span>
              </div>

              {/* Right Door Knocker Handle */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#FFE5A3] via-[#D4AF37] to-[#8C6D1F] border border-[#FFF0C9] shadow-lg flex items-center justify-center text-[#3D2505] font-serif font-bold text-xs">
                  ❖
                </div>
              </div>
            </div>

            {/* Center Golden Song Hỷ Lock Seal (Dissolves softly on open) */}
            <div 
              className={`absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1200ms] ease-out pointer-events-none ${
                isOpeningOrBeyond ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#FFF2CC] via-[#D4AF37] to-[#8A6715] p-0.5 shadow-[0_0_25px_rgba(234,210,152,0.9)] flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-[#FFE5A3] flex items-center justify-center text-[#361E05] font-serif font-bold text-base sm:text-lg">
                  囍
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STYLE 3: CURTAIN-SPLIT (3. TÁCH MỞ 2 BÊN - MÀN LỤA HOÀNG GIA)
            Từ từ tách mở sang 2 bên trong 3.000ms hé lộ Ảnh nền màn hình
           ============================================================== */}
        {openingStyle === 'curtain-split' && (
          <div 
            className="relative w-full h-full rounded-2xl border border-[#D4AF37]/80 shadow-[0_0_80px_rgba(212,175,55,0.3)] flex items-center justify-center overflow-hidden bg-[#0A170F]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Background Image (Ảnh nền màn hình) */}
            <img
              src={activeBgUrl}
              alt="Ảnh nền màn hình mở thiệp"
              className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-[3000ms] ease-out ${
                isRevealedOrBeyond ? 'scale-105 brightness-105' : 'scale-100 brightness-95'
              }`}
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center px-4 transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRevealedOrBeyond ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              <CoverCardContent
                hasBuiltInTopSeal={hasBuiltInTopSeal}
                firstShortName={firstShortName}
                secondShortName={secondShortName}
                partyDay={partyDay}
                partyMonth={partyMonth}
                partyYear={partyYear}
                guestName={guestName}
                isOpening={isOpeningOrBeyond}
                isRevealed={isRevealedOrBeyond}
                embedded={embedded}
              />
            </div>

            {/* LEFT VELVET SILK CURTAIN (Tách nhẹ nhàng sang trái trong 3.000ms) */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1/2 z-20 origin-left transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                isOpeningOrBeyond ? '-translate-x-full -rotate-y-20 opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(90deg, #1A0D10 0%, #4D0A14 30%, #30060C 60%, #5C0C18 90%, #200407 100%)',
                boxShadow: 'inset -8px 0 24px rgba(0,0,0,0.7), 8px 0 20px rgba(0,0,0,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_15px,rgba(255,255,255,0.05)_20px,transparent_30px)]" />
              <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-gradient-to-r from-[#D4AF37] to-[#FFE5A3] shadow-md flex items-center justify-around">
                <span className="w-1.5 h-2.5 bg-[#8C6D1F] rounded-b-sm" />
                <span className="w-1.5 h-2.5 bg-[#8C6D1F] rounded-b-sm" />
                <span className="w-1.5 h-2.5 bg-[#8C6D1F] rounded-b-sm" />
              </div>
            </div>

            {/* RIGHT VELVET SILK CURTAIN (Tách nhẹ nhàng sang phải trong 3.000ms) */}
            <div
              className={`absolute top-0 bottom-0 right-0 w-1/2 z-20 origin-right transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                isOpeningOrBeyond ? 'translate-x-full rotate-y-20 opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(270deg, #1A0D10 0%, #4D0A14 30%, #30060C 60%, #5C0C18 90%, #200407 100%)',
                boxShadow: 'inset 8px 0 24px rgba(0,0,0,0.7), -8px 0 20px rgba(0,0,0,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_15px,rgba(255,255,255,0.05)_20px,transparent_30px)]" />
              <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-gradient-to-r from-[#FFE5A3] to-[#D4AF37] shadow-md flex items-center justify-around">
                <span className="w-1.5 h-2.5 bg-[#8C6D1F] rounded-b-sm" />
                <span className="w-1.5 h-2.5 bg-[#8C6D1F] rounded-b-sm" />
                <span className="w-1.5 h-2.5 bg-[#8C6D1F] rounded-b-sm" />
              </div>
            </div>

            {/* Central Curtain Golden Clasp */}
            <div className={`absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1200ms] ease-out pointer-events-none ${
              isOpeningOrBeyond ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
            }`}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#8C6D1F] via-[#FFE5A3] to-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.9)] flex items-center justify-center border border-white">
                <span className="text-[#331D00] font-serif font-bold text-sm">囍</span>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STYLE 4: SCROLL-UNROLL (4. CUỘN TRÒN 2 BÊN - CHIẾU THƯ HOÀNG CUNG)
            Từ từ cuộn mở sang hai bên trong 3.000ms hé lộ Ảnh nền màn hình
           ============================================================== */}
        {openingStyle === 'scroll-unroll' && (
          <div 
            className="relative w-full h-full rounded-2xl border-2 border-[#D4AF37]/90 shadow-[0_0_90px_rgba(234,210,152,0.35)] flex items-center justify-center overflow-hidden bg-[#10241A]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Background Image (Ảnh nền màn hình) */}
            <img
              src={activeBgUrl}
              alt="Ảnh nền màn hình mở thiệp"
              className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-[3000ms] ease-out ${
                isRevealedOrBeyond ? 'scale-105 brightness-105' : 'scale-100 brightness-95'
              }`}
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center px-4 transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRevealedOrBeyond ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              <CoverCardContent
                hasBuiltInTopSeal={hasBuiltInTopSeal}
                firstShortName={firstShortName}
                secondShortName={secondShortName}
                partyDay={partyDay}
                partyMonth={partyMonth}
                partyYear={partyYear}
                guestName={guestName}
                isOpening={isOpeningOrBeyond}
                isRevealed={isRevealedOrBeyond}
                embedded={embedded}
              />
            </div>

            {/* LEFT IMPERIAL SCROLL CYLINDER (Cuộn nhẹ nhàng sang trái trong 3.000ms) */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1/2 z-20 origin-left transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                isOpeningOrBeyond ? '-translate-x-full -rotate-y-180 opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(90deg, #132418 0%, #2E5C3E 70%, #1A3323 100%)',
                boxShadow: 'inset -12px 0 20px rgba(0,0,0,0.8)'
              }}
            >
              <div className="absolute -top-1 -bottom-1 right-0 w-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF2CC] to-[#8C6D1F] shadow-[0_0_12px_rgba(212,175,55,0.7)] flex flex-col justify-between py-1 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D2505]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D2505]" />
              </div>
            </div>

            {/* RIGHT IMPERIAL SCROLL CYLINDER (Cuộn nhẹ nhàng sang phải trong 3.000ms) */}
            <div
              className={`absolute top-0 bottom-0 right-0 w-1/2 z-20 origin-right transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                isOpeningOrBeyond ? 'translate-x-full rotate-y-180 opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(270deg, #132418 0%, #2E5C3E 70%, #1A3323 100%)',
                boxShadow: 'inset 12px 0 20px rgba(0,0,0,0.8)'
              }}
            >
              <div className="absolute -top-1 -bottom-1 left-0 w-4 rounded-full bg-gradient-to-r from-[#8C6D1F] via-[#FFF2CC] to-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.7)] flex flex-col justify-between py-1 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D2505]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D2505]" />
              </div>
            </div>

            {/* Golden Ribbon Seal at center */}
            <div className={`absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1200ms] ease-out pointer-events-none ${
              isOpeningOrBeyond ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
            }`}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#FFE5A3] via-[#D4AF37] to-[#8C6D1F] shadow-[0_0_30px_rgba(234,210,152,0.9)] flex items-center justify-center border-2 border-white">
                <span className="text-[#361E05] font-serif font-bold text-base">📜</span>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STYLE 5: HEART-BLOOM (5. MỞ HÌNH TRÁI TIM - KIỂU XÉ GIẤY 3D)
            Chỉ vành trái tim dát vàng (trong suốt, không che nền/chữ),
            hai vạt giấy xé mở ra 2 bên như xé giấy đón tân hôn.
           ============================================================== */}
        {openingStyle === 'heart-bloom' && (
          <div 
            className="relative w-full h-full rounded-2xl border-2 border-[#D4AF37]/80 shadow-[0_0_90px_rgba(234,210,152,0.35)] flex items-center justify-center overflow-hidden bg-[#0A170F]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Background Image (Ảnh nền màn hình - Hoàn toàn không bị che khuất) */}
            <img
              src={activeBgUrl}
              alt="Ảnh nền màn hình mở thiệp"
              className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-[3000ms] ease-out ${
                isRevealedOrBeyond ? 'scale-105 brightness-105' : 'scale-100 brightness-95'
              }`}
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* Main Content (Tên cô dâu chú rể, ngày cưới - luôn nhìn thấy rõ ràng) */}
            <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center px-4 transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRevealedOrBeyond ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
            }`}>
              <CoverCardContent
                hasBuiltInTopSeal={hasBuiltInTopSeal}
                firstShortName={firstShortName}
                secondShortName={secondShortName}
                partyDay={partyDay}
                partyMonth={partyMonth}
                partyYear={partyYear}
                guestName={guestName}
                isOpening={isOpeningOrBeyond}
                isRevealed={isRevealedOrBeyond}
                embedded={embedded}
              />
            </div>

            {/* LEFT TORN PAPER FLAP (Nửa bìa xé giấy bên trái - rách viền thủ công, mở sang trái) */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1/2 z-20 origin-left transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                isOpeningOrBeyond ? '-translate-x-full -rotate-y-35 opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(135deg, #10241A 0%, #1A3927 65%, #12281D 100%)',
                boxShadow: isOpeningOrBeyond ? 'none' : 'inset -6px 0 16px rgba(0,0,0,0.7), 6px 0 20px rgba(0,0,0,0.6)'
              }}
            >
              {/* Torn paper texture & gold fibers */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,210,152,0.08)_0%,transparent_70%)]" />
              {/* Jagged / Deckled Torn Paper Seam Line along the right edge */}
              <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-l from-[#FFF3D1]/40 to-transparent flex flex-col justify-between py-1 items-end pointer-events-none">
                <div className="h-full w-[2px] border-r-2 border-dashed border-[#EAD298]/80 drop-shadow-[0_0_6px_rgba(234,210,152,0.8)]" />
              </div>
              {/* Royal Seal Watermark */}
              <span className="absolute top-4 left-4 text-[#C8B06B]/30 text-xs font-serif">囍</span>
              <span className="absolute bottom-4 left-4 text-[#C8B06B]/30 text-xs font-serif">囍</span>
            </div>

            {/* RIGHT TORN PAPER FLAP (Nửa bìa xé giấy bên phải - rách viền thủ công, mở sang phải) */}
            <div
              className={`absolute top-0 bottom-0 right-0 w-1/2 z-20 origin-right transition-all duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                isOpeningOrBeyond ? 'translate-x-full rotate-y-35 opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
              }`}
              style={{
                background: 'linear-gradient(225deg, #10241A 0%, #1A3927 65%, #12281D 100%)',
                boxShadow: isOpeningOrBeyond ? 'none' : 'inset 6px 0 16px rgba(0,0,0,0.7), -6px 0 20px rgba(0,0,0,0.6)'
              }}
            >
              {/* Torn paper texture & gold fibers */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,210,152,0.08)_0%,transparent_70%)]" />
              {/* Jagged / Deckled Torn Paper Seam Line along the left edge */}
              <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-[#FFF3D1]/40 to-transparent flex flex-col justify-between py-1 items-start pointer-events-none">
                <div className="h-full w-[2px] border-l-2 border-dashed border-[#EAD298]/80 drop-shadow-[0_0_6px_rgba(234,210,152,0.8)]" />
              </div>
              {/* Royal Seal Watermark */}
              <span className="absolute top-4 right-4 text-[#C8B06B]/30 text-xs font-serif">囍</span>
              <span className="absolute bottom-4 right-4 text-[#C8B06B]/30 text-xs font-serif">囍</span>
            </div>

            {/* VÀNH TRÁI TIM DÁT VÀNG (STRICTLY TRANSPARENT INSIDE - KHÔNG TÔ MÀU CHE KHUẤT) */}
            <div 
              className={`absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-[2800ms] ease-out ${
                isRevealedOrBeyond ? 'scale-[2.4] opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <svg viewBox="0 0 320 290" className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-[0_0_24px_rgba(234,210,152,0.95)]">
                <defs>
                  <linearGradient id="goldHeartRim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF9E0" />
                    <stop offset="25%" stopColor="#EAD298" />
                    <stop offset="50%" stopColor="#FFE8B0" />
                    <stop offset="75%" stopColor="#C59A45" />
                    <stop offset="100%" stopColor="#EAD298" />
                  </linearGradient>
                </defs>

                {/* Vành trái tim chính ngoài (fill='none' trong suốt 100%) */}
                <path
                  d="M 160,82 C 150,42 95,30 60,65 C 16,110 38,175 160,255 C 282,175 304,110 260,65 C 225,30 170,42 160,82 Z"
                  fill="none"
                  stroke="url(#goldHeartRim)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Vành chấm sao kim lấp lánh bên trong (fill='none') */}
                <path
                  d="M 160,92 C 153,58 105,48 76,75 C 38,114 58,168 160,238 C 262,168 282,114 244,75 C 215,48 167,58 160,92 Z"
                  fill="none"
                  stroke="#FFF2CC"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.85"
                />
              </svg>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Reusable Inner Content Component representing "Ảnh nền màn hình" with typography
// ĐÃ BỎ BƯỚC ẤN VÀO NÚT MỞ THIỆP - TỰ ĐỘNG CHUYỂN CẢNH
const CoverCardContent: React.FC<{
  hasBuiltInTopSeal: boolean;
  firstShortName: string;
  secondShortName: string;
  partyDay: number;
  partyMonth: number;
  partyYear: number;
  guestName?: string;
  isOpening: boolean;
  isRevealed: boolean;
  embedded?: boolean;
}> = ({
  hasBuiltInTopSeal,
  firstShortName,
  secondShortName,
  partyDay,
  partyMonth,
  partyYear,
  guestName,
  isOpening,
  isRevealed,
  embedded
}) => {
  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center w-full transition-all duration-[1200ms] ${
        embedded ? 'pt-2 scale-90' : (hasBuiltInTopSeal ? 'pt-8 sm:pt-12' : 'pt-1')
      } ${isRevealed ? 'opacity-100 scale-100' : 'opacity-90 scale-95'}`}
    >
      {/* Show Top Golden Seal only if the chosen artwork does not already have one */}
      {!hasBuiltInTopSeal && (
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#E5CA8A] shadow-[0_0_20px_rgba(229,202,138,0.75)] flex items-center justify-center mb-1.5 border border-[#F5E3B3] animate-pulse">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-[#9E844A]/60 flex items-center justify-center text-[#8C723B] font-serif font-bold text-base sm:text-lg leading-none">
            囍
          </div>
        </div>
      )}

      {/* Couple Short Names */}
      <h1 className="text-xl sm:text-3xl font-serif text-[#F5DFAC] font-semibold tracking-wide leading-tight whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
        {firstShortName.normalize('NFC')}
      </h1>
      <div className="text-xs sm:text-base font-serif italic text-[#F5DFAC] my-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        &amp;
      </div>
      <h1 className="text-xl sm:text-3xl font-serif text-[#F5DFAC] font-semibold tracking-wide leading-tight whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
        {secondShortName.normalize('NFC')}
      </h1>

      {/* Ornamental Divider */}
      <div className="flex items-center justify-center gap-2 my-1.5 sm:my-2 w-36 sm:w-44">
        <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#F5DFAC]/80" />
        <span className="text-[#F5DFAC] text-[10px] sm:text-xs leading-none drop-shadow">❦</span>
        <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#F5DFAC]/80" />
      </div>

      {/* Event Date */}
      <p className="text-xs sm:text-base font-serif font-medium text-[#FFF1CC] tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
        {partyDay} tháng {partyMonth}, {partyYear}
      </p>

      {/* Invitation Greeting & Guest Name */}
      <div className="mt-1 mb-2 space-y-0.5 text-center">
        <p className="text-[11px] sm:text-xs font-serif font-medium text-[#F5DFAC] drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          Thân Mời
        </p>
        {guestName && (
          <p className="text-xs sm:text-base font-serif font-bold text-white tracking-wide drop-shadow">
            {guestName}
          </p>
        )}
      </div>

      {/* Elegant Automatic Transition Badge (Thay cho nút ấn mở thiệp cũ) */}
      <div className="mt-1 flex items-center justify-center gap-1.5 py-1 px-4 rounded-full bg-black/35 backdrop-blur-xs border border-[#F5E1B0]/40 text-[#F5E1B0] font-serif text-[11px] sm:text-xs tracking-wider shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#F5E1B0] animate-spin" style={{ animationDuration: '4s' }} />
        <span>{isRevealed ? 'Đang vào thiệp cưới...' : 'Trân Trọng Kính Mời'}</span>
      </div>
    </div>
  );
};
