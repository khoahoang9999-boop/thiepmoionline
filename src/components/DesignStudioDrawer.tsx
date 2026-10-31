import React, { useState } from 'react';
import { InvitationData, StyleTheme, ThemeConfig, EventType } from '../types/invitation';
import { THEME_CONFIGS, PRESET_WEDDING, PRESET_BIRTHDAY, PRESET_YEAREND, UX_UI_DESIGN_SPEC } from '../data/invitationData';
import { 
  X, 
  Sparkles, 
  Layout, 
  Palette, 
  Compass, 
  FileText, 
  Share2, 
  Check, 
  Smartphone, 
  Monitor, 
  RefreshCw,
  Copy,
  Code,
  Download,
  ExternalLink,
  BookOpen,
  Sliders
} from 'lucide-react';

interface DesignStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: InvitationData;
  onChangeInvitation: (data: InvitationData) => void;
  currentTheme: ThemeConfig;
  onChangeTheme: (theme: StyleTheme) => void;
  guestName: string;
  onChangeGuestName: (name: string) => void;
  viewMode: 'desktop' | 'mobile';
  onChangeViewMode: (mode: 'desktop' | 'mobile') => void;
}

export const DesignStudioDrawer: React.FC<DesignStudioDrawerProps> = ({
  isOpen,
  onClose,
  invitation,
  onChangeInvitation,
  currentTheme,
  onChangeTheme,
  guestName,
  onChangeGuestName,
  viewMode,
  onChangeViewMode
}) => {
  const [activeTab, setActiveTab] = useState<'consult' | 'custom' | 'share' | 'export'>('consult');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (type: EventType) => {
    if (type === 'wedding') {
      onChangeInvitation(PRESET_WEDDING);
      onChangeTheme(PRESET_WEDDING.styleTheme);
    } else if (type === 'birthday') {
      onChangeInvitation(PRESET_BIRTHDAY);
      onChangeTheme(PRESET_BIRTHDAY.styleTheme);
    } else if (type === 'yearend') {
      onChangeInvitation(PRESET_YEAREND);
      onChangeTheme(PRESET_YEAREND.styleTheme);
    }
  };

  const shareableUrl = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(guestName || invitation.guestNameDefault)}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <h2 className="text-lg font-luxury font-semibold text-stone-900">
                Bảng Điều Khiển Chuyên Gia UX/UI & Studio Thiệp
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Tư vấn cấu trúc, văn phong, bảng màu và tùy chỉnh thông số thiệp mời tương tác
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-5 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('consult')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'consult'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tư Vấn Thiết Kế UX/UI</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Tùy Chỉnh Nội Dung & Theme</span>
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'share'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Cá Nhân Hóa</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'export'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Mã index.html Đơn Lẻ</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* TAB 1: EXPERT CONSULTATION & UX/UI DESIGN REPORT */}
          {activeTab === 'consult' && (
            <div className="space-y-8">
              {/* Introduction */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs leading-relaxed text-amber-950">
                <p className="font-semibold text-amber-900 text-sm mb-1">
                  Kính gửi Gia chủ / Ban Tổ Chức,
                </p>
                Dưới vai trò Chuyên gia Thiết kế Thiệp mời & Trải nghiệm Người dùng (UX/UI Designer), tôi đã chuẩn hóa trang thiệp mời online của bạn theo mô hình Canva Website / HTML tương tác cao cấp. Dưới đây là 4 giải pháp thiết kế toàn diện:
              </div>

              {/* 1. CẤU TRÚC 4 SECTION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-semibold border-b pb-2">
                  <Layout className="w-4 h-4 text-amber-700" />
                  <h3 className="text-base font-luxury">
                    1. Cấu Trúc Thiệp 4 Trang (Sections) Chuẩn Hành Trình Khách Mời
                  </h3>
                </div>
                <div className="space-y-3">
                  {UX_UI_DESIGN_SPEC.sectionStructure.map((sec) => (
                    <div
                      key={sec.order}
                      className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900 text-sm">
                          {sec.name}
                        </span>
                        <span className="text-[11px] text-amber-800 font-medium">
                          Giai đoạn {sec.order}/4
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        <strong>Mục đích UX:</strong> {sec.purpose}
                      </p>
                      <div className="text-xs text-stone-500 pt-1">
                        <strong>Thành phần chính:</strong> {sec.components.join(' · ')}
                      </div>
                      <p className="text-[11px] text-stone-500 italic bg-white p-2 rounded border border-stone-100 mt-2">
                        💡 <strong>Lý do thiết kế:</strong> {sec.uxRationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. SOẠN THẢO CÂU TỪ & VĂN PHONG */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-semibold border-b pb-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <h3 className="text-base font-luxury">
                    2. Soạn Thảo Lời Mời Trang Trọng & Ngọt Ngào Theo Từng Chủ Đề
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                    <p className="font-semibold text-stone-900 text-sm mb-1">
                      🌸 Lễ Cưới / Thành Hôn (Ngọt ngào, tôn kính, đong đầy yêu thương)
                    </p>
                    <p className="text-stone-600 italic">
                      "Tình yêu không chỉ là nhìn nhau, mà là cùng nhau nhìn về một hướng. Sau những năm tháng cùng nhau sẻ chia buồn vui, chúng tôi hạnh phúc được nắm tay bước vào chương mới của cuộc đời..."
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                    <p className="font-semibold text-stone-900 text-sm mb-1">
                      🎂 Tiệc Sinh Nhật / Dấu Ấn Tuổi Mới (Ấm áp, thanh xuân, tri ân bạn bè)
                    </p>
                    <p className="text-stone-600 italic">
                      "Tuổi tác chỉ là những con số ghi lại hành trình bạn đã gom góp được bao nhiêu nụ cười và kỷ niệm đáng giá. Bữa tiệc này là dịp để tụi mình cùng ngồi lại, nâng ly ngắm hoàng hôn và tâm sự..."
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                    <p className="font-semibold text-stone-900 text-sm mb-1">
                      🥂 Tiệc Tất Niên Doanh Nghiệp (Trang trọng, tự hào, kết nối và bứt phá)
                    </p>
                    <p className="text-stone-600 italic">
                      "Khép lại một năm kiên cường và đột phá. Chúng tôi trân trọng kính mời Quý Đối tác và toàn thể Cán bộ Nhân viên tụ họp trong đêm Gala đặc biệt nhất năm để tôn vinh và thắp sáng tương lai..."
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. MÀU SẮC & PHÔNG CHỮ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-semibold border-b pb-2">
                  <Palette className="w-4 h-4 text-amber-700" />
                  <h3 className="text-base font-luxury">
                    3. Đề Xuất Bảng Màu (Color Palette) & Phông Chữ (Fonts) Chuẩn Tỷ Lệ Vàng
                  </h3>
                </div>
                <p className="text-xs text-stone-600">
                  Áp dụng nguyên tắc phối màu <strong>60 - 30 - 10</strong> và quy chuẩn <strong>2 Font Families</strong> (1 Expressive Serif cho tiêu đề + 1 Clean Sans-serif cho nội dung):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(THEME_CONFIGS) as StyleTheme[]).map((key) => {
                    const t = THEME_CONFIGS[key];
                    return (
                      <div
                        key={key}
                        onClick={() => onChangeTheme(key)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          currentTheme.id === key
                            ? 'border-stone-900 ring-2 ring-stone-900/10 bg-stone-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xs text-stone-800">
                            {t.name.split('(')[0]}
                          </span>
                          {currentTheme.id === key && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Đang chọn ✓
                            </span>
                          )}
                        </div>

                        {/* Color swatches */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded border border-stone-300" style={{ backgroundColor: t.colors.primary }} title="60% Nền" />
                          <div className="w-5 h-5 rounded border border-stone-300" style={{ backgroundColor: t.colors.secondary }} title="30% Khung" />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: t.colors.accent }} title="10% Nhấn" />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: t.colors.text }} title="Chữ chính" />
                        </div>

                        <p className="text-[11px] text-stone-500 leading-snug">
                          {t.paletteDescription}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* 16:9 Artwork Canvas Preview */}
                <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-800">
                      Bản Vẽ Hình Nền Nghệ Thuật (16:9 Botanical Background)
                    </span>
                    <span className="text-[10px] uppercase font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      16:9 · Vector Fine-Art
                    </span>
                  </div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-[#FAF8F5] via-[#FCFAF6] to-[#F5EFE6] border border-stone-200 shadow-inner flex items-center justify-center p-6 text-center">
                    <div className="absolute top-2 left-2 text-[10px] text-stone-400 font-serif">
                      🌿 White Roses & Gold Leaf
                    </div>
                    <div className="relative z-10 max-w-xs">
                      <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">
                        Khu vực trung tâm sạch thoáng
                      </p>
                      <p className="text-base font-luxury text-stone-800 font-medium mt-0.5">
                        Clean Empty Space for Typography
                      </p>
                      <p className="text-[11px] text-stone-500 italic mt-1">
                        Ánh sáng lãng mạn dịu êm kết hợp viền hoa hồng trắng và ánh kim hoàng gia
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-2">
                    ✓ Đã nhúng trực tiếp làm hình nền chính của Trang 1 (Bìa Thiệp & Lời Mời Đầu), bảo đảm hiển thị sắc nét trên cả màn hình Retina 4K lẫn smartphone.
                  </p>
                </div>
              </div>

              {/* 4. VỊ TRÍ ĐẶT NÚT TƯƠNG TÁC */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-semibold border-b pb-2">
                  <Compass className="w-4 h-4 text-amber-700" />
                  <h3 className="text-base font-luxury">
                    4. Gợi Ý Vị Trí Đặt Nút Tương Tác Công Thái Học (UX Placement)
                  </h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  {UX_UI_DESIGN_SPEC.buttonPlacementStrategy.map((btn, i) => (
                    <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-stone-900">{btn.buttonName}</strong>
                        <span className="text-[11px] text-amber-900 font-medium">
                          Vị trí: {btn.position}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {btn.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CUSTOMIZER */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Presets Quick Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Chọn Nhanh Mẫu Sự Kiện (Preset Template)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleApplyPreset('wedding')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      invitation.eventType === 'wedding'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    💍 Tiệc Cưới
                  </button>
                  <button
                    onClick={() => handleApplyPreset('birthday')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      invitation.eventType === 'birthday'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    🎂 Sinh Nhật
                  </button>
                  <button
                    onClick={() => handleApplyPreset('yearend')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      invitation.eventType === 'yearend'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    🥂 Tất Niên Gala
                  </button>
                </div>
              </div>

              {/* Theme Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Phong Cách & Bảng Màu (Style Theme)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEME_CONFIGS) as StyleTheme[]).map((themeKey) => {
                    const th = THEME_CONFIGS[themeKey];
                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          onChangeTheme(themeKey);
                          onChangeInvitation({ ...invitation, styleTheme: themeKey });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          currentTheme.id === themeKey
                            ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-300"
                            style={{ backgroundColor: th.accentColor }}
                          />
                          <span className="text-xs font-semibold text-stone-800">
                            {th.name.split('(')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Art Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Hình Nền Nghệ Thuật (Artwork Background)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeInvitation({ ...invitation, backgroundArtStyle: 'gold-bokeh' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      (invitation.backgroundArtStyle || (invitation.eventType === 'wedding' ? 'botanical-roses' : 'gold-bokeh')) === 'gold-bokeh'
                        ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-800">
                      <span>✨</span>
                      <span>Gold Bokeh Party</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Ánh đèn bokeh vàng kim, nền kem beige ấm, khung tối giản
                    </p>
                  </button>

                  <button
                    onClick={() => onChangeInvitation({ ...invitation, backgroundArtStyle: 'botanical-roses' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      (invitation.backgroundArtStyle || (invitation.eventType === 'wedding' ? 'botanical-roses' : 'gold-bokeh')) === 'botanical-roses'
                        ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-800">
                      <span>🌿</span>
                      <span>White Roses & Gold</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Hoa hồng trắng, cành lá mềm mại, chi tiết dát vàng
                    </p>
                  </button>
                </div>
              </div>

              {/* Detail inputs */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Tên Sự Kiện
                  </label>
                  <input
                    type="text"
                    value={invitation.eventTitle}
                    onChange={(e) => onChangeInvitation({ ...invitation, eventTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Tên Nhân Vật Chính / Chủ Tiệc
                  </label>
                  <input
                    type="text"
                    value={invitation.primaryHosts}
                    onChange={(e) => onChangeInvitation({ ...invitation, primaryHosts: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Thời Gian (Hiển thị)
                    </label>
                    <input
                      type="text"
                      value={invitation.displayTime}
                      onChange={(e) => onChangeInvitation({ ...invitation, displayTime: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Ngày Diễn Ra
                    </label>
                    <input
                      type="text"
                      value={invitation.displayDate}
                      onChange={(e) => onChangeInvitation({ ...invitation, displayDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Tên Nhà Hàng / Địa Điểm
                  </label>
                  <input
                    type="text"
                    value={invitation.venueName}
                    onChange={(e) => onChangeInvitation({ ...invitation, venueName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Địa Chỉ Chi Tiết
                  </label>
                  <input
                    type="text"
                    value={invitation.venueAddress}
                    onChange={(e) => onChangeInvitation({ ...invitation, venueAddress: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Thông Điệp Mở Đầu / Lời Mời
                  </label>
                  <textarea
                    rows={2}
                    value={invitation.welcomeMessage}
                    onChange={(e) => onChangeInvitation({ ...invitation, welcomeMessage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Hạn Chót Xác Nhận (RSVP Deadline)
                  </label>
                  <input
                    type="text"
                    value={invitation.rsvpDeadline}
                    onChange={(e) => onChangeInvitation({ ...invitation, rsvpDeadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONALIZATION & GUEST LINK */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs leading-relaxed text-stone-700">
                <p className="font-semibold text-stone-900 mb-1 text-sm">
                  Cá Nhân Hóa Tên Từng Khách Mời
                </p>
                Để thể hiện sự tôn trọng tuyệt đối, bạn hãy nhập danh xưng và tên của từng vị khách. Hệ thống sẽ sinh đường link riêng biệt, khi người đó bấm mở sẽ thấy tên mình trang trọng trên bìa thiệp và phong bì sáp niêm phong!
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Tên Khách Mời (Danh Xưng & Họ Tên)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => onChangeGuestName(e.target.value)}
                  placeholder="Ví dụ: Anh Hoàng & Chị Mai, Gia đình Bác Bảy, Em Tuấn..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <p className="text-xs font-medium text-stone-600">
                  Đường Link Chia Sẻ Riêng Cho Vị Khách Này:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareableUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono text-stone-700 truncate"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-stone-800 transition-colors shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 space-y-2">
                <p className="text-xs font-semibold text-stone-800">
                  Cách Gửi Mời Chuẩn Tế Nhị & Thanh Lịch:
                </p>
                <div className="p-3 rounded bg-white border border-stone-200 text-xs text-stone-600 leading-relaxed italic">
                  "Dạ em/chúng em trân trọng gửi thiệp mời trực tuyến tới {guestName || 'Anh/Chị'}. Kính mời {guestName || 'Anh/Chị'} bấm vào link để cùng xem chi tiết thời gian và địa điểm tổ chức tiệc: {shareableUrl}. Rất mong được đón tiếp {guestName || 'Anh/Chị'}!"
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT SINGLE FILE index.html */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs leading-relaxed text-amber-950">
                <p className="font-semibold text-amber-900 text-sm mb-1">
                  File index.html Tự Chứa (Self-Contained) Duy Nhất
                </p>
                Được viết trọn vẹn bằng HTML5, Tailwind CSS (CDN), hiệu ứng cuộn trang AOS, Countdown Timer bằng JavaScript thuần, khung bản đồ Google Maps và nút chuyển hướng Google Form. Bạn chỉ cần tải file về và mở trực tiếp trên bất kỳ trình duyệt nào (Chrome, Safari, Edge) mà không cần cài đặt Node.js hay build!
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href="/standalone-invitation.html"
                  download="index.html"
                  className="py-3 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-stone-800 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Tải File index.html</span>
                </a>

                <a
                  href="/standalone-invitation.html"
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-stone-50 shadow-xs transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-stone-500" />
                  <span>Mở Trang Đơn File</span>
                </a>

                <button
                  onClick={() => {
                    fetch('/standalone-invitation.html')
                      .then((res) => res.text())
                      .then((text) => {
                        navigator.clipboard.writeText(text);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2500);
                      });
                  }}
                  className="py-3 px-4 rounded-xl bg-amber-100/70 border border-amber-300/80 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Đã chép toàn bộ mã!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Mã Nguồn</span>
                    </>
                  )}
                </button>
              </div>

              {/* Technical Feature Checklist */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <p className="font-semibold text-stone-900">
                  Thông Số Kỹ Thuật Trong File index.html:
                </p>
                <ul className="space-y-1.5 text-stone-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Tông màu Pastel &amp; Gold hoàng gia với Tailwind CSS CDN tự cấu hình</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Thư viện AOS (Animate On Scroll) kích hoạt hiệu ứng mượt mà khi cuộn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>JavaScript thuần đếm ngược tự động theo ngày/giờ/phút/giây tới ngày 25/12/2026</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Khung &lt;iframe&gt; Google Maps nhúng trực tiếp kèm nút mở app chỉ đường</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Nút Xác nhận tham dự (RSVP) chuyển hướng trực tiếp đến Google Form</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Trình phát nhạc nền Web Audio API không phụ thuộc file mp3 ngoài</span>
                  </li>
                </ul>
              </div>

              {/* Code Snippet Preview */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-stone-600">
                  Xem Trước Đoạn Đầu Của File index.html:
                </span>
                <pre className="p-4 rounded-xl bg-stone-900 text-stone-200 text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
{`<!DOCTYPE html>
<html lang="vi" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thiệp Mời Cưới - Mạnh Hùng & Thảo Linh</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- AOS CSS -->
  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
  ...
  <!-- JavaScript Countdown & Google Maps & RSVP -->
</head>`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Switcher: Mobile vs Desktop Viewport */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span>Chế độ hiển thị:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200">
              <button
                onClick={() => onChangeViewMode('desktop')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (1440px)</span>
              </button>
              <button
                onClick={() => onChangeViewMode('mobile')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Canva Mobile (390px)</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            Đóng bảng điều khiển
          </button>
        </div>
      </div>
    </div>
  );
};
