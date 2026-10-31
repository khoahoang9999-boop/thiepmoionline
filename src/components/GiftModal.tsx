import React, { useState } from 'react';
import { InvitationData, ThemeConfig } from '../types/invitation';
import { X, Copy, Check, QrCode, Gift, Heart } from 'lucide-react';

interface GiftModalProps {
  invitation: InvitationData;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  invitation,
  theme,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gift = invitation.bankGift || {
    bankName: 'Vietcombank - Chi nhánh Sài Gòn',
    accountNumber: '1018998877',
    accountHolder: invitation.primaryHosts.toUpperCase(),
    note: `Mung ${invitation.primaryHosts}`
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(gift.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon */}
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-3">
          <Gift className="w-7 h-7 stroke-[1.5]" />
        </div>

        <h3 className="text-2xl font-luxury font-semibold text-stone-900">
          Hộp Mừng Quà & Chúc Phúc
        </h3>

        <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 mb-6 leading-relaxed">
          Sự hiện diện của quý vị là món quà quý giá nhất. Đối với quý khách ở xa muốn gửi gắm lời chúc mừng, có thể tham khảo thông tin bên dưới:
        </p>

        {/* Simulated VietQR Card */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 mb-6">
          <div className="flex justify-center mb-3">
            {/* SVG QR Code Simulation */}
            <div className="w-40 h-40 bg-white p-2.5 rounded-xl border border-stone-300/80 shadow-xs flex flex-col items-center justify-center relative">
              <svg viewBox="0 0 100 100" className="w-full h-full text-stone-900">
                {/* Corner markers */}
                <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="2" />
                <rect x="11" y="11" width="16" height="16" fill="currentColor" />
                
                <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="2" />
                <rect x="73" y="11" width="16" height="16" fill="currentColor" />

                <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="2" />
                <rect x="11" y="73" width="16" height="16" fill="currentColor" />

                {/* Simulated QR data grid */}
                <rect x="42" y="8" width="6" height="14" fill="currentColor" />
                <rect x="52" y="14" width="8" height="6" fill="currentColor" />
                <rect x="40" y="28" width="18" height="6" fill="currentColor" />
                <rect x="10" y="42" width="20" height="6" fill="currentColor" />
                <rect x="36" y="40" width="12" height="12" fill="currentColor" />
                <rect x="54" y="42" width="22" height="6" fill="currentColor" />
                <rect x="80" y="42" width="12" height="8" fill="currentColor" />
                <rect x="42" y="60" width="8" height="18" fill="currentColor" />
                <rect x="58" y="56" width="10" height="10" fill="currentColor" />
                <rect x="74" y="60" width="16" height="6" fill="currentColor" />
                <rect x="42" y="84" width="24" height="6" fill="currentColor" />
                <rect x="74" y="76" width="16" height="14" fill="currentColor" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-xs">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Quét mã QR qua ứng dụng Ngân hàng (VietQR)
          </span>
        </div>

        {/* Banking Details */}
        <div className="space-y-2 text-left bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Ngân hàng:</span>
            <span className="font-semibold text-stone-800">{gift.bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Số tài khoản:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-stone-900 text-sm">
                {gift.accountNumber}
              </span>
              <button
                onClick={handleCopyAccount}
                className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors"
                title="Sao chép số tài khoản"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Chủ tài khoản:</span>
            <span className="font-semibold text-stone-800">{gift.accountHolder}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Nội dung CK:</span>
            <span className="font-mono text-stone-700">{gift.note}</span>
          </div>
        </div>

        {copied && (
          <p className="text-xs text-emerald-600 font-medium mt-2">
            ✓ Đã sao chép số tài khoản vào bộ nhớ tạm!
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
        >
          Đóng cửa sổ
        </button>
      </div>
    </div>
  );
};
