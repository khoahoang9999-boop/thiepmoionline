import React, { useState, useEffect } from 'react';
import { WeddingData, SideType, getAdjustedImageStyle } from '../../types/wedding';
import { DEFAULT_WEDDING_DATA, MUSIC_PLAYLIST } from '../../data/weddingDefault';
import { buildShareableSideUrl, normalizeRelativeAssetUrl } from '../../utils/shareLinkCodec';
import { formatVietnameseSolarDate } from '../../utils/lunarCalendar';
import {
  X,
  Check,
  Copy,
  Sparkles,
  CloudUpload,
  Smartphone,
  Monitor,
  Music,
  Image as ImageIcon,
  Palette,
  Play,
  ExternalLink,
  RefreshCw,
  Save,
  Download,
  ShieldCheck,
  QrCode
} from 'lucide-react';

interface PublishCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingData: WeddingData;
  onChangeData: (newData: WeddingData) => void;
  onSaveCard: () => Promise<void> | void;
  onPublishCard: (dataToPublish?: WeddingData) => Promise<WeddingData | null>;
  onOpenCustomLinkModal?: () => void;
}

export const PublishCardModal: React.FC<PublishCardModalProps> = ({
  isOpen,
  onClose,
  weddingData,
  onChangeData,
  onSaveCard,
  onPublishCard,
  onOpenCustomLinkModal
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedSide, setCopiedSide] = useState<SideType | null>(null);
  const [showQrSide, setShowQrSide] = useState<SideType | null>(null);
  const [guestNameInput, setGuestNameInput] = useState('');

  // Auto-synchronize when opening the Publish modal so links are always up to date
  useEffect(() => {
    if (isOpen) {
      handleTriggerPublish(weddingData, true);
    } else {
      setCopiedSide(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thiepmoionline.khoahoang9999.workers.dev';

  const groomLink = buildShareableSideUrl(origin, 'groom', weddingData, {
    guestName: guestNameInput.trim() || undefined
  });
  const brideLink = buildShareableSideUrl(origin, 'bride', weddingData, {
    guestName: guestNameInput.trim() || undefined
  });

  const currentTrack = MUSIC_PLAYLIST.find((m) => m.id === weddingData.selectedMusicId) || MUSIC_PLAYLIST[0];

  const themeLabels: Record<string, string> = {
    'imperial-dragon': 'Hoàng Triều Khắc Rồng',
    'burgundy-roses': 'Minimalism - Đỏ Đậm Quý Phái',
    'long-phung-red': 'Long Phụng V4 - Đỏ Hoàng Gia',
    'vintage-brown': 'Minimalism - Nâu Đậm Vintage',
    'pastel-floral': 'Hoa Khô V2 - Lam & Pastel',
    'modern-emerald': 'Hiện Đại - Xanh Ngọc Lâu Đài'
  };

  const handleToggleMotion = (
    field: 'autoScroll' | 'autoPlayMusic' | 'fallingPetals' | 'autoPlay3dGallery',
    value: boolean
  ) => {
    const next: WeddingData = {
      ...weddingData,
      [field]: value
    };
    onChangeData(next);
  };

  const handleTriggerSave = async () => {
    setIsSaving(true);
    try {
      await onSaveCard();
    } finally {
      setTimeout(() => setIsSaving(false), 600);
    }
  };

  const handleTriggerPublish = async (customData?: WeddingData, silent = false) => {
    setIsPublishing(true);
    if (!silent) setPublishSuccess(false);
    try {
      await onPublishCard(customData || weddingData);
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBumpLinkVersion = async () => {
    setIsPublishing(true);
    try {
      const nextVer = (weddingData.publishedVersion || 1) + 1;
      const updatedData: WeddingData = {
        ...weddingData,
        publishedVersion: nextVer,
        updatedAtMs: Date.now()
      };
      onChangeData(updatedData);
      await onPublishCard(updatedData);
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopySynchronizedLink = async (side: SideType) => {
    // Ensure latest state is published & synchronized before copying link
    setIsPublishing(true);
    try {
      const synced = await onPublishCard(weddingData);
      const effectiveData = synced || weddingData;
      const url = buildShareableSideUrl(origin, side, effectiveData, {
        guestName: guestNameInput.trim() || undefined
      });
      await navigator.clipboard.writeText(url);
      setPublishSuccess(true);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 3000);
    } catch {
      const fallbackUrl = side === 'groom' ? groomLink : brideLink;
      navigator.clipboard.writeText(fallbackUrl);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadBackupJson = async () => {
    const { exportWeddingJsonWithEmbeddedImages } = await import('../../utils/shareLinkCodec');
    await exportWeddingJsonWithEmbeddedImages(
      weddingData,
      `thiep_cuoi_${weddingData.groomShortName || 'chu-re'}_${weddingData.brideShortName || 'co-dau'}_backup.json`
    );
  };

  const groomCover = normalizeRelativeAssetUrl(
    weddingData.shareGroom?.coverPhotoUrl || weddingData.shareCoverPhotoUrl || DEFAULT_WEDDING_DATA.shareCoverPhotoUrl
  );
  const brideCover = normalizeRelativeAssetUrl(
    weddingData.shareBride?.coverPhotoUrl || weddingData.shareCoverPhotoUrl || DEFAULT_WEDDING_DATA.shareCoverPhotoUrl
  );

  const groomTitle =
    weddingData.shareGroom?.title ||
    `Thiệp Mời Tiệc Nhà Trai - ${weddingData.groomShortName || 'Quang Hưng'} & ${weddingData.brideShortName || 'Minh Tuệ'}`;
  const brideTitle =
    weddingData.shareBride?.title ||
    `Thiệp Mời Tiệc Nhà Gái - ${weddingData.brideShortName || 'Minh Tuệ'} & ${weddingData.groomShortName || 'Quang Hưng'}`;

  const groomDesc = (() => {
    const raw = weddingData.shareGroom?.description;
    const time = weddingData.partyGroom?.time || '16:00';
    const date = formatVietnameseSolarDate(weddingData.partyGroom?.date) || '29/11/2026';
    if (!raw) return `Thân mời quý khách đến dự tiệc Nhà Trai vào lúc ${time} ngày ${date}`;
    if (/vào lúc\s+\d{1,2}:\d{2}/i.test(raw) && /ngày\s+\d{1,2}\/\d{1,2}\/\d{4}/i.test(raw)) {
      return raw
        .replace(/vào lúc\s+\d{1,2}:\d{2}/i, `vào lúc ${time}`)
        .replace(/ngày\s+\d{1,2}\/\d{1,2}\/\d{4}/i, `ngày ${date}`);
    }
    return raw;
  })();

  const brideDesc = (() => {
    const raw = weddingData.shareBride?.description;
    const time = weddingData.partyBride?.time || '10:00';
    const date = formatVietnameseSolarDate(weddingData.partyBride?.date) || '22/11/2026';
    if (!raw) return `Thân mời quý khách đến dự tiệc Nhà Gái vào lúc ${time} ngày ${date}`;
    if (/vào lúc\s+\d{1,2}:\d{2}/i.test(raw) && /ngày\s+\d{1,2}\/\d{1,2}\/\d{4}/i.test(raw)) {
      return raw
        .replace(/vào lúc\s+\d{1,2}:\d{2}/i, `vào lúc ${time}`)
        .replace(/ngày\s+\d{1,2}\/\d{1,2}\/\d{4}/i, `ngày ${date}`);
    }
    return raw;
  })();

  const totalSyncedImages =
    (weddingData.groomAvatarUrl ? 1 : 0) +
    (weddingData.brideAvatarUrl ? 1 : 0) +
    (weddingData.heroPhotoUrl ? 1 : 0) +
    (groomCover ? 1 : 0) +
    (brideCover ? 1 : 0) +
    (weddingData.galleryPhotos?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* HEADER */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#14294B] via-[#1C3766] to-[#2B1438] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-serif text-amber-200">
                  Chế Độ Xuất Thiệp &amp; Đồng Bộ Đa Nền Tảng
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  Điện thoại &amp; Máy tính
                </span>
              </div>
              <p className="text-xs text-stone-200">
                Sao lưu đồng bộ toàn bộ hình ảnh, âm thanh, mẫu thiệp &amp; cơ chế tự chuyển động cho đường link Nhà Trai và Nhà Gái
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. TRẠNG THÁI SAO LƯU & ĐỒNG BỘ (HÌNH ẢNH, ÂM THANH, MẪU THIỆP, CƠ CHẾ TỰ CHUYỂN ĐỘNG) */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-stone-900 text-xs sm:text-sm">
                  1. Kiểm tra đồng bộ Hình ảnh, Âm thanh, Mẫu thiệp &amp; Cơ chế tự chuyển động
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 font-semibold border border-blue-200">
                  <Smartphone className="w-3 h-3" /> iOS / Android / Zalo
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 font-semibold border border-purple-200">
                  <Monitor className="w-3 h-3" /> Web / Máy tính
                </span>
              </div>
            </div>

            {/* 3 Pillar Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Hình ảnh */}
              <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-800">Hình Ảnh Thiệp</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Đã đồng bộ <strong>{totalSyncedImages} ảnh</strong> (Đại diện, Ảnh đầu, Bìa Zalo/FB &amp; Album 3D)
                  </p>
                </div>
              </div>

              {/* Âm thanh */}
              <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-800">Âm Thanh Nhạc Nền</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                    {weddingData.selectedMusicId === 'custom-upload'
                      ? weddingData.customAudioName || 'Nhạc tải lên cá nhân'
                      : currentTrack.title}{' '}
                    (Chuẩn phát tự động)
                  </p>
                </div>
              </div>

              {/* Mẫu thiệp */}
              <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-800">Mẫu Thiệp &amp; Bìa Mở</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                    {themeLabels[weddingData.themeTemplate] || 'Hoàng Triều Khắc Rồng'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cơ chế tự chuyển động toggles */}
            <div className="pt-2">
              <label className="block font-bold text-stone-700 mb-2">
                Cấu hình cơ chế tự chuyển động (Đồng bộ trên cả Điện thoại &amp; Máy tính khi khách mở link):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer hover:border-emerald-400 transition-colors">
                  <span className="font-semibold text-stone-800 text-[11px]">🎵 Tự động phát nhạc</span>
                  <input
                    type="checkbox"
                    checked={weddingData.autoPlayMusic !== false}
                    onChange={(e) => handleToggleMotion('autoPlayMusic', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer hover:border-emerald-400 transition-colors">
                  <span className="font-semibold text-stone-800 text-[11px]">📜 Tự động cuộn thiệp</span>
                  <input
                    type="checkbox"
                    checked={weddingData.autoScroll !== false}
                    onChange={(e) => handleToggleMotion('autoScroll', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer hover:border-emerald-400 transition-colors">
                  <span className="font-semibold text-stone-800 text-[11px]">🌸 Cánh hoa rơi tự động</span>
                  <input
                    type="checkbox"
                    checked={weddingData.fallingPetals !== false}
                    onChange={(e) => handleToggleMotion('fallingPetals', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer hover:border-emerald-400 transition-colors">
                  <span className="font-semibold text-stone-800 text-[11px]">🖼️ Tự chạy Album 3D</span>
                  <input
                    type="checkbox"
                    checked={weddingData.autoPlay3dGallery !== false}
                    onChange={(e) => handleToggleMotion('autoPlay3dGallery', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 2. NÚT HÀNH ĐỘNG: LƯU THÔNG TIN THIỆP & CHẾ ĐỘ XUẤT THIỆP */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#123524] to-emerald-900 text-white border border-emerald-700 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-sm sm:text-base text-amber-200 font-serif">
                  2. Lưu Thông Tin Thiệp &amp; Xuất Bản Thiệp Đồng Bộ
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                {isPublishing
                  ? 'Đang đóng gói và đồng bộ hình ảnh, âm thanh, hiệu ứng lên máy chủ...'
                  : publishSuccess || weddingData.isPublished
                  ? `✅ Đã xuất bản & đồng bộ thành công (Phiên bản #${weddingData.publishedVersion || 1} - ${
                      weddingData.publishedAt || 'Vừa xong'
                    }). Bạn có thể copy link Nhà Trai hoặc Nhà Gái ngay bên dưới!`
                  : 'Bấm "Xuất Thiệp & Đồng Bộ" để cập nhật toàn bộ dữ liệu trước khi copy link gửi khách.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleTriggerSave}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin thiệp'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPublish(weddingData, false)}
                disabled={isPublishing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Xuất Thiệp...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>🚀 Xuất Thiệp &amp; Đồng Bộ Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tùy chọn nhập tên khách mời cá nhân hóa trước khi copy */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex-1">
              <label className="block font-bold text-stone-800 text-xs">
                ✍️ Nhập tên khách mời (Tùy chọn - sẽ hiện trên bìa &quot;Mở thiệp&quot;):
              </label>
              <input
                type="text"
                value={guestNameInput}
                onChange={(e) => setGuestNameInput(e.target.value)}
                placeholder="Để trống nếu gửi chung, hoặc nhập VD: Anh Nam & Chị Hương..."
                className="mt-1 w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {onOpenCustomLinkModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCustomLinkModal();
                }}
                className="px-3 py-2 rounded-lg bg-white hover:bg-stone-100 text-pink-700 font-bold text-xs border border-pink-200 shrink-0 cursor-pointer self-end sm:self-center"
              >
                ⚙️ Tùy chỉnh đuôi đường link
              </button>
            )}
          </div>

          {/* 3. KHU VỰC COPY ĐƯỜNG LINK NHÀ TRAI & NHÀ GÁI SAU KHI XUẤT THIỆP */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wide">
                3. Copy Đường Link Đã Xuất Bản (Đồng Bộ Điện Thoại &amp; Máy Tính)
              </h4>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                  <span>Mã link:</span>
                  <span className="text-pink-700">v={weddingData.publishedVersion || 1}</span>
                </span>
                <button
                  type="button"
                  onClick={handleBumpLinkVersion}
                  disabled={isPublishing}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Tự động đổi mã link phiên bản mới (v=...) để Zalo & Facebook bắt buộc quét lại ảnh bìa & nội dung mới nhất mà không bị lưu cache cũ"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                  <span>🔄 Tạo mã link mới (Xóa cache Zalo)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD NHÀ TRAI */}
              <div className="rounded-2xl border-2 border-[#1C3766]/30 bg-[#F8FAFC] overflow-hidden flex flex-col justify-between shadow-sm">
                <div>
                  <div className="px-4 py-2.5 bg-[#1C3766] text-white flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span>🤵 ĐƯỜNG LINK THẾP NHÀ TRAI</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold">
                      Đã đồng bộ
                    </span>
                  </div>

                  {/* Mini OG Preview */}
                  <div className="p-3 space-y-2.5">
                    <div className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs">
                      <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                        <img
                          src={groomCover}
                          alt="Ảnh bìa Nhà Trai"
                          style={getAdjustedImageStyle(weddingData.shareGroom?.coverPosition || weddingData.shareCoverPosition)}
                          onError={(e) => {
                            if (DEFAULT_WEDDING_DATA.shareCoverPhotoUrl && e.currentTarget.src !== DEFAULT_WEDDING_DATA.shareCoverPhotoUrl) {
                              e.currentTarget.src = DEFAULT_WEDDING_DATA.shareCoverPhotoUrl;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 inset-x-3 text-center text-white">
                          <span className="text-[9px] uppercase tracking-widest text-amber-200 block">
                            Thếp Mời Nhà Trai
                          </span>
                          <p className="font-serif font-bold text-sm">
                            {weddingData.groomShortName || 'Quang Hưng'} ♥ {weddingData.brideShortName || 'Minh Tuệ'}
                          </p>
                        </div>
                      </div>
                      <div className="p-2.5 bg-stone-50 border-t border-stone-200">
                        <p className="font-bold text-stone-900 text-xs">{groomTitle}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{groomDesc}</p>
                      </div>
                    </div>

                    {/* Link Box */}
                    <div className="p-2.5 rounded-xl bg-white border border-stone-300 font-mono text-[11px] text-blue-950 font-bold break-all">
                      {groomLink}
                    </div>

                    {showQrSide === 'groom' && (
                      <div className="p-3 rounded-xl bg-white border border-stone-200 flex flex-col items-center text-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(groomLink)}`}
                          alt="QR Nhà Trai"
                          className="w-32 h-32 rounded-lg border border-stone-200 p-1"
                        />
                        <span className="text-[10px] text-stone-500 mt-1">Quét mã QR mở thiệp Nhà Trai trên điện thoại</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopySynchronizedLink('groom')}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      copiedSide === 'groom'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1C3766] hover:bg-blue-950 text-white'
                    }`}
                  >
                    {copiedSide === 'groom' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đã Copy Link Nhà Trai (Đồng Bộ)!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link Nhà Trai</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQrSide(showQrSide === 'groom' ? null : 'groom')}
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 cursor-pointer"
                    title="Hiện mã QR Nhà Trai"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <a
                    href={groomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300"
                    title="Mở xem thử Link Nhà Trai"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* CARD NHÀ GÁI */}
              <div className="rounded-2xl border-2 border-rose-700/30 bg-[#FFF9FA] overflow-hidden flex flex-col justify-between shadow-sm">
                <div>
                  <div className="px-4 py-2.5 bg-rose-700 text-white flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span>👰 ĐƯỜNG LINK THẾP NHÀ GÁI</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] font-bold">
                      Đã đồng bộ
                    </span>
                  </div>

                  {/* Mini OG Preview */}
                  <div className="p-3 space-y-2.5">
                    <div className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs">
                      <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                        <img
                          src={brideCover}
                          alt="Ảnh bìa Nhà Gái"
                          style={getAdjustedImageStyle(weddingData.shareBride?.coverPosition || weddingData.shareCoverPosition)}
                          onError={(e) => {
                            if (DEFAULT_WEDDING_DATA.shareCoverPhotoUrl && e.currentTarget.src !== DEFAULT_WEDDING_DATA.shareCoverPhotoUrl) {
                              e.currentTarget.src = DEFAULT_WEDDING_DATA.shareCoverPhotoUrl;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 inset-x-3 text-center text-white">
                          <span className="text-[9px] uppercase tracking-widest text-amber-200 block">
                            Thếp Mời Nhà Gái
                          </span>
                          <p className="font-serif font-bold text-sm">
                            {weddingData.brideShortName || 'Minh Tuệ'} ♥ {weddingData.groomShortName || 'Quang Hưng'}
                          </p>
                        </div>
                      </div>
                      <div className="p-2.5 bg-stone-50 border-t border-stone-200">
                        <p className="font-bold text-stone-900 text-xs">{brideTitle}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{brideDesc}</p>
                      </div>
                    </div>

                    {/* Link Box */}
                    <div className="p-2.5 rounded-xl bg-white border border-stone-300 font-mono text-[11px] text-rose-950 font-bold break-all">
                      {brideLink}
                    </div>

                    {showQrSide === 'bride' && (
                      <div className="p-3 rounded-xl bg-white border border-stone-200 flex flex-col items-center text-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(brideLink)}`}
                          alt="QR Nhà Gái"
                          className="w-32 h-32 rounded-lg border border-stone-200 p-1"
                        />
                        <span className="text-[10px] text-stone-500 mt-1">Quét mã QR mở thiệp Nhà Gái trên điện thoại</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopySynchronizedLink('bride')}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      copiedSide === 'bride'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-700 hover:bg-rose-800 text-white'
                    }`}
                  >
                    {copiedSide === 'bride' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đã Copy Link Nhà Gái (Đồng Bộ)!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link Nhà Gái</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQrSide(showQrSide === 'bride' ? null : 'bride')}
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 cursor-pointer"
                    title="Hiện mã QR Nhà Gái"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <a
                    href={brideLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300"
                    title="Mở xem thử Link Nhà Gái"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={handleDownloadBackupJson}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-200 text-stone-700 font-semibold border border-stone-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Tải tệp sao lưu (.JSON) về máy</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold cursor-pointer"
            >
              Hoàn tất &amp; Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
