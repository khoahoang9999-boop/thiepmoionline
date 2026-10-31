import { WeddingData, MusicTrack } from '../types/wedding';

export const MUSIC_PLAYLIST: MusicTrack[] = [
  {
    id: 'acoustic-romance',
    title: 'Acoustic Harpsichord Romance',
    artist: 'Serenade Studio',
    category: 'Giai điệu lãng mạn du dương'
  },
  {
    id: 'canon-d',
    title: 'Canon in D (Pachelbel Acoustic)',
    artist: 'Classical Ensemble',
    category: 'Nhạc lễ cưới thiêng liêng'
  },
  {
    id: 'thousand-years',
    title: 'A Thousand Years (Piano Romance)',
    artist: 'Melody Piano',
    category: 'Tình ca ngọt ngào'
  },
  {
    id: 'until-found-you',
    title: 'Until I Found You (Acoustic Waltz)',
    artist: 'Vintage Romance',
    category: 'Giai điệu khiêu vũ'
  }
];

export const SAMPLE_GALLERY_PHOTOS: string[] = [];

export const COVER_BACKGROUNDS = [
  {
    id: 'dragon-seal',
    name: 'Song Long Chầu Nguyệt (Ấn Song Hỷ)',
    url: '/assets/aistudio/36ff6f2f-bc88-4ece-a72c-1d5e94e32f91_437e6aa0.jpg'
  },
  {
    id: 'royal-crimson',
    name: 'Hoàng Gia Đỏ Son & Xanh Ngọc',
    url: '/assets/aistudio/57ebd954-f6c3-4edd-ab7b-d9e5c2e321af_74bfe189.jpg'
  },
  {
    id: 'lotus-wreath',
    name: 'Vòng Nguyệt Quế & Hoa Sen Vàng',
    url: '/assets/aistudio/3eaf34e8-d174-4211-be3d-ee3713470129_b690ceac.jpg'
  }
];

export const CARD_OPENING_STYLES = [
  {
    id: 'default' as const,
    num: 1,
    name: '1. Mở mặc định',
    subtitle: 'Nắp phong bì 3D hoàng gia',
    icon: '💌',
    badge: 'Mặc định'
  },
  {
    id: 'double-door' as const,
    num: 2,
    name: '2. Mở cánh cửa 3D',
    subtitle: 'Cánh cửa đôi mở êm dịu',
    icon: '🚪',
    badge: 'Cửa 3D'
  },
  {
    id: 'curtain-split' as const,
    num: 3,
    name: '3. Tách mở 2 bên',
    subtitle: 'Rèm nhung tách sang hai bên',
    icon: '✨',
    badge: 'Tách 2 bên'
  },
  {
    id: 'scroll-unroll' as const,
    num: 4,
    name: '4. Cuộn tròn 2 bên',
    subtitle: 'Chiếu thư cuộn mở hai phía',
    icon: '📜',
    badge: 'Cuộn 2 bên'
  },
  {
    id: 'heart-bloom' as const,
    num: 5,
    name: '5. Mở hình trái tim',
    subtitle: 'Vành tim xé giấy 3D sang trọng',
    icon: '💖',
    badge: 'Xé giấy 3D'
  }
];

export const DEFAULT_WEDDING_DATA: WeddingData = {
  themeTemplate: 'imperial-dragon',
  // Danh sách khách mời mặc định (Nhà Trai & Nhà Gái)
  guests: [
    { id: 'g_1', name: 'Lan', salutation: 'Cô', side: 'bride', phone: '0912345678' },
    { id: 'g_2', name: 'Hùng', salutation: 'Chú', side: 'bride', phone: '0987654321' },
    { id: 'g_3', name: 'Thành', salutation: 'Anh', side: 'bride' },
    { id: 'g_4', name: 'Gia đình Bác Tám', salutation: 'Bác', side: 'bride' },
    { id: 'g_5', name: 'Tuấn', salutation: 'Bạn', side: 'groom', phone: '0901234567' },
    { id: 'g_6', name: 'Minh', salutation: 'Anh', side: 'groom' },
    { id: 'g_7', name: 'Phương', salutation: 'Chị', side: 'groom' }
  ],

  // Thông tin cơ bản (Ảnh gốc chất lượng cao của cặp đôi Quang Hưng & Minh Tuệ)
  introText: 'THÔNG TIN LỄ VỀ CHUNG MỘT NHÀ',
  groomName: 'Phùng Văn Hưng',
  groomShortName: 'Quang Hưng',
  groomRole: 'Trưởng Nam',
  groomAvatarUrl: '/api/media/media_385d6b17539c87cc.jpg',

  brideName: 'Hoàng Minh Tuệ',
  brideShortName: 'Minh Tuệ',
  brideRole: 'Út Nữ',
  brideAvatarUrl: '/api/media/media_debf66392f8c9341.jpg',

  displayOrder: 'groom-first',

  // Ảnh đầu thiệp
  showHeroPhoto: true,
  heroPhotoUrl: '/api/media/media_cca42efe1813d7a6.jpg',

  // Thư viện ảnh cưới
  showGallery: true,
  galleryType: '3d',
  galleryPhotos: [
    '/api/media/media_48034d471b1e1c49.jpg',
    '/api/media/media_cca42efe1813d7a6.jpg'
  ],

  // Thông tin gia đình hai bên
  showFamily: true,
  groomFamily: {
    title: 'Ông',
    fatherName: 'Phùng Văn Vượng',
    motherName: '',
    address: 'Số nhà 10, Đường số 4, thôn Đằng Xã, xã Hoằng Hóa, tỉnh Thanh Hóa',
    phone: '0988 123 456'
  },
  brideFamily: {
    title: 'Ông Bà',
    fatherName: 'Hoàng Hiếu Luân',
    motherName: 'Nguyễn Thị Phánh',
    address: 'Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang',
    phone: '0912 345 678'
  },

  // Lời thông báo & Lễ
  showAnnouncement: true,
  announcementText: 'TRÂN TRỌNG BÁO TIN DỰ LỄ VỀ CHUNG MỘT NHÀ CỦA CON CHÚNG TÔI',

  ceremony: {
    enabled: true,
    title: 'THÔNG TIN LỄ VỀ CHUNG MỘT NHÀ',
    ceremonyType: 'thanh-hon',
    time: '09:00',
    date: '2026-11-29',
    address: 'Tư gia Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang'
  },
  ceremonyGroom: {
    enabled: true,
    title: 'THÔNG TIN LỄ THÀNH HÔN',
    ceremonyType: 'thanh-hon',
    time: '11:00',
    date: '2026-11-29',
    address: 'Số nhà 10, Đường số 4, thôn Đằng Xã, xã Hoằng Hóa, tỉnh Thanh Hóa'
  },
  // Lễ Vu Quy bên Nhà Gái
  ceremonyBride: {
    enabled: true,
    title: 'THÔNG TIN LỄ VU QUY',
    ceremonyType: 'vu-quy',
    time: '09:00',
    date: '2026-11-22',
    address: 'Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang'
  },

  // Tiệc cưới bên Nhà Trai
  partyGroom: {
    enabled: true,
    partyType: 'reception',
    title: 'THÔNG TIN TIỆC VỀ CHUNG NHÀ',
    date: '2026-11-29',
    time: '16:00',
    timeFormat: '24h',
    showWelcomeDiningTimes: true,
    welcomeTime: '16:00',
    diningTime: '16:30',
    showCountdown: true,
    venueHeader: 'TIỆC SẼ TỔ CHỨC TẠI NHÀ ÔNG BÀ PHÙNG VĂN VƯỢNG',
    venueName: 'Tư Gia Nhà Trai - Gia Đình Ông Bà Phùng Văn Vượng',
    venueAddress: 'Số nhà 10, Đường số 4, thôn Đằng Xã, xã Hoằng Hóa, tỉnh Thanh Hóa',
    mapEmbedUrl: 'https://maps.google.com/maps?q=19.85950,105.85420&hl=vi&z=15&output=embed',
    mapCoordinates: {
      lat: 19.85950,
      lng: 105.85420
    },
    showMap: true
  },

  // Tiệc cưới bên Nhà Gái
  partyBride: {
    enabled: true,
    partyType: 'reception',
    title: 'THÔNG TIN TIỆC VỀ CHUNG NHÀ',
    date: '2026-11-22',
    time: '10:00',
    timeFormat: '24h',
    showWelcomeDiningTimes: true,
    welcomeTime: '10:00',
    diningTime: '10:30',
    showCountdown: true,
    venueHeader: 'TIỆC SẼ TỔ CHỨC TẠI NHÀ ÔNG BÀ HOÀNG HIẾU LUÂN',
    venueName: 'Tư Gia Nhà Gái - Gia Đình Ông Bà Hoàng Hiếu Luân',
    venueAddress: 'Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang',
    mapEmbedUrl: 'https://maps.google.com/maps?q=22.10026,105.0259&hl=vi&z=15&output=embed',
    mapCoordinates: {
      lat: 22.10026,
      lng: 105.0259
    },
    showMap: true
  },

  // Bố trí ảnh nền & xem trước khi gửi thiệp riêng biệt cho Nhà Trai và Nhà Gái (Zalo / Facebook / iMessage)
  shareGroom: {
    coverPhotoUrl: '/api/media/media_48034d471b1e1c49.jpg',
    coverPosition: { x: 48.3, y: 67.3, zoom: 212, fit: 'contain', flipX: false, flipY: false, rotate: 0 },
    title: 'Thiệp Mời Tiệc Báo Hỷ - Quang Hưng & Minh Tuệ',
    description: 'Kính mời quý khách tới dự tiệc báo hỷ của Quang Hưng & Minh Tuệ vào lúc 16:00 ngày 29/11/2026 tại Số nhà 10, Đường số 4, thôn Đằng Xá, xã Hoằng Hóa, tỉnh Thanh Hóa',
    dateText: '29/11/2026'
  },
  shareBride: {
    coverPhotoUrl: '/api/media/media_48034d471b1e1c49.jpg',
    coverPosition: { x: 49.7, y: 68.3, zoom: 210, fit: 'contain', flipX: false, flipY: false, rotate: 0 },
    title: 'Thiệp Mời Tiệc Báo Hỷ - Minh Tuệ & Quang Hưng',
    description: 'Kính mời quý khách tới dự tiệc báo hỷ của Minh Tuệ & Quang Hưng vào lúc 10:00 ngày 22/11/2026 tại Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang',
    dateText: '22/11/2026'
  },

  shareCoverPhotoUrl: '/api/media/media_48034d471b1e1c49.jpg',
  shareTitle: 'Thiệp Mời Tiệc Báo Hỷ - Quang Hưng & Minh Tuệ',
  shareDescription: 'Kính mời quý khách tới dự tiệc báo hỷ của Quang Hưng & Minh Tuệ vào lúc 16:00 ngày 29/11/2026 tại Số nhà 10, Đường số 4, thôn Đằng Xá, xã Hoằng Hóa, tỉnh Thanh Hóa',
  shareDateText: '29/11/2026',

  customSlugGroom: 'quanghung-minhtue',
  customSlugBride: 'minhtue-quanghung',

  // Căn chỉnh vị trí & kích thước ảnh trong khung (giữ nguyên chất lượng ảnh gốc)
  groomAvatarPosition: { x: 48.9, y: 47.1, zoom: 106, fit: 'contain', flipX: false, flipY: false, rotate: -1 },
  brideAvatarPosition: { x: 50, y: 46.8, zoom: 106, fit: 'contain', flipX: false, flipY: false, rotate: 12 },
  groomAvatarPositionGroom: { x: 48.9, y: 47.1, zoom: 106, fit: 'contain', flipX: false, flipY: false, rotate: -1 },
  brideAvatarPositionGroom: { x: 50, y: 46.8, zoom: 106, fit: 'contain', flipX: false, flipY: false, rotate: 12 },
  groomAvatarPositionBride: { x: 48.9, y: 47.1, zoom: 106, fit: 'contain', flipX: false, flipY: false, rotate: -1 },
  brideAvatarPositionBride: { x: 50, y: 46.8, zoom: 106, fit: 'contain', flipX: false, flipY: false, rotate: 12 },
  heroPhotoPosition: { x: 50, y: 50, zoom: 100, fit: 'contain', flipX: false, flipY: false, rotate: 0 },
  shareCoverPosition: { x: 48.3, y: 67.3, zoom: 212, fit: 'contain', flipX: false, flipY: false, rotate: 0 },

  showThankYou: true,
  thankYouText: 'Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!',
  selectedMusicId: 'acoustic-romance',

  // Mặc định bật đầy đủ cơ chế tự chuyển động trên Điện thoại & Máy tính
  autoScroll: true,
  autoPlayMusic: true,
  fallingPetals: true,
  autoPlay3dGallery: true,
  isPublished: true,
  publishedVersion: 52
};

