/**
 * Chuyển đổi ngày Dương lịch (YYYY-MM-DD) sang chuỗi Âm lịch Việt Nam tự động
 * Ví dụ: "2026-11-29" -> "(Tức ngày 21 tháng 10 năm Bính Ngọ)"
 */

const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

export function getCanChiYear(lunarYear: number): string {
  const can = CAN[lunarYear % 10];
  const chi = CHI[lunarYear % 12];
  return `${can} ${chi}`;
}

export interface LunarDateParts {
  day: number;
  month: number;
  isLeapMonth: boolean;
  year: number;
  canChiYear: string;
}

/**
 * Tính ngày Âm lịch từ chuỗi YYYY-MM-DD sử dụng Intl.DateTimeFormat('en-u-ca-chinese')
 */
export function solarToLunar(dateStr?: string): LunarDateParts | null {
  if (!dateStr) return null;

  try {
    const cleanStr = dateStr.trim();
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    // Dùng 12:00 trưa giờ địa phương để tránh lệch múi giờ
    const solarDate = new Date(year, month - 1, day, 12, 0, 0);
    if (isNaN(solarDate.getTime())) return null;

    const formatter = new Intl.DateTimeFormat('en-u-ca-chinese', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });

    const formattedParts = formatter.formatToParts(solarDate);
    let lunarDay = 1;
    let lunarMonth = 1;
    let isLeapMonth = false;
    let lunarYear = year;

    for (const part of formattedParts) {
      if (part.type === 'day') {
        lunarDay = parseInt(part.value, 10) || 1;
      } else if (part.type === 'month') {
        // Trong lịch âm có thể có tháng nhuận dạng "6bis"
        if (part.value.includes('bis')) {
          isLeapMonth = true;
        }
        lunarMonth = parseInt(part.value.replace(/\D/g, ''), 10) || 1;
      } else if ((part.type as string) === 'relatedYear') {
        lunarYear = parseInt(part.value, 10) || year;
      }
    }

    // Nếu trình duyệt không trả về relatedYear, suy ra năm âm lịch dựa trên tháng dương và tháng âm
    if (!lunarYear || isNaN(lunarYear)) {
      lunarYear = month <= 2 && lunarMonth >= 11 ? year - 1 : year;
    }

    return {
      day: lunarDay,
      month: lunarMonth,
      isLeapMonth,
      year: lunarYear,
      canChiYear: getCanChiYear(lunarYear)
    };
  } catch (e) {
    return null;
  }
}

/**
 * Trả về chuỗi hiển thị chuẩn trên thiệp cưới:
 * "(Tức ngày 21 tháng 10 năm Bính Ngọ)"
 */
export function formatVietnameseLunarDate(dateStr?: string, includeParentheses = true): string {
  const lunar = solarToLunar(dateStr);
  if (!lunar) return '';

  const monthText = lunar.isLeapMonth ? `${lunar.month} nhuận` : `${lunar.month}`;
  const content = `Tức ngày ${lunar.day} tháng ${monthText} năm ${lunar.canChiYear}`.normalize('NFC');
  return includeParentheses ? `(${content})` : content;
}

/**
 * Chuyển chuỗi ngày "YYYY-MM-DD" sang định dạng Việt Nam "DD/MM/YYYY" (VD: "29/11/2026")
 */
export function formatVietnameseSolarDate(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return clean;
}

