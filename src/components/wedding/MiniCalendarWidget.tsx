import React from 'react';

interface MiniCalendarWidgetProps {
  dateStr: string; // "2026-12-05"
}

export const MiniCalendarWidget: React.FC<MiniCalendarWidgetProps> = ({ dateStr }) => {
  const dateObj = new Date(dateStr);
  const year = isNaN(dateObj.getFullYear()) ? 2026 : dateObj.getFullYear();
  const month = isNaN(dateObj.getMonth()) ? 11 : dateObj.getMonth(); // 0-indexed
  const selectedDay = isNaN(dateObj.getDate()) ? 5 : dateObj.getDate();

  // Month days calculation
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0: Sun, 1: Mon...
  // Convert Sunday (0) to 7 for European/Vietnamese Mon-Sun format
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div className="w-full max-w-[320px] mx-auto bg-[#F7F3EC] text-stone-800 rounded-2xl p-4 shadow-inner border border-amber-200/60 my-4 select-none">
      {/* Month Title in Italic Calligraphy */}
      <div className="text-center font-script text-xl sm:text-2xl text-amber-950 font-bold mb-2">
        Tháng {month + 1} / {year}
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-stone-500 pb-1.5 border-b border-stone-300/60">
        <span>T2</span>
        <span>T3</span>
        <span>T4</span>
        <span>T5</span>
        <span>T6</span>
        <span className="text-rose-700">T7</span>
        <span className="text-rose-700">CN</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs mt-2 font-serif">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-7" />;
          }
          const isSelected = day === selectedDay;
          return (
            <div key={`day-${day}`} className="h-7 flex items-center justify-center">
              {isSelected ? (
                <div className="relative flex items-center justify-center w-7 h-7">
                  {/* Red Heart Shape Icon */}
                  <svg viewBox="0 0 24 24" fill="#DC2626" className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-xs">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-white font-sans leading-none pt-0.5">
                    {day}
                  </span>
                </div>
              ) : (
                <span className="text-stone-700 hover:text-stone-900 font-medium">
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
