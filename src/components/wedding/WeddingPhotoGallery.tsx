import React, { useState, useEffect, useRef } from 'react';
import { GalleryDisplayType } from '../../types/wedding';
import { normalizeRelativeAssetUrl } from '../../utils/shareLinkCodec';
import { DEFAULT_WEDDING_DATA } from '../../data/weddingDefault';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeddingPhotoGalleryProps {
  photos: string[];
  type: GalleryDisplayType;
  autoPlay?: boolean;
}

export const WeddingPhotoGallery: React.FC<WeddingPhotoGalleryProps> = ({
  photos,
  type,
  autoPlay = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPausedByInteraction, setIsPausedByInteraction] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const normalizedPhotos = (Array.isArray(photos) ? photos : DEFAULT_WEDDING_DATA.galleryPhotos)
    .map((p) => normalizeRelativeAssetUrl(p))
    .filter(Boolean);

  useEffect(() => {
    if (normalizedPhotos.length > 0 && currentIndex >= normalizedPhotos.length) {
      setCurrentIndex(0);
    }
  }, [normalizedPhotos.length, currentIndex]);

  // Auto-play effect: changes photo every 3.0 seconds if 3d mode & not currently held/clicked/viewed by user
  useEffect(() => {
    if (type !== '3d' || normalizedPhotos.length <= 1 || isPausedByInteraction || !normalizedPhotos.length) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % normalizedPhotos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [type, normalizedPhotos.length, isPausedByInteraction]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  if (!normalizedPhotos || normalizedPhotos.length === 0) {
    return null;
  }

  const scheduleAutoResume = (delayMs = 2600) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPausedByInteraction(false);
    }, delayMs);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? normalizedPhotos.length - 1 : prev - 1));
    scheduleAutoResume(2800);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === normalizedPhotos.length - 1 ? 0 : prev + 1));
    scheduleAutoResume(2800);
  };

  // User presses mouse down or hovers to inspect the photo -> pause
  const handleMouseEnter = () => {
    setIsPausedByInteraction(true);
  };

  const handleMouseLeave = () => {
    setIsPausedByInteraction(false);
  };

  const handleMouseDown = () => {
    setIsPausedByInteraction(true);
  };

  const handleMouseUp = () => {
    scheduleAutoResume(2400);
  };

  // User touches or holds finger on mobile screen to view the photo -> pause
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPausedByInteraction(true);
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    // Fallback auto-resume after 4s in case mobile browser cancels event during scroll
    scheduleAutoResume(4000);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      if (Math.abs(deltaX) > 35) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartXRef.current = null;
    scheduleAutoResume(2400);
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    scheduleAutoResume(1600);
  };

  return (
    <div className="w-full my-6">
      {/* 1. 3D CAROUSEL (Tự động chuyển động ảnh 3D, tạm dừng khi nhấn chuột hoặc giữ tay xem) */}
      {type === '3d' && (
        <div
          className="relative py-4 px-2 overflow-hidden flex flex-col items-center select-none"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <div className="relative w-full max-w-sm h-80 sm:h-96 flex items-center justify-center">
            {normalizedPhotos.map((photo, idx) => {
              const count = normalizedPhotos.length;
              let diff = (idx - currentIndex + count) % count;
              if (diff > count / 2) diff -= count;

              const isCenter = diff === 0;
              const isPrev = diff === -1 || (currentIndex === 0 && idx === count - 1);
              const isNext = diff === 1 || (currentIndex === count - 1 && idx === 0);

              if (!isCenter && !isPrev && !isNext) return null;

              let transformClass = '';
              let zIndex = 10;
              let opacity = 0.5;

              if (isCenter) {
                transformClass = 'translate-x-0 scale-100 shadow-2xl';
                zIndex = 30;
                opacity = 1;
              } else if (isPrev) {
                transformClass = '-translate-x-24 sm:-translate-x-36 scale-80 rotate-[-6deg]';
                zIndex = 20;
                opacity = 0.68;
              } else if (isNext) {
                transformClass = 'translate-x-24 sm:translate-x-36 scale-80 rotate-[6deg]';
                zIndex = 20;
                opacity = 0.68;
              }

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    scheduleAutoResume(2800);
                  }}
                  className={`absolute w-56 sm:w-64 h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-white/80 transition-all duration-700 ease-out cursor-pointer bg-stone-200 ${transformClass}`}
                  style={{ zIndex, opacity }}
                >
                  <img
                    src={photo}
                    alt={`Ảnh cưới ${idx + 1}`}
                    className="w-full h-full object-cover"
                    decoding="async"
                    onError={(e) => {
                      const fallback = DEFAULT_WEDDING_DATA.galleryPhotos[idx % DEFAULT_WEDDING_DATA.galleryPhotos.length];
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              );
            })}

            {/* Left & Right Controls */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ảnh trước"
              className="absolute left-2 z-40 p-2 rounded-full bg-white/85 text-stone-800 shadow-md hover:bg-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ảnh tiếp theo"
              className="absolute right-2 z-40 p-2 rounded-full bg-white/85 text-stone-800 shadow-md hover:bg-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Pagination (No Play/Pause button, automatically centered) */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {normalizedPhotos.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  scheduleAutoResume(2800);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentIndex ? 'w-6 bg-[#1C3766]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Chuyển đến ảnh ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. GRID DISPLAY */}
      {type === 'grid' && (
        <div className="grid grid-cols-2 gap-3 px-2">
          {normalizedPhotos.map((photo, i) => (
            <div
              key={i}
              className="relative aspect-3/4 rounded-xl overflow-hidden border border-stone-200 shadow-xs group bg-stone-100"
            >
              <img
                src={photo}
                alt={`Ảnh kỷ niệm ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                decoding="async"
              />
            </div>
          ))}
        </div>
      )}

      {/* 3. COLLAGE DISPLAY */}
      {type === 'collage' && (
        <div className="columns-2 gap-3 space-y-3 px-2">
          {normalizedPhotos.map((photo, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-stone-200 shadow-xs break-inside-avoid bg-stone-100"
            >
              <img
                src={photo}
                alt={`Ảnh kỷ niệm ${i + 1}`}
                className="w-full h-auto object-cover"
                decoding="async"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
