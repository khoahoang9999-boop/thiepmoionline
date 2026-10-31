import { WeddingData, SideType } from '../types/wedding';

/**
 * Formats a Date in Vietnam Time (GMT+7 / Asia/Ho_Chi_Minh) consistently across browser and server.
 */
export function formatVietnamDateTime(date: Date = new Date()): string {
  try {
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return date.toLocaleString('vi-VN');
  }
}

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || '';
  return res.ok && ct.includes('application/json');
}

/**
 * Strips any foreign origin (like private ais-dev URLs or localhost) from built-in /assets/aistudio/,
 * /assets/uploaded/, and /api/media/ paths, and upgrades legacy/fallback media references
 * to the authentic high-resolution uploaded media files.
 */
export const normalizeRelativeAssetUrl = (
  url?: string,
  role?: 'groom' | 'bride' | 'hero' | 'share' | 'gallery' | 'cover'
): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Remap legacy compressed or fallback-polluted filenames to the user's authentic original photos
  if (
    trimmed.includes('media_04bbb52038e5c1c2') ||
    trimmed.includes('media_c7b988f8be4c7ba7') ||
    trimmed.includes('_CC60AD8D-EF13-4091-84E3-561D49B71097__bc480265')
  ) {
    return '/api/media/media_385d6b17539c87cc.jpg';
  }
  if (
    trimmed.includes('media_fc522fec3928155b') ||
    trimmed.includes('media_90634f1608443007') ||
    trimmed.includes('image_5d019752')
  ) {
    return '/api/media/media_debf66392f8c9341.jpg';
  }
  if (trimmed.includes('media_f537bb51898bd9a8')) {
    return '/api/media/media_cca42efe1813d7a6.jpg';
  }
  if (trimmed.includes('media_0d887f85423e6db0')) {
    return '/api/media/media_48034d471b1e1c49.jpg';
  }
  if (
    trimmed.includes('41128b8c5bb3dbed82a2_21c0b90d') ||
    trimmed.includes('media_c11f2880eddc4004')
  ) {
    return role === 'hero'
      ? '/api/media/media_cca42efe1813d7a6.jpg'
      : '/api/media/media_48034d471b1e1c49.jpg';
  }
  if (trimmed.includes('image_f8b3147c') || trimmed.includes('media_842469830e756731')) {
    return '/api/media/media_cca42efe1813d7a6.jpg';
  }

  const assetsIdx = trimmed.indexOf('/assets/aistudio/');
  if (assetsIdx !== -1) {
    return trimmed.slice(assetsIdx);
  }
  const uploadedIdx = trimmed.indexOf('/assets/uploaded/');
  if (uploadedIdx !== -1) {
    return trimmed.slice(uploadedIdx);
  }
  const mediaIdx = trimmed.indexOf('/api/media/');
  if (mediaIdx !== -1) {
    return trimmed.slice(mediaIdx);
  }
  return trimmed;
};

export const toAbsoluteUrl = (url?: string, origin?: string): string => {
  if (!url) return '';
  const normalized = normalizeRelativeAssetUrl(url);
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized;
  }
  const base =
    origin || (typeof window !== 'undefined' ? window.location.origin : 'https://thiepmoionline.khoahoang9999.workers.dev');
  return `${base.replace(/\/$/, '')}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
};

/**
 * Compresses an uploaded image file on an HTML5 Canvas (max 1400px, quality 0.88)
 * and uploads it to /api/upload-media to get a short relative URL (/api/media/...)
 * that works across mobile devices and OpenGraph crawlers (Zalo/Facebook/iMessage).
 */
export async function compressAndUploadImage(
  file: File,
  maxDimension = 1400,
  quality = 0.88
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawResult = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = maxDimension;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawResult);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(rawResult);
        }
      };
      img.onerror = () => resolve(rawResult);
      img.src = rawResult;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch('/api/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl })
    });
    if (isJsonResponse(res)) {
      const json = await res.json();
      if (json && json.url) {
        return json.url;
      }
    }
  } catch {
    // Fallback to compressed dataUrl if server endpoint is unreachable
  }

  return dataUrl;
}

/**
 * IndexedDB storage helper so large WeddingData / multi-project backups never fail on localStorage's 5MB limit.
 */
const IDB_NAME = 'WeddingStudioDB_v1';
const IDB_STORE = 'wedding_state';

function openWeddingIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveStateToIndexedDB(key: string, value: any): Promise<void> {
  const db = await openWeddingIDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadStateFromIndexedDB<T = any>(key: string): Promise<T | null> {
  const db = await openWeddingIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Syncs the current WeddingData ("Lưu thông tin thiệp") to the backend server
 * so short links (/nha-trai, /nha-gai, /i/:slug) and logged-in accounts immediately serve
 * the latest data, photos, avatar adjustments, audio, templates, and auto-motion settings.
 */
export async function syncWeddingDataToServer(
  data: WeddingData,
  options?: {
    username?: string;
    projects?: any[];
    activeProjectId?: string;
    replaceProjects?: boolean;
  }
): Promise<WeddingData | null> {
  try {
    const res = await fetch('/api/wedding-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        username: options?.username,
        projects: options?.projects,
        activeProjectId: options?.activeProjectId,
        replaceProjects: options?.replaceProjects
      })
    });
    if (isJsonResponse(res)) {
      const json = await res.json();
      if (json && json.data) {
        if (typeof window !== 'undefined' && (window as any).__INITIAL_WEDDING_STATE__) {
          (window as any).__INITIAL_WEDDING_STATE__.data = json.data;
        }
        return json.data as WeddingData;
      }
    }
  } catch {
    // Ignore network error on static-only hosts
  }
  return null;
}

export interface PublishCardResponse {
  ok: boolean;
  data: WeddingData;
  publishedAt: string;
  publishedVersion: number;
  groomPath: string;
  bridePath: string;
}

/**
 * Publishes & synchronizes the WeddingData ("Chế độ Xuất thiệp") to the backend server,
 * converting all images & audio to permanent media endpoints and guaranteeing 100% synchronization
 * across all mobile phones and computers when copying Link Nhà Trai or Link Nhà Gái.
 */
export async function publishWeddingCardToServer(
  data: WeddingData,
  options?: {
    username?: string;
    projects?: any[];
    activeProjectId?: string;
  }
): Promise<PublishCardResponse | null> {
  try {
    const res = await fetch('/api/publish-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        username: options?.username,
        projects: options?.projects,
        activeProjectId: options?.activeProjectId
      })
    });
    if (isJsonResponse(res)) {
      const json = await res.json();
      if (json && json.ok && json.data) {
        if (typeof window !== 'undefined' && (window as any).__INITIAL_WEDDING_STATE__) {
          (window as any).__INITIAL_WEDDING_STATE__.data = json.data;
        }
        return json as PublishCardResponse;
      }
    }
  } catch {
    // Fallback if offline
  }
  return null;
}

/**
 * Synchronizes user accounts and multi-card projects with the server so logging in on any phone
 * or computer restores all saved & published cards, images, audio, and auto-motion settings.
 */
export async function syncAccountWithServer(payload: {
  username?: string;
  projects?: any[];
  activeProjectId?: string;
  users?: any[];
  forceSync?: boolean;
  replaceProjects?: boolean;
}): Promise<any> {
  try {
    const res = await fetch('/api/sync-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (isJsonResponse(res)) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return null;
}

export async function fetchAccountBackupFromServer(username?: string): Promise<{
  ok: boolean;
  users?: any[];
  accountBackup?: { projects: any[]; activeProjectId: string; updatedAt: string; updatedAtMs?: number } | null;
  defaultData?: WeddingData;
} | null> {
  try {
    const query = username ? `?username=${encodeURIComponent(username)}` : '';
    const res = await fetch(`/api/sync-account${query}`, { cache: 'no-store' });
    if (isJsonResponse(res)) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Legacy decoder for old links that still have ?d=...
 */
export function decodeWeddingDataFromParam(encoded: string): Partial<WeddingData> | null {
  if (!encoded || !encoded.trim()) return null;
  try {
    let base64 = encoded.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object') {
      return parsed as Partial<WeddingData>;
    }
    return null;
  } catch (e) {
    console.error('Failed to decode wedding data param', e);
    return null;
  }
}

/**
 * Builds a clean, short shareable URL for Nhà Trai (/nha-trai or /i/:slug)
 * or Nhà Gái (/nha-gai or /i/:slug) that works with Zalo / Facebook / iMessage OpenGraph previews.
 */
export function buildShareableSideUrl(
  baseOrigin: string,
  side: SideType,
  data: WeddingData,
  options?: {
    guestName?: string;
    includeEncodedData?: boolean;
    useQuerySide?: boolean;
    forceVersion?: number | string;
  }
): string {
  const cleanOrigin = baseOrigin.replace(/\/$/, '');

  const customSlugGroom = data.customSlugGroom?.trim();
  const customSlugBride = data.customSlugBride?.trim();
  const path = side === 'groom'
    ? (customSlugGroom ? `/i/${customSlugGroom.replace(/^\/+|\/+$/g, '')}` : '/nha-trai')
    : (customSlugBride ? `/i/${customSlugBride.replace(/^\/+|\/+$/g, '')}` : '/nha-gai');

  const params = new URLSearchParams();
  params.set('side', side);

  const version =
    options?.forceVersion ??
    data.publishedVersion ??
    (data.updatedAtMs ? Math.floor(data.updatedAtMs / 1000) : 1);

  params.set('v', String(version));

  if (options?.guestName && options.guestName.trim()) {
    params.set('to', options.guestName.trim());
  }

  const queryString = params.toString();
  return `${cleanOrigin}${path}?${queryString}`;
}

async function urlToDataUrl(
  url?: string,
  role?: 'groom' | 'bride' | 'hero' | 'share' | 'gallery' | 'cover'
): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  try {
    const fetchUrl = normalizeRelativeAssetUrl(url, role);
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    if (!res.ok) return fetchUrl;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : fetchUrl);
      reader.onerror = () => resolve(fetchUrl);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export async function embedMediaAsDataUrls(data: WeddingData): Promise<WeddingData> {
  const [
    coverBackgroundUrl,
    groomAvatarUrl,
    brideAvatarUrl,
    heroPhotoUrl,
    shareCoverPhotoUrl,
    groomShareCover,
    brideShareCover,
    customAudioUrl,
    galleryPhotos
  ] = await Promise.all([
    urlToDataUrl(data.coverBackgroundUrl, 'cover'),
    urlToDataUrl(data.groomAvatarUrl, 'groom'),
    urlToDataUrl(data.brideAvatarUrl, 'bride'),
    urlToDataUrl(data.heroPhotoUrl, 'hero'),
    urlToDataUrl(data.shareCoverPhotoUrl, 'share'),
    urlToDataUrl(data.shareGroom?.coverPhotoUrl, 'share'),
    urlToDataUrl(data.shareBride?.coverPhotoUrl, 'share'),
    data.customAudioUrl ? urlToDataUrl(data.customAudioUrl) : Promise.resolve(undefined),
    Promise.all((data.galleryPhotos || []).map((u) => urlToDataUrl(u, 'gallery')))
  ]);

  return {
    ...data,
    coverBackgroundUrl: coverBackgroundUrl || data.coverBackgroundUrl,
    groomAvatarUrl: groomAvatarUrl || data.groomAvatarUrl,
    brideAvatarUrl: brideAvatarUrl || data.brideAvatarUrl,
    heroPhotoUrl: heroPhotoUrl || data.heroPhotoUrl,
    shareCoverPhotoUrl: shareCoverPhotoUrl || data.shareCoverPhotoUrl,
    galleryPhotos,
    customAudioUrl: customAudioUrl || data.customAudioUrl,
    shareGroom: data.shareGroom
      ? {
          ...data.shareGroom,
          coverPhotoUrl: groomShareCover || data.shareGroom.coverPhotoUrl
        }
      : data.shareGroom,
    shareBride: data.shareBride
      ? {
          ...data.shareBride,
          coverPhotoUrl: brideShareCover || data.shareBride.coverPhotoUrl
        }
      : data.shareBride
  };
}

export async function exportWeddingJsonWithEmbeddedImages(
  payload: any,
  filename: string
): Promise<void> {
  const nowStr = formatVietnamDateTime();
  const nowMs = Date.now();
  let finalPayload = payload;
  try {
    if (payload && typeof payload === 'object') {
      if (payload.data && typeof payload.data === 'object') {
        const embeddedData = await embedMediaAsDataUrls({
          ...(payload.data as WeddingData),
          lastSavedAt: nowStr,
          updatedAtMs: nowMs
        });
        finalPayload = {
          ...payload,
          updatedAt: nowStr,
          exportedAt: nowStr,
          data: embeddedData
        };
      } else if (payload.groomName !== undefined || payload.brideName !== undefined) {
        const embeddedData = await embedMediaAsDataUrls({
          ...(payload as WeddingData),
          lastSavedAt: nowStr,
          updatedAtMs: nowMs
        });
        finalPayload = {
          ...embeddedData,
          lastSavedAt: nowStr,
          updatedAtMs: nowMs
        };
      }
    }
  } catch {
    // Fallback to raw payload if embedding fails
  }

  const blob = new Blob([JSON.stringify(finalPayload, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function uploadSingleDataUrlIfNeeded(
  url?: string,
  role?: 'groom' | 'bride' | 'hero' | 'share' | 'gallery' | 'cover'
): Promise<string> {
  if (!url) return '';
  if (!url.startsWith('data:')) {
    return normalizeRelativeAssetUrl(url, role);
  }
  try {
    const res = await fetch('/api/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: url, role })
    });
    if (isJsonResponse(res)) {
      const json = await res.json();
      if (json && json.url) {
        return normalizeRelativeAssetUrl(json.url, role);
      }
    }
  } catch {
    // keep dataUrl if offline
  }
  return url;
}

export async function uploadEmbeddedDataUrlsInWeddingData(data: WeddingData): Promise<WeddingData> {
  const [
    coverBackgroundUrl,
    groomAvatarUrl,
    brideAvatarUrl,
    heroPhotoUrl,
    shareCoverPhotoUrl,
    groomShareCover,
    brideShareCover,
    customAudioUrl,
    galleryPhotos
  ] = await Promise.all([
    uploadSingleDataUrlIfNeeded(data.coverBackgroundUrl, 'cover'),
    uploadSingleDataUrlIfNeeded(data.groomAvatarUrl, 'groom'),
    uploadSingleDataUrlIfNeeded(data.brideAvatarUrl, 'bride'),
    uploadSingleDataUrlIfNeeded(data.heroPhotoUrl, 'hero'),
    uploadSingleDataUrlIfNeeded(data.shareCoverPhotoUrl, 'share'),
    uploadSingleDataUrlIfNeeded(data.shareGroom?.coverPhotoUrl, 'share'),
    uploadSingleDataUrlIfNeeded(data.shareBride?.coverPhotoUrl, 'share'),
    data.customAudioUrl ? uploadSingleDataUrlIfNeeded(data.customAudioUrl) : Promise.resolve(undefined),
    Promise.all((data.galleryPhotos || []).map((u) => uploadSingleDataUrlIfNeeded(u, 'gallery')))
  ]);

  return {
    ...data,
    coverBackgroundUrl: coverBackgroundUrl || data.coverBackgroundUrl,
    groomAvatarUrl: groomAvatarUrl || data.groomAvatarUrl,
    brideAvatarUrl: brideAvatarUrl || data.brideAvatarUrl,
    heroPhotoUrl: heroPhotoUrl || data.heroPhotoUrl,
    shareCoverPhotoUrl: shareCoverPhotoUrl || data.shareCoverPhotoUrl,
    galleryPhotos: galleryPhotos.filter(Boolean),
    customAudioUrl: customAudioUrl || data.customAudioUrl,
    shareGroom: data.shareGroom
      ? {
          ...data.shareGroom,
          coverPhotoUrl: groomShareCover || data.shareGroom.coverPhotoUrl
        }
      : data.shareGroom,
    shareBride: data.shareBride
      ? {
          ...data.shareBride,
          coverPhotoUrl: brideShareCover || data.shareBride.coverPhotoUrl
        }
      : data.shareBride
  };
}
