import React, { useRef } from 'react';
import { WeddingData, SideType, ShareSideConfig, getAdjustedImageStyle, getPartyTypeLabel } from '../../types/wedding';
import { DEFAULT_WEDDING_DATA } from '../../data/weddingDefault';
import { formatVietnameseSolarDate } from '../../utils/lunarCalendar';
import {
  buildShareableSideUrl,
  compressAndUploadImage,
  normalizeRelativeAssetUrl,
  syncWeddingDataToServer,
  publishWeddingCardToServer
} from '../../utils/shareLinkCodec';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Sliders,
  RotateCcw,
  Link2,
  Share2,
  CloudUpload,
  Save,
  Users
} from 'lucide-react';
import { CustomLinkModal } from './CustomLinkModal';
import { ShareMenuModal } from './ShareMenuModal';

interface SocialSharePreviewProps {
  data: WeddingData;
  activeSide: SideType;
  onChangeSide: (side: SideType) => void;
  onUpdate: (field: keyof WeddingData, value: any) => void;
  onOpenAdjustModal?: (imageUrl: string, side: SideType) => void;
  onOpenPublishModal?: () => void;
  onSaveCard?: () => void;
  onOpenGuestListModal?: () => void;
}

export const SocialSharePreview: React.FC<SocialSharePreviewProps> = ({
  data,
  activeSide,
  onChangeSide,
  onUpdate,
  onOpenAdjustModal,
  onOpenPublishModal,
  onSaveCard,
  onOpenGuestListModal
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedSide, setCopiedSide] = React.useState<SideType | null>(null);
  const [isSyncingCopy, setIsSyncingCopy] = React.useState<SideType | null>(null);
  const [isCustomLinkModalOpen, setIsCustomLinkModalOpen] = React.useState(false);
  const [isShareMenuModalOpen, setIsShareMenuModalOpen] = React.useState(false);

  const isGroom = activeSide === 'groom';
  const party = isGroom ? data.partyGroom : data.partyBride;
  const formattedPartyDate = formatVietnameseSolarDate(party.date);
  const groomDateStr = formatVietnameseSolarDate(data.partyGroom?.date || '2026-11-29');
  const brideDateStr = formatVietnameseSolarDate(data.partyBride?.date || '2026-11-22');

  const gPartyType = getPartyTypeLabel(data.partyGroom);
  const bPartyType = getPartyTypeLabel(data.partyBride);

  const defaultGroomShare: ShareSideConfig = {
    coverPhotoUrl: normalizeRelativeAssetUrl(data.shareGroom?.coverPhotoUrl ?? data.shareCoverPhotoUrl ?? ''),
    coverPosition: data.shareGroom?.coverPosition || data.shareCoverPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' },
    title: (data.shareGroom?.title && data.shareGroom.title.trim() !== '')
      ? data.shareGroom.title
      : `Thiệp Mời ${gPartyType.labelCap} - ${data.groomShortName || 'Quang Hưng'} & ${data.brideShortName || 'Minh Tuệ'}`,
    description: ((typeof data.shareGroom?.description === 'string' && data.shareGroom.description.trim() !== '')
      ? data.shareGroom.description.trim()
      : `Kính mời quý khách tới dự ${gPartyType.labelLower} của ${data.groomShortName || 'Quang Hưng'} & ${data.brideShortName || 'Minh Tuệ'} vào lúc ${data.partyGroom?.time || '16:00'} ngày ${groomDateStr} tại ${data.partyGroom?.venueAddress || ''}`),
    dateText: data.shareGroom?.dateText || groomDateStr
  };

  const brideTimeFix = data.partyBride?.time === '22:00' ? '10:00' : (data.partyBride?.time || '10:00');

  const defaultBrideShare: ShareSideConfig = {
    coverPhotoUrl: normalizeRelativeAssetUrl(data.shareBride?.coverPhotoUrl ?? data.shareCoverPhotoUrl ?? ''),
    coverPosition: data.shareBride?.coverPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' },
    title: (data.shareBride?.title && data.shareBride.title.trim() !== '')
      ? data.shareBride.title
      : `Thiệp Mời ${bPartyType.labelCap} - ${data.brideShortName || 'Minh Tuệ'} & ${data.groomShortName || 'Quang Hưng'}`,
    description: ((typeof data.shareBride?.description === 'string' && data.shareBride.description.trim() !== '')
      ? data.shareBride.description.trim()
      : `Kính mời quý khách tới dự ${bPartyType.labelLower} của ${data.brideShortName || 'Minh Tuệ'} & ${data.groomShortName || 'Quang Hưng'} vào lúc ${brideTimeFix} ngày ${brideDateStr} tại ${data.partyBride?.venueAddress || ''}`)
        .replace(/22:00/g, '10:00'),
    dateText: data.shareBride?.dateText || brideDateStr
  };

  const currentShare = isGroom ? defaultGroomShare : defaultBrideShare;
  const shareFieldKey: 'shareGroom' | 'shareBride' = isGroom ? 'shareGroom' : 'shareBride';

  const updateCurrentShare = (patch: Partial<ShareSideConfig>) => {
    const updated: ShareSideConfig = {
      ...currentShare,
      ...patch
    };
    onUpdate(shareFieldKey, updated);
  };

  const coupleNamesOnBanner = isGroom
    ? `${data.groomShortName || 'Quang Hưng'} ♥ ${data.brideShortName || 'Minh Tuệ'}`
    : `${data.brideShortName || 'Minh Tuệ'} ♥ ${data.groomShortName || 'Quang Hưng'}`;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const url = await compressAndUploadImage(file);
      updateCurrentShare({
        coverPhotoUrl: url,
        coverPosition: { x: 50, y: 50, zoom: 100, fit: 'contain' }
      });
      if (onOpenAdjustModal) {
        onOpenAdjustModal(url, activeSide);
      }
    } catch {
      // ignore
    }
  };

  const [copiedMessage, setCopiedMessage] = React.useState<SideType | null>(null);
  const [copiedFreshCache, setCopiedFreshCache] = React.useState<SideType | null>(null);

  const getShareUrlForSide = (side: SideType, freshCache = false) => {
    const base = buildShareableSideUrl(window.location.origin, side, data);
    const sideQuery = side === 'groom' ? 'side=groom' : 'side=bride';
    let url = base;
    if (!url.includes('side=')) {
      url += (url.includes('?') ? '&' : '?') + sideQuery;
    }
    if (freshCache) {
      const v = (data.publishedVersion || 1) + 1;
      url += `&v=${v}`;
    }
    return url;
  };

  const handleCopyLinkForSide = async (side: SideType, freshCache = false) => {
    setIsSyncingCopy(side);
    const url = getShareUrlForSide(side, freshCache);
    const activeShareGroom = isGroom ? currentShare : defaultGroomShare;
    const activeShareBride = !isGroom ? currentShare : defaultBrideShare;
    const dataToPublish: WeddingData = {
      ...data,
      shareGroom: activeShareGroom,
      shareBride: activeShareBride
    };
    try {
      await publishWeddingCardToServer(dataToPublish);
    } catch {
      syncWeddingDataToServer(dataToPublish);
    }
    navigator.clipboard.writeText(url);
    setIsSyncingCopy(null);
    if (freshCache) {
      setCopiedFreshCache(side);
      setTimeout(() => setCopiedFreshCache(null), 2400);
    } else {
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 2400);
    }
  };

  const handleCopyInvitationMessage = async (side: SideType) => {
    const url = getShareUrlForSide(side);
    const cfg = side === 'groom' ? (isGroom ? currentShare : defaultGroomShare) : (!isGroom ? currentShare : defaultBrideShare);
    const desc = cfg.description || (side === 'groom' ? DEFAULT_WEDDING_DATA.shareGroom!.description : DEFAULT_WEDDING_DATA.shareBride!.description);
    const fullMessage = `${desc}\n👉 Xem thiệp hỷ & gửi lời chúc mừng: ${url}`;
    navigator.clipboard.writeText(fullMessage);
    setCopiedMessage(side);
    setTimeout(() => setCopiedMessage(null), 2400);
  };

  const handleSyncAutoDescription = () => {
    if (isGroom) {
      updateCurrentShare({
        title: `Thiệp Mời ${gPartyType.labelCap} - ${data.groomShortName || 'Quang Hưng'} & ${data.brideShortName || 'Minh Tuệ'}`,
        dateText: formatVietnameseSolarDate(data.partyGroom.date),
        description: `Kính mời quý khách tới dự ${gPartyType.labelLower} của ${data.groomShortName || 'Quang Hưng'} & ${data.brideShortName || 'Minh Tuệ'} vào lúc ${data.partyGroom.time || '16:00'} ngày ${formatVietnameseSolarDate(data.partyGroom.date)} tại ${data.partyGroom.venueAddress}`
      });
    } else {
      const bTime = data.partyBride.time === '22:00' ? '10:00' : (data.partyBride.time || '10:00');
      updateCurrentShare({
        title: `Thiệp Mời ${bPartyType.labelCap} - ${data.brideShortName || 'Minh Tuệ'} & ${data.groomShortName || 'Quang Hưng'}`,
        dateText: formatVietnameseSolarDate(data.partyBride.date),
        description: `Kính mời quý khách tới dự ${bPartyType.labelLower} của ${data.brideShortName || 'Minh Tuệ'} & ${data.groomShortName || 'Quang Hưng'} vào lúc ${bTime} ngày ${formatVietnameseSolarDate(data.partyBride.date)} tại ${data.partyBride.venueAddress}`
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. SIDE SWITCHER: Cấu hình riêng khi gửi Link Nhà Trai vs Link Nhà Gái */}
      <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-800">
            Chọn thếp để chỉnh ảnh bìa &amp; nội dung khi gửi link:
          </span>
          <span className="text-[11px] font-semibold text-pink-600">
            2 Link &amp; Nội dung tách biệt
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeSide('groom')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              isGroom
                ? 'bg-[#1C3766] text-white shadow-sm'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <span>🤵 Thếp Gửi Nhà Trai</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeSide('bride')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              !isGroom
                ? 'bg-[#E01460] text-white shadow-sm'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <span>👰 Thếp Gửi Nhà Gái</span>
          </button>
        </div>
      </div>

      {/* 2. Upload button & Quick Actions for Active Side */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
        <div>
          <span className="font-bold text-stone-800 block">
            Ảnh bìa khi gửi link {isGroom ? 'NHÀ TRAI' : 'NHÀ GÁI'} (Zalo / Facebook / iMessage)
          </span>
          <span className="text-[11px] text-stone-500">
            Ảnh bìa của {isGroom ? 'Nhà Trai' : 'Nhà Gái'} độc lập, có thể dùng 2 ảnh khác nhau
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3.5 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
              isGroom ? 'bg-[#1C3766] hover:bg-[#13274A]' : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải ảnh bìa {isGroom ? 'Nhà Trai' : 'Nhà Gái'}</span>
          </button>
          {currentShare.coverPhotoUrl && (
            <>
              {onOpenAdjustModal && (
                <button
                  type="button"
                  onClick={() => onOpenAdjustModal(currentShare.coverPhotoUrl, activeSide)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-pink-600" />
                  <span>Căn chỉnh ảnh</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => updateCurrentShare({ coverPhotoUrl: '' })}
                className="px-2.5 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition-colors"
                title="Xóa ảnh để trống khung chia sẻ"
              >
                Để trống
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Inputs for Title, Date, and Summary Description of Active Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-stone-600 font-semibold mb-1">
            Tiêu đề khi gửi link ({isGroom ? 'Nhà Trai' : 'Nhà Gái'})
          </label>
          <input
            type="text"
            value={currentShare.title}
            onChange={(e) => updateCurrentShare({ title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none"
            placeholder={isGroom ? 'Thiệp Mời Tiệc Nhà Trai...' : 'Thiệp Mời Tiệc Nhà Gái...'}
          />
        </div>

        <div>
          <label className="block text-stone-600 font-semibold mb-1">
            Ngày hiển thị trên ảnh bìa ({isGroom ? 'Nhà Trai' : 'Nhà Gái'})
          </label>
          <input
            type="text"
            value={currentShare.dateText}
            onChange={(e) => updateCurrentShare({ dateText: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none"
            placeholder={formattedPartyDate || '29/11/2026'}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-stone-600 font-semibold text-xs">
            Nội dung mô tả tóm tắt khi gửi link ({isGroom ? 'Nhà Trai' : 'Nhà Gái'})
          </label>
          <button
            type="button"
            onClick={handleSyncAutoDescription}
            className="text-[11px] text-pink-600 hover:underline flex items-center gap-1 font-medium"
            title="Tự động điền theo ngày giờ và địa chỉ của nhà đang chọn"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đồng bộ theo lịch {isGroom ? 'Nhà Trai' : 'Nhà Gái'}</span>
          </button>
        </div>
        <textarea
          rows={2}
          value={currentShare.description}
          onChange={(e) => updateCurrentShare({ description: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none"
          placeholder="Thân mời quý khách đến dự..."
        />
      </div>

      {/* 4. Separate Share Links Box for Nhà Trai & Nhà Gái */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5 text-xs">
        <div className="font-bold text-stone-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-amber-700" />
            <span>Đường link gửi thiệp &amp; Đồng bộ đa nền tảng:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {onSaveCard && (
              <button
                type="button"
                onClick={onSaveCard}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Lưu thông tin thiệp hiện tại"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thông tin thiệp</span>
              </button>
            )}
            {onOpenPublishModal && (
              <button
                type="button"
                onClick={onOpenPublishModal}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#1C3766] to-blue-900 hover:from-blue-950 hover:to-blue-950 text-amber-200 font-extrabold text-[11px] shadow-xs flex items-center gap-1 cursor-pointer"
                title="Mở chế độ Xuất thiệp & đồng bộ hình ảnh, âm thanh, hiệu ứng trên Điện thoại & Máy tính"
              >
                <CloudUpload className="w-3.5 h-3.5 text-amber-300" />
                <span>🚀 Xuất thiệp</span>
              </button>
            )}
            {onOpenGuestListModal && (
              <button
                type="button"
                onClick={onOpenGuestListModal}
                className="px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Dán danh sách khách mời hàng loạt & chọn xưng hô cá nhân hóa"
              >
                <Users className="w-3.5 h-3.5 text-indigo-200" />
                <span>👥 Khách Mời &amp; Xưng Hô</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsShareMenuModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#E01460] hover:bg-[#C20E50] text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Menu chia sẻ</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                THẾP NHÀ TRAI (ĐỒNG BỘ ĐIỆN THOẠI &amp; PC)
              </span>
              <span className="font-mono text-xs text-blue-900 font-bold truncate block" title={getShareUrlForSide('groom')}>
                {getShareUrlForSide('groom').replace(/^https?:\/\//, '')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyLinkForSide('groom')}
              disabled={isSyncingCopy === 'groom'}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
              title="Đồng bộ & Chép link Nhà Trai"
            >
              {copiedSide === 'groom' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 text-[11px]">Đã đồng bộ &amp; chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isSyncingCopy === 'groom' ? 'Đang đồng bộ...' : 'Chép link'}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                THẾP NHÀ GÁI (ĐỒNG BỘ ĐIỆN THOẠI &amp; PC)
              </span>
              <span className="font-mono text-xs text-rose-900 font-bold truncate block" title={getShareUrlForSide('bride')}>
                {getShareUrlForSide('bride').replace(/^https?:\/\//, '')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyLinkForSide('bride')}
              disabled={isSyncingCopy === 'bride'}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
              title="Đồng bộ & Chép link Nhà Gái"
            >
              {copiedSide === 'bride' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 text-[11px]">Đã đồng bộ &amp; chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isSyncingCopy === 'bride' ? 'Đang đồng bộ...' : 'Chép link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] text-emerald-800 font-semibold">
            {data.publishedAt ? `✓ Đã xuất bản & đồng bộ lúc: ${data.publishedAt}` : '✓ Tự động đồng bộ khi bấm Xuất thiệp hoặc Chép link'}
          </span>
          <button
            type="button"
            onClick={() => setIsCustomLinkModalOpen(true)}
            className="text-xs text-pink-600 hover:text-pink-800 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <span>⚙️ Đổi / Tùy chỉnh đường link mới</span>
          </button>
        </div>
      </div>

      {/* CUSTOM LINK MODAL */}
      <CustomLinkModal
        isOpen={isCustomLinkModalOpen}
        activeSide={activeSide}
        weddingData={data}
        onClose={() => setIsCustomLinkModalOpen(false)}
        onSaveSlug={(newSlug, side) => {
          if (side === 'groom') {
            onUpdate('customSlugGroom', newSlug);
          } else {
            onUpdate('customSlugBride', newSlug);
          }
        }}
      />

      {/* SHARE MENU MODAL */}
      <ShareMenuModal
        isOpen={isShareMenuModalOpen}
        activeSide={activeSide}
        weddingData={data}
        onClose={() => setIsShareMenuModalOpen(false)}
        onOpenCustomLinkModal={() => setIsCustomLinkModalOpen(true)}
        onSwitchToPreview={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 5. Exact Visual Mockup for Active Side */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500">
            XEM TRƯỚC KHI GỬI LINK {isGroom ? 'NHÀ TRAI' : 'NHÀ GÁI'} (Zalo / Facebook / iMessage)
          </span>
          <button
            type="button"
            onClick={() => handleCopyLinkForSide(activeSide)}
            className="text-xs text-pink-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            {copiedSide === activeSide ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã chép link {isGroom ? 'Nhà Trai' : 'Nhà Gái'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Chép link {isGroom ? 'Nhà Trai' : 'Nhà Gái'}</span>
              </>
            )}
          </button>
        </div>

        {/* The Card */}
        <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-white select-none">
          {/* Top Banner Image with Overlay or Empty State */}
          {currentShare.coverPhotoUrl ? (
            <div className="relative w-full aspect-[16/9] bg-stone-900 overflow-hidden flex items-end justify-center">
              <img
                src={currentShare.coverPhotoUrl}
                alt={`Ảnh bìa thiệp cưới ${isGroom ? 'Nhà Trai' : 'Nhà Gái'}`}
                style={getAdjustedImageStyle(currentShare.coverPosition)}
                onError={(e) => {
                  if (DEFAULT_WEDDING_DATA.shareCoverPhotoUrl && e.currentTarget.src !== DEFAULT_WEDDING_DATA.shareCoverPhotoUrl) {
                    e.currentTarget.src = DEFAULT_WEDDING_DATA.shareCoverPhotoUrl;
                  }
                }}
              />
              {/* Dark gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

              {/* Centered Typography over photo matching couple names */}
              <div className="absolute bottom-4 inset-x-4 text-center text-white z-10 space-y-0.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-sans uppercase tracking-widest text-amber-200 mb-1">
                  {isGroom ? 'Thếp Mời Nhà Trai' : 'Thếp Mời Nhà Gái'}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight drop-shadow-lg">
                  {coupleNamesOnBanner}
                </h3>
                <p className="font-serif text-xs sm:text-sm text-stone-200 tracking-wide drop-shadow-md">
                  {currentShare.dateText || formattedPartyDate}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-44 sm:h-52 bg-stone-100 border-b border-stone-200 flex flex-col items-center justify-center text-center p-5">
              <div className="w-11 h-11 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center mb-2">
                <ImageIcon className="w-5 h-5 stroke-[1.6]" />
              </div>
              <p className="text-xs font-semibold text-stone-600">
                Chưa có ảnh bìa chia sẻ của {isGroom ? 'Nhà Trai' : 'Nhà Gái'}
              </p>
              <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                Khung hiển thị để trống (bấm &quot;Tải ảnh bìa {isGroom ? 'Nhà Trai' : 'Nhà Gái'}&quot; để thêm ảnh riêng)
              </p>
            </div>
          )}

          {/* Bottom Link Metadata Box */}
          <div className="p-4 bg-[#F8F9FA] border-t border-stone-200 space-y-1">
            <h4 className="font-bold text-stone-900 text-sm font-sans leading-snug">
              {currentShare.title}
            </h4>
            <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-2">
              {currentShare.description}
            </p>
          </div>
        </div>

        {/* Quick Actions for Zalo / Social Share */}
        <div className="mt-3 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleCopyInvitationMessage(activeSide)}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            title="Chép toàn bộ lời mời kèm đường link để gửi trực tiếp vào tin nhắn Zalo"
          >
            {copiedMessage === activeSide ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã chép tin nhắn Zalo</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-700" />
                <span>💬 Chép tin nhắn mời Zalo</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCopyLinkForSide(activeSide, true)}
            className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/90 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            title="Chép link kèm mã làm mới bộ nhớ đệm (cache) Zalo"
          >
            {copiedFreshCache === activeSide ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã chép link làm mới</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-sky-700" />
                <span>⚡ Chép link (Làm mới Zalo)</span>
              </>
            )}
          </button>
        </div>

        {/* Zalo Cache Notice & Debugger Link */}
        <div className="mt-2.5 max-w-md mx-auto p-2.5 rounded-xl bg-stone-100 border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
          <div className="flex items-center justify-between font-semibold text-stone-700">
            <span>💡 Lưu ý về hiển thị trên Zalo:</span>
            <a
              href="https://developers.zalo.me/tools/debug-share"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:underline flex items-center gap-0.5"
            >
              <span>Xóa cache Zalo ↗</span>
            </a>
          </div>
          <p className="leading-relaxed text-stone-500">
            Zalo lưu bộ nhớ đệm (cache) ảnh và mô tả thiệp. Nếu gửi link cũ mà Zalo vẫn hiện ngày giờ trước đó, bạn chỉ cần bấm <strong>&quot;⚡ Chép link (Làm mới Zalo)&quot;</strong> để Zalo tải lại thông tin mới nhất ngay lập tức.
          </p>
        </div>
      </div>
    </div>
  );
};
