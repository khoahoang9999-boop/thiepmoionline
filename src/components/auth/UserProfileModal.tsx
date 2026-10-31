import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../types/auth';
import {
  DEFAULT_AVATARS,
  getStoredUsers,
  saveStoredUsers,
  setCurrentUserStore,
  syncUsersFromServer,
  isImageAvatarUrl
} from '../../services/authStore';
import { UserAvatar } from '../common/UserAvatar';
import { compressAndUploadImage, normalizeRelativeAssetUrl } from '../../utils/shareLinkCodec';
import { X, User, Key, ShieldCheck, Upload, Save, CheckCircle2 } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onOpenAdminModal?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUpdateUser,
  onOpenAdminModal
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'devices'>('profile');
  
  // Profile form
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [organization, setOrganization] = useState(currentUser.organization || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [notes, setNotes] = useState(currentUser.notes || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(currentUser.fullName || '');
      setOrganization(currentUser.organization || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setNotes(currentUser.notes || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      syncUsersFromServer().then((latestList) => {
        const fresh = latestList.find(
          (u) => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
        );
        if (fresh && (Number(fresh.updatedAtMs) || 0) > (Number(currentUser.updatedAtMs) || 0)) {
          setFullName(fresh.fullName || '');
          setOrganization(fresh.organization || '');
          setPhone(fresh.phone || '');
          setEmail(fresh.email || '');
          setNotes(fresh.notes || '');
          setAvatarUrl(fresh.avatarUrl || '');
          setCurrentUserStore(fresh);
          onUpdateUser(fresh);
        }
      });
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const persistUserChanges = (nextAvatarUrl: string, showToastText?: string) => {
    const nowMs = Date.now();
    const cleanAvatar = normalizeRelativeAssetUrl(nextAvatarUrl) || nextAvatarUrl;
    const users = getStoredUsers();
    const updated: UserAccount = {
      ...currentUser,
      fullName: fullName.trim() || currentUser.fullName,
      organization: organization.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      avatarUrl: cleanAvatar,
      updatedAtMs: nowMs
    };

    const exists = users.some(
      (u) => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
    );
    const nextUsers = exists
      ? users.map((u) =>
          u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
            ? updated
            : u
        )
      : [updated, ...users];

    saveStoredUsers(nextUsers, { syncToServer: true });
    setCurrentUserStore(updated);
    onUpdateUser(updated);

    if (showToastText) {
      setMessage({ type: 'success', text: showToastText });
      setTimeout(() => setMessage(null), 3200);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    persistUserChanges(avatarUrl, 'Đã lưu hồ sơ & đồng bộ tài khoản lên mọi trình duyệt và máy tính!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (currentPassword !== currentUser.password) {
      setMessage({ type: 'error', text: 'Mật khẩu hiện tại không chính xác.' });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải từ 4 ký tự trở lên.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu mới không trùng khớp.' });
      return;
    }

    const nowMs = Date.now();
    const users = getStoredUsers();
    const updated: UserAccount = {
      ...currentUser,
      password: newPassword,
      updatedAtMs: nowMs
    };

    const nextUsers = users.map((u) =>
      u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
        ? updated
        : u
    );
    saveStoredUsers(nextUsers, { syncToServer: true });
    setCurrentUserStore(updated);
    onUpdateUser(updated);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ type: 'success', text: 'Đã đổi mật khẩu & đồng bộ thành công!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const uploadedUrl = await compressAndUploadImage(file, 420, 0.86);
      setAvatarUrl(uploadedUrl);
      persistUserChanges(uploadedUrl, 'Đã tải lên & đồng bộ ảnh đại diện trên mọi thiết bị!');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setAvatarUrl(res);
        persistUserChanges(res, 'Đã lưu & đồng bộ ảnh đại diện!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-900/20 w-full max-w-xl overflow-hidden flex flex-col">
        
        {/* Header matching Screenshot 4 */}
        <div className="bg-[#5C2018] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <UserAvatar
              user={{ fullName, avatarUrl, role: currentUser.role }}
              size="md"
              className="border border-amber-400/60 shadow-inner"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif leading-tight">
                  Tài Khoản & Hồ Sơ Cá Nhân
                </h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  currentUser.role === 'admin' ? 'bg-amber-500 text-stone-900' : 'bg-blue-600 text-white'
                }`}>
                  {currentUser.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG'}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-mono mt-0.5">
                {currentUser.username} • {currentUser.organization || 'Hệ thống thiệp mời'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-stone-100 p-1.5 border-b border-stone-200 flex items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <User className="w-4 h-4 text-amber-700" />
            <span>Hồ sơ & Đổi Avatar</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <Key className="w-4 h-4 text-amber-700" />
            <span>Đổi Mật Khẩu</span>
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Thiết bị & Bảo mật ({currentUser.connectedDevices}/{currentUser.deviceLimit})</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4">
          
          {/* Admin Management Quick Entry Banner */}
          {currentUser.role === 'admin' && onOpenAdminModal && (
            <div className="p-3.5 rounded-2xl bg-[#5C2018] text-amber-100 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Quản Trị Người Dùng (Admin)</span>
                  <span className="text-[11px] text-amber-200/80">Quản lý cấp tài khoản & gia hạn thời gian người dùng</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminModal();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                Mở Bảng Quản Trị
              </button>
            </div>
          )}
          
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Avatar Selection Card */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    📷 Ảnh Đại Diện (Lưu trên hệ thống)
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    {isUploadingAvatar ? 'Đang tải & đồng bộ...' : 'Tự động đồng bộ đa thiết bị'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <UserAvatar
                    key={`modal-avatar-preview-${avatarUrl || 'none'}`}
                    user={{ fullName, avatarUrl, role: currentUser.role }}
                    size="xl"
                    className="border-2 border-amber-400 shadow-sm"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}</span>
                      <input type="file" accept="image/*" onChange={handleCustomAvatarUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        persistUserChanges('', 'Đã chuyển về ảnh đại diện mặc định & đồng bộ!');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-300 cursor-pointer"
                    >
                      Dùng mặc định
                    </button>
                  </div>
                </div>

                {/* Preset Avatar Icons (matching Screenshot 4) */}
                <div>
                  <span className="text-[11px] text-stone-600 block mb-1.5 font-medium">Hoặc chọn nhanh ảnh mẫu có sẵn:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {DEFAULT_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(av.icon);
                          persistUserChanges(av.icon, `Đã chọn biểu tượng "${av.name}" & đồng bộ!`);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all cursor-pointer ${
                          avatarUrl === av.icon
                            ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-xl">{av.icon}</span>
                        <span className="text-[10px] font-bold text-stone-700">{av.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tên đăng nhập / Tài khoản hệ thống
                  </label>
                  <input
                    type="text"
                    value={currentUser.username}
                    disabled
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 font-mono text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Họ và tên người dùng <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Đơn vị công tác / Trường học
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email nhận thông báo
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Ghi chú cá nhân
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ghi chú thêm..."
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5C2018] hover:bg-[#481812] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi & Đồng Bộ</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mật khẩu hiện tại <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mật khẩu mới <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Mật khẩu mới (tối thiểu 4 ký tự)"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Xác nhận mật khẩu mới <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs bg-stone-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5C2018] hover:bg-[#481812] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Cập Nhật Mật Khẩu</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="font-bold text-sm flex items-center gap-1.5">
                  💻 Quản Lý Máy & Thiết Bị Liên Kết
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Tài khoản của bạn được giới hạn tối đa <strong>{currentUser.deviceLimit} thiết bị</strong> sử dụng đồng thời. Hiện tại đã liên kết <strong>{currentUser.connectedDevices} thiết bị</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">Trình duyệt hiện tại (Máy tính bàn / Trình duyệt Web)</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">Đang hoạt động</span>
                </div>
                <p className="text-[11px] text-stone-500 font-mono">
                  Đăng nhập lần cuối: {currentUser.lastLoginTime}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
