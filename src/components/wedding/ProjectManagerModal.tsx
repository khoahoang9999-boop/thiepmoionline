import React, { useState, useRef } from 'react';
import { WeddingData } from '../../types/wedding';
import { DEFAULT_WEDDING_DATA } from '../../data/weddingDefault';
import { formatVietnameseSolarDate } from '../../utils/lunarCalendar';
import { formatVietnamDateTime } from '../../utils/shareLinkCodec';
import {
  X,
  FolderHeart,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';

import { UserAccount } from '../../types/auth';

export interface WeddingProject {
  id: string;
  title: string;
  updatedAt: string;
  data: WeddingData;
}

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: WeddingProject[];
  activeProjectId: string;
  currentWeddingData?: WeddingData;
  onSelectProject: (id: string) => void;
  onCreateProject: (newProject: WeddingProject) => void;
  onDuplicateProject: (project: WeddingProject) => void;
  onDeleteProject: (id: string) => void;
  onImportProject: (project: WeddingProject) => void;
  currentUser?: UserAccount | null;
  onRequireAuth?: (tab: 'login' | 'register') => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  currentWeddingData,
  onSelectProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onImportProject,
  currentUser,
  onRequireAuth
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newGroomName, setNewGroomName] = useState('Nguyễn Minh Khôi');
  const [newBrideName, setNewBrideName] = useState('Trần Ngọc Lan');
  const [newWeddingDate, setNewWeddingDate] = useState('2026-12-20');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const extractShortName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return parts.slice(-2).join(' ');
    }
    return fullName.trim();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const groomFull = newGroomName.trim() || 'Chú Rể';
    const brideFull = newBrideName.trim() || 'Cô Dâu';
    const groomShort = extractShortName(groomFull);
    const brideShort = extractShortName(brideFull);
    const dateVal = newWeddingDate || '2026-12-20';
    const vnDate = formatVietnameseSolarDate(dateVal);
    const nowStr = formatVietnamDateTime();
    const nowMs = Date.now();

    const freshData: WeddingData = {
      ...DEFAULT_WEDDING_DATA,
      groomName: groomFull,
      groomShortName: groomShort,
      brideName: brideFull,
      brideShortName: brideShort,
      groomAvatarUrl: '',
      brideAvatarUrl: '',
      heroPhotoUrl: '',
      shareCoverPhotoUrl: '',
      galleryPhotos: [],
      ceremony: {
        ...DEFAULT_WEDDING_DATA.ceremony,
        date: dateVal
      },
      ceremonyGroom: {
        ...(DEFAULT_WEDDING_DATA.ceremonyGroom || DEFAULT_WEDDING_DATA.ceremony),
        date: dateVal
      },
      ceremonyBride: {
        ...(DEFAULT_WEDDING_DATA.ceremonyBride || DEFAULT_WEDDING_DATA.ceremony),
        date: dateVal
      },
      partyGroom: {
        ...DEFAULT_WEDDING_DATA.partyGroom,
        date: dateVal
      },
      partyBride: {
        ...DEFAULT_WEDDING_DATA.partyBride,
        date: dateVal
      },
      shareDateText: vnDate,
      shareTitle: `${groomFull} ❤️ ${brideFull} - Thiệp Cưới Online`,
      shareGroom: {
        ...(DEFAULT_WEDDING_DATA.shareGroom!),
        coverPhotoUrl: '',
        title: `Thiệp Mời Tiệc Nhà Trai | ${groomFull} ❤️ ${brideFull}`,
        description: `Trân trọng kính mời Quý khách đến dự buổi tiệc rượu chung vui cùng gia đình Nhà Trai chúng tôi vào lúc ${DEFAULT_WEDDING_DATA.partyGroom.time} ngày ${vnDate}!`,
        dateText: vnDate
      },
      shareBride: {
        ...(DEFAULT_WEDDING_DATA.shareBride!),
        coverPhotoUrl: '',
        title: `Thiệp Mời Tiệc Nhà Gái | ${brideFull} ❤️ ${groomFull}`,
        description: `Trân trọng kính mời Quý khách đến dự buổi tiệc rượu chung vui cùng gia đình Nhà Gái chúng tôi vào lúc ${DEFAULT_WEDDING_DATA.partyBride.time} ngày ${vnDate}!`,
        dateText: vnDate
      },
      lastSavedAt: nowStr,
      updatedAtMs: nowMs
    };

    const project: WeddingProject = {
      id: `card_${nowMs}`,
      title: `${groomShort} & ${brideShort}`,
      updatedAt: nowStr,
      data: freshData
    };

    onCreateProject(project);
    setShowNewForm(false);
    onClose();
  };

  const handleExportJson = async (proj: WeddingProject) => {
    setExportingId(proj.id);
    try {
      const { exportWeddingJsonWithEmbeddedImages } = await import('../../utils/shareLinkCodec');
      const isCurrent = proj.id === activeProjectId;
      const liveData = isCurrent && currentWeddingData ? currentWeddingData : proj.data;
      const nowStr = formatVietnamDateTime();
      const nowMs = Date.now();
      const latestProj: WeddingProject = {
        ...proj,
        title: `${liveData.groomShortName || liveData.groomName || 'Chú Rể'} & ${liveData.brideShortName || liveData.brideName || 'Cô Dâu'}`,
        updatedAt: nowStr,
        data: {
          ...liveData,
          lastSavedAt: nowStr,
          updatedAtMs: nowMs
        }
      };
      const safeName = latestProj.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');
      await exportWeddingJsonWithEmbeddedImages(latestProj, `thiep-${safeName || 'cuoi'}.json`);
      setStatusNotice(`Đã tải xuống file .JSON cập nhật mới nhất lúc ${nowStr}`);
      setTimeout(() => setStatusNotice(null), 3500);
    } finally {
      setExportingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawText = String(reader.result || '').replace(/^\uFEFF/, '').trim();
        const parsed = JSON.parse(rawText);

        let rawCardData: any = null;
        let customTitle = '';

        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          rawCardData = first?.data ? first.data : first;
          customTitle = first?.title || '';
        } else if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
          const activeId = parsed.activeProjectId;
          const chosen = parsed.projects.find((p: any) => p.id === activeId) || parsed.projects[0];
          rawCardData = chosen?.data ? chosen.data : chosen;
          customTitle = chosen?.title || '';
        } else if (parsed && typeof parsed === 'object') {
          rawCardData = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
          customTitle = parsed.title || '';
        }

        if (!rawCardData || typeof rawCardData !== 'object') {
          setImportError('Tệp .JSON không đúng định dạng dữ liệu thiệp cưới.');
          setIsImporting(false);
          return;
        }

        const { uploadEmbeddedDataUrlsInWeddingData } = await import('../../utils/shareLinkCodec');
        const syncedMediaData = await uploadEmbeddedDataUrlsInWeddingData(rawCardData as WeddingData);

        const groomShort = syncedMediaData.groomShortName || syncedMediaData.groomName || 'Chú Rể';
        const brideShort = syncedMediaData.brideShortName || syncedMediaData.brideName || 'Cô Dâu';
        const nowStr = formatVietnamDateTime();
        const nowMs = Date.now();
        const newProj: WeddingProject = {
          id: `card_${nowMs}`,
          title: customTitle || `${groomShort} & ${brideShort}`,
          updatedAt: nowStr,
          data: {
            ...syncedMediaData,
            lastSavedAt: nowStr,
            updatedAtMs: nowMs
          }
        };

        onImportProject(newProj);
        setIsImporting(false);
        onClose();
      } catch (err) {
        console.error('Invalid JSON file', err);
        setImportError('Không thể đọc file .JSON. Vui lòng kiểm tra lại định dạng tệp đã xuất.');
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      setImportError('Lỗi khi đọc tệp từ thiết bị.');
      setIsImporting(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1C3766] via-[#264782] to-[#15294D] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/25">
              <FolderHeart className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <span>Quản Lý Danh Sách Thiệp Cưới (Multi-Studio)</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 font-semibold">
                  {projects.length} bộ thiệp
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                Tạo không giới hạn thiệp cưới cho nhiều cặp đôi khác nhau, lưu trữ & xuất bản độc lập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-800">
          {/* Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            <div className="text-xs text-stone-600">
              Chọn bộ thiệp bên dưới để chỉnh sửa hoặc bấm <strong>"+ Tạo Thiệp Cưới Mới"</strong> cho cặp đôi khác.
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={isImporting}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isImporting ? 'Đang nhập & đồng bộ ảnh...' : 'Nhập file .JSON'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onClose();
                    onRequireAuth?.('register');
                    return;
                  }
                  setShowNewForm(!showNewForm);
                }}
                className="px-4 py-2 rounded-xl bg-[#1C3766] hover:bg-blue-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Thiệp Cưới Mới</span>
              </button>
            </div>
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              ⚠️ {importError}
            </div>
          )}

          {statusNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Create New Project Quick Form */}
          {showNewForm && (
            <form
              onSubmit={handleCreateNew}
              className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-4 space-y-3.5 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-[#1C3766] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Khởi tạo nhanh bộ thiệp mới cho cặp đôi</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Huỷ
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Họ và tên Chú Rể
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroomName}
                    onChange={(e) => setNewGroomName(e.target.value)}
                    placeholder="VD: Nguyễn Minh Khôi"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Họ và tên Cô Dâu
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrideName}
                    onChange={(e) => setNewBrideName(e.target.value)}
                    placeholder="VD: Trần Ngọc Lan"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:border-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Ngày tổ chức chính (Dương lịch)
                  </label>
                  <input
                    type="date"
                    required
                    value={newWeddingDate}
                    onChange={(e) => setNewWeddingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tạo & Mở Chỉnh Sửa Ngay</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Projects */}
          <div className="space-y-2.5">
            {projects.map((proj) => {
              const isCurrent = proj.id === activeProjectId || (projects.length === 1);
              const displayData = isCurrent && currentWeddingData ? currentWeddingData : proj.data;
              const groomDate = formatVietnameseSolarDate(displayData.partyGroom.date);
              const brideDate = formatVietnameseSolarDate(displayData.partyBride.date);
              const displayUpdatedAt =
                isCurrent && currentWeddingData?.lastSavedAt
                  ? currentWeddingData.lastSavedAt
                  : proj.updatedAt;
              const isConfirmingDelete = confirmDeleteId === proj.id;

              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-[#1C3766] bg-blue-50/40 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectProject(proj.id);
                      onClose();
                    }}
                    className="space-y-1 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                        {displayData.groomName} ❤️ {displayData.brideName}
                      </span>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1C3766] text-white text-[10px] font-bold">
                          Đang chỉnh sửa
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-700" />
                        <span>Nhà Trai: {displayData.partyGroom.time} - {groomDate}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-700" />
                        <span>Nhà Gái: {displayData.partyBride.time} - {brideDate}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Cập nhật: <strong>{displayUpdatedAt}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1C3766] hover:bg-blue-950 text-white text-xs font-bold cursor-pointer"
                      >
                        Mở thiệp này
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth?.('login');
                          return;
                        }
                        onDuplicateProject({
                          ...proj,
                          data: displayData
                        });
                      }}
                      title="Nhân bản bộ thiệp này"
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={exportingId === proj.id}
                      onClick={() => handleExportJson(proj)}
                      title="Tải file dự án (.JSON) có đầy đủ mọi chỉnh sửa & hình ảnh mới nhất"
                      className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span>{exportingId === proj.id ? 'Đang tải...' : 'Tải .JSON'}</span>
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProject(proj.id);
                            setConfirmDeleteId(null);
                            setStatusNotice(`Đã xoá bộ thiệp "${proj.title}" thành công!`);
                            setTimeout(() => setStatusNotice(null), 3000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Xác nhận xoá
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-600 text-[11px] font-semibold border border-stone-200 cursor-pointer"
                        >
                          Huỷ
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(proj.id)}
                        title="Xoá bộ thiệp / file .JSON này khỏi danh sách"
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            Mọi bộ thiệp đều có thể tạo Link gửi khách riêng biệt hoặc xuất / nhập file .JSON bất cứ lúc nào.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

