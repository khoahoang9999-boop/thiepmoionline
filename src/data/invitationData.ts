import { InvitationData, StyleTheme, ThemeConfig, GuestRSVP } from '../types/invitation';

export const THEME_CONFIGS: Record<StyleTheme, ThemeConfig> = {
  'ivory-gold': {
    id: 'ivory-gold',
    name: 'Sang Trọng & Hoàng Gia (Royal Ivory & Warm Gold)',
    tagline: 'Phong cách tiệc cổ điển, quý phái, ánh kim champagne kết hợp giấy lụa Alabaster',
    bgPage: 'bg-[#FAF8F5]',
    bgCard: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#1E1C1A]',
    textSecondary: 'text-[#68625D]',
    textAccent: 'text-[#9A7B4F]',
    borderSubtle: 'border-[#EAE4DC]',
    accentColor: '#9A7B4F',
    accentHover: '#84673E',
    badgeBg: 'bg-[#F4EFE6]',
    fontDisplay: 'font-luxury',
    fontBody: 'font-body',
    paletteDescription: 'Alabaster (#FAF8F5) làm màu nền chủ đạo 60%, Champagne Gold (#9A7B4F) điểm nhấn hoàng kim 10%, Than chì (#1E1C1A) 30% giữ độ tương phản chuẩn WCAG AA.',
    colors: {
      primary: '#FAF8F5',
      secondary: '#EAE4DC',
      accent: '#9A7B4F',
      surface: '#FFFFFF',
      text: '#1E1C1A'
    }
  },
  'blush-rose': {
    id: 'blush-rose',
    name: 'Lãng Mạn & Ngọt Ngào (Blush Floral & Rose Gold)',
    tagline: 'Sắc hồng pastel êm dịu, ấm áp, đậm chất thơ mộng của tình yêu đôi lứa',
    bgPage: 'bg-[#FDF8F8]',
    bgCard: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#2B2325]',
    textSecondary: 'text-[#706165]',
    textAccent: 'text-[#B26B79]',
    borderSubtle: 'border-[#F0E2E4]',
    accentColor: '#B26B79',
    accentHover: '#985260',
    badgeBg: 'bg-[#F7EBEF]',
    fontDisplay: 'font-display',
    fontBody: 'font-body',
    paletteDescription: 'Blush Cream (#FDF8F8) tạo cảm giác ngọt ngào dịu êm, hoa hồng khô Dusty Rose (#B26B79) làm nút hành động tinh tế, Espresso (#2B2325) bảo đảm độ đọc tối ưu.',
    colors: {
      primary: '#FDF8F8',
      secondary: '#F0E2E4',
      accent: '#B26B79',
      surface: '#FFFFFF',
      text: '#2B2325'
    }
  },
  'minimal-noir': {
    id: 'minimal-noir',
    name: 'Hiện Đại & Tối Giản (Minimalist Editorial Noir)',
    tagline: 'Đường nét thanh mảnh, tỷ lệ vàng tạp chí thời trang Vogue, dứt khoát và thời thượng',
    bgPage: 'bg-[#FAFAFA]',
    bgCard: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#121214]',
    textSecondary: 'text-[#5C5C64]',
    textAccent: 'text-[#121214]',
    borderSubtle: 'border-[#E4E4E7]',
    accentColor: '#121214',
    accentHover: '#27272A',
    badgeBg: 'bg-[#F4F4F5]',
    fontDisplay: 'font-display',
    fontBody: 'font-body',
    paletteDescription: 'Đen Trắng Tinh Khiết (#121214 & #FAFAFA) với các đường hairline 1px (#E4E4E7). Tập trung 100% vào kiểu chữ (Typography) và khoảng thở không gian (Negative Space).',
    colors: {
      primary: '#FAFAFA',
      secondary: '#E4E4E7',
      accent: '#121214',
      surface: '#FFFFFF',
      text: '#121214'
    }
  },
  'warm-terracotta': {
    id: 'warm-terracotta',
    name: 'Ấm Cúng & Mộc Mạc (Warm Terracotta & Sage)',
    tagline: 'Chất liệu thiên nhiên, gốm nung mộc mạc và lá thảo mộc xanh biếc an yên',
    bgPage: 'bg-[#FAF6F0]',
    bgCard: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#28211E]',
    textSecondary: 'text-[#645953]',
    textAccent: 'text-[#BD6349]',
    borderSubtle: 'border-[#EADFD5]',
    accentColor: '#BD6349',
    accentHover: '#A44F37',
    badgeBg: 'bg-[#F5EBE1]',
    fontDisplay: 'font-luxury',
    fontBody: 'font-body',
    paletteDescription: 'Màu gốm đất nung Terracotta (#BD6349) kết hợp nền yến mạch mộc (#FAF6F0) và xanh xô thơm (#5E7153). Mang lại cảm xúc gần gũi, ấm áp như bữa cơm sum họp gia đình.',
    colors: {
      primary: '#FAF6F0',
      secondary: '#EADFD5',
      accent: '#BD6349',
      surface: '#FFFFFF',
      text: '#28211E'
    }
  }
};

export const PRESET_WEDDING: InvitationData = {
  id: 'wedding-preset',
  eventType: 'wedding',
  styleTheme: 'ivory-gold',
  backgroundArtStyle: 'botanical-roses',
  eventTitle: 'LỄ THÀNH HÔN & DẠ TIỆC CƯỚI',
  subTitle: 'Hân hoan kính báo tin vui cùng quý quan khách',
  primaryHosts: 'Mạnh Hùng & Thảo Linh',
  secondaryHosts: 'Gia đình Hai Họ',
  parentsGroom: 'Ông Nguyễn Văn An & Bà Trần Thị Bình (Nhà Trai)',
  parentsBride: 'Ông Lê Minh Tuấn & Bà Phạm Thu Hằng (Nhà Gái)',
  targetDateTime: '2026-12-25T18:00:00',
  displayDate: 'Thứ Sáu, Ngày 25 Tháng 12 Năm 2026',
  displayTime: '18:00 (Đón khách & Tiệc trà từ 17:30)',
  lunarDate: 'Tức ngày 17 tháng 11 năm Bính Ngọ',
  venueName: 'Trung Tâm Hội Nghị GEM Center - Grand Ballroom',
  venueRoom: 'Sảnh Castor - Lầu 5',
  venueAddress: 'Số 8 Nguyễn Bỉnh Khiêm, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2965646399996!2d106.69830847586887!3d10.788582989360812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4ae1b99737%3A0xc3f25c798083a31c!2sGEM%20Center!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s',
  mapExternalUrl: 'https://maps.google.com/?q=GEM+Center+8+Nguyen+Binh+Khiem+Quan+1+Ho+Chi+Minh',
  dressCodeTitle: 'Trang Phục Tham Dự (Dress Code)',
  dressCodeColors: [
    { name: 'Champagne Gold', hex: '#D4AF37' },
    { name: 'Ivory White', hex: '#FDFBF7' },
    { name: 'Warm Beige', hex: '#D8C7B5' },
    { name: 'Soft Muted Rose', hex: '#C49A99' }
  ],
  dressCodeNote: 'Quý khách vui lòng hạn chế mặc trang phục thuần đen hoặc đỏ thẫm để không gian ảnh kỷ niệm thêm phần hài hòa.',
  welcomeMessage: 'Tình yêu không chỉ là nhìn nhau, mà là cùng nhau nhìn về một hướng. Sau những năm tháng cùng nhau sẻ chia buồn vui, chúng tôi hạnh phúc được nắm tay bước vào chương mới của cuộc đời.',
  quote: '"Được yêu sâu sắc bởi một người cho bạn sức mạnh, yêu sâu sắc một người cho bạn dũng khí."',
  storyTitle: 'Hành Trình Tình Yêu & Tri Kỷ',
  storyBody: 'Từ giảng đường đại học năm 2019 với những buổi chiều mưa Sài Gòn cùng ly cà phê đá, đến những chuyến hành trình rong ruổi khắp mọi miền đất nước. Hôm nay, trước sự chứng kiến của gia đình, người thân và những người bạn tri kỷ, chúng mình chính thức kết duyên trăm năm.',
  timeline: [
    {
      id: 'tl-1',
      time: '17:30',
      title: 'Đón Tiếp Quan Khách & Welcome Drinks',
      description: 'Check-in thảm đỏ, ký tên lưu niệm tại Sổ Lưu Bút và thưởng thức tiệc finger food nhẹ cùng rượu vang khai vị.',
      iconType: 'welcome'
    },
    {
      id: 'tl-2',
      time: '18:30',
      title: 'Nghi Lễ Thành Hôn Trọng Thể',
      description: 'Lắng nghe lời nguyện ước (Vows), trao nhẫn cưới thiêng liêng và nghi thức rót rượu tháp champagne hạnh phúc.',
      iconType: 'ceremony'
    },
    {
      id: 'tl-3',
      time: '19:00',
      title: 'Khai Tiệc Mừng Ẩm Thực',
      description: 'Thưởng thức thực đơn tiệc cưới cao cấp kết hợp màn trình diễn hòa tấu violin & cello acoustic lãng mạn.',
      iconType: 'feast'
    },
    {
      id: 'tl-4',
      time: '20:30',
      title: 'Khiêu Vũ, Trò Chơi Gắn Kết & After-Party',
      description: 'Tung hoa cưới may mắn, bốc thăm quà tặng tri ân và cùng khiêu vũ những giai điệu ngọt ngào.',
      iconType: 'party'
    }
  ],
  rsvpDeadline: 'Ngày 15 Tháng 12, 2026',
  contactPhone: '0909 123 456 (Chú rể Hùng) - 0908 654 321 (Cô dâu Linh)',
  bankGift: {
    bankName: 'Vietcombank - Chi nhánh Sài Gòn',
    accountNumber: '1018998877',
    accountHolder: 'NGUYEN MANH HUNG',
    note: 'Mung cuoi Hung Linh'
  },
  guestNameDefault: 'Anh/Chị và Người thương'
};

export const PRESET_BIRTHDAY: InvitationData = {
  id: 'birthday-preset',
  eventType: 'birthday',
  styleTheme: 'blush-rose',
  backgroundArtStyle: 'gold-bokeh',
  eventTitle: 'DẠ TIỆC SINH NHẬT - CHAPTER 30',
  subTitle: 'A Celebration of Grace, Joy & Lifelong Friendships',
  primaryHosts: 'Minh Anh',
  secondaryHosts: 'Cùng Gia Đình & Những Người Bạn Thân Thiết',
  targetDateTime: '2026-11-20T18:30:00',
  displayDate: 'Thứ Bảy, Ngày 20 Tháng 11 Năm 2026',
  displayTime: '18:30 (Đón khách từ 18:00)',
  venueName: 'The Deck Saigon - Riverside Garden Lounge',
  venueRoom: 'Khu Vực Sunset Terrace bên sông',
  venueAddress: '38 Nguyễn Ư Dĩ, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.995955637207!2d106.73812857586925!3d10.811612789339327!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752622f671bb41%3A0xc3fa599df899f8d9!2sThe%20Deck%20Saigon!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s',
  mapExternalUrl: 'https://maps.google.com/?q=The+Deck+Saigon+38+Nguyen+U+Di+Thao+Dien',
  dressCodeTitle: 'Trang Phục Gợi Ý (Dress Code)',
  dressCodeColors: [
    { name: 'Blush Pink', hex: '#F4C2C2' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Pastel Sage', hex: '#9CAF88' },
    { name: 'Sunset Bronze', hex: '#CD7F32' }
  ],
  dressCodeNote: 'Phong cách Elegant Cocktail / Smart Casual, ưu tiên trang phục thanh lịch nhẹ nhàng bên bờ sông hoàng hôn.',
  welcomeMessage: 'Tuổi 30 là cột mốc tuyệt đẹp khi chúng ta đủ trưởng thành để trân trọng từng phút giây hiện tại, và đủ nhiệt huyết để theo đuổi những ước mơ rực rỡ.',
  quote: '"Tuổi tác chỉ là những con số ghi lại hành trình bạn đã gom góp được bao nhiêu nụ cười và kỷ niệm đáng giá."',
  storyTitle: 'Lời Tri Ân Tuổi 30 Rực Rỡ',
  storyBody: 'Cảm ơn bạn đã luôn là một phần ý nghĩa trong hành trình thanh xuân của Minh Anh. Bữa tiệc này không chỉ để thổi nến đón tuổi mới, mà là dịp để tụi mình cùng ngồi lại, nâng ly ngắm hoàng hôn sông Sài Gòn và ôn lại những kỷ niệm đẹp nhất.',
  timeline: [
    {
      id: 'b-1',
      time: '18:00',
      title: 'Đón Khách & Hoàng Hôn Sunset Cocktails',
      description: 'Chụp hình kỷ niệm bên góc hoa tươi Sunset Garden, nhâm nhi cocktail mát lành ngắm thuyền xuôi sông.',
      iconType: 'welcome'
    },
    {
      id: 'b-2',
      time: '19:00',
      title: 'Thổi Nến & Lời Chia Sẻ Tuổi Mới',
      description: 'Thổi nến bánh kem sinh nhật, nâng ly champagne chúc mừng dấu mốc tròn 30 tuổi.',
      iconType: 'ceremony'
    },
    {
      id: 'b-3',
      time: '19:30',
      title: 'Tiệc Nướng BBQ & Rượu Vang',
      description: 'Thực đơn nướng hải sản tươi thượng hạng kết hợp rượu vang nồng ấm.',
      iconType: 'feast'
    },
    {
      id: 'b-4',
      time: '21:00',
      title: 'Acoustic Jamming & Mini Game Vui Nhộn',
      description: 'Đàn hát guitar mộc, bốc thăm quà kỷ niệm và tâm sự đêm muộn.',
      iconType: 'party'
    }
  ],
  rsvpDeadline: 'Ngày 12 Tháng 11, 2026',
  contactPhone: '0912 345 678 (Minh Anh)',
  guestNameDefault: 'Bạn thân mến'
};

export const PRESET_YEAREND: InvitationData = {
  id: 'yearend-preset',
  eventType: 'yearend',
  styleTheme: 'minimal-noir',
  backgroundArtStyle: 'gold-bokeh',
  eventTitle: 'GALA DINNER TẤT NIÊN 2026',
  subTitle: 'Tôn Vinh Bản Lĩnh - Kết Nối Tương Lai · InnovateTech Gala',
  primaryHosts: 'Ban Giám Đốc InnovateTech Corporation',
  secondaryHosts: 'Toàn Thể Cán Bộ Nhân Viên & Quý Đối Tác',
  targetDateTime: '2026-12-30T18:00:00',
  displayDate: 'Thứ Tư, Ngày 30 Tháng 12 Năm 2026',
  displayTime: '18:00 (Check-in & Thảm đỏ từ 17:00)',
  venueName: 'Khách Sạn Park Hyatt Saigon - Ballroom',
  venueRoom: 'Grand Ballroom - Tầng Trệt',
  venueAddress: 'Số 2 Công Trường Lam Sơn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4539121980836!2d106.70068567586867!3d10.776501289372224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f476a086053%3A0xc3fa599df899f8d9!2sPark%20Hyatt%20Saigon!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s',
  mapExternalUrl: 'https://maps.google.com/?q=Park+Hyatt+Saigon+2+Cong+Truong+Lam+Son',
  dressCodeTitle: 'Trang Phục Tham Dự (Dress Code)',
  dressCodeColors: [
    { name: 'Black Tie', hex: '#111111' },
    { name: 'Metallic Silver', hex: '#C0C0C0' },
    { name: 'Midnight Navy', hex: '#1B263B' },
    { name: 'Pure White', hex: '#FFFFFF' }
  ],
  dressCodeNote: 'Black-Tie / Sang trọng quý phái: Nam mặc Tuxedo/Suit tối màu, Nữ mặc đầm dạ hội sang trọng.',
  welcomeMessage: 'Khép lại một năm 2026 kiên cường và đột phá. Chúng tôi trân trọng kính mời Quý Đối tác và toàn thể Anh Chị Em tụ họp trong đêm Gala đặc biệt nhất năm.',
  quote: '"Thành công lớn lao không tạo nên bởi một cá nhân, mà là bản giao hưởng của tập thể gắn kết."',
  storyTitle: 'Thông Điệp Tri Ân & Chuyển Mình 2027',
  storyBody: 'Một chặng đường 365 ngày đã qua với biết bao nỗ lực không ngừng nghỉ. Đêm nay là thời khắc chúng ta cùng tôn vinh những cống hiến xuất sắc, nâng ly cảm tạ sự đồng hành và thắp sáng khát vọng vươn tầm năm mới.',
  timeline: [
    {
      id: 'y-1',
      time: '17:00 - 18:00',
      title: 'Đón Khách, Thảm Đỏ & Check-in Photo Booth 360',
      description: 'Chụp hình thảm đỏ danh dự, nhận số may mắn Lucky Draw và tiệc cocktail giao lưu.',
      iconType: 'welcome'
    },
    {
      id: 'y-2',
      time: '18:15 - 19:00',
      title: 'Khai Mạc, Phát Biểu Tổng Kết & Tôn Vinh Xuất Sắc',
      description: 'Phim ngắn nhìn lại năm 2026, phát biểu định hướng từ Chủ tịch và lễ trao giải Top Performers.',
      iconType: 'speech'
    },
    {
      id: 'y-3',
      time: '19:00 - 20:30',
      title: 'Khai Tiệc Dạ Hội Ẩm Thực 5 Sao',
      description: 'Thực đơn fine-dining chuẩn quốc tế kết hợp live show ca nhạc của nghệ sĩ khách mời.',
      iconType: 'feast'
    },
    {
      id: 'y-4',
      time: '20:30 - 22:00',
      title: 'Bốc Thăm May Mắn (Lucky Draw) & Countdown Nhảy Gala',
      description: 'Bốc thăm các giải thưởng công nghệ giá trị lớn và DJ set chào đón thềm năm mới rực rỡ.',
      iconType: 'party'
    }
  ],
  rsvpDeadline: 'Ngày 22 Tháng 12, 2026',
  contactPhone: '028 3824 1234 (Ban Thư Ký Gala)',
  guestNameDefault: 'Quý Đối Tác & Quý Đồng Nghiệp'
};

export const INITIAL_WISHES: GuestRSVP[] = [
  {
    id: 'w-1',
    guestName: 'Nguyễn Hải Đăng & Lan Phương',
    phone: '0903***789',
    attending: 'yes',
    guestCount: 2,
    dietary: 'Không có yêu cầu đặc biệt',
    wishes: 'Chúc hai bạn một hành trình hôn nhân viên mãn, ngọt ngào như ngày đầu và luôn nắm chặt tay nhau vượt qua mọi thử thách!',
    createdAt: 'Hôm qua, 20:15'
  },
  {
    id: 'w-2',
    guestName: 'Hoàng Minh Khôi (Đồng nghiệp thân)',
    phone: '0918***456',
    attending: 'yes',
    guestCount: 1,
    dietary: 'Ăn chay nhẹ nếu có',
    wishes: 'Thiệp mời quá tinh tế và xúc động! Chắc chắn mình sẽ có mặt đúng giờ để nâng ly chúc phúc cho đôi bạn trẻ!',
    createdAt: 'Hôm nay, 08:30'
  },
  {
    id: 'w-3',
    guestName: 'Gia đình Chú Bảy (Hà Nội)',
    phone: '0988***123',
    attending: 'yes',
    guestCount: 3,
    dietary: 'Bình thường',
    wishes: 'Chúc hai cháu trăm năm hạnh phúc, gia đình êm ấm, sớm đón thiên thần nhỏ nhé!',
    createdAt: 'Hôm nay, 10:45'
  }
];

export const UX_UI_DESIGN_SPEC = {
  sectionStructure: [
    {
      order: 1,
      name: 'Trang 1: Bìa & Lời Mời Đầu (Cover & Hero)',
      purpose: 'Tạo ấn tượng thị giác đầu tiên (First Impression) đẳng cấp, kích hoạt cảm xúc trang trọng qua phong bì sáp niêm phong và lời mời cá nhân hóa.',
      components: [
        'Hiệu ứng mở phong bì (Wax Seal Unfold)',
        'Monogram nghệ thuật lồng chữ cái chủ nhân',
        'Tên sự kiện & Tên nhân vật chính nổi bật ở cấp thị giác cao nhất',
        'Lời chào cá nhân hóa "Trân trọng kính mời [Tên Khách]"',
        'Thời gian chi tiết & Đồng hồ đếm ngược (Countdown Timer) trực quan',
        'Nút "Thêm vào Lịch" (Google Calendar / Apple iCal)'
      ],
      uxRationale: 'Khách mời mở thiệp thường muốn biết ngay: "Ai mời? Khi nào diễn ra?". Đồng hồ đếm ngược tạo sự háo hức và tính cấp thiết (urgency), nút Lưu lịch giải quyết nỗi sợ quên ngày tiệc.'
    },
    {
      order: 2,
      name: 'Trang 2: Câu Chuyện & Lịch Trình (Story & Program Timeline)',
      purpose: 'Truyền tải chiều sâu cảm xúc, ý nghĩa của sự kiện và giúp khách chuẩn bị chu đáo về thời gian biểu lẫn trang phục.',
      components: [
        'Đoạn văn ngắn bộc bạch tâm tình chân thành, ấm áp',
        'Trích dẫn thơ / châm ngôn lãng mạn ý nghĩa',
        'Timeline dọc tương tác theo từng khung giờ (Đón khách -> Khai lễ -> Dùng tiệc -> Giao lưu)',
        'Quy chuẩn trang phục (Dress Code) với bảng màu trực quan (Color swatches) có mã tên rõ ràng'
      ],
      uxRationale: 'Timeline chia nhỏ giúp khách chủ động sắp xếp công việc để có mặt đúng giờ quan trọng (đặc biệt là lễ cưới hoặc trao giải). Bảng màu dress code trực quan tránh việc khách phân vân về màu sắc.'
    },
    {
      order: 3,
      name: 'Trang 3: Không Gian & Bản Đồ Google Maps (Venue & Map Navigation)',
      purpose: 'Giải quyết triệt để nhu cầu đi lại, tìm đường, gửi xe và check-in không gian tiệc mà không gặp bất kỳ trở ngại nào.',
      components: [
        'Tên sảnh tiệc, số tầng, địa chỉ hành chính chi tiết',
        'Khung Google Maps nhúng có thể phóng to, thu nhỏ, kéo xem xung quanh',
        'Nút "Chỉ Đường Trên Google Maps" (mở app bản đồ với tọa độ chính xác)',
        'Nút "Sao Chép Địa Chỉ" với phản hồi Toast trực quan trong 2 giây',
        'Lưu ý về bãi đỗ xe ô tô/xe máy và hướng dẫn thang máy'
      ],
      uxRationale: 'Đặt nút Google Maps to, rõ ràng và có nút Sao Chép Địa Chỉ giải quyết bài toán khách đang chạy xe hoặc gọi taxi/Grab chỉ cần 1 chạm là dán ngay điểm đến.'
    },
    {
      order: 4,
      name: 'Trang 4: Xác Nhận Tham Dự & Sổ Lưu Bút (RSVP & Guestbook Wall)',
      purpose: 'Thu thập thông tin chính xác phục vụ công tác đặt bàn tiệc của chủ nhà, đồng thời tạo sân chơi gửi gắm yêu thương.',
      components: [
        'Form RSVP tinh gọn: Tên, SĐT, Đi mấy người, Có tham dự được không, Chế độ ăn uống',
        'Lời chúc mừng gửi gắm cho chủ tiệc',
        'Hiệu ứng pháo hoa Confetti rực rỡ ăn mừng ngay khi gửi thành công',
        'Bức tường lời chúc (Wish Wall) cập nhật trực tiếp theo thời gian thực',
        'Hộp mừng cưới / Quà mừng online (VietQR và số tài khoản ngân hàng tinh tế)'
      ],
      uxRationale: 'RSVP đặt ở cuối luồng để sau khi khách đã cảm nhận toàn bộ câu chuyện và nắm rõ thời gian, địa điểm, họ sẽ đưa ra quyết định xác nhận với tâm thế hào hứng và cam kết cao nhất.'
    }
  ],
  buttonPlacementStrategy: [
    {
      buttonName: 'Mở Thiệp / Bóc Niêm Phong Sáp (Wax Seal Button)',
      position: 'Chính giữa màn hình mở đầu (Overlay Hero)',
      reason: 'Biến thao tác lướt web vô hồn thành nghi thức bóc thiệp thiêng liêng ngoài đời thực, đồng thời kích hoạt trình phát nhạc nền lãng mạn theo đúng chính sách tự động phát âm thanh của trình duyệt.'
    },
    {
      buttonName: 'Thêm Vào Lịch (Google Calendar / iCal)',
      position: 'Ngay dưới mốc ngày giờ ở Section 1',
      reason: 'Khoảnh khắc khách vừa đọc ngày tháng là lúc họ dễ dàng bấm nút nhất để thêm sự kiện vào Google Calendar / điện thoại mà không phải gõ tay.'
    },
    {
      buttonName: 'Chỉ Đường Google Maps & Sao Chép Địa Chỉ',
      position: 'Nằm kép ngay dưới tiêu đề địa điểm ở Section 3',
      reason: 'Đây là vị trí công thái học tối ưu khi khách đang trên đường hoặc chuẩn bị book xe công nghệ.'
    },
    {
      buttonName: 'Xác Nhận Tham Dự (RSVP Submit Button)',
      position: 'Cuối form ở Section 4 + Có thể kích hoạt từ thanh điều hướng nhanh',
      reason: 'Đảm bảo khách đã xem đủ thông tin cần thiết trước khi cam kết số lượng người tham dự.'
    },
    {
      buttonName: 'Hộp Mừng Quà / Mừng Cưới (Gift QR Modal)',
      position: 'Nút phụ trang nhã ở chân trang Section 4',
      reason: 'Thiết kế theo chuẩn văn hóa hiện đại: tế nhị, không bắt buộc, chỉ mở ra khi khách có nhu cầu gửi mừng từ xa.'
    }
  ]
};
