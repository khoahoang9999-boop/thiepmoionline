import { UserAccount } from '../types/auth';

const STORAGE_USERS_KEY = 'wedding_auth_users_v3';
const STORAGE_CURRENT_USER_KEY = 'wedding_auth_current_user_v3';

export const DEFAULT_AVATARS = [
  { id: 'quan', name: 'Quản', bg: 'bg-amber-600', icon: '⭐' },
  { id: 'thay', name: 'Thầy', bg: 'bg-emerald-600', icon: '👨‍🏫' },
  { id: 'co', name: 'Cô', bg: 'bg-rose-600', icon: '👩‍🏫' },
  { id: 'chuyen', name: 'Chuyên', bg: 'bg-indigo-600', icon: '🤖' },
  { id: 'mu', name: 'Mũ', bg: 'bg-blue-600', icon: '🎓' },
  { id: 'cu', name: 'Cú', bg: 'bg-amber-700', icon: '🦉' },
  { id: 'ngon', name: 'Ngọn', bg: 'bg-orange-600', icon: '🕯️' },
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_admin_01',
    username: 'admin@123',
    fullName: 'Quản Trị Viên Hệ Thống (Admin)',
    email: 'admin@123',
    phone: '0978468986',
    organization: 'Ban Quản Trị Hệ Thống',
    role: 'admin',
    password: '123456',
    avatarUrl: '/api/media/media_04bbb52038e5c1c2.jpg',
    status: 'active',
    expiryDate: 'Vĩnh viễn',
    deviceLimit: 10,
    connectedDevices: 1,
    lastLoginTime: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
    todaySeconds: 0,
    todayLogins: 1,
    notes: 'Tài khoản Quản trị viên cấp cao duy nhất',
    createdAt: '2026-01-01',
    updatedAtMs: 0
  }
];

export const isImageAvatarUrl = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.startsWith('/') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  );
};

export const formatActiveTime = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return '0 giây';
  if (seconds < 60) return `${seconds} giây`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return secs > 0 ? `${mins} phút ${secs} giây` : `${mins} phút`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours} giờ ${remMins} phút` : `${hours} giờ`;
};

export const getUserExpiryInfo = (user: UserAccount) => {
  if (user.role === 'admin' || user.expiryDate?.toLowerCase().includes('vĩnh viễn')) {
    return {
      text: user.expiryDate || 'Vĩnh viễn',
      isTrial: false,
      isExpired: false,
      badgeColor: 'bg-[#1C3766]/10 text-[#1C3766] border-[#1C3766]/30 font-bold'
    };
  }

  // Check if account has been explicitly extended (+1 Năm, 3 Tháng, 6 Tháng, date like 19/11/2027)
  const expLower = (user.expiryDate || '').toLowerCase();
  const isExplicitlyExtended =
    expLower.includes('năm') ||
    (expLower.includes('tháng') && !expLower.includes('3 ngày')) ||
    (expLower.includes('/') && !expLower.includes('dùng thử') && !expLower.includes('còn 3 ngày'));

  if (isExplicitlyExtended) {
    return {
      text: user.expiryDate,
      isTrial: false,
      isExpired: false,
      badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
    };
  }

  // Trial User (3 days countdown)
  let createdTime = Date.now();
  if (user.createdAt) {
    const parsed = new Date(user.createdAt).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      createdTime = parsed;
    }
  }

  const expiryTimestamp = createdTime + 3 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diffMs = expiryTimestamp - now;
  const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const expDateObj = new Date(expiryTimestamp);
  const expDayStr = String(expDateObj.getDate()).padStart(2, '0');
  const expMonthStr = String(expDateObj.getMonth() + 1).padStart(2, '0');
  const expYearStr = expDateObj.getFullYear();
  const formattedExpDate = `${expDayStr}/${expMonthStr}/${expYearStr}`;

  if (remainingDays <= 0 || diffMs <= 0) {
    return {
      text: `Đã hết 3 ngày dùng thử (Hết hạn: ${formattedExpDate})`,
      isTrial: true,
      isExpired: true,
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
    };
  }

  return {
    text: `Dùng thử: Còn ${remainingDays} ngày (Hết hạn: ${formattedExpDate})`,
    isTrial: true,
    isExpired: false,
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
  };
};

export const isNewActiveTrial = (user: UserAccount): boolean => {
  if (user.role === 'admin') return false;
  const info = getUserExpiryInfo(user);
  return info.isTrial && !info.isExpired;
};

export const sortUsersList = (usersList: UserAccount[]): UserAccount[] => {
  return [...usersList].sort((a, b) => {
    // 1. Admin ALWAYS fixed at top
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    if (a.role === 'admin' && b.role === 'admin') return 0;

    // 2. Newly created trial accounts (under 3 days, active trial) stand right below Admin
    const aNewTrial = isNewActiveTrial(a);
    const bNewTrial = isNewActiveTrial(b);

    if (aNewTrial && !bNewTrial) return -1;
    if (!aNewTrial && bNewTrial) return 1;

    if (aNewTrial && bNewTrial) {
      // Both are new trial users: newest created comes first
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    }

    // 3. Extended accounts OR expired accounts sorted alphabetically A-Z by Full Name (vần Anpha B)
    const nameA = (a.fullName || '').trim();
    const nameB = (b.fullName || '').trim();
    return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
  });
};

export const mergeUsersByTimestamp = (
  baseList: UserAccount[],
  incomingList: UserAccount[]
): UserAccount[] => {
  const byKey = new Map<string, UserAccount>();

  (Array.isArray(baseList) ? baseList : []).forEach((u) => {
    if (u && u.username) {
      byKey.set(u.username.toLowerCase().trim(), {
        ...u,
        updatedAtMs: typeof u.updatedAtMs === 'number' ? u.updatedAtMs : 0
      });
    }
  });

  (Array.isArray(incomingList) ? incomingList : []).forEach((inc) => {
    if (!inc || !inc.username) return;
    const key = inc.username.toLowerCase().trim();
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, {
        ...inc,
        updatedAtMs: typeof inc.updatedAtMs === 'number' ? inc.updatedAtMs : 0
      });
      return;
    }

    const prevTime = Number(prev.updatedAtMs) || 0;
    const incTime = Number(inc.updatedAtMs) || 0;

    // Favor incoming if timestamp is greater/equal, or if incoming has an avatar set while prev was missing one
    if (incTime >= prevTime || (!prev.avatarUrl && inc.avatarUrl)) {
      byKey.set(key, {
        ...prev,
        ...inc,
        avatarUrl: inc.avatarUrl || prev.avatarUrl,
        todaySeconds: Math.max(Number(inc.todaySeconds) || 0, Number(prev.todaySeconds) || 0),
        todayLogins: Math.max(Number(inc.todayLogins) || 0, Number(prev.todayLogins) || 0),
        updatedAtMs: Math.max(incTime, prevTime)
      });
    } else {
      byKey.set(key, {
        ...inc,
        ...prev,
        avatarUrl: prev.avatarUrl || inc.avatarUrl,
        todaySeconds: Math.max(Number(inc.todaySeconds) || 0, Number(prev.todaySeconds) || 0),
        todayLogins: Math.max(Number(inc.todayLogins) || 0, Number(prev.todayLogins) || 0),
        updatedAtMs: prevTime
      });
    }
  });

  return sortUsersList(Array.from(byKey.values()));
};

export const getStoredUsers = (): UserAccount[] => {
  let localUsers: UserAccount[] = INITIAL_USERS;
  try {
    const keysToTry = [STORAGE_USERS_KEY, 'wedding_auth_users_v2', 'wedding_auth_users_v1'];
    for (const key of keysToTry) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(
            (u: UserAccount) =>
              u &&
              u.id &&
              !u.id.includes('1792207850563') &&
              !u.id.includes('1792207850564') &&
              !u.id.includes('1792207850565') &&
              !u.id.includes('1792207850566')
          );
          if (clean.length > 0) {
            localUsers = clean;
            break;
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // Merge with server-injected bootstrap users if present on window.__INITIAL_WEDDING_STATE__
  let merged = mergeUsersByTimestamp(INITIAL_USERS, localUsers);
  merged = merged.map((u) => {
    if (u.role === 'admin' && (!u.avatarUrl || u.avatarUrl.includes('_16F35F95') || !u.avatarUrl.trim())) {
      return { ...u, avatarUrl: '/api/media/media_04bbb52038e5c1c2.jpg' };
    }
    return u;
  });
  try {
    if (typeof window !== 'undefined') {
      const bootstrapUsers = (window as any).__INITIAL_WEDDING_STATE__?.users;
      if (Array.isArray(bootstrapUsers) && bootstrapUsers.length > 0) {
        // Local user updates must take priority over stale bootstrap users
        merged = mergeUsersByTimestamp(bootstrapUsers, merged);
      }
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }

  return merged;
};

export const saveStoredUsers = (
  users: UserAccount[],
  options?: { syncToServer?: boolean; replaceAll?: boolean }
) => {
  try {
    const sorted = sortUsersList(users);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(sorted));
    if (typeof window !== 'undefined' && (window as any).__INITIAL_WEDDING_STATE__) {
      (window as any).__INITIAL_WEDDING_STATE__.users = sorted;
    }

    // Keep current user in localStorage in sync if they are in the updated list
    const curr = getCurrentUser();
    if (curr) {
      const match = sorted.find(
        (u) => u.id === curr.id || u.username.toLowerCase() === curr.username.toLowerCase()
      );
      if (match) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(match));
      }
    }

    if (options?.syncToServer !== false && typeof window !== 'undefined') {
      fetch('/api/sync-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: sorted,
          replaceUsers: Boolean(options?.replaceAll)
        })
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          if (res?.users && Array.isArray(res.users) && res.users.length > 0) {
            const reconciled = options?.replaceAll
              ? sortUsersList(res.users)
              : mergeUsersByTimestamp(sorted, res.users);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(reconciled));
            if (typeof window !== 'undefined' && (window as any).__INITIAL_WEDDING_STATE__) {
              (window as any).__INITIAL_WEDDING_STATE__.users = reconciled;
            }
            const activeUser = getCurrentUser();
            if (activeUser) {
              const freshActive = reconciled.find(
                (u) => u.id === activeUser.id || u.username.toLowerCase() === activeUser.username.toLowerCase()
              );
              if (freshActive) {
                localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(freshActive));
              }
            }
          }
        })
        .catch(() => {
          // ignore network error
        });
    }
  } catch (e) {}
};

export const syncUsersFromServer = async (): Promise<UserAccount[]> => {
  try {
    const res = await fetch('/api/sync-account');
    if (res.ok) {
      const json = await res.json();
      if (json?.users && Array.isArray(json.users) && json.users.length > 0) {
        const currentLocal = getStoredUsers();
        const merged = mergeUsersByTimestamp(currentLocal, json.users);
        saveStoredUsers(merged, { syncToServer: false });
        if (typeof window !== 'undefined' && (window as any).__INITIAL_WEDDING_STATE__) {
          (window as any).__INITIAL_WEDDING_STATE__.users = merged;
        }
        const active = getCurrentUser();
        if (active) {
          const fresh = merged.find(
            (u) => u.id === active.id || u.username.toLowerCase() === active.username.toLowerCase()
          );
          if (fresh) {
            setCurrentUserStore(fresh);
          }
        }
        return merged;
      }
    }
  } catch {
    // ignore
  }
  return getStoredUsers();
};

export const getCurrentUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) {
      const parsed: UserAccount = JSON.parse(raw);
      if (parsed && parsed.username) {
        const allUsers = getStoredUsers();
        const latest = allUsers.find(
          (u) => u.id === parsed.id || u.username.toLowerCase() === parsed.username.toLowerCase()
        );
        if (latest) {
          const parsedMs = Number(parsed.updatedAtMs) || 0;
          const latestMs = Number(latest.updatedAtMs) || 0;
          if (latestMs >= parsedMs || (!parsed.avatarUrl && latest.avatarUrl)) {
            localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(latest));
            return latest;
          }
        }
      }
      if (parsed && parsed.role === 'admin' && (!parsed.avatarUrl || parsed.avatarUrl.includes('_16F35F95') || !parsed.avatarUrl.trim())) {
        parsed.avatarUrl = '/api/media/media_04bbb52038e5c1c2.jpg';
        try {
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(parsed));
        } catch {}
      }
      return parsed;
    }
  } catch (e) {}
  return null;
};

export const setCurrentUserStore = (user: UserAccount | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (e) {}
};

