export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'locked';

export interface UserAccount {
  id: string;
  username: string; // Tên đăng nhập / Email
  fullName: string;
  email: string;
  phone?: string;
  organization?: string; // Đơn vị công tác / Trường học
  role: UserRole;
  password: string;
  avatarUrl?: string;
  status: UserStatus;
  expiryDate: string; // 'Vĩnh viễn', '19/11/2027', etc.
  deviceLimit: number;
  connectedDevices: number;
  lastLoginTime: string;
  todaySeconds: number;
  todayLogins: number;
  notes?: string;
  createdAt: string;
  updatedAtMs?: number;
}

export interface AuthState {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
}
