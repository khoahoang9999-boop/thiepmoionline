import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';

interface AutoScrollControllerProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const AutoScrollController: React.FC<AutoScrollControllerProps> = ({ containerRef }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [scrollProgress, setScrollProgress] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  const getSpeedPx = () => {
    switch (speed) {
      case 'slow':
        return 1.2;
      case 'fast':
        return 3.5;
      default:
        return 2.0;
    }
  };

  const getScrollContainer = (): Window | HTMLElement => {
    if (containerRef && containerRef.current) {
      return containerRef.current;
    }
    return window;
  };

  const stopAutoScroll = () => {
    setIsScrolling(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const startAutoScroll = () => {
    setIsScrolling(true);
  };

  // Scroll loop
  useEffect(() => {
    if (!isScrolling) return;

    const step = () => {
      const target = getScrollContainer();
      let currentScroll = 0;
      let maxScroll = 0;

      if (target instanceof Window) {
        currentScroll = window.scrollY || document.documentElement.scrollTop;
        maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      } else {
        currentScroll = target.scrollTop;
        maxScroll = target.scrollHeight - target.clientHeight;
      }

      if (maxScroll <= 0) {
        stopAutoScroll();
        return;
      }

      const progress = Math.min(100, Math.round((currentScroll / maxScroll) * 100));
      setScrollProgress(progress);

      if (currentScroll >= maxScroll - 2) {
        // Reached bottom
        stopAutoScroll();
        return;
      }

      const nextScroll = currentScroll + getSpeedPx();
      if (target instanceof Window) {
        window.scrollTo(0, nextScroll);
      } else {
        target.scrollTop = nextScroll;
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isScrolling, speed]);

  const handleRestart = () => {
    const target = getScrollContainer();
    if (target instanceof Window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setScrollProgress(0);
    setTimeout(() => {
      startAutoScroll();
    }, 400);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5">
      {/* Auto Scroll Floating Widget */}
      <div className="bg-stone-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl border border-stone-700/80 flex items-center gap-3 text-xs select-none">
        
        {/* Play/Pause Button */}
        <button
          onClick={() => (isScrolling ? stopAutoScroll() : startAutoScroll())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
            isScrolling
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-white text-stone-900 hover:bg-stone-100'
          }`}
          title={isScrolling ? 'Tạm dừng cuộn' : 'Bắt đầu tự động cuộn thiệp'}
        >
          {isScrolling ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Tạm dừng</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Tự động cuộn thiệp</span>
            </>
          )}
        </button>

        {/* Speed Toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-stone-800 p-0.5 rounded-full border border-stone-700 text-[11px]">
          <button
            onClick={() => setSpeed('slow')}
            className={`px-2 py-0.5 rounded-full ${speed === 'slow' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
          >
            Chậm
          </button>
          <button
            onClick={() => setSpeed('normal')}
            className={`px-2 py-0.5 rounded-full ${speed === 'normal' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
          >
            Vừa
          </button>
          <button
            onClick={() => setSpeed('fast')}
            className={`px-2 py-0.5 rounded-full ${speed === 'fast' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
          >
            Nhanh
          </button>
        </div>

        {/* Replay Button */}
        <button
          onClick={handleRestart}
          title="Cuộn lại từ đầu trang"
          className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Progress indicator */}
        <span className="text-[10px] text-stone-400 font-mono hidden md:inline">
          {scrollProgress}%
        </span>
      </div>

      {/* Progress hairline bar */}
      {isScrolling && (
        <div className="w-32 h-1 bg-stone-700/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-all duration-200"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};
