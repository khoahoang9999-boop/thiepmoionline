import React, { useState } from 'react';
import { X, Heart, Share2, QrCode, Eye, Link, Users, ChevronRight, Check, Copy } from 'lucide-react';
import { WeddingData, SideType } from '../../types/wedding';
import { buildShareableSideUrl, syncWeddingDataToServer } from '../../utils/shareLinkCodec';

interface ShareMenuModalProps {
  isOpen: boolean;
  activeSide: SideType;
  weddingData: WeddingData;
  guestName?: string;
  onClose: () => void;
  onOpenCustomLinkModal: () => void;
  onSwitchToPreview: () => void;
}

export const ShareMenuModal: React.FC<ShareMenuModalProps> = ({
  isOpen,
  activeSide,
  weddingData,
  guestName,
  onClose,
  onOpenCustomLinkModal,
  onSwitchToPreview
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fullShareUrl = buildShareableSideUrl(
    typeof window !== 'undefined' ? window.location.origin : 'https://thiepmoionline.khoahoang9999.workers.dev',
    activeSide,
    weddingData,
    { guestName }
  );

  if (!isOpen) return null;

  const handleCopyLink = () => {
    syncWeddingDataToServer(weddingData);
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Heart Badge & Status Header matching Screenshot 2 */}
        <div className="p-6 pb-4 text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto text-rose-500 shadow-xs">
            <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
          </div>

          <h3 className="text-base font-bold text-rose-500 font-sans">
            Thiệp đang hoạt động
          </h3>

          <p className="text-xs font-semibold text-rose-400 font-mono break-all px-2">
            {fullShareUrl}
          </p>

          <p className="text-[11px] text-stone-400 leading-relaxed px-2">
            Link chung - dùng cho nhóm chat, mạng xã hội, in thiệp giấy. Nên gửi link bằng điện thoại để hiện đủ thông tin trong tin nhắn.
          </p>
        </div>

        {/* Top 2 Action Buttons matching Screenshot 2 */}
        <div className="px-5 pb-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-stone-600" />}
            <span>{copied ? 'Đã chép link' : 'Chia sẻ link'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-stone-600" />
            <span>Mã QR</span>
          </button>
        </div>

        {/* Menu Items matching Screenshot 2 (No Payment item!) */}
        <div className="border-t border-stone-100 divide-y divide-stone-100 text-xs font-sans">
          
          {/* Xem thiệp */}
          <button
            type="button"
            onClick={() => {
              onSwitchToPreview();
              onClose();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-800 text-xs">Xem thiệp</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
          </button>

          {/* Tùy chỉnh đường link */}
          <button
            type="button"
            onClick={() => {
              onOpenCustomLinkModal();
              onClose();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
                <Link className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-800 text-xs">Tùy chỉnh đường link</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
          </button>

          {/* Mời khách */}
          <button
            type="button"
            onClick={() => {
              onSwitchToPreview();
              onClose();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left group bg-rose-50/40 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-rose-600 text-xs block">Mời khách</span>
                <span className="text-[11px] text-stone-400 block">Ghi tên & tạo link riêng cho từng khách</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
          </button>

        </div>
      </div>

      {/* QR Code Modal Popup */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm">Mã QR Thiệp Mời</h4>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fullShareUrl)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-stone-500 font-mono break-all">{fullShareUrl}</p>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
