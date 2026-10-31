import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../types/auth';
import { getStoredUsers, saveStoredUsers, setCurrentUserStore, syncUsersFromServer } from '../../services/authStore';
import { X, LogIn, UserPlus, Eye, EyeOff, Building, User, Mail, Phone, Lock, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Sync activeTab with initialTab and pull latest accounts from server whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMessage('');
      setSuccessMessage('');
      syncUsersFromServer();
    }
  }, [isOpen, initialTab]);
  
  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register form states
  const [regFullName, setRegFullName] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const users = await syncUsersFromServer();
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === loginUsername.trim().toLowerCase() ||
          u.email.toLowerCase() === loginUsername.trim().toLowerCase()) &&
        u.password === loginPassword
    );

    if (!found) {
      setErrorMessage('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    if (found.status === 'locked') {
      setErrorMessage('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Admin để mở lại!');
      return;
    }

    // Update login stats while preserving profile updatedAtMs and latest avatar
    const now = new Date();
    const nowMs = Date.now();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
    const dateStr = now.toLocaleDateString('vi-VN');
    const nowStr = `${timeStr} ${dateStr}`;

    const updatedUser: UserAccount = {
      ...found,
      lastLoginTime: nowStr,
      todayLogins: (found.todayLogins || 0) + 1,
      updatedAtMs: Math.max(found.updatedAtMs || 0, nowMs)
    };

    const nextUsers = users.map((u) =>
      u.id === found.id || u.username.toLowerCase() === found.username.toLowerCase() ? updatedUser : u
    );
    saveStoredUsers(nextUsers, { syncToServer: true });
    setCurrentUserStore(updatedUser);

    onLoginSuccess(updatedUser);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regFullName.trim() || !regOrg.trim() || !regUsername.trim() || !regPassword) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Mật khẩu tối thiểu phải từ 4 ký tự.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    const users = await syncUsersFromServer();
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === regUsername.trim().toLowerCase() ||
        u.email.toLowerCase() === regUsername.trim().toLowerCase()
    );

    if (exists) {
      setErrorMessage('Tên đăng nhập / Email này đã tồn tại trên hệ thống. Vui lòng chọn tên khác hoặc Đăng nhập.');
      return;
    }

    const nowMs = Date.now();
    const newUser: UserAccount = {
      id: `user_${nowMs}_${Math.random().toString(36).substring(2, 7)}`,
      username: regUsername.trim(),
      fullName: regFullName.trim(),
      email: regUsername.includes('@') ? regUsername.trim() : `${regUsername.trim()}@gmail.com`,
      phone: regPhone.trim(),
      organization: regOrg.trim(),
      role: 'user',
      password: regPassword,
      status: 'active',
      expiryDate: 'Dùng thử: Còn 3 ngày',
      deviceLimit: 2,
      connectedDevices: 1,
      lastLoginTime: new Date().toLocaleString('vi-VN'),
      todaySeconds: 0,
      todayLogins: 1,
      notes: 'Người dùng tự đăng ký qua hệ thống',
      createdAt: new Date().toISOString(),
      updatedAtMs: nowMs
    };

    const nextUsers = [newUser, ...users];
    saveStoredUsers(nextUsers, { syncToServer: true });
    setCurrentUserStore(newUser);

    setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển đăng nhập...');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-900/20 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header matching Screenshot 5 & 6 */}
        <div className="bg-[#5C2018] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner">
              囍
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif leading-tight">
                {activeTab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
              </h2>
              <p className="text-[11px] text-amber-200/80">
                Hệ thống Thiệp Mời Online Premium
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-200/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="bg-stone-100 p-1.5 border-b border-stone-200 grid grid-cols-2 gap-1 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Tài Khoản</span>
            <span className="bg-amber-400 text-stone-900 text-[9px] px-1.5 py-0.2 rounded-full uppercase">Mới</span>
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4">
          
          {/* Quick Notice Banner */}
          {activeTab === 'register' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Đăng ký tài khoản tự động:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-700">
                Sau khi đăng ký, tài khoản sẽ tự động đồng bộ lên hệ thống quản trị. Quý khách đăng nhập và liên hệ Admin để được cấp lượt dùng hoặc hạn ngày sử dụng.
              </p>
            </div>
          )}

          {/* Error / Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
              ⚠️ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
              ✅ {successMessage}
            </div>
          )}

          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tên đăng nhập / Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Ví dụ: admin@123 hoặc email của bạn"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mật khẩu truy cập <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Tối thiểu 4 ký tự"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Ngay</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Họ và tên người dùng <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thị Hoa"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Đơn vị / Trường học / Địa chỉ <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="Ví dụ: Trường Mầm Non Tân Thành"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tên đăng nhập / Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Ví dụ: giaovien_hoa hoặc hoanguyen@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Số điện thoại <span className="text-stone-400 font-normal">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Ví dụ: 0987.654.321"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mật khẩu <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 4 ký tự"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Xác nhận mật khẩu <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng Ký Tài Khoản Ngay</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                  }}
                  className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                >
                  Đã có tài khoản? Đăng nhập ngay
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
