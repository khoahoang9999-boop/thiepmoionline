export type SideType = 'groom' | 'bride'; // Nhà trai | Nhà gái
export type DisplayOrder = 'groom-first' | 'bride-first';
export type PartyType = 'wedding' | 'reception' | 'engagement'; // Tiệc cưới | Tiệc báo hỷ | Tiệc đính hôn
export type GalleryDisplayType = 'grid' | 'collage' | '3d';
export type CardOpeningStyle = 
  | 'default'        // Cách 1: Bao thư hoàng gia cổ điển
  | 'double-door'    // Cách 2: Đại môn hoàng gia (Mở cửa 3D)
  | 'curtain-split'  // Cách 3: Mở ra 2 bên (Màn lụa cung đình)
  | 'scroll-unroll'  // Cách 4: Cuộn tròn sang 2 bên (Chiếu thư hoàng cung)
  | 'heart-bloom';   // Cách 5: Mở hình trái tim 3D nở rộ

export interface CardOpeningStyleOption {
  id: CardOpeningStyle;
  name: string;
  subtitle: string;
  icon: string;
  badge: string;
  description: string;
}

export type ThemeTemplate = 
  | 'imperial-dragon' 
  | 'burgundy-roses'
  | 'long-phung-red'
  | 'vintage-brown'
  | 'pastel-floral'
  | 'modern-emerald';

export interface FamilySide {
  title: string; // "Ông Bà" hoặc "Ông Bà: Phùng Văn Vượng"
  fatherName: string;
  motherName: string;
  address: string;
  phone?: string;
}

export interface CeremonyInfo {
  enabled: boolean;
  title: string; // "THÔNG TIN LỄ VỀ CHUNG MỘT NHÀ"
  ceremonyType: 'thanh-hon' | 'vu-quy' | 'dinh-hon';
  time: string; // "09:00"
  date: string; // "2026-11-22"
  address: string;
}

export interface PartyInfo {
  enabled: boolean;
  partyType: PartyType;
  title: string; // "THÔNG TIN TIỆC VỀ CHUNG NHÀ"
  date: string; // "2026-11-22"
  time: string; // "10:00"
  timeFormat: '24h' | '12h';
  showWelcomeDiningTimes: boolean;
  welcomeTime: string; // "10:00"
  diningTime: string; // "10:00"
  showCountdown: boolean;
  venueHeader: string; // "TIỆC SẼ TỔ CHỨC TẠI NHÀ..."
  venueName: string;
  venueRoom?: string;
  venueAddress: string;
  mapEmbedUrl: string;
  mapCoordinates: {
    lat: number;
    lng: number;
  };
  showMap: boolean;
}

export interface GuestItem {
  id: string;
  name: string; // Tên khách mời (e.g. "Lan", "Nguyễn Văn A", "Hùng")
  salutation: string; // Cách xưng hô (e.g. "Cô", "Dì", "Chú", "Bác", "Anh", "Chị", "Em", "Bạn", "Gia đình", "Cậu", "Mợ")
  side: SideType; // 'groom' | 'bride'
  phone?: string;
  note?: string;
}

export interface WeddingData {
  themeTemplate: ThemeTemplate;

  // Danh sách khách mời & cách xưng hô hàng loạt
  guests?: GuestItem[];

  // Thông tin cơ bản
  introText: string;
  groomName: string;
  groomShortName: string;
  groomRole: string;
  groomAvatarUrl: string;

  brideName: string;
  brideShortName: string;
  brideRole: string;
  brideAvatarUrl: string;

  displayOrder: DisplayOrder;

  // Ảnh đầu thiệp
  showHeroPhoto: boolean;
  heroPhotoUrl: string;

  // Thư viện ảnh
  showGallery: boolean;
  galleryType: GalleryDisplayType;
  galleryPhotos: string[];

  // Thông tin gia đình
  showFamily: boolean;
  groomFamily: FamilySide;
  brideFamily: FamilySide;

  // Lời thông báo & Lễ
  showAnnouncement: boolean;
  announcementText: string;
  ceremony: CeremonyInfo;
  ceremonyGroom?: CeremonyInfo; // Lễ riêng Nhà Trai (Lễ Thành Hôn / Tân Hôn)
  ceremonyBride?: CeremonyInfo; // Lễ riêng Nhà Gái (Lễ Vu Quy / Đính Hôn)

  // Tiệc cưới riêng cho Nhà Trai và Nhà Gái
  partyGroom: PartyInfo;
  partyBride: PartyInfo;

  // Bố trí ảnh nền & thông tin khi gửi thiệp riêng biệt cho Nhà Trai và Nhà Gái (Zalo / Facebook / iMessage)
  shareGroom?: ShareSideConfig;
  shareBride?: ShareSideConfig;

  // Legacy fallback fields
  shareCoverPhotoUrl: string;
  shareTitle: string;
  shareDescription: string;
  shareDateText: string;

  // Căn chỉnh vị trí & kích thước ảnh trong khung (giữ nguyên chất lượng ảnh gốc)
  groomAvatarPosition?: ImageFrameAdjustment;
  brideAvatarPosition?: ImageFrameAdjustment;
  
  // Tùy chỉnh lật & căn chỉnh ảnh riêng biệt cho Nhà Trai và Nhà Gái
  groomAvatarPositionGroom?: ImageFrameAdjustment;
  brideAvatarPositionGroom?: ImageFrameAdjustment;
  groomAvatarPositionBride?: ImageFrameAdjustment;
  brideAvatarPositionBride?: ImageFrameAdjustment;

  heroPhotoPosition?: ImageFrameAdjustment;
  shareCoverPosition?: ImageFrameAdjustment;

  // Ảnh nền màn hình Mở thiệp (3 mẫu bìa hoàng gia)
  coverBackgroundUrl?: string;

  // Lựa chọn cách mở thiệp 3D sang trọng (5 phong cách)
  cardOpeningStyle?: CardOpeningStyle;

  // Lời cảm ơn & Nhạc nền
  showThankYou: boolean;
  thankYouText: string;
  selectedMusicId: string;
  customAudioUrl?: string;
  customAudioName?: string;

  // Quản lý thời hạn dùng thử 3 ngày & gia hạn tài khoản bởi Admin
  createdTime?: number;
  isExtended?: boolean;
  ownerUsername?: string;

  // Đường link tùy chỉnh
  customSlugGroom?: string;
  customSlugBride?: string;

  // Cơ chế tự chuyển động & Đồng bộ đa nền tảng (Điện thoại & Máy tính)
  autoScroll?: boolean;
  autoPlayMusic?: boolean;
  fallingPetals?: boolean;
  autoPlay3dGallery?: boolean;

  // Trạng thái Lưu & Xuất thiệp (Publish & Cloud Backup Sync)
  isPublished?: boolean;
  publishedAt?: string;
  publishedVersion?: number;
  lastSavedAt?: string;
  updatedAtMs?: number;
  cardId?: string;
}

export interface ShareSideConfig {
  coverPhotoUrl: string;
  coverPosition: ImageFrameAdjustment;
  title: string;
  description: string;
  dateText: string;
}

export interface ImageFrameAdjustment {
  x: number; // 0% - 100% (50 is center; x - 50 is % horizontal shift)
  y: number; // 0% - 100% (50 is center; y - 50 is % vertical shift)
  zoom: number; // 50% - 300% (100% = 1.0x)
  fit?: 'cover' | 'contain';
  flipX?: boolean; // Lật ngang (Horizontal Flip)
  flipY?: boolean; // Lật dọc (Vertical Flip)
  rotate?: number; // Góc xoay độ nghiêng xoay tròn (-180° đến 180°)
}

export function getAdjustedImageStyle(adj?: ImageFrameAdjustment): {
  width: string;
  height: string;
  objectFit: 'cover' | 'contain';
  objectPosition: string;
  transform: string;
  transformOrigin: string;
  imageRendering: 'auto';
} {
  const x = adj?.x ?? 50;
  const y = adj?.y ?? 50;
  const zoom = (adj?.zoom ?? 100) / 100;
  const fit = adj?.fit || 'contain';
  const flipXScale = adj?.flipX ? -1 : 1;
  const flipYScale = adj?.flipY ? -1 : 1;
  const rotate = adj?.rotate ?? 0;
  const tx = -(x - 50);
  const ty = -(y - 50);

  return {
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: 'center center',
    transform: `translate(${tx}%, ${ty}%) scale(${zoom}) rotate(${rotate}deg) scaleX(${flipXScale}) scaleY(${flipYScale})`,
    transformOrigin: 'center center',
    imageRendering: 'auto'
  };
}

export function getGroomAvatarPosition(data: WeddingData, side: SideType): ImageFrameAdjustment {
  if (side === 'groom') {
    return data.groomAvatarPositionGroom || data.groomAvatarPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' };
  }
  return data.groomAvatarPositionBride || data.groomAvatarPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' };
}

export function getBrideAvatarPosition(data: WeddingData, side: SideType): ImageFrameAdjustment {
  if (side === 'groom') {
    return data.brideAvatarPositionGroom || data.brideAvatarPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' };
  }
  return data.brideAvatarPositionBride || data.brideAvatarPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' };
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: string;
  audioUrl?: string;
  isCustom?: boolean;
}

export function getPartyTypeLabel(party?: PartyInfo): { labelCap: string; labelLower: string } {
  if (!party) return { labelCap: 'Tiệc Báo Hỷ', labelLower: 'tiệc báo hỷ' };

  const titleLower = (party.title || '').toLowerCase();
  if (titleLower.includes('đính hôn') || titleLower.includes('dinh hon') || party.partyType === 'engagement') {
    return { labelCap: 'Tiệc Đính Hôn', labelLower: 'tiệc đính hôn' };
  }
  if (titleLower.includes('cưới') || titleLower.includes('cuoi') || party.partyType === 'wedding') {
    return { labelCap: 'Tiệc Cưới', labelLower: 'tiệc cưới' };
  }
  return { labelCap: 'Tiệc Báo Hỷ', labelLower: 'tiệc báo hỷ' };
}

