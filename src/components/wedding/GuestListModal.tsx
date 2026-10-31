import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  ClipboardList,
  UserPlus,
  Check,
  Copy,
  Trash2,
  Search,
  Share2,
  Sparkles,
  Download,
  Info,
  CheckSquare,
  Square,
  Edit3,
  Eye
} from 'lucide-react';
import { WeddingData, SideType, GuestItem } from '../../types/wedding';
import { buildShareableSideUrl, syncWeddingDataToServer } from '../../utils/shareLinkCodec';

interface GuestListModalProps {
  isOpen: boolean;
  weddingData: WeddingData;
  activeSide: SideType;
  onClose: () => void;
  onUpdateGuests: (updatedGuests: GuestItem[]) => void;
}

const COMMON_SALUTATIONS = [
  'Cô',
  'Dì',
  'Chú',
  'Bác',
  'Anh',
  'Chị',
  'Em',
  'Bạn',
  'Gia đình',
  'Cậu',
  'Mợ',
  'Thím',
  'Dượng',
  'Vợ chồng',
  'Ông',
  'Bà'
];

/**
 * Smartly parses a single pasted line into salutation, name, and phone.
 */
function parseGuestLine(
  line: string,
  defaultSide: SideType,
  defaultSalutation: string = 'auto'
): GuestItem | null {
  const cleanLine = line.trim();
  if (!cleanLine) return null;

  // Extract phone if exists (e.g. 0912345678 or 098 765 4321)
  const phoneMatch = cleanLine.match(/(\d{3,4}[\s.-]?\d{3}[\s.-]?\d{3,4})/);
  const phone = phoneMatch ? phoneMatch[0].replace(/[\s.-]/g, '') : undefined;
  
  // Strip phone and separator dashes/commas from remaining name
  let nameAndPrefix = cleanLine.replace(/(\d{3,4}[\s.-]?\d{3}[\s.-]?\d{3,4})/, '').replace(/[-–—,:;]+$/, '').trim();

  let detectedSalutation = defaultSalutation !== 'auto' ? defaultSalutation : 'Bạn';
  let guestName = nameAndPrefix;
  let matchedPrefix = false;

  // Try matching known prefixes
  for (const sal of COMMON_SALUTATIONS) {
    const regex = new RegExp(`^(${sal})\\s+`, 'i');
    if (regex.test(nameAndPrefix)) {
      detectedSalutation = sal;
      guestName = nameAndPrefix.replace(regex, '').trim();
      matchedPrefix = true;
      break;
    }
  }

  // If no prefix matched in text line
  if (!matchedPrefix) {
    if (defaultSalutation !== 'auto') {
      detectedSalutation = defaultSalutation;
    } else {
      detectedSalutation = 'Bạn';
    }
  }

  if (!guestName) {
    guestName = nameAndPrefix || 'Khách mời';
  }

  return {
    id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${Math.random().toString(36).substring(2, 5)}`,
    salutation: detectedSalutation,
    name: guestName,
    side: defaultSide,
    phone
  };
}

export const GuestListModal: React.FC<GuestListModalProps> = ({
  isOpen,
  weddingData,
  activeSide,
  onClose,
  onUpdateGuests
}) => {
  const [selectedSide, setSelectedSide] = useState<SideType>(activeSide);
  const [activeTab, setActiveTab] = useState<'paste' | 'list'>('paste');
  const [bulkText, setBulkText] = useState('');
  const [defaultPasteSalutation, setDefaultPasteSalutation] = useState<string>('auto');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [batchSalutation, setBatchSalutation] = useState('Cô');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLinkMap, setCopiedLinkMap] = useState<Record<string, boolean>>({});

  const allGuests = useMemo(() => weddingData.guests || [], [weddingData.guests]);

  // Filter guests by selected side (Nhà Trai vs Nhà Gái)
  const sideGuests = useMemo(() => {
    return allGuests.filter((g) => g.side === selectedSide);
  }, [allGuests, selectedSide]);

  // Filter side guests by search query
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return sideGuests;
    const q = searchQuery.toLowerCase().trim();
    return sideGuests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.salutation.toLowerCase().includes(q) ||
        (g.phone && g.phone.includes(q))
    );
  }, [sideGuests, searchQuery]);

  // Stats count per salutation
  const salutationStats = useMemo(() => {
    const map: Record<string, number> = {};
    sideGuests.forEach((g) => {
      const sal = g.salutation || 'Khác';
      map[sal] = (map[sal] || 0) + 1;
    });
    return map;
  }, [sideGuests]);

  if (!isOpen) return null;

  // Handle bulk paste submit
  const handleBulkAdd = () => {
    const lines = bulkText.split('\n');
    const parsed: GuestItem[] = [];

    lines.forEach((line) => {
      const item = parseGuestLine(line, selectedSide, defaultPasteSalutation);
      if (item) {
        parsed.push(item);
      }
    });

    if (parsed.length === 0) return;

    const newAll = [...allGuests, ...parsed];
    onUpdateGuests(newAll);
    setBulkText('');
    setActiveTab('list');
  };

  // Real-time preview of parsed guests as user types or pastes text
  const parsedPreview = useMemo(() => {
    if (!bulkText.trim()) return [];
    const lines = bulkText.split('\n');
    const result: GuestItem[] = [];
    for (const line of lines) {
      const item = parseGuestLine(line, selectedSide, defaultPasteSalutation);
      if (item) result.push(item);
    }
    return result;
  }, [bulkText, selectedSide, defaultPasteSalutation]);

  // Update single guest property
  const handleUpdateGuest = (id: string, patch: Partial<GuestItem>) => {
    const newAll = allGuests.map((g) => (g.id === id ? { ...g, ...patch } : g));
    onUpdateGuests(newAll);
  };

  // Delete single guest
  const handleDeleteGuest = (id: string) => {
    const newAll = allGuests.filter((g) => g.id !== id);
    onUpdateGuests(newAll);
    setSelectedGuestIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Toggle selection for batch actions
  const handleToggleSelect = (id: string) => {
    setSelectedGuestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedGuestIds.size === filteredGuests.length && filteredGuests.length > 0) {
      setSelectedGuestIds(new Set());
    } else {
      setSelectedGuestIds(new Set(filteredGuests.map((g) => g.id)));
    }
  };

  // Batch update salutation for selected guests
  const handleBatchApplySalutation = () => {
    if (selectedGuestIds.size === 0) return;
    const newAll = allGuests.map((g) =>
      selectedGuestIds.has(g.id) ? { ...g, salutation: batchSalutation } : g
    );
    onUpdateGuests(newAll);
  };

  // Batch delete selected guests
  const handleBatchDelete = () => {
    if (selectedGuestIds.size === 0) return;
    const newAll = allGuests.filter((g) => !selectedGuestIds.has(g.id));
    onUpdateGuests(newAll);
    setSelectedGuestIds(new Set());
  };

  // Generate personalized URL for guest
  const getPersonalizedUrlForGuest = (guest: GuestItem) => {
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://thiepmoionline.khoahoang9999.workers.dev';
    const guestQuery = `${guest.salutation} ${guest.name}`.trim();
    return buildShareableSideUrl(baseOrigin, guest.side, weddingData, {
      guestName: guestQuery
    });
  };

  // Copy Zalo personalized invitation message with guest salutation and name
  const handleCopyPersonalizedMessage = async (guest: GuestItem) => {
    const url = getPersonalizedUrlForGuest(guest);
    const sideConfig = guest.side === 'groom' ? weddingData.shareGroom : weddingData.shareBride;
    const rawDesc = sideConfig?.description || (guest.side === 'groom' ? 'Thân mời quý khách đến dự tiệc báo hỷ Nhà Trai' : 'Thân mời quý khách đến dự thông tin về tiệc hỷ Nhà Gái');
    
    // Replace generic "quý khách" with guest's salutation & name if present
    let messageBody = rawDesc.replace(/Thân mời quý khách/g, `Thân mời ${guest.salutation} ${guest.name}`);
    if (!messageBody.includes(guest.name)) {
      messageBody = `Thân mời ${guest.salutation} ${guest.name}\n${messageBody}`;
    }

    const fullMsg = `${messageBody}\n👉 Trân trọng kính mời ${guest.salutation} ${guest.name} xem thiệp cưới & gửi lời chúc mừng tại: ${url}`;

    try {
      syncWeddingDataToServer(weddingData);
      await navigator.clipboard.writeText(fullMsg);
      setCopiedId(guest.id);
      setTimeout(() => setCopiedId(null), 2400);
    } catch {
      // ignore
    }
  };

  // Copy just personalized URL
  const handleCopyPersonalizedLink = async (guest: GuestItem) => {
    const url = getPersonalizedUrlForGuest(guest);
    try {
      syncWeddingDataToServer(weddingData);
      await navigator.clipboard.writeText(url);
      setCopiedLinkMap((prev) => ({ ...prev, [guest.id]: true }));
      setTimeout(() => {
        setCopiedLinkMap((prev) => ({ ...prev, [guest.id]: false }));
      }, 2400);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif leading-tight">
                Danh Sách Khách Mời &amp; Đặt Cách Xưng Hô
              </h3>
              <p className="text-xs text-stone-300 font-sans">
                Dán hàng loạt khách mời - Tạo link &amp; lời mời Zalo cá nhân hóa riêng cho từng vị khách
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side Selector Tabs (Nhà Trai vs Nhà Gái) */}
        <div className="p-3 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSide('groom')}
              className={`py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedSide === 'groom'
                  ? 'bg-[#1C3766] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <span>🤵 Khách Mời Nhà Trai</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedSide === 'groom' ? 'bg-amber-400 text-stone-900' : 'bg-stone-100 text-stone-600'
              }`}>
                {allGuests.filter((g) => g.side === 'groom').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSide('bride')}
              className={`py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedSide === 'bride'
                  ? 'bg-[#E01460] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <span>👰 Khách Mời Nhà Gái</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedSide === 'bride' ? 'bg-amber-300 text-stone-900' : 'bg-stone-100 text-stone-600'
              }`}>
                {allGuests.filter((g) => g.side === 'bride').length}
              </span>
            </button>
          </div>

          {/* Mode Switcher: Dán hàng loạt vs Bảng danh sách */}
          <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'paste' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
              <span>Dán hàng loạt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-pink-600" />
              <span>Bảng danh sách &amp; Xưng hô ({sideGuests.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 font-sans text-xs">
          
          {/* ================= MODE 1: BULK PASTE TEXTAREA ================= */}
          {activeTab === 'paste' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Salutation Choice Selector Bar */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Chọn danh xưng mặc định khi dán danh sách này:</span>
                  </label>

                  <select
                    value={defaultPasteSalutation}
                    onChange={(e) => setDefaultPasteSalutation(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-bold text-xs text-stone-800 shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="auto">⚡ Tự động nhận diện (Cô, Dì, Chú, Bác, Anh...)</option>
                    {COMMON_SALUTATIONS.map((sal) => (
                      <option key={sal} value={sal}>
                        Gán mặc định: {sal}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Selection Pill Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-stone-500 font-semibold mr-1">Chọn nhanh danh xưng:</span>
                  <button
                    type="button"
                    onClick={() => setDefaultPasteSalutation('auto')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      defaultPasteSalutation === 'auto'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    ⚡ Tự động
                  </button>
                  {['Cô', 'Dì', 'Chú', 'Bác', 'Anh', 'Chị', 'Em', 'Bạn', 'Gia đình', 'Cậu', 'Mợ', 'Ông', 'Bà'].map((sal) => (
                    <button
                      key={sal}
                      type="button"
                      onClick={() => setDefaultPasteSalutation(sal)}
                      className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                        defaultPasteSalutation === sal
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {sal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 text-xs mb-1.5">
                  Dán danh sách khách mời {selectedSide === 'groom' ? 'NHÀ TRAI' : 'NHÀ GÁI'} (Mỗi vị khách 1 dòng):
                </label>
                <textarea
                  rows={7}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={
                    defaultPasteSalutation === 'auto'
                      ? `Cô Lan\nChú Hùng - 0987654321\nAnh Thành\nChị Phương\nGia đình Bác Tám\nBạn Minh`
                      : `Lan\nHùng - 0987654321\nThành\nPhương\nTám\nMinh`
                  }
                  className="w-full p-3.5 rounded-2xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              {/* Real-time Live Preview of Parsed Guests */}
              {parsedPreview.length > 0 && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="font-bold text-stone-700 flex items-center justify-between text-[11px] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-pink-600" />
                      <span>Xem trước kết quả phân tích ({parsedPreview.length} vị khách):</span>
                    </span>
                    <span className="text-amber-800 font-semibold normal-case">
                      Danh xưng đang dùng: <strong>{defaultPasteSalutation === 'auto' ? 'Tự động nhận diện' : defaultPasteSalutation}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-0.5">
                    {parsedPreview.slice(0, 6).map((item, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-1.5 text-xs shadow-2xs"
                      >
                        <span className="font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md text-[11px] border border-pink-200 shrink-0">
                          {item.salutation}
                        </span>
                        <span className="font-bold text-stone-900 truncate flex-1 text-left">
                          {item.name}
                        </span>
                        {item.phone && (
                          <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                            {item.phone}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {parsedPreview.length > 6 && (
                    <p className="text-[11px] text-stone-400 italic pt-0.5">
                      ... và {parsedPreview.length - 6} vị khách khác sẽ được tạo tự động với danh xưng tương tự.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-stone-500 font-medium text-xs">
                  {bulkText.trim() ? `Đã nhập khoảng ${bulkText.split('\n').filter((l) => l.trim()).length} dòng khách mời` : 'Chưa có dòng nào'}
                </span>

                <button
                  type="button"
                  onClick={handleBulkAdd}
                  disabled={!bulkText.trim()}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                    bulkText.trim()
                      ? selectedSide === 'groom'
                        ? 'bg-[#1C3766] hover:bg-[#13274A]'
                        : 'bg-[#E01460] hover:bg-[#C20E50]'
                      : 'bg-stone-300 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>➕ Thêm vào danh sách {selectedSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 2: TABLE & HONORIFIC SETTINGS ================= */}
          {activeTab === 'list' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Stats pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-stone-700">Tổng quan danh xưng ({selectedSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'}):</span>
                  {Object.keys(salutationStats).length === 0 ? (
                    <span className="text-stone-400 font-normal">Chưa có dữ liệu</span>
                  ) : (
                    Object.entries(salutationStats).map(([sal, cnt]) => (
                      <span
                        key={sal}
                        className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 font-semibold shadow-2xs text-[11px]"
                      >
                        {sal}: <strong className="text-pink-600">{cnt}</strong>
                      </span>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Dán thêm hàng loạt</span>
                </button>
              </div>

              {/* Search & Batch Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên, danh xưng hoặc số điện thoại..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                {/* Batch Salutation Assign & Delete */}
                {selectedGuestIds.size > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50/90 p-1.5 rounded-xl border border-amber-200">
                    <span className="text-[11px] font-bold text-amber-900 px-1">
                      Đã chọn ({selectedGuestIds.size}):
                    </span>

                    <select
                      value={batchSalutation}
                      onChange={(e) => setBatchSalutation(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-amber-300 bg-white text-xs font-bold text-stone-800"
                    >
                      {COMMON_SALUTATIONS.map((sal) => (
                        <option key={sal} value={sal}>
                          Đổi xưng hô thành: {sal}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleBatchApplySalutation}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      Áp dụng
                    </button>

                    <button
                      type="button"
                      onClick={handleBatchDelete}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1"
                      title="Xóa các mục đã chọn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa chọn</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Interactive Guests Table */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 text-[11px] uppercase tracking-wider font-bold border-b border-stone-200">
                        <th className="p-3 w-10 text-center">
                          <button
                            type="button"
                            onClick={handleSelectAll}
                            className="cursor-pointer text-stone-600 hover:text-stone-900"
                            title="Chọn tất cả"
                          >
                            {selectedGuestIds.size === filteredGuests.length && filteredGuests.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-pink-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="p-3 w-12 text-center">STT</th>
                        <th className="p-3 w-40">Cách xưng hô (Danh xưng)</th>
                        <th className="p-3 w-48">Tên khách mời</th>
                        <th className="p-3 w-36">Số điện thoại</th>
                        <th className="p-3">Hành động &amp; Lời mời Zalo cá nhân</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-xs">
                      {filteredGuests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-400">
                            Chưa có khách mời nào trong danh sách {selectedSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'}. Bấm nút &quot;Dán thêm hàng loạt&quot; để thêm nhanh!
                          </td>
                        </tr>
                      ) : (
                        filteredGuests.map((guest, idx) => {
                          const isSelected = selectedGuestIds.has(guest.id);
                          const isCopiedMsg = copiedId === guest.id;
                          const isCopiedLink = Boolean(copiedLinkMap[guest.id]);

                          return (
                            <tr
                              key={guest.id}
                              className={`transition-colors ${
                                isSelected ? 'bg-pink-50/60' : 'hover:bg-stone-50/80'
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSelect(guest.id)}
                                  className="cursor-pointer text-stone-600 hover:text-pink-600"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-pink-600" />
                                  ) : (
                                    <Square className="w-4 h-4 stroke-1.5" />
                                  )}
                                </button>
                              </td>

                              {/* Index */}
                              <td className="p-3 text-center font-bold text-stone-400 text-[11px]">
                                {idx + 1}
                              </td>

                              {/* Honorific / Salutation Column (Cột cách xưng hô) */}
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={guest.salutation}
                                    onChange={(e) =>
                                      handleUpdateGuest(guest.id, { salutation: e.target.value })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white font-bold text-stone-800 focus:ring-1 focus:ring-pink-500 focus:outline-none"
                                  >
                                    {COMMON_SALUTATIONS.map((sal) => (
                                      <option key={sal} value={sal}>
                                        {sal}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>

                              {/* Guest Name Column */}
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={guest.name}
                                  onChange={(e) =>
                                    handleUpdateGuest(guest.id, { name: e.target.value })
                                  }
                                  placeholder="Nhập tên khách mời..."
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 font-semibold text-stone-900 focus:ring-1 focus:ring-pink-500 focus:outline-none"
                                />
                              </td>

                              {/* Phone Column */}
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={guest.phone || ''}
                                  onChange={(e) =>
                                    handleUpdateGuest(guest.id, { phone: e.target.value })
                                  }
                                  placeholder="0912345678"
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-700 focus:ring-1 focus:ring-pink-500 focus:outline-none"
                                />
                              </td>

                              {/* Actions Column */}
                              <td className="p-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPersonalizedMessage(guest)}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Chép toàn bộ lời mời kèm tên cá nhân hóa để dán trực tiếp vào Zalo"
                                  >
                                    {isCopiedMsg ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">Đã chép lời mời Zalo!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5 text-amber-700" />
                                        <span>💬 Chép lời mời Zalo ({guest.salutation} {guest.name})</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCopyPersonalizedLink(guest)}
                                    className="px-2 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Chép đường link cá nhân hóa"
                                  >
                                    {isCopiedLink ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">Đã chép link</span>
                                      </>
                                    ) : (
                                      <>
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>Link</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteGuest(guest.id)}
                                    className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Xóa khách mời này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-stone-600 font-medium">
            <Info className="w-4 h-4 text-amber-600" />
            <span>Tổng cộng: <strong className="text-stone-900">{sideGuests.length} khách mời {selectedSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'}</strong> ({allGuests.length} toàn bộ thiệp)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold transition-all shadow-2xs cursor-pointer"
          >
            Hoàn tất &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
