export type EventType = 'wedding' | 'birthday' | 'yearend' | 'engagement';

export type StyleTheme = 'ivory-gold' | 'blush-rose' | 'minimal-noir' | 'warm-terracotta';

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  iconType: 'welcome' | 'ceremony' | 'feast' | 'party' | 'speech' | 'photo';
}

export interface BankGiftInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  note: string;
}

export interface InvitationData {
  id: string;
  eventType: EventType;
  styleTheme: StyleTheme;
  backgroundArtStyle?: 'botanical-roses' | 'gold-bokeh' | 'minimal-clean';
  eventTitle: string;
  subTitle: string;
  primaryHosts: string;
  secondaryHosts?: string; // e.g. Tên cô dâu chú rể hoặc ban tổ chức
  parentsGroom?: string;
  parentsBride?: string;
  targetDateTime: string; // ISO or YYYY-MM-DDTHH:mm
  displayDate: string; // e.g. "Thứ Bảy, 25 Tháng 12, 2026"
  displayTime: string; // e.g. "18:00 (Đón khách từ 17:30)"
  lunarDate?: string; // e.g. "Tức ngày 17 tháng 11 năm Bính Ngọ"
  venueName: string;
  venueRoom?: string;
  venueAddress: string;
  mapEmbedUrl: string;
  mapExternalUrl: string;
  dressCodeTitle: string;
  dressCodeColors: { name: string; hex: string }[];
  dressCodeNote: string;
  welcomeMessage: string;
  quote: string;
  storyTitle: string;
  storyBody: string;
  timeline: TimelineItem[];
  rsvpDeadline: string;
  contactPhone: string;
  bankGift?: BankGiftInfo;
  guestNameDefault: string;
}

export interface GuestRSVP {
  id: string;
  guestName: string;
  phone: string;
  attending: 'yes' | 'no';
  guestCount: number;
  dietary?: string;
  wishes: string;
  createdAt: string;
}

export interface ThemeConfig {
  id: StyleTheme;
  name: string;
  tagline: string;
  bgPage: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  borderSubtle: string;
  accentColor: string;
  accentHover: string;
  badgeBg: string;
  fontDisplay: string;
  fontBody: string;
  paletteDescription: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    text: string;
  };
}
