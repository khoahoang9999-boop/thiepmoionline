import React, { useState } from 'react';
import { UserAccount, UserRole, UserStatus } from '../../types/auth';
import {
  getStoredUsers,
  saveStoredUsers,
  formatActiveTime,
  getUserExpiryInfo,
  sortUsersList,
  syncUsersFromServer,
  isImageAvatarUrl
} from '../../services/authStore';
import { UserAvatar } from '../common/UserAvatar';
import {
  X,
  Shield,
  Plus,
  RefreshCw,
  Key,
  Search,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Copy,
  Laptop
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [users, setUsers] = useState<UserAccount[]>(getStoredUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCompact, setViewCompact] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all');

  // Edit / Add User Modal state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Password reset prompt modal
  const [resetPassUser, setResetPassUser] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Sync users from storage and server whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUsers(getStoredUsers());
      syncUsersFromServer().then((latest) => {
        setUsers(latest);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveUserList = (nextList: UserAccount[], options?: { replaceAll?: boolean }) => {
    setUsers(nextList);
    saveStoredUsers(nextList, { syncToServer: true, replaceAll: options?.replaceAll });
  };

  const handleQuickExtendOneYear = (userId: string) => {
    const nowMs = Date.now();
    const nextUsers = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          expiryDate: '19/11/2027 (Còn 1 Năm)',
          updatedAtMs: nowMs
        };
      }
      return u;
    });
    handleSaveUserList(nextUsers);
  };

  const handleToggleLock = (userId: string) => {
    const nowMs = Date.now();
    const nextUsers = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: UserStatus = u.status === 'active' ? 'locked' : 'active';
        return { ...u, status: nextStatus, updatedAtMs: nowMs };
      }
      return u;
    });
    handleSaveUserList(nextUsers);
  };

  const handleDeleteUser = (userId: string, _name?: string) => {
    const nextUsers = users.filter((u) => u.id !== userId);
    handleSaveUserList(nextUsers, { replaceAll: true });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser || !newPasswordInput.trim()) return;
    const nowMs = Date.now();
    const nextUsers = users.map((u) =>
      u.id === resetPassUser.id
        ? { ...u, password: newPasswordInput.trim(), updatedAtMs: nowMs }
        : u
    );
    handleSaveUserList(nextUsers);
    setResetPassUser(null);
    setNewPasswordInput('');
  };

  // Filtered and Sorted list (Admin fixed top -> New trial accounts -> Alphabetically A-Z)
  const filteredUsers = sortUsersList(
    users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q));

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchQuery && matchRole && matchStatus;
    })
  );

  const totalUsers = users.length;
  const totalUsersRole = users.filter((u) => u.role === 'user').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const todayLogins = users.reduce((acc, u) => acc + (u.todayLogins || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-300 w-[98vw] max-w-[1680px] h-[94vh] max-h-[960px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Bar matching Screenshot 2 */}
        <div className="bg-[#5C2018] text-white p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/40 text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif leading-tight">
                  Quản Trị & Cấp Tài Khoản Người Dùng
                </h2>
                <span className="bg-amber-500 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Dành cho Admin
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Hệ thống quản lý thông tin thiệp cưới & thời hạn tài khoản người dùng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Tự động đồng bộ thời gian thực
            </span>

            <button
              onClick={() => {
                const newUser: UserAccount = {
                  id: `user_${Date.now()}`,
                  username: `user_${Math.floor(100 + Math.random() * 900)}@gmail.com`,
                  fullName: 'Người dùng mới',
                  email: '',
                  organization: 'Đơn vị mới',
                  role: 'user',
                  password: '123456',
                  status: 'active',
                  expiryDate: 'Dùng thử: Còn 3 ngày',
                  deviceLimit: 2,
                  connectedDevices: 1,
                  lastLoginTime: 'Mới tạo',
                  todaySeconds: 0,
                  todayLogins: 0,
                  notes: 'Tài khoản do Admin khởi tạo',
                  createdAt: new Date().toISOString()
                };
                setEditingUser(newUser);
                setIsCreating(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cấp Tài Khoản Mới</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row (matching Screenshot 2) */}
        <div className="bg-stone-100 p-3 border-b border-stone-200 text-xs flex flex-wrap items-center justify-between gap-3 text-stone-700">
          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <span>👥 Tổng: <strong className="text-stone-900">{totalUsers}</strong> tài khoản</span>
            <span className="text-stone-300">|</span>
            <span>👨‍🏫 Người dùng/Giáo viên: <strong className="text-blue-800">{totalUsersRole}</strong></span>
            <span className="text-stone-300">|</span>
            <span>🛡️ Admin: <strong className="text-amber-800">{totalAdmins}</strong></span>
            <span className="text-stone-300">|</span>
            <span>⚡ Đăng nhập hôm nay: <strong className="text-emerald-800">{todayLogins}</strong> lượt ({totalUsers} user)</span>
          </div>
        </div>

        {/* Search & Filter Bar (matching Screenshot 2) */}
        <div className="p-3 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh theo họ tên, tên đăng nhập, email, trường học..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewCompact(false)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                !viewCompact ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-300'
              }`}
            >
              📋 Xem đầy đủ cột
            </button>
            <button
              onClick={() => setViewCompact(true)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                viewCompact ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-300'
              }`}
            >
              📑 Xem gọn
            </button>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-medium"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="user">Người dùng (Giáo viên)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* Main Users Table (matching Screenshot 2) */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-100 text-stone-700 font-bold sticky top-0 z-10 border-b border-stone-200">
              <tr>
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Họ Tên & Tài Khoản</th>
                {!viewCompact && <th className="p-3">Thời Gian Đăng Nhập & Hoạt Động</th>}
                <th className="p-3">Ngày Hết Hạn Tài Khoản</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    Không tìm thấy tài khoản nào phù hợp với từ khóa.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-3 text-center font-bold text-stone-400">{idx + 1}</td>
                    
                    {/* User info */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={u} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900 text-xs">{u.fullName}</span>
                            {u.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                GỐC
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-stone-500">
                            {u.username} {u.organization ? `• ${u.organization}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Last activity */}
                    {!viewCompact && (
                      <td className="p-3 text-[11px] text-stone-600">
                        <div>➔] Đăng nhập: <strong className="text-stone-800">{u.lastLoginTime}</strong></div>
                        <div className="text-stone-500">⏱️ Hôm nay: <strong className="text-stone-800">{formatActiveTime(u.todaySeconds)}</strong> • <strong className="text-stone-800">{u.todayLogins || 1}</strong> lượt</div>
                      </td>
                    )}

                    {/* Expiry status */}
                    <td className="p-3">
                      {(() => {
                        const expInfo = getUserExpiryInfo(u);
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${expInfo.badgeColor}`}>
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{expInfo.text}</span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      {u.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Đã khóa
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickExtendOneYear(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] cursor-pointer"
                          title="Gia hạn nhanh +1 Năm sử dụng"
                        >
                          +1 Năm
                        </button>

                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setIsCreating(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Xem chi tiết & chỉnh sửa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem & Sửa</span>
                        </button>

                        <button
                          onClick={() => {
                            setResetPassUser(u);
                            setNewPasswordInput(u.password);
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 cursor-pointer"
                          title="Đổi mật khẩu"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleLock(u.id)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                          }`}
                          title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT USER MODAL (matching Screenshot 3) */}
      {editingUser && (
        <UserDetailEditModal
          user={editingUser}
          isCreating={isCreating}
          onClose={() => setEditingUser(null)}
          onSave={(savedUser) => {
            const stampedUser: UserAccount = {
              ...savedUser,
              updatedAtMs: Date.now()
            };
            let nextUsers: UserAccount[];
            if (isCreating) {
              nextUsers = [stampedUser, ...users];
            } else {
              nextUsers = users.map((u) => (u.id === stampedUser.id ? stampedUser : u));
            }
            handleSaveUserList(nextUsers);
            setEditingUser(null);
          }}
        />
      )}

      {/* RESET PASSWORD PROMPT MODAL */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              Đổi mật khẩu cho: {resetPassUser.fullName}
            </h3>
            <p className="text-xs text-stone-500">Tên đăng nhập: <strong>{resetPassUser.username}</strong></p>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Mật khẩu mới:</label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetPassUser(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleResetPasswordSubmit}
                className="px-4 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold"
              >
                Lưu Mật Khẩu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* USER EDIT DETAIL MODAL COMPONENT (matching Screenshot 3) */
interface UserDetailEditModalProps {
  user: UserAccount;
  isCreating?: boolean;
  onClose: () => void;
  onSave: (savedUser: UserAccount) => void;
}

const UserDetailEditModal: React.FC<UserDetailEditModalProps> = ({
  user,
  isCreating = false,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<UserAccount>({ ...user });

  const handleQuickAddDays = (days: number, label: string) => {
    const today = new Date();
    today.setDate(today.getDate() + days);
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const yearStr = today.getFullYear();
    setFormData({
      ...formData,
      expiryDate: `${dayStr}/${monthStr}/${yearStr} (Gói ${label})`
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim()) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-900/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header matching Screenshot 3 */}
        <div className="bg-[#5C2018] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/30 text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif leading-tight">
                {isCreating ? 'Cấp Tài Khoản Người Dùng Mới' : 'Chi Tiết & Chỉnh Sửa Tài Khoản'}
              </h2>
              <p className="text-[11px] text-amber-200/80 font-mono">
                {formData.fullName} ({formData.username})
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Status Monitoring Box (Screenshot 3) */}
          {!isCreating && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="text-[11px] uppercase font-bold text-amber-900 flex items-center justify-between">
                <span>⚡ Thông tin giám sát & tình trạng hiện tại</span>
                <span className="font-mono text-stone-500">ID: {formData.id}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-500 block">Đăng nhập lần cuối:</span>
                  <strong className="text-stone-800">{formData.lastLoginTime}</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-500 block">Hạn dùng / Đếm ngược:</span>
                  <strong className="text-amber-800">{getUserExpiryInfo(formData).text}</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-stone-500 block">Máy đã liên kết:</span>
                    <strong className="text-blue-800">{formData.connectedDevices} / {formData.deviceLimit} máy</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Họ và tên người dùng / Chủ thiệp <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Tên đăng nhập / Email <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 bg-stone-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Mật khẩu truy cập <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 bg-stone-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Đơn vị / Địa chỉ công tác
              </label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Ví dụ: Trường Mầm non Tân Thành"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ví dụ: 0912.345.678"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Phân quyền vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold"
              >
                <option value="user">Người dùng (Chủ thiệp / Giáo viên)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Trạng thái tài khoản</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold"
              >
                <option value="active">🟢 Đang hoạt động (Cho phép sử dụng)</option>
                <option value="locked">🔴 Đã khóa (Tạm ngừng truy cập)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Giới hạn số máy liên kết</label>
              <select
                value={formData.deviceLimit}
                onChange={(e) => setFormData({ ...formData, deviceLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
              >
                <option value={1}>1 máy</option>
                <option value={2}>2 máy (Chuẩn)</option>
                <option value={5}>5 máy</option>
                <option value={10}>10 máy (Nâng cao)</option>
              </select>
            </div>
          </div>

          {/* Subscription & Expiry Extension Box (Screenshot 3) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
            <label className="block font-bold text-amber-900 text-xs">
              📅 Ngày Hết Hạn Tài Khoản & Gia Hạn
            </label>

            <input
              type="text"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              placeholder="Ví dụ: 19/11/2027 hoặc Vĩnh viễn"
              className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-amber-900 text-xs"
            />

            <div>
              <span className="text-[11px] font-bold text-stone-600 block mb-1.5">Gia hạn nhanh từ hôm nay:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAddDays(30, '1 Tháng')}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 font-bold text-amber-900 text-[11px] cursor-pointer"
                >
                  +1 Tháng
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddDays(90, '3 Tháng')}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 font-bold text-amber-900 text-[11px] cursor-pointer"
                >
                  +3 Tháng
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddDays(180, '6 Tháng')}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 font-bold text-amber-900 text-[11px] cursor-pointer"
                >
                  +6 Tháng
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddDays(365, '1 Năm')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold shadow-xs text-[11px] cursor-pointer"
                >
                  +1 Năm (Chuẩn)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddDays(730, '2 Năm')}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 font-bold text-amber-900 text-[11px] cursor-pointer"
                >
                  +2 Năm
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddDays(1095, '3 Năm')}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 font-bold text-amber-900 text-[11px] cursor-pointer"
                >
                  +3 Năm
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, expiryDate: 'Thời hạn: Vĩnh viễn' })}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  Vĩnh viễn
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Ghi chú quản trị</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Ghi chú riêng cho Admin..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5C2018] hover:bg-[#481812] text-white font-bold shadow-md cursor-pointer"
            >
              Lưu Tài Khoản & Đồng Bộ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
