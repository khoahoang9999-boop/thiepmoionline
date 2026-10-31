import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  accentColor?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, accentColor }) => {
  const calculateTime = (): TimeRemaining => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isPast: false
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="py-4 px-6 text-center rounded-xl bg-stone-100 border border-stone-200">
        <p className="text-sm uppercase tracking-wider font-medium text-stone-700">
          Sự kiện đang diễn ra hôm nay!
        </p>
      </div>
    );
  }

  const units = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds }
  ];

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center py-3 px-1 sm:px-2 bg-white/80 backdrop-blur-xs rounded-xl border border-stone-200/80 shadow-xs"
          >
            <span
              className="text-2xl sm:text-3xl font-luxury font-semibold tabular-nums leading-none tracking-tight text-stone-800"
              style={{ color: accentColor || undefined }}
            >
              {String(u.value).padStart(2, '0')}
            </span>
            <span className="text-[11px] sm:text-xs text-stone-500 uppercase tracking-widest mt-1.5 font-sans">
              {u.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-stone-400 mt-2.5 tracking-wider uppercase">
        Đếm ngược đến thời khắc thiêng liêng
      </p>
    </div>
  );
};
