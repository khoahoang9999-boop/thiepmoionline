import React, { useState, useRef } from 'react';
import { WeddingData, SideType, PartyType, GalleryDisplayType, DisplayOrder, ImageFrameAdjustment, getAdjustedImageStyle, getGroomAvatarPosition, getBrideAvatarPosition, CardOpeningStyle, getPartyTypeLabel } from '../../types/wedding';
import { DEFAULT_WEDDING_DATA, MUSIC_PLAYLIST, COVER_BACKGROUNDS, CARD_OPENING_STYLES } from '../../data/weddingDefault';
import { SocialSharePreview } from './SocialSharePreview';
import { ImageAdjustModal } from './ImageAdjustModal';
import { MapLocationPicker } from './MapLocationPicker';
import { formatVietnameseLunarDate, formatVietnameseSolarDate } from '../../utils/lunarCalendar';
import { 
  Heart, 
  Image as ImageIcon, 
  Users, 
  Megaphone, 
  Clock, 
  Cake, 
  MessageSquare, 
  Music, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Upload,
  Sparkles,
  Palette,
  Share2,
  Save,
  Check,
  Download,
  Eye,
  RefreshCw,
  Sliders,
  Lock,
  UserPlus,
  LogIn,
  CloudUpload,
  Play
} from 'lucide-react';
import { UserAccount } from '../../types/auth';

interface WeddingEditorProps {
  data: WeddingData;
  onChange: (newData: WeddingData) => void;
  activeSide: SideType;
  onChangeSide: (side: SideType) => void;
  onOpenMusicModal: () => void;
  onOpenTemplateModal?: () => void;
  onOpenPublishModal?: () => void;
  onSave?: () => void;
  onResetDefault?: () => void;
  onSwitchToPreview?: () => void;
  currentUser?: UserAccount | null;
  onRequireAuth?: (tab: 'login' | 'register') => void;
  onImportJsonData?: (importedData: WeddingData) => void;
  onTestOpeningStyle?: (style: CardOpeningStyle) => void;
  onOpenGuestListModal?: () => void;
}

export const WeddingEditor: React.FC<WeddingEditorProps> = ({
  data,
  onChange,
  activeSide,
  onChangeSide,
  onOpenMusicModal,
  onOpenTemplateModal,
  onOpenPublishModal,
  onSave,
  onResetDefault,
  onSwitchToPreview,
  currentUser,
  onRequireAuth,
  onImportJsonData,
  onTestOpeningStyle,
  onOpenGuestListModal
}) => {
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const groomAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const brideAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportInputRef = useRef<HTMLInputElement | null>(null);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isImportingJson, setIsImportingJson] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  });
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [ceremonySideTab, setCeremonySideTab] = useState<'groom' | 'bride'>('groom');

  // Modal state for interactive image position & zoom adjuster
  const [adjustModal, setAdjustModal] = useState<{
    isOpen: boolean;
    target: 'groom' | 'bride' | 'hero' | 'share-groom' | 'share-bride';
    imageUrl: string;
    title: string;
    shape: 'circle' | 'rect' | 'rect-wide';
    initialAdjustment?: ImageFrameAdjustment;
  }>({
    isOpen: false,
    target: 'groom',
    imageUrl: '',
    title: 'Điều chỉnh ảnh đại diện',
    shape: 'circle'
  });

  const openGroomAdjustModal = () => {
    if (!data.groomAvatarUrl) return;
    setAdjustModal({
      isOpen: true,
      target: 'groom',
      imageUrl: data.groomAvatarUrl,
      title: `Điều chỉnh ảnh đại diện Chú Rể (${activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})`,
      shape: 'circle',
      initialAdjustment: getGroomAvatarPosition(data, activeSide)
    });
  };

  const openBrideAdjustModal = () => {
    if (!data.brideAvatarUrl) return;
    setAdjustModal({
      isOpen: true,
      target: 'bride',
      imageUrl: data.brideAvatarUrl,
      title: `Điều chỉnh ảnh đại diện Cô Dâu (${activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})`,
      shape: 'circle',
      initialAdjustment: getBrideAvatarPosition(data, activeSide)
    });
  };

  const openHeroAdjustModal = () => {
    if (!data.heroPhotoUrl) return;
    setAdjustModal({
      isOpen: true,
      target: 'hero',
      imageUrl: data.heroPhotoUrl,
      title: 'Điều chỉnh ảnh đầu thiệp',
      shape: 'rect',
      initialAdjustment: data.heroPhotoPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' }
    });
  };

  const openShareAdjustModal = (imageUrl?: string, side: SideType = activeSide) => {
    const shareObj = side === 'groom' ? data.shareGroom : data.shareBride;
    const url = imageUrl || shareObj?.coverPhotoUrl;
    if (!url) return;
    setAdjustModal({
      isOpen: true,
      target: side === 'groom' ? 'share-groom' : 'share-bride',
      imageUrl: url,
      title: `Điều chỉnh ảnh bìa chia sẻ (${side === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})`,
      shape: 'rect-wide',
      initialAdjustment: shareObj?.coverPosition || { x: 50, y: 50, zoom: 100, fit: 'contain' }
    });
  };

  const handleApplyAdjustment = (newAdj: ImageFrameAdjustment) => {
    if (adjustModal.target === 'groom') {
      if (activeSide === 'groom') {
        onChange({
          ...data,
          groomAvatarPositionGroom: newAdj,
          groomAvatarPosition: newAdj,
          groomAvatarPositionBride: data.groomAvatarPositionBride || newAdj
        });
      } else {
        onChange({
          ...data,
          groomAvatarPositionBride: newAdj,
          groomAvatarPosition: newAdj
        });
      }
    } else if (adjustModal.target === 'bride') {
      if (activeSide === 'groom') {
        onChange({
          ...data,
          brideAvatarPositionGroom: newAdj,
          brideAvatarPosition: newAdj,
          brideAvatarPositionBride: data.brideAvatarPositionBride || newAdj
        });
      } else {
        onChange({
          ...data,
          brideAvatarPositionBride: newAdj,
          brideAvatarPosition: newAdj
        });
      }
    } else if (adjustModal.target === 'hero') {
      handleUpdate('heroPhotoPosition', newAdj);
    } else if (adjustModal.target === 'share-groom') {
      const current = data.shareGroom || DEFAULT_WEDDING_DATA.shareGroom!;
      handleUpdate('shareGroom', { ...current, coverPosition: newAdj });
    } else if (adjustModal.target === 'share-bride') {
      const current = data.shareBride || DEFAULT_WEDDING_DATA.shareBride!;
      handleUpdate('shareBride', { ...current, coverPosition: newAdj });
    }
  };

  // Accordion toggle states
  const [openSections, setOpenSections] = useState({
    templates: true,
    sharePreview: true,
    basic: true,
    avatars: true,
    heroPhoto: true,
    gallery: true,
    family: true,
    announcement: true,
    ceremony: true,
    party: true,
    thankYou: true,
    music: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUpdate = (field: keyof WeddingData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const { compressAndUploadImage } = await import('../../utils/shareLinkCodec');
      const url = await compressAndUploadImage(file);
      const initialAdj: ImageFrameAdjustment = { x: 50, y: 50, zoom: 100, fit: 'contain' };
      onChange({
        ...data,
        heroPhotoUrl: url,
        heroPhotoPosition: initialAdj
      });
      setAdjustModal({
        isOpen: true,
        target: 'hero',
        imageUrl: url,
        title: 'Điều chỉnh ảnh đầu thiệp',
        shape: 'rect',
        initialAdjustment: initialAdj
      });
    } catch {
      // ignore
    }
  };

  const handleGroomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const { compressAndUploadImage } = await import('../../utils/shareLinkCodec');
      const url = await compressAndUploadImage(file);
      const initialAdj: ImageFrameAdjustment = { x: 50, y: 50, zoom: 100, fit: 'contain' };
      onChange({
        ...data,
        groomAvatarUrl: url,
        groomAvatarPosition: initialAdj,
        groomAvatarPositionGroom: initialAdj,
        groomAvatarPositionBride: initialAdj
      });
      setAdjustModal({
        isOpen: true,
        target: 'groom',
        imageUrl: url,
        title: 'Điều chỉnh ảnh đại diện Chú Rể',
        shape: 'circle',
        initialAdjustment: initialAdj
      });
    } catch {
      // ignore
    }
  };

  const handleBrideAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const { compressAndUploadImage } = await import('../../utils/shareLinkCodec');
      const url = await compressAndUploadImage(file);
      const initialAdj: ImageFrameAdjustment = { x: 50, y: 50, zoom: 100, fit: 'contain' };
      onChange({
        ...data,
        brideAvatarUrl: url,
        brideAvatarPosition: initialAdj,
        brideAvatarPositionGroom: initialAdj,
        brideAvatarPositionBride: initialAdj
      });
      setAdjustModal({
        isOpen: true,
        target: 'bride',
        imageUrl: url,
        title: 'Điều chỉnh ảnh đại diện Cô Dâu',
        shape: 'circle',
        initialAdjustment: initialAdj
      });
    } catch {
      // ignore
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    e.target.value = '';
    try {
      const { compressAndUploadImage } = await import('../../utils/shareLinkCodec');
      const urls = await Promise.all(fileArray.map((f) => compressAndUploadImage(f)));
      handleUpdate('galleryPhotos', [...data.galleryPhotos, ...urls]);
    } catch {
      // ignore
    }
  };

  const handleRefreshShortNameGroom = () => {
    const parts = data.groomName.trim().split(' ');
    const short = parts.length > 0 ? parts[parts.length - 1] : '';
    handleUpdate('groomShortName', short);
  };

  const handleRefreshShortNameBride = () => {
    const parts = data.brideName.trim().split(' ');
    const short = parts.length > 0 ? parts[parts.length - 1] : '';
    handleUpdate('brideShortName', short);
  };

  const handleAddSamplePhoto = () => {
    const sample = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
    handleUpdate('galleryPhotos', [...data.galleryPhotos, sample]);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = data.galleryPhotos.filter((_, i) => i !== index);
    handleUpdate('galleryPhotos', updated);
  };

  const handleExplicitSave = () => {
    try {
      localStorage.setItem('wedding_custom_data', JSON.stringify(data));
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      setShowSavedToast(true);
      if (onSave) onSave();
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (e) {
      console.error('Error saving wedding data', e);
    }
  };

  const handleExportJson = async () => {
    setIsExportingJson(true);
    try {
      const { exportWeddingJsonWithEmbeddedImages } = await import('../../utils/shareLinkCodec');
      await exportWeddingJsonWithEmbeddedImages(
        data,
        `thiep_cuoi_${data.groomShortName || 'chu-re'}_${data.brideShortName || 'co-dau'}_backup.json`
      );
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingJson(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawText = String(reader.result || '').replace(/^\uFEFF/, '').trim();
        const parsed = JSON.parse(rawText);
        let rawCardData: any = null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawCardData = parsed[0]?.data || parsed[0];
        } else if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
          const activeId = parsed.activeProjectId;
          const chosen = parsed.projects.find((p: any) => p.id === activeId) || parsed.projects[0];
          rawCardData = chosen?.data || chosen;
        } else if (parsed && typeof parsed === 'object') {
          rawCardData = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        }
        if (rawCardData && typeof rawCardData === 'object') {
          const { uploadEmbeddedDataUrlsInWeddingData } = await import('../../utils/shareLinkCodec');
          const synced = await uploadEmbeddedDataUrlsInWeddingData(rawCardData as WeddingData);
          if (onImportJsonData) {
            onImportJsonData(synced);
          } else {
            onChange(synced);
          }
          const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedTime(timeStr);
          setShowSavedToast(true);
          setTimeout(() => setShowSavedToast(false), 3000);
        }
      } catch (err) {
        console.error('Error importing JSON', err);
      } finally {
        setIsImportingJson(false);
      }
    };
    reader.onerror = () => setIsImportingJson(false);
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentTrack = MUSIC_PLAYLIST.find((m) => m.id === data.selectedMusicId) || MUSIC_PLAYLIST[0];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-4 font-sans text-stone-800 relative">
      
      {/* 🔒 AUTH LOCK BANNER FOR GUEST USERS */}
      {!currentUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white shadow-xl space-y-3 border border-amber-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-amber-100 font-serif">
                🔒 Vui Lòng Đăng Nhập / Đăng Ký Để Bắt Đầu Chỉnh Sửa &amp; Tạo Thiệp Mới
              </h3>
              <p className="text-xs text-amber-200/90 leading-snug">
                Hệ thống yêu cầu bạn đăng ký hoặc đăng nhập tài khoản trước khi nhập nội dung, tải ảnh hay khởi tạo thiệp cưới mới.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onRequireAuth?.('register')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng Ký Ngay</span>
            </button>
            <button
              type="button"
              onClick={() => onRequireAuth?.('login')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {showSavedToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-xs">Đã lưu thông tin thiệp thành công!</p>
            <p className="text-[11px] text-emerald-100">Dữ liệu đã được lưu an toàn lúc {lastSavedTime}</p>
          </div>
        </div>
      )}




      {/* 0. CHỌN MẪU THIỆP (KHO MẪU THIỆP) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-pink-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-300">
                Mẫu Thiệp Hiện Tại
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E01460] text-white">
                Đang Áp Dụng
              </span>
            </div>
            <h3 className="text-base font-bold font-serif text-white mt-0.5">
              {data.themeTemplate === 'imperial-dragon' && 'Hoàng Triều Khắc Rồng'}
              {data.themeTemplate === 'burgundy-roses' && 'Minimalism - Đỏ Đậm Quý Phái'}
              {data.themeTemplate === 'long-phung-red' && 'Long Phụng V4 - Đỏ Hoàng Gia'}
              {data.themeTemplate === 'vintage-brown' && 'Minimalism - Nâu Đậm Vintage'}
              {data.themeTemplate === 'pastel-floral' && 'Hoa Khô V2 - Lam & Pastel'}
              {data.themeTemplate === 'modern-emerald' && 'Hiện Đại - Xanh Ngọc Lâu Đài'}
            </h3>
          </div>
        </div>

        {onOpenTemplateModal && (
          <button
            type="button"
            onClick={onOpenTemplateModal}
            className="px-4 py-2 rounded-full bg-[#E01460] hover:bg-[#C20E50] text-white text-xs font-bold shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Đổi Mẫu Khác (Kho Mẫu)</span>
          </button>
        )}
      </div>

      {/* 0.05 CHỌN ẢNH NỀN MÀN HÌNH MỞ THIỆP (3 BỨC ẢNH HOÀNG GIA) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Ảnh nền màn hình "Mở thiệp" (3 mẫu Hoàng Gia)</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            3 Ảnh Bìa Mở Thiệp
          </span>
        </div>
        <p className="text-xs text-stone-500">
          Chọn 1 trong 3 bức ảnh nền dưới đây cho màn hình chào đón <strong>"Mở thiệp"</strong> khi khách bấm vào link:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {COVER_BACKGROUNDS.map((bg, idx) => {
            const isSelected = (data.coverBackgroundUrl || COVER_BACKGROUNDS[0].url) === bg.url;
            return (
              <div
                key={bg.id}
                onClick={() => handleUpdate('coverBackgroundUrl', bg.url)}
                className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-[#1C3766] ring-2 ring-[#1C3766]/20 shadow-md'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="aspect-[4/3] w-full relative overflow-hidden bg-[#112419]">
                  <img
                    src={bg.url}
                    alt={bg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#EAD298] text-[#142E1E] text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Đang dùng</span>
                    </div>
                  )}
                </div>
                <div className="p-2 text-center bg-stone-50">
                  <span className="text-xs font-bold text-stone-800 block truncate">
                    Mẫu {idx + 1}: {bg.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 0.06 LỰA CHỌN HIỆU ỨNG MỞ THIỆP (5 HIỆU ỨNG THU GỌN - BẤM VÀO LÀ CÓ REVIEW TRÊN ĐIỆN THOẠI) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-sm text-stone-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Hiệu ứng mở thiệp (Xem review trực tiếp trên điện thoại bên cạnh)</span>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Tự động mở nhẹ nhàng 3D
          </span>
        </div>
        <p className="text-xs text-stone-500">
          Tích chọn hiệu ứng để áp dụng và xem review chuyển động từ từ mở ra ngay trên màn hình điện thoại bên cạnh:
        </p>

        {/* 5 Hiệu ứng thu gọn - Tích vào là xem trực tiếp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {CARD_OPENING_STYLES.map((style) => {
            const isSelected = (data.cardOpeningStyle || 'default') === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  handleUpdate('cardOpeningStyle', style.id);
                  if (onTestOpeningStyle) {
                    onTestOpeningStyle(style.id);
                  }
                }}
                className={`relative rounded-xl p-3 border-2 transition-all cursor-pointer flex items-center justify-between text-left ${
                  isSelected
                    ? 'border-[#1C3766] bg-amber-50/70 ring-2 ring-[#1C3766]/20 shadow-xs font-bold text-stone-950'
                    : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/80 text-stone-700'
                }`}
                title="Bấm để chọn và xem review mở thiệp trực tiếp trên điện thoại"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{style.icon}</span>
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-bold block truncate text-stone-900">
                      {style.name}
                    </span>
                    <span className="text-[10px] text-amber-900/80 block font-normal truncate">
                      {style.subtitle}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-[#1C3766] text-white flex items-center justify-center shrink-0 ml-1.5 shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-stone-300 shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 0.1 BỐ TRÍ ẢNH NỀN & XEM TRƯỚC KHI GỬI (ZALO / FACEBOOK / TIN NHẮN) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('sharePreview')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <Share2 className="w-4 h-4 text-pink-600" />
            <span>Bố trí ảnh nền &amp; Xem trước khi gửi thiệp (Zalo / Facebook)</span>
          </div>
          {openSections.sharePreview ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>

        {openSections.sharePreview && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100">
            <SocialSharePreview
              data={data}
              activeSide={activeSide}
              onChangeSide={onChangeSide}
              onUpdate={handleUpdate}
              onOpenAdjustModal={(url, side) => openShareAdjustModal(url, side)}
              onOpenPublishModal={onOpenPublishModal}
              onSaveCard={handleExplicitSave}
              onOpenGuestListModal={onOpenGuestListModal}
            />
          </div>
        )}
      </div>

      {/* 1. THÔNG TIN CƠ BẢN (image_486b3e51.png) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('basic')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <Heart className="w-4 h-4 text-pink-600" />
            <span>Thông tin cơ bản</span>
          </div>
          {openSections.basic ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>

        {openSections.basic && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 space-y-4 text-xs">
            {/* Lời mở đầu */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-stone-700">Lời mở đầu</label>
                <span className="text-[11px] text-stone-400 font-normal">Mặc định</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Đang dùng chữ mặc định của mẫu: <strong>"{data.introText || 'Save The Date'}"</strong></span>
              </div>
              <input
                type="text"
                value={data.introText}
                onChange={(e) => handleUpdate('introText', e.target.value)}
                placeholder="Tự nhập lời mở đầu khác (VD: SAVE OUR DATE)"
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>

            {/* Họ tên chú rể & Họ tên cô dâu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Họ tên chú rể</label>
                <input
                  type="text"
                  value={data.groomName}
                  onChange={(e) => handleUpdate('groomName', e.target.value)}
                  placeholder="VD: Phùng Quang Hưng"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Họ tên cô dâu</label>
                <input
                  type="text"
                  value={data.brideName}
                  onChange={(e) => handleUpdate('brideName', e.target.value)}
                  placeholder="VD: Hoàng Minh Tuệ"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Tên ngắn chú rể & Tên ngắn cô dâu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tên ngắn chú rể</label>
                <div className="relative">
                  <input
                    type="text"
                    value={data.groomShortName}
                    onChange={(e) => handleUpdate('groomShortName', e.target.value)}
                    placeholder="Quang Hưng"
                    className="w-full px-3.5 py-2 pr-9 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                  <button 
                    onClick={handleRefreshShortNameGroom}
                    title="Tự động lấy tên"
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tên ngắn cô dâu</label>
                <div className="relative">
                  <input
                    type="text"
                    value={data.brideShortName}
                    onChange={(e) => handleUpdate('brideShortName', e.target.value)}
                    placeholder="Minh Tuệ"
                    className="w-full px-3.5 py-2 pr-9 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                  <button 
                    onClick={handleRefreshShortNameBride}
                    title="Tự động lấy tên"
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Danh xưng chú rể & Danh xưng cô dâu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Danh xưng chú rể</label>
                <input
                  type="text"
                  value={data.groomRole}
                  onChange={(e) => handleUpdate('groomRole', e.target.value)}
                  placeholder="Trưởng Nam"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Danh xưng cô dâu</label>
                <input
                  type="text"
                  value={data.brideRole}
                  onChange={(e) => handleUpdate('brideRole', e.target.value)}
                  placeholder="Út Nữ"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* THỨ TỰ HIỂN THỊ TỰ ĐỘNG THEO TỪNG THẾP NHÀ TRAI / NHÀ GÁI */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <label className="block font-bold uppercase tracking-wider text-[#1C3766] text-[10px]">
                THỨ TỰ HIỂN THỊ TỰ ĐỘNG THEO TỪNG THẾP MỜI
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeSide('groom')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSide === 'groom'
                      ? 'bg-[#1C3766] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  🤵 Thiệp Nhà Trai: Chú Rể &amp; Nhà Trai trước
                </button>
                <button
                  type="button"
                  onClick={() => onChangeSide('bride')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSide === 'bride'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  👰 Thiệp Nhà Gái: Cô Dâu &amp; Nhà Gái trước
                </button>
              </div>
              <p className="text-[11px] text-[#1C3766] font-medium">
                {activeSide === 'groom'
                  ? '✓ Đang xem Thiệp Nhà Trai: Tên Chú Rể và thông tin bên Nhà Trai được tự động đưa lên trước.'
                  : '✓ Đang xem Thiệp Nhà Gái: Tên Cô Dâu và mọi thông tin bên Nhà Gái được tự động đưa lên trước.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. ẢNH ĐẠI DIỆN 2 HÌNH TRÒN (CHÚ RỂ & CÔ DÂU) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('avatars')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <Users className="w-4 h-4 text-pink-600" />
            <span>Ảnh đại diện 2 hình tròn (Chú Rể &amp; Cô Dâu)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
              Khung Song Hỷ 囍
            </span>
            {openSections.avatars ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>
        </div>

        {openSections.avatars && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 text-xs space-y-4">
            <p className="text-stone-500 leading-relaxed">
              Tải ảnh chân dung của <strong>Chú Rể</strong> và <strong>Cô Dâu</strong> để hiển thị vào 2 khung hình tròn lồng chữ Song Hỷ (囍) ở đầu thiệp cưới:
            </p>

            {/* Hidden file inputs */}
            <input
              ref={groomAvatarInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.heic"
              onChange={handleGroomAvatarUpload}
              className="hidden"
            />
            <input
              ref={brideAvatarInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.heic"
              onChange={handleBrideAvatarUpload}
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* Box Chú Rể */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col items-center text-center space-y-2.5">
                <span className="font-bold text-stone-800 text-xs">
                  🤵 Ảnh Chú Rể ({data.groomShortName || 'Quang Hưng'})
                </span>
                
                {/* Circle Avatar Preview */}
                <div 
                  onClick={data.groomAvatarUrl ? openGroomAdjustModal : () => groomAvatarInputRef.current?.click()}
                  className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-white relative group cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all flex items-center justify-center"
                  title={data.groomAvatarUrl ? "Nhấn để điều chỉnh vị trí ảnh Chú Rể" : "Nhấn để tải ảnh Chú Rể"}
                >
                  {data.groomAvatarUrl ? (
                    <>
                      <img
                        src={data.groomAvatarUrl}
                        alt="Chú Rể"
                        style={getAdjustedImageStyle(data.groomAvatarPosition)}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity">
                        <Sliders className="w-4 h-4 mb-0.5" />
                        <span>Chỉnh ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 p-2">
                      <Upload className="w-6 h-6 mb-1 stroke-1" />
                      <span className="text-[10px]">Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => groomAvatarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-[#1C3766] hover:bg-[#13274A] text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{data.groomAvatarUrl ? 'Đổi ảnh' : 'Tải ảnh'}</span>
                  </button>

                  {data.groomAvatarUrl && (
                    <>
                      <button
                        type="button"
                        onClick={openGroomAdjustModal}
                        className="px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#E01460] border border-pink-200 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all active:scale-95"
                        title="Mở popup điều chỉnh vị trí và thu phóng ảnh"
                      >
                        <Sliders className="w-3 h-3 text-[#E01460]" />
                        <span>Điều chỉnh</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            groomAvatarUrl: '',
                            groomAvatarPosition: { x: 50, y: 50, zoom: 100, fit: 'contain' }
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-300 text-[11px] transition-colors"
                        title="Xóa ảnh để trống"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Box Cô Dâu */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col items-center text-center space-y-2.5">
                <span className="font-bold text-stone-800 text-xs">
                  👰 Ảnh Cô Dâu ({data.brideShortName || 'Minh Tuệ'})
                </span>
                
                {/* Circle Avatar Preview */}
                <div 
                  onClick={data.brideAvatarUrl ? openBrideAdjustModal : () => brideAvatarInputRef.current?.click()}
                  className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-white relative group cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all flex items-center justify-center"
                  title={data.brideAvatarUrl ? "Nhấn để điều chỉnh vị trí ảnh Cô Dâu" : "Nhấn để tải ảnh Cô Dâu"}
                >
                  {data.brideAvatarUrl ? (
                    <>
                      <img
                        src={data.brideAvatarUrl}
                        alt="Cô Dâu"
                        style={getAdjustedImageStyle(data.brideAvatarPosition)}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity">
                        <Sliders className="w-4 h-4 mb-0.5" />
                        <span>Chỉnh ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 p-2">
                      <Upload className="w-6 h-6 mb-1 stroke-1" />
                      <span className="text-[10px]">Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => brideAvatarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-[#1C3766] hover:bg-[#13274A] text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{data.brideAvatarUrl ? 'Đổi ảnh' : 'Tải ảnh'}</span>
                  </button>

                  {data.brideAvatarUrl && (
                    <>
                      <button
                        type="button"
                        onClick={openBrideAdjustModal}
                        className="px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#E01460] border border-pink-200 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all active:scale-95"
                        title="Mở popup điều chỉnh vị trí và thu phóng ảnh"
                      >
                        <Sliders className="w-3 h-3 text-[#E01460]" />
                        <span>Điều chỉnh</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            brideAvatarUrl: '',
                            brideAvatarPosition: { x: 50, y: 50, zoom: 100, fit: 'contain' }
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-300 text-[11px] transition-colors"
                        title="Xóa ảnh để trống"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 3. ẢNH ĐẦU THIỆP */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('heroPhoto')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <ImageIcon className="w-4 h-4 text-pink-600" />
            <span>Ảnh đầu thiệp</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">{data.showHeroPhoto ? 'Hiện' : 'Ẩn'}</span>
            <input
              type="checkbox"
              checked={data.showHeroPhoto}
              onChange={(e) => {
                e.stopPropagation();
                handleUpdate('showHeroPhoto', e.target.checked);
              }}
              className="w-4 h-4 text-pink-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {openSections.heroPhoto && data.showHeroPhoto && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 flex flex-col items-center text-xs">
            <input
              ref={heroFileInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.heic"
              onChange={handleHeroUpload}
              className="hidden"
            />

            <span className="text-stone-500 mb-2 font-medium">Ảnh đầu thiệp</span>
            
            {/* Spacious Frame matching 310:360 ratio */}
            <div 
              onClick={data.heroPhotoUrl ? openHeroAdjustModal : () => heroFileInputRef.current?.click()}
              className="w-44 aspect-[310/360] rounded-2xl border-2 border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden mb-3 relative group cursor-pointer hover:border-pink-500 shadow-xs transition-colors"
              title={data.heroPhotoUrl ? "Nhấn để điều chỉnh vị trí ảnh đầu thiệp" : "Nhấn để tải ảnh"}
            >
              {data.heroPhotoUrl ? (
                <>
                  <img
                    src={data.heroPhotoUrl}
                    alt="Ảnh đầu thiệp"
                    style={getAdjustedImageStyle(data.heroPhotoPosition)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity">
                    <Sliders className="w-5 h-5 mb-1 text-white" />
                    <span>Chỉnh ảnh</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-stone-400 p-2">
                  <ImageIcon className="w-10 h-10 mx-auto mb-1 stroke-1" />
                  <span className="text-[10px]">Chưa có ảnh</span>
                </div>
              )}
            </div>

            {/* Upload & Adjust Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => heroFileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#1C3766] hover:bg-[#13274A] text-white font-bold transition-all text-xs shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{data.heroPhotoUrl ? 'Đổi ảnh đầu thiệp' : 'Tải lên'}</span>
              </button>
              {data.heroPhotoUrl && (
                <>
                  <button
                    type="button"
                    onClick={openHeroAdjustModal}
                    className="px-3.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#E01460] border border-pink-200 font-bold transition-all text-xs shadow-2xs active:scale-95 flex items-center gap-1.5"
                    title="Mở popup điều chỉnh vị trí và thu phóng ảnh"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#E01460]" />
                    <span>Điều chỉnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate('heroPhotoUrl', '')}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium transition-colors"
                    title="Xóa ảnh đầu thiệp"
                  >
                    Xóa ảnh
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-stone-400 mt-2 text-center">
              JPG, PNG, GIF, WebP, HEIC (Giữ nguyên 100% kích thước & chất lượng gốc)
            </p>
          </div>
        )}
      </div>

      {/* 3. THƯ VIỆN ẢNH (ALBUM ẢNH) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('gallery')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <ImageIcon className="w-4 h-4 text-pink-600" />
            <span>Thư viện ảnh ({data.galleryPhotos.length} ảnh)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">{data.showGallery ? 'Hiện' : 'Ẩn'}</span>
            <input
              type="checkbox"
              checked={data.showGallery}
              onChange={(e) => {
                e.stopPropagation();
                handleUpdate('showGallery', e.target.checked);
              }}
              className="w-4 h-4 text-pink-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {openSections.gallery && data.showGallery && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 space-y-4 text-xs">
            <input
              ref={galleryFileInputRef}
              type="file"
              multiple
              accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.heic"
              onChange={handleGalleryUpload}
              className="hidden"
            />

            {/* Kiểu hiển thị: Lưới / Ghép ảnh / 3D */}
            <div>
              <label className="block font-medium uppercase tracking-wider text-stone-500 text-[10px] mb-1.5">
                KIỂU HIỂN THỊ
              </label>
              <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-xl text-center">
                <button
                  type="button"
                  onClick={() => handleUpdate('galleryType', 'grid')}
                  className={`py-2 rounded-lg font-semibold transition-all ${
                    data.galleryType === 'grid'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Lưới
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate('galleryType', 'collage')}
                  className={`py-2 rounded-lg font-semibold transition-all ${
                    data.galleryType === 'collage'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Ghép ảnh
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate('galleryType', '3d')}
                  className={`py-2 rounded-lg font-semibold transition-all ${
                    data.galleryType === '3d'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  3D Carousel
                </button>
              </div>
            </div>

            {/* Photo list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500">
                  Thư viện ảnh ({data.galleryPhotos.length} ảnh)
                </span>
                {data.galleryPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate('galleryPhotos', []);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Xóa toàn bộ ảnh trong thư viện"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa tất cả ảnh</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {data.galleryPhotos.map((photo, i) => (
                  <div
                    key={`${photo}_${i}`}
                    className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group shadow-xs"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemovePhoto(i);
                      }}
                      className="absolute top-1.5 right-1.5 z-10 p-1.5 bg-black/75 rounded-full text-white hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Box with + Thêm ảnh (_355A1D80-0CD8-4575-808F-CB9A3D418BA1__952c4f27.png) */}
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-pink-500 flex flex-col items-center justify-center text-stone-500 hover:text-pink-600 transition-all bg-stone-50 hover:bg-pink-50/20 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-6 h-6 mb-1 text-stone-400 group-hover:text-pink-600" />
                  <span className="text-[11px] font-semibold">Thêm ảnh</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-400 mt-2">
                Hỗ trợ: JPG, PNG, GIF, WebP, HEIC. Tối đa 20 ảnh/lần.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. THÔNG TIN GIA ĐÌNH (_C10CD1A0-DB63-400E-B838-B2DFDF2C7270__0bc9b14a.png) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('family')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <Users className="w-4 h-4 text-pink-600" />
            <span>Thông tin gia đình</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">{data.showFamily ? 'Hiện' : 'Ẩn'}</span>
            <input
              type="checkbox"
              checked={data.showFamily}
              onChange={(e) => {
                e.stopPropagation();
                handleUpdate('showFamily', e.target.checked);
              }}
              className="w-4 h-4 text-pink-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {openSections.family && data.showFamily && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 space-y-5 text-xs">
            {/* Nhà trai */}
            <div className="space-y-3">
              <span className="font-semibold text-amber-900 block border-b border-stone-100 pb-1">
                Nhà trai
              </span>
              <div>
                <label className="block text-stone-500 mb-1">Danh xưng</label>
                <input
                  type="text"
                  value={data.groomFamily.title}
                  onChange={(e) => handleUpdate('groomFamily', { ...data.groomFamily, title: e.target.value })}
                  placeholder="Ông Bà"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">Ông (Họ tên cha)</label>
                  <input
                    type="text"
                    value={data.groomFamily.fatherName}
                    onChange={(e) => handleUpdate('groomFamily', { ...data.groomFamily, fatherName: e.target.value })}
                    placeholder="VD: Nguyễn Văn Hùng"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">Bà (Họ tên mẹ)</label>
                  <input
                    type="text"
                    value={data.groomFamily.motherName}
                    onChange={(e) => handleUpdate('groomFamily', { ...data.groomFamily, motherName: e.target.value })}
                    placeholder="VD: Trần Thị Lan"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-500 mb-1">Địa chỉ nhà trai</label>
                <textarea
                  rows={2}
                  value={data.groomFamily.address}
                  onChange={(e) => handleUpdate('groomFamily', { ...data.groomFamily, address: e.target.value })}
                  placeholder="Địa chỉ nhà trai"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                />
              </div>
            </div>

            {/* Nhà gái */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <span className="font-semibold text-amber-900 block border-b border-stone-100 pb-1">
                Nhà gái
              </span>
              <div>
                <label className="block text-stone-500 mb-1">Danh xưng</label>
                <input
                  type="text"
                  value={data.brideFamily.title}
                  onChange={(e) => handleUpdate('brideFamily', { ...data.brideFamily, title: e.target.value })}
                  placeholder="Ông Bà"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">Ông (Họ tên cha)</label>
                  <input
                    type="text"
                    value={data.brideFamily.fatherName}
                    onChange={(e) => handleUpdate('brideFamily', { ...data.brideFamily, fatherName: e.target.value })}
                    placeholder="VD: Trần Văn Minh"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">Bà (Họ tên mẹ)</label>
                  <input
                    type="text"
                    value={data.brideFamily.motherName}
                    onChange={(e) => handleUpdate('brideFamily', { ...data.brideFamily, motherName: e.target.value })}
                    placeholder="VD: Phạm Thị Hoa"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-500 mb-1">Địa chỉ nhà gái</label>
                <textarea
                  rows={2}
                  value={data.brideFamily.address}
                  onChange={(e) => handleUpdate('brideFamily', { ...data.brideFamily, address: e.target.value })}
                  placeholder="Địa chỉ nhà gái"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. LỜI THÔNG BÁO & LỄ CƯỚI (CHUNG NỘI DUNG, CẤU HÌNH THỜI GIAN & ĐỊA ĐIỂM 2 NHÀ) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('announcement')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <Megaphone className="w-4 h-4 text-pink-600" />
            <span>Lời thông báo &amp; Lễ cưới</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">{data.showAnnouncement ? 'Hiện' : 'Ẩn'}</span>
            <input
              type="checkbox"
              checked={data.showAnnouncement}
              onChange={(e) => {
                e.stopPropagation();
                handleUpdate('showAnnouncement', e.target.checked);
              }}
              className="w-4 h-4 text-pink-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {openSections.announcement && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 space-y-4 text-xs">
            <div>
              <label className="block text-stone-600 mb-1">
                Câu thông báo chung (để trống nếu không muốn hiện)
              </label>
              <textarea
                rows={2}
                value={data.announcementText}
                onChange={(e) => handleUpdate('announcementText', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none"
              />
            </div>

            {(() => {
              const sharedCeremony = data.ceremony || DEFAULT_WEDDING_DATA.ceremony;
              const ceremonyGroom = data.ceremonyGroom || DEFAULT_WEDDING_DATA.ceremonyGroom || sharedCeremony;
              const ceremonyBride = data.ceremonyBride || DEFAULT_WEDDING_DATA.ceremonyBride || sharedCeremony;

              const updateSharedCeremony = (patch: Partial<typeof sharedCeremony>) => {
                onChange({
                  ...data,
                  ceremony: { ...sharedCeremony, ...patch },
                  ceremonyGroom: { ...ceremonyGroom, ...patch },
                  ceremonyBride: { ...ceremonyBride, ...patch }
                });
              };

              const activeCeremonySide = ceremonySideTab === 'groom' ? ceremonyGroom : ceremonyBride;
              const updateActiveSideCeremony = (patch: Partial<typeof sharedCeremony>) => {
                if (ceremonySideTab === 'groom') {
                  onChange({
                    ...data,
                    ceremonyGroom: { ...ceremonyGroom, ...patch }
                  });
                } else {
                  onChange({
                    ...data,
                    ceremonyBride: { ...ceremonyBride, ...patch }
                  });
                }
              };

              return (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-stone-800 block">
                        Thông tin Lễ Cưới (Chung tiêu đề)
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Bật để hiển thị thông tin giờ và ngày cử hành lễ
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={sharedCeremony.enabled}
                      onChange={(e) => updateSharedCeremony({ enabled: e.target.checked })}
                      className="w-4 h-4 text-pink-600 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1">Tiêu đề mục lễ (Chung)</label>
                    <input
                      type="text"
                      value={sharedCeremony.title}
                      onChange={(e) => updateSharedCeremony({ title: e.target.value })}
                      placeholder="THÔNG TIN LỄ VỀ CHUNG MỘT NHÀ"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>

                  {sharedCeremony.enabled && (
                    <div className="space-y-3 pt-2 border-t border-stone-200">
                      <label className="block font-semibold text-stone-700 text-[11px] uppercase tracking-wider">
                        Cấu hình Ngày, Giờ &amp; Địa điểm Lễ của 2 Nhà:
                      </label>

                      {/* Tab chọn cấu hình Nhà Trai / Nhà Gái */}
                      <div className="flex items-center gap-2 bg-stone-200/70 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setCeremonySideTab('groom')}
                          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            ceremonySideTab === 'groom' ? 'bg-[#1C3766] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <span>🤵 Nhà Trai</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCeremonySideTab('bride')}
                          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            ceremonySideTab === 'bride' ? 'bg-[#1C3766] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <span>👰 Nhà Gái</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-600 mb-1">
                              Giờ lễ ({ceremonySideTab === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                            </label>
                            <input
                              type="time"
                              value={activeCeremonySide.time}
                              onChange={(e) => updateActiveSideCeremony({ time: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1">
                              Ngày lễ ({ceremonySideTab === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                            </label>
                            <input
                              type="date"
                              value={activeCeremonySide.date}
                              onChange={(e) => updateActiveSideCeremony({ date: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                            />
                            <p className="text-[11px] text-amber-800 font-medium mt-1">
                              🌙 Lịch âm tự động: {formatVietnameseLunarDate(activeCeremonySide.date, true)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-stone-600 mb-1">
                            Địa điểm lễ ({ceremonySideTab === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                          </label>
                          <input
                            type="text"
                            value={activeCeremonySide.address}
                            onChange={(e) => updateActiveSideCeremony({ address: e.target.value })}
                            placeholder={ceremonySideTab === 'groom' ? 'Tư gia Nhà Trai...' : 'Tư gia Nhà Gái...'}
                            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 6. THÔNG TIN TIỆC & ĐỊA ĐIỂM TỔ CHỨC (CHUNG NỘI DUNG, CẤU HÌNH NGÀY GIỜ & ĐỊA ĐIỂM 2 NHÀ KHÁC NHAU) */}
      {(() => {
        const groomParty = data?.partyGroom || DEFAULT_WEDDING_DATA.partyGroom;
        const brideParty = data?.partyBride || DEFAULT_WEDDING_DATA.partyBride;
        const partyKey = activeSide === 'groom' ? 'partyGroom' : 'partyBride';
        const currentParty = activeSide === 'groom' ? groomParty : brideParty;

        // Cập nhật thông tin chung cho cả 2 nhà (cùng nội dung) và tự động đồng bộ tiêu đề & mô tả gửi link
        const updateSharedParty = (patch: Partial<typeof groomParty>) => {
          const nextGroomParty = { ...groomParty, ...patch };
          const nextBrideParty = { ...brideParty, ...patch };
          const groomShort = data.groomShortName || data.groomName || 'Quang Hưng';
          const brideShort = data.brideShortName || data.brideName || 'Minh Tuệ';

          const gPType = getPartyTypeLabel(nextGroomParty);
          const bPType = getPartyTypeLabel(nextBrideParty);

          const gDateStr = formatVietnameseSolarDate(nextGroomParty.date);
          const bDateStr = formatVietnameseSolarDate(nextBrideParty.date);
          const bTimeStr = nextBrideParty.time === '22:00' ? '10:00' : (nextBrideParty.time || '10:00');

          const updatedGroomShare = {
            ...(data.shareGroom || DEFAULT_WEDDING_DATA.shareGroom!),
            title: `Thiệp Mời ${gPType.labelCap} - ${groomShort} & ${brideShort}`,
            dateText: gDateStr,
            description: `Kính mời quý khách tới dự ${gPType.labelLower} của ${groomShort} & ${brideShort} vào lúc ${nextGroomParty.time || '16:00'} ngày ${gDateStr} tại ${nextGroomParty.venueAddress}`
          };

          const updatedBrideShare = {
            ...(data.shareBride || DEFAULT_WEDDING_DATA.shareBride!),
            title: `Thiệp Mời ${bPType.labelCap} - ${brideShort} & ${groomShort}`,
            dateText: bDateStr,
            description: `Kính mời quý khách tới dự ${bPType.labelLower} của ${brideShort} & ${groomShort} vào lúc ${bTimeStr} ngày ${bDateStr} tại ${nextBrideParty.venueAddress}`
          };

          onChange({
            ...data,
            partyGroom: nextGroomParty,
            partyBride: nextBrideParty,
            shareGroom: updatedGroomShare,
            shareBride: updatedBrideShare
          });
        };

        // Cập nhật riêng Ngày, Giờ, Địa điểm, Bản đồ cho nhà đang chọn và tự động đồng bộ mô tả gửi link
        const updateCurrentSideParty = (patch: Partial<typeof currentParty>) => {
          const updatedParty = { ...currentParty, ...patch };
          const nextDateFormatted = formatVietnameseSolarDate(updatedParty.date);
          const groomShort = data.groomShortName || data.groomName || 'Quang Hưng';
          const brideShort = data.brideShortName || data.brideName || 'Minh Tuệ';
          const pType = getPartyTypeLabel(updatedParty);

          if (activeSide === 'groom') {
            const updatedGroomShare = {
              ...(data.shareGroom || DEFAULT_WEDDING_DATA.shareGroom!),
              title: `Thiệp Mời ${pType.labelCap} - ${groomShort} & ${brideShort}`,
              dateText: nextDateFormatted,
              description: `Kính mời quý khách tới dự ${pType.labelLower} của ${groomShort} & ${brideShort} vào lúc ${updatedParty.time || '16:00'} ngày ${nextDateFormatted} tại ${updatedParty.venueAddress}`
            };
            onChange({
              ...data,
              partyGroom: updatedParty,
              shareGroom: updatedGroomShare
            });
          } else {
            const bTimeStr = updatedParty.time === '22:00' ? '10:00' : (updatedParty.time || '10:00');
            const updatedBrideShare = {
              ...(data.shareBride || DEFAULT_WEDDING_DATA.shareBride!),
              title: `Thiệp Mời ${pType.labelCap} - ${brideShort} & ${groomShort}`,
              dateText: nextDateFormatted,
              description: `Kính mời quý khách tới dự ${pType.labelLower} của ${brideShort} & ${groomShort} vào lúc ${bTimeStr} ngày ${nextDateFormatted} tại ${updatedParty.venueAddress}`
            };
            onChange({
              ...data,
              partyBride: updatedParty,
              shareBride: updatedBrideShare
            });
          }
        };

        return (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div 
              onClick={() => toggleSection('party')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
            >
              <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
                <Cake className="w-4 h-4 text-pink-600" />
                <span>Thông tin Tiệc &amp; Địa điểm tổ chức</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">{groomParty.enabled ? 'Hiện' : 'Ẩn'}</span>
                <input
                  type="checkbox"
                  checked={groomParty.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateSharedParty({ enabled: e.target.checked });
                  }}
                  className="w-4 h-4 text-pink-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {openSections.party && groomParty.enabled && (
              <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 space-y-4 text-xs">
                
                {/* PHẦN 1: NỘI DUNG CHUNG */}
                <div className="space-y-3">
                  <label className="block font-semibold text-stone-500 text-[10px] uppercase tracking-wider">
                    NỘI DUNG TIỆC CHUNG
                  </label>

                  {/* Tabs phân loại tiệc (Chung) */}
                  <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-xl text-center">
                    <button
                      type="button"
                      onClick={() => updateSharedParty({ partyType: 'wedding', title: 'THÔNG TIN TIỆC CƯỚI' })}
                      className={`py-2 rounded-lg font-semibold transition-all ${
                        groomParty.partyType === 'wedding'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Tiệc cưới
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSharedParty({ partyType: 'reception', title: 'THÔNG TIN TIỆC VỀ CHUNG NHÀ' })}
                      className={`py-2 rounded-lg font-semibold transition-all ${
                        groomParty.partyType === 'reception'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Tiệc báo hỷ
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSharedParty({ partyType: 'engagement', title: 'THÔNG TIN TIỆC ĐÍNH HÔN' })}
                      className={`py-2 rounded-lg font-semibold transition-all ${
                        groomParty.partyType === 'engagement'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Tiệc đính hôn
                    </button>
                  </div>

                  {/* Tiêu đề mục (Chung) */}
                  <div>
                    <label className="block text-stone-600 mb-1">Tiêu đề mục (Chung)</label>
                    <input
                      type="text"
                      value={groomParty.title}
                      onChange={(e) => updateSharedParty({ title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  {/* Các tuỳ chọn hiển thị chung */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="font-medium text-stone-700 text-[11px]">Đón khách &amp; Khai tiệc</span>
                      <input
                        type="checkbox"
                        checked={groomParty.showWelcomeDiningTimes}
                        onChange={(e) => updateSharedParty({ showWelcomeDiningTimes: e.target.checked })}
                        className="w-4 h-4 text-pink-600 rounded"
                      />
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="font-medium text-stone-700 text-[11px]">Đồng hồ đếm ngược</span>
                      <input
                        type="checkbox"
                        checked={groomParty.showCountdown}
                        onChange={(e) => updateSharedParty({ showCountdown: e.target.checked })}
                        className="w-4 h-4 text-pink-600 rounded"
                      />
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="font-medium text-stone-700 text-[11px]">Bản đồ Google Maps</span>
                      <input
                        type="checkbox"
                        checked={groomParty.showMap}
                        onChange={(e) => updateSharedParty({ showMap: e.target.checked })}
                        className="w-4 h-4 text-pink-600 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* PHẦN 2: CẤU HÌNH NGÀY THÁNG, GIỜ TỔ CHỨC & ĐỊA ĐIỂM 2 NHÀ TRAI - GÁI KHÁC NHAU */}
                <div className="pt-3 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-stone-800 text-xs">
                      Cấu hình Ngày Giờ &amp; Địa điểm tổ chức (2 Nhà Trai / Gái riêng)
                    </label>
                  </div>

                  {/* Switcher chọn cấu hình Nhà Trai vs Nhà Gái */}
                  <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => onChangeSide('groom')}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        activeSide === 'groom' ? 'bg-[#1C3766] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span>🤵 Nhà Trai ({formatVietnameseSolarDate(groomParty.date)})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeSide('bride')}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        activeSide === 'bride' ? 'bg-[#1C3766] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span>👰 Nhà Gái ({formatVietnameseSolarDate(brideParty.date)})</span>
                    </button>
                  </div>

                  {/* Khung nhập Ngày, Giờ & Địa điểm của nhà đang chọn */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="font-bold text-[#1C3766] text-xs">
                        {activeSide === 'groom' ? '🤵 Thời gian & Địa điểm tổ chức NHÀ TRAI' : '👰 Thời gian & Địa điểm tổ chức NHÀ GÁI'}
                      </span>
                    </div>

                    {/* Ngày và Giờ tổ chức */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-600 mb-1">
                          Ngày tổ chức ({activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                        </label>
                        <input
                          type="date"
                          value={currentParty.date}
                          onChange={(e) => updateCurrentSideParty({ date: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white"
                        />
                        <p className="text-[11px] text-amber-800 font-semibold mt-1.5 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/70">
                          🌙 Lịch âm tự động: {formatVietnameseLunarDate(currentParty.date, true)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">
                          Giờ tổ chức ({activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                        </label>
                        <input
                          type="time"
                          value={currentParty.time}
                          onChange={(e) => updateCurrentSideParty({ time: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white"
                        />
                      </div>
                    </div>

                    {/* Giờ đón khách & khai tiệc */}
                    {groomParty.showWelcomeDiningTimes && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-600 mb-1">
                            Giờ đón khách ({activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                          </label>
                          <input
                            type="time"
                            value={currentParty.welcomeTime}
                            onChange={(e) => updateCurrentSideParty({ welcomeTime: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-600 mb-1">
                            Giờ khai tiệc ({activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                          </label>
                          <input
                            type="time"
                            value={currentParty.diningTime}
                            onChange={(e) => updateCurrentSideParty({ diningTime: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tiêu đề địa điểm */}
                    <div>
                      <label className="block text-stone-600 mb-1">
                        Tiêu đề địa điểm ({activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                      </label>
                      <input
                        type="text"
                        value={currentParty.venueHeader}
                        onChange={(e) => updateCurrentSideParty({ venueHeader: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white"
                        placeholder="VD: TIỆC SẼ TỔ CHỨC TẠI..."
                      />
                    </div>

                    {/* Tên địa điểm & Địa chỉ */}
                    <div>
                      <label className="block text-stone-600 mb-1">
                        Tên địa điểm / Tư gia ({activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                      </label>
                      <input
                        type="text"
                        value={currentParty.venueName}
                        onChange={(e) => updateCurrentSideParty({ venueName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">
                        Địa chỉ chi tiết ({activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})
                      </label>
                      <textarea
                        rows={2}
                        value={currentParty.venueAddress}
                        onChange={(e) => updateCurrentSideParty({ venueAddress: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>

                    {/* Bản đồ tương tác của nhà đang chọn */}
                    {groomParty.showMap && (
                      <MapLocationPicker
                        lat={currentParty.mapCoordinates.lat}
                        lng={currentParty.mapCoordinates.lng}
                        address={currentParty.venueAddress}
                        sideLabel={activeSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'}
                        onChangeCoordinates={(newLat, newLng) => {
                          updateCurrentSideParty({
                            mapCoordinates: { lat: newLat, lng: newLng },
                            mapEmbedUrl: `https://maps.google.com/maps?q=${newLat},${newLng}&hl=vi&z=15&output=embed`
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 7. LỜI CẢM ƠN & NHẠC NỀN (_FEF2C2EF-15AB-4DCC-B7E3-5E5199343083__9e4d03df.png) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => toggleSection('thankYou')}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5 font-semibold text-sm text-stone-900">
            <MessageSquare className="w-4 h-4 text-pink-600" />
            <span>Lời cảm ơn</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">{data.showThankYou ? 'Hiện' : 'Ẩn'}</span>
            <input
              type="checkbox"
              checked={data.showThankYou}
              onChange={(e) => {
                e.stopPropagation();
                handleUpdate('showThankYou', e.target.checked);
              }}
              className="w-4 h-4 text-pink-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {openSections.thankYou && data.showThankYou && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 text-xs">
            <textarea
              rows={3}
              value={data.thankYouText}
              onChange={(e) => handleUpdate('thankYouText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 8. NHẠC NỀN & CƠ CHẾ TỰ CHUYỂN ĐỘNG ĐA NỀN TẢNG */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mb-2 shadow-xs">
            <Music className="w-6 h-6 stroke-[1.8]" />
          </div>
          <span className="text-xs font-semibold text-stone-800">Nhạc Nền &amp; Cơ Chế Tự Chuyển Động</span>
          <p className="text-xs text-pink-600 font-bold mt-0.5 max-w-sm truncate">
            {data.selectedMusicId === 'custom-upload'
              ? (data.customAudioName || 'Nhạc tệp tải lên của bạn')
              : currentTrack.title}
          </p>
          <span className="text-[11px] text-stone-400 mt-0.5">
            {data.selectedMusicId === 'custom-upload' ? 'Tệp nhạc cá nhân (Đồng bộ đa thiết bị)' : currentTrack.category}
          </span>
          <button
            type="button"
            onClick={onOpenMusicModal}
            className="mt-3 px-6 py-2.5 rounded-full bg-[#E01460] hover:bg-[#C20E50] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Chọn hoặc tải bài hát khác</span>
          </button>
        </div>

        {/* Tùy chỉnh Cơ chế tự chuyển động (Đồng bộ trên Điện thoại & Máy tính) */}
        <div className="pt-3 border-t border-stone-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-800">
              ⚙️ Cấu hình Cơ chế tự chuyển động (Điện thoại &amp; Máy tính):
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Đồng bộ theo Link Xuất Thiệp
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-semibold text-stone-700 text-xs">🎵 Tự động phát nhạc khi mở thiệp</span>
              <input
                type="checkbox"
                checked={data.autoPlayMusic !== false}
                onChange={(e) => handleUpdate('autoPlayMusic', e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-semibold text-stone-700 text-xs">📜 Tự động cuộn chạy dọc thiệp</span>
              <input
                type="checkbox"
                checked={data.autoScroll !== false}
                onChange={(e) => handleUpdate('autoScroll', e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-semibold text-stone-700 text-xs">🌸 Hiệu ứng cánh hoa rơi tự động</span>
              <input
                type="checkbox"
                checked={data.fallingPetals !== false}
                onChange={(e) => handleUpdate('fallingPetals', e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-semibold text-stone-700 text-xs">🖼️ Tự động chuyển ảnh Album 3D</span>
              <input
                type="checkbox"
                checked={data.autoPlay3dGallery !== false}
                onChange={(e) => handleUpdate('autoPlay3dGallery', e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Bottom Save & Publish Action Box */}
        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={jsonImportInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
            <button
              type="button"
              disabled={isImportingJson}
              onClick={() => jsonImportInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isImportingJson ? 'Đang nhập .JSON...' : 'Nhập tệp (.JSON)'}</span>
            </button>
            <button
              type="button"
              disabled={isExportingJson}
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingJson ? 'Đang đóng gói ảnh...' : 'Sao lưu tệp (.JSON)'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExplicitSave}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thông tin thiệp</span>
            </button>
            {onOpenPublishModal && (
              <button
                type="button"
                onClick={onOpenPublishModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1C3766] to-blue-900 hover:from-blue-950 hover:to-blue-950 text-amber-200 font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CloudUpload className="w-4 h-4 text-amber-300" />
                <span>🚀 Xuất thiệp &amp; Copy Link Đồng Bộ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ĐIỀU CHỈNH ẢNH (KÉO & PHÓNG TO) */}
      <ImageAdjustModal
        isOpen={adjustModal.isOpen}
        imageUrl={adjustModal.imageUrl}
        title={adjustModal.title}
        shape={adjustModal.shape}
        initialAdjustment={adjustModal.initialAdjustment}
        onClose={() => setAdjustModal((prev) => ({ ...prev, isOpen: false }))}
        onApply={handleApplyAdjustment}
      />

    </div>
  );
};
