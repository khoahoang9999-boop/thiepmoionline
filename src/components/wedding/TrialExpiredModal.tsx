import React from 'react';
import { AlertCircle, UserPlus, LogIn, PhoneCall, Clock, Sparkles } from 'lucide-react';

interface TrialExpiredModalProps {
  isOpen: boolean;
  coupleNames?: string;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({
  isOpen,
  coupleNames = 'Cô dâu & Chú rể',
  onOpenRegister,
  onOpenLogin
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-rose-300 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-amber-900 text-white p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl mb-3 shadow-inner">
            ⏳
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-900 font-bold text-[10px] uppercase tracking-wider shadow-xs">
            Hạn dùng thử 3 ngày đã hết
          </span>

          <h2 className="text-xl font-bold font-serif mt-2 tracking-wide">
            Thiệp Mời Cưới: {coupleNames}
          </h2>
          <p className="text-xs text-rose-100/90 mt-1 font-light">
            Hệ thống Thiệp Mời Online Tương Tác Premium
          </p>
        </div>

        {/* Message Content */}
        <div className="p-6 text-center space-y-4 bg-stone-50/50">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed space-y-2 text-left">
            <div className="font-bold text-sm flex items-center gap-1.5 text-rose-800">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>Đường link thiệp mời này đã quá 03 ngày dùng thử!</span>
            </div>
            <p className="text-stone-700 text-[11px] leading-normal">
              Đối với thiệp mời tự do chưa được gia hạn chính thức, hệ thống hỗ trợ truy cập dùng thử miễn phí trong vòng <strong>03 ngày</strong>.
            </p>
            <p className="text-stone-700 text-[11px] leading-normal font-semibold">
              Để giữ link thiệp hoạt động bền vững theo <strong>Năm / Tháng hoặc Vĩnh Viễn</strong> cho khách mời truy cập lại, vui lòng đăng ký tài khoản và liên hệ Admin hệ thống để gia hạn.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
            <div className="font-bold text-amber-800">💡 Quyền lợi khi được Admin gia hạn:</div>
            <div className="text-[11px] text-amber-800 font-serif">
              ✓ Lưu trữ thiệp không thời hạn • ✓ Không giới hạn lượt khách xem • ✓ Tải nhạc & ảnh sắc nét HD
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onOpenRegister}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký Tài Khoản Chính Thức Ngay</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="w-full py-3 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-700" />
              <span>Đã có tài khoản? Đăng nhập để kích hoạt</span>
            </button>
          </div>

          {/* Contact Admin */}
          <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
            <span>Hotline Hỗ Trợ Gia Hạn Admin: <strong className="text-stone-900 font-mono text-xs">0978.468.986</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
