import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DEFAULT_WEDDING_DATA } from './src/data/weddingDefault';
import { WeddingData, SideType, getPartyTypeLabel } from './src/types/wedding';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '.data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const PUBLIC_MEDIA_DIR = path.resolve(__dirname, 'public', 'assets', 'uploaded');
const PUBLIC_API_MEDIA_DIR = path.resolve(__dirname, 'public', 'api', 'media');
const STORE_FILE = path.join(DATA_DIR, 'wedding-store.json');
const TRACKED_STORE_FILE = path.resolve(__dirname, 'src', 'data', 'server-store.json');

fs.mkdirSync(MEDIA_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_MEDIA_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_API_MEDIA_DIR, { recursive: true });

function formatVietnamDateTime(date: Date = new Date()): string {
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

/**
 * Ensures the original high-resolution couple photos from Paste_October_30__2026_-_1_46AM_e53a9960
 * are extracted into public/assets/uploaded, public/api/media, and .data/media on any fresh server start.
 */
function ensureOriginalCoupleMediaExtracted() {
  try {
    const requiredFile = path.join(PUBLIC_API_MEDIA_DIR, 'media_385d6b17539c87cc.jpg');
    if (fs.existsSync(requiredFile)) return;

    const pastePath = path.resolve(__dirname, 'public', 'assets', 'aistudio', 'Paste_October_30__2026_-_1_46AM_e53a9960');
    if (!fs.existsSync(pastePath)) return;

    const raw = fs.readFileSync(pastePath, 'utf-8').trim();
    const urlObj = new URL(raw);
    const d = urlObj.searchParams.get('d');
    if (!d) return;

    let b64 = d.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const parsed = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));

    const writeAllDirs = (dataUrl: string | undefined, filenames: string[]) => {
      if (!dataUrl || !dataUrl.includes(',')) return;
      const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
      for (const dir of [PUBLIC_MEDIA_DIR, PUBLIC_API_MEDIA_DIR, MEDIA_DIR]) {
        for (const name of filenames) {
          const target = path.join(dir, name);
          if (!fs.existsSync(target)) {
            fs.writeFileSync(target, buf);
          }
        }
      }
    };

    writeAllDirs(parsed.groomAvatarUrl, ['media_385d6b17539c87cc.jpg', 'media_04bbb52038e5c1c2.jpg']);
    writeAllDirs(parsed.brideAvatarUrl, ['media_debf66392f8c9341.jpg', 'media_fc522fec3928155b.jpg']);
    writeAllDirs(parsed.heroPhotoUrl, ['media_cca42efe1813d7a6.jpg', 'media_f537bb51898bd9a8.jpg']);
    if (Array.isArray(parsed.galleryPhotos) && parsed.galleryPhotos[0]) {
      writeAllDirs(parsed.galleryPhotos[0], ['media_48034d471b1e1c49.jpg', 'media_0d887f85423e6db0.jpg']);
    }
  } catch (e) {
    console.error('Failed to extract original couple media:', e);
  }
}

ensureOriginalCoupleMediaExtracted();

interface AccountBackup {
  projects: any[];
  activeProjectId: string;
  updatedAt: string;
  updatedAtMs?: number;
}

interface StoredState {
  defaultData: WeddingData;
  bySlug: Record<string, { side: SideType; data: WeddingData; publishedAt?: string; ownerUsername?: string }>;
  byAccount: Record<string, AccountBackup>;
  users: any[];
}

/**
 * Saves a data:image/... or data:audio/... string to disk in both public/assets/uploaded and .data/media
 * and returns a short relative path /api/media/...
 */
function persistDataUrlToMedia(
  dataUrl: string,
  role?: 'groom' | 'bride' | 'hero' | 'share' | 'gallery' | 'cover'
): string {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  try {
    const match = dataUrl.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
    if (!match) return dataUrl;
    const mimeType = match[1].toLowerCase();
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 16);

    // If an imported JSON contained one of the old fallback placeholder images, map it back to the authentic photo
    if (hash === 'c7b988f8be4c7ba7' || hash === '04bbb52038e5c1c2') {
      return '/api/media/media_385d6b17539c87cc.jpg';
    }
    if (hash === '90634f1608443007' || hash === 'fc522fec3928155b') {
      return '/api/media/media_debf66392f8c9341.jpg';
    }
    if (hash === 'f537bb51898bd9a8' || hash === '842469830e756731') {
      return '/api/media/media_cca42efe1813d7a6.jpg';
    }
    if (hash === '0d887f85423e6db0') {
      return '/api/media/media_48034d471b1e1c49.jpg';
    }
    if (hash === 'c11f2880eddc4004') {
      return role === 'hero'
        ? '/api/media/media_cca42efe1813d7a6.jpg'
        : '/api/media/media_48034d471b1e1c49.jpg';
    }

    let ext = 'bin';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) ext = 'mp3';
    else if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'm4a';
    else if (mimeType.includes('ogg')) ext = 'ogg';

    const filename = `media_${hash}.${ext}`;
    for (const dir of [PUBLIC_API_MEDIA_DIR, PUBLIC_MEDIA_DIR, MEDIA_DIR]) {
      try {
        const p = path.join(dir, filename);
        if (!fs.existsSync(p)) {
          fs.writeFileSync(p, buffer);
        }
      } catch (err) {
        console.error(`Error saving media to ${dir}:`, err);
      }
    }
    return `/api/media/${filename}`;
  } catch (e) {
    console.error('Failed to persist data URL:', e);
    return dataUrl;
  }
}

function normalizeUrlToRelative(
  url?: string,
  role?: 'groom' | 'bride' | 'hero' | 'share' | 'gallery' | 'cover'
): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) {
    return persistDataUrlToMedia(trimmed, role);
  }

  // Upgrade legacy or fallback-polluted image paths to the authentic high-resolution photos
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
}

function sanitizeUserAccount(u: any): any {
  if (!u || typeof u !== 'object') return u;
  const rawAvatar = typeof u.avatarUrl === 'string' ? u.avatarUrl : '';
  const cleanAvatar =
    rawAvatar.startsWith('data:') || rawAvatar.includes('/assets/aistudio/') || rawAvatar.includes('/api/media/')
      ? normalizeUrlToRelative(rawAvatar)
      : rawAvatar;
  return {
    ...u,
    avatarUrl: cleanAvatar,
    updatedAtMs: typeof u.updatedAtMs === 'number' ? u.updatedAtMs : 0
  };
}

function mergeUsersOnServer(existingUsers: any[], incomingUsers: any[], replaceAll?: boolean): any[] {
  const sanitizedIncoming = (Array.isArray(incomingUsers) ? incomingUsers : [])
    .filter((u) => u && typeof u.username === 'string')
    .map(sanitizeUserAccount);

  if (replaceAll) {
    return sanitizedIncoming;
  }

  const byKey = new Map<string, any>();
  (Array.isArray(existingUsers) ? existingUsers : []).forEach((u) => {
    if (u && typeof u.username === 'string') {
      byKey.set(u.username.toLowerCase().trim(), sanitizeUserAccount(u));
    }
  });

  sanitizedIncoming.forEach((inc) => {
    const key = inc.username.toLowerCase().trim();
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, inc);
      return;
    }
    const prevTime = Number(prev.updatedAtMs) || 0;
    const incTime = Number(inc.updatedAtMs) || 0;
    if (incTime >= prevTime) {
      byKey.set(key, {
        ...prev,
        ...inc,
        todaySeconds: Math.max(Number(inc.todaySeconds) || 0, Number(prev.todaySeconds) || 0),
        todayLogins: Math.max(Number(inc.todayLogins) || 0, Number(prev.todayLogins) || 0),
        updatedAtMs: incTime
      });
    } else {
      byKey.set(key, {
        ...inc,
        ...prev,
        todaySeconds: Math.max(Number(inc.todaySeconds) || 0, Number(prev.todaySeconds) || 0),
        todayLogins: Math.max(Number(inc.todayLogins) || 0, Number(prev.todayLogins) || 0),
        updatedAtMs: prevTime
      });
    }
  });

  return Array.from(byKey.values());
}

function sanitizeWeddingDataMedia(data: WeddingData): WeddingData {
  const rawGroomShare = data.shareGroom || DEFAULT_WEDDING_DATA.shareGroom!;
  const rawBrideShare = data.shareBride || DEFAULT_WEDDING_DATA.shareBride!;

  const shareCover = normalizeUrlToRelative(
    data.shareCoverPhotoUrl || DEFAULT_WEDDING_DATA.shareCoverPhotoUrl,
    'share'
  );

  const groomPos = data.groomAvatarPosition || DEFAULT_WEDDING_DATA.groomAvatarPosition;
  const bridePos = data.brideAvatarPosition || DEFAULT_WEDDING_DATA.brideAvatarPosition;

  const rawGallery =
    Array.isArray(data.galleryPhotos) && data.galleryPhotos.length > 0
      ? data.galleryPhotos.map((u) => normalizeUrlToRelative(u, 'gallery')).filter(Boolean)
      : DEFAULT_WEDDING_DATA.galleryPhotos;

  // Deduplicate gallery if fallback upgrade mapped multiple old photos to the same URL
  const dedupedGallery = Array.from(new Set(rawGallery));
  if (dedupedGallery.length === 1 && dedupedGallery[0] === '/api/media/media_48034d471b1e1c49.jpg') {
    dedupedGallery.push('/api/media/media_cca42efe1813d7a6.jpg');
  }

  const bParty = data.partyBride || DEFAULT_WEDDING_DATA.partyBride;
  const bDate = formatSolarDateVN(bParty.date) || '22/11/2026';
  const bTime = (bParty.time === '22:00' ? '10:00' : bParty.time) || '10:00';
  const bVenue = bParty.venueAddress || 'Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang';
  const bShort = data.brideShortName || data.brideName || 'Minh Tuệ';
  const gShort = data.groomShortName || data.groomName || 'Quang Hưng';
  const bType = getPartyTypeLabel(bParty);

  const gParty = data.partyGroom || DEFAULT_WEDDING_DATA.partyGroom;
  const gDate = formatSolarDateVN(gParty.date) || '29/11/2026';
  const gTime = gParty.time || '16:00';
  const gVenue = gParty.venueAddress || 'Số nhà 10, Đường số 4, thôn Đằng Xá, xã Hoằng Hóa, tỉnh Thanh Hóa';
  const gType = getPartyTypeLabel(gParty);

  const fullGroomDesc = `Kính mời quý khách tới dự ${gType.labelLower} của ${gShort} & ${bShort} vào lúc ${gTime} ngày ${gDate} tại ${gVenue}`;
  const fullBrideDesc = `Kính mời quý khách tới dự ${bType.labelLower} của ${bShort} & ${gShort} vào lúc ${bTime} ngày ${bDate} tại ${bVenue}`;

  const rawGDesc = (rawGroomShare.description || '').trim();
  const resolvedGroomDesc =
    !rawGDesc || (!rawGDesc.includes('vào lúc') && !rawGDesc.includes('tại'))
      ? fullGroomDesc
      : rawGDesc.replace(/tiệc hỷ/gi, gType.labelLower);

  const rawBDesc = (rawBrideShare.description || '').trim();
  const resolvedBrideDesc =
    !rawBDesc || (!rawBDesc.includes('vào lúc') && !rawBDesc.includes('tại'))
      ? fullBrideDesc
      : rawBDesc.replace(/tiệc hỷ/gi, bType.labelLower);

  const rawGTitle = (rawGroomShare.title || '').trim();
  const resolvedGroomTitle =
    !rawGTitle || rawGTitle === 'Thiệp Mời Tiệc Hỷ - Quang Hưng & Minh Tuệ'
      ? `Thiệp Mời ${gType.labelCap} - ${gShort} & ${bShort}`
      : rawGTitle;

  const rawBTitle = (rawBrideShare.title || '').trim();
  const resolvedBrideTitle =
    !rawBTitle ||
    rawBTitle === 'Thiệp Mời Tiệc Hỷ - Minh Tuệ & Quang Hưng' ||
    rawBTitle === 'Thiệp Mời Tiệc Báo Hỷ - Minh Tuệ & Quang Hưn'
      ? `Thiệp Mời ${bType.labelCap} - ${bShort} & ${gShort}`
      : rawBTitle;

  const next: WeddingData = {
    ...DEFAULT_WEDDING_DATA,
    ...data,
    customSlugGroom:
      !data.customSlugGroom || data.customSlugGroom === 'quanghungminhtue'
        ? 'quanghung-minhtue'
        : data.customSlugGroom,
    customSlugBride:
      !data.customSlugBride || data.customSlugBride === 'minhtuequanghung'
        ? 'minhtue-quanghung'
        : data.customSlugBride,
    coverBackgroundUrl: normalizeUrlToRelative(
      data.coverBackgroundUrl || DEFAULT_WEDDING_DATA.coverBackgroundUrl,
      'cover'
    ),
    groomAvatarUrl:
      typeof data.groomAvatarUrl === 'string' && data.groomAvatarUrl.trim() !== ''
        ? normalizeUrlToRelative(data.groomAvatarUrl, 'groom')
        : data.groomAvatarUrl === ''
        ? ''
        : normalizeUrlToRelative(DEFAULT_WEDDING_DATA.groomAvatarUrl, 'groom'),
    brideAvatarUrl:
      typeof data.brideAvatarUrl === 'string' && data.brideAvatarUrl.trim() !== ''
        ? normalizeUrlToRelative(data.brideAvatarUrl, 'bride')
        : data.brideAvatarUrl === ''
        ? ''
        : normalizeUrlToRelative(DEFAULT_WEDDING_DATA.brideAvatarUrl, 'bride'),
    heroPhotoUrl:
      typeof data.heroPhotoUrl === 'string' && data.heroPhotoUrl.trim() !== ''
        ? normalizeUrlToRelative(data.heroPhotoUrl, 'hero')
        : data.heroPhotoUrl === ''
        ? ''
        : normalizeUrlToRelative(DEFAULT_WEDDING_DATA.heroPhotoUrl, 'hero'),
    shareCoverPhotoUrl: shareCover,
    galleryPhotos: dedupedGallery,
    customAudioUrl: data.customAudioUrl ? normalizeUrlToRelative(data.customAudioUrl) : undefined,
    groomAvatarPosition: groomPos,
    brideAvatarPosition: bridePos,
    groomAvatarPositionGroom: data.groomAvatarPositionGroom || groomPos,
    brideAvatarPositionGroom: data.brideAvatarPositionGroom || bridePos,
    groomAvatarPositionBride: data.groomAvatarPositionBride || groomPos,
    brideAvatarPositionBride: data.brideAvatarPositionBride || bridePos,
    heroPhotoPosition: data.heroPhotoPosition || DEFAULT_WEDDING_DATA.heroPhotoPosition,
    shareCoverPosition: data.shareCoverPosition || DEFAULT_WEDDING_DATA.shareCoverPosition,
    autoScroll: data.autoScroll !== undefined ? data.autoScroll : true,
    autoPlayMusic: data.autoPlayMusic !== undefined ? data.autoPlayMusic : true,
    fallingPetals: data.fallingPetals !== undefined ? data.fallingPetals : true,
    autoPlay3dGallery: data.autoPlay3dGallery !== undefined ? data.autoPlay3dGallery : true,
    updatedAtMs: typeof data.updatedAtMs === 'number' ? data.updatedAtMs : Date.now(),
    shareGroom: {
      ...DEFAULT_WEDDING_DATA.shareGroom!,
      ...rawGroomShare,
      title: resolvedGroomTitle,
      description: resolvedGroomDesc,
      dateText: rawGroomShare.dateText || gDate,
      coverPhotoUrl: normalizeUrlToRelative(
        rawGroomShare.coverPhotoUrl || shareCover,
        'share'
      ),
      coverPosition:
        rawGroomShare.coverPosition ||
        data.shareCoverPosition ||
        DEFAULT_WEDDING_DATA.shareGroom!.coverPosition
    },
    shareBride: {
      ...DEFAULT_WEDDING_DATA.shareBride!,
      ...rawBrideShare,
      title: resolvedBrideTitle,
      description: resolvedBrideDesc,
      dateText: rawBrideShare.dateText || bDate,
      coverPhotoUrl: normalizeUrlToRelative(
        rawBrideShare.coverPhotoUrl || shareCover,
        'share'
      ),
      coverPosition:
        rawBrideShare.coverPosition ||
        data.shareCoverPosition ||
        DEFAULT_WEDDING_DATA.shareBride!.coverPosition
    }
  };
  return next;
}

function deduplicateAndSanitizeProjects(projects: any[], targetUser: string): any[] {
  const seenIds = new Map<string, any>();
  for (const p of projects) {
    if (!p || typeof p !== 'object') continue;
    const pData = sanitizeWeddingDataMedia({ ...(p.data || {}), ownerUsername: targetUser });
    const defaultTitle = `${pData.groomShortName || pData.groomName || 'Chú Rể'} & ${pData.brideShortName || pData.brideName || 'Cô Dâu'}`;
    const projId = p.id === 'card_1793331172761' ? 'card_default' : (p.id || `card_${Date.now()}`);
    const cleanUpdatedAt =
      !p.updatedAt || p.updatedAt.startsWith('03:') || p.updatedAt.startsWith('05:')
        ? formatVietnamDateTime(new Date(pData.updatedAtMs || Date.now()))
        : p.updatedAt;
    const cleanProj = {
      ...p,
      id: projId,
      title: p.title || defaultTitle,
      updatedAt: cleanUpdatedAt,
      data: {
        ...pData,
        lastSavedAt: cleanUpdatedAt
      }
    };
    const existing = seenIds.get(projId);
    if (!existing) {
      seenIds.set(projId, cleanProj);
    } else {
      const existingMs = Number(existing.data?.updatedAtMs) || 0;
      const currentMs = Number(cleanProj.data?.updatedAtMs) || 0;
      if (currentMs >= existingMs) {
        seenIds.set(projId, cleanProj);
      }
    }
  }
  return Array.from(seenIds.values());
}

function loadStore(): StoredState {
  const candidates: StoredState[] = [];
  for (const file of [STORE_FILE, TRACKED_STORE_FILE]) {
    try {
      if (fs.existsSync(file)) {
        const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (raw && typeof raw === 'object') {
          candidates.push({
            defaultData: { ...DEFAULT_WEDDING_DATA, ...(raw.defaultData || {}) },
            bySlug: raw.bySlug || {},
            byAccount: raw.byAccount || {},
            users: Array.isArray(raw.users) ? raw.users : []
          });
        }
      }
    } catch (e) {
      console.error(`Failed to read ${file}:`, e);
    }
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => (Number(b.defaultData?.updatedAtMs) || 0) - (Number(a.defaultData?.updatedAtMs) || 0));
    return candidates[0];
  }
  return {
    defaultData: DEFAULT_WEDDING_DATA,
    bySlug: {},
    byAccount: {},
    users: []
  };
}

function saveStore(state: StoredState) {
  const json = JSON.stringify(state, null, 2);
  try {
    fs.writeFileSync(STORE_FILE, json, 'utf-8');
  } catch (e) {
    console.error('Failed to write wedding-store.json:', e);
  }
  try {
    fs.writeFileSync(TRACKED_STORE_FILE, json, 'utf-8');
  } catch (e) {
    console.error('Failed to write tracked server-store.json:', e);
  }
}

function registerSlugsForWeddingData(store: StoredState, cleaned: WeddingData, username?: string) {
  const groomSlug = (cleaned.customSlugGroom || 'quanghung-minhtue').toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  const brideSlug = (cleaned.customSlugBride || 'minhtue-quanghung').toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  const publishedAt = cleaned.publishedAt || cleaned.lastSavedAt || formatVietnamDateTime();
  const owner = username || cleaned.ownerUsername || 'admin@123';

  const bParty = cleaned.partyBride || DEFAULT_WEDDING_DATA.partyBride;
  const bDate = formatSolarDateVN(bParty.date) || '22/11/2026';
  const bTime = (bParty.time === '22:00' ? '10:00' : bParty.time) || '10:00';
  const bVenue = bParty.venueAddress || 'Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang';
  const bShort = cleaned.brideShortName || cleaned.brideName || 'Minh Tuệ';
  const gShort = cleaned.groomShortName || cleaned.groomName || 'Quang Hưng';
  const bType = getPartyTypeLabel(bParty);

  const defaultBrideDesc = `Kính mời quý khách tới dự ${bType.labelLower} của ${bShort} & ${gShort} vào lúc ${bTime} ngày ${bDate} tại ${bVenue}`;
  const existingBrideDesc = (cleaned.shareBride?.description || '').trim();

  cleaned.shareBride = {
    coverPhotoUrl: normalizeUrlToRelative(cleaned.shareBride?.coverPhotoUrl || cleaned.shareCoverPhotoUrl || '/api/media/media_48034d471b1e1c49.jpg', 'share'),
    coverPosition: cleaned.shareBride?.coverPosition || { x: 49.7, y: 68.3, zoom: 210, fit: 'contain', flipX: false, flipY: false, rotate: 0 },
    title: cleaned.shareBride?.title || `Thiệp Mời ${bType.labelCap} - ${bShort} & ${gShort}`,
    description:
      existingBrideDesc && (existingBrideDesc.includes('vào lúc') || existingBrideDesc.includes('tại'))
        ? existingBrideDesc
        : defaultBrideDesc,
    dateText: cleaned.shareBride?.dateText || bDate
  };

  const gParty = cleaned.partyGroom || DEFAULT_WEDDING_DATA.partyGroom;
  const gDate = formatSolarDateVN(gParty.date) || '29/11/2026';
  const gTime = gParty.time || '16:00';
  const gVenue = gParty.venueAddress || 'Số nhà 10, Đường số 4, thôn Đằng Xá, xã Hoằng Hóa, tỉnh Thanh Hóa';
  const gType = getPartyTypeLabel(gParty);

  const defaultGroomDesc = `Kính mời quý khách tới dự ${gType.labelLower} của ${gShort} & ${bShort} vào lúc ${gTime} ngày ${gDate} tại ${gVenue}`;
  const existingGroomDesc = (cleaned.shareGroom?.description || '').trim();

  cleaned.shareGroom = {
    coverPhotoUrl: normalizeUrlToRelative(cleaned.shareGroom?.coverPhotoUrl || cleaned.shareCoverPhotoUrl || '/api/media/media_48034d471b1e1c49.jpg', 'share'),
    coverPosition: cleaned.shareGroom?.coverPosition || { x: 48.3, y: 67.3, zoom: 212, fit: 'contain', flipX: false, flipY: false, rotate: 0 },
    title: cleaned.shareGroom?.title || `Thiệp Mời ${gType.labelCap} - ${gShort} & ${bShort}`,
    description:
      existingGroomDesc && (existingGroomDesc.includes('vào lúc') || existingGroomDesc.includes('tại'))
        ? existingGroomDesc
        : defaultGroomDesc,
    dateText: cleaned.shareGroom?.dateText || gDate
  };

  const addSlugVariants = (slug: string, side: SideType) => {
    if (!slug) return;
    const clean = slug.replace(/[^a-z0-9]/g, '');
    store.bySlug[slug] = { side, data: cleaned, publishedAt, ownerUsername: owner };
    if (clean) store.bySlug[clean] = { side, data: cleaned, publishedAt, ownerUsername: owner };
  };

  addSlugVariants(groomSlug, 'groom');
  addSlugVariants('quanghungminhtue', 'groom');
  addSlugVariants('quanghung-minhtue', 'groom');
  store.bySlug['nha-trai'] = { side: 'groom', data: cleaned, publishedAt, ownerUsername: owner };
  store.bySlug['nhatrai'] = { side: 'groom', data: cleaned, publishedAt, ownerUsername: owner };

  addSlugVariants(brideSlug, 'bride');
  addSlugVariants('minhtuequanghung', 'bride');
  addSlugVariants('minhtue-quanghung', 'bride');
  store.bySlug['nha-gai'] = { side: 'bride', data: cleaned, publishedAt, ownerUsername: owner };
  store.bySlug['nhagai'] = { side: 'bride', data: cleaned, publishedAt, ownerUsername: owner };
}

function syncCardIntoAccountBackups(
  store: StoredState,
  cleaned: WeddingData,
  options?: { username?: string; projects?: any[]; activeProjectId?: string; nowStr?: string; replaceProjects?: boolean }
) {
  const nowStr = options?.nowStr || formatVietnamDateTime();
  const nowMs = cleaned.updatedAtMs || Date.now();
  const targetUser = (options?.username || cleaned.ownerUsername || 'admin@123').toLowerCase().trim();

  cleaned.ownerUsername = targetUser;

  if (Array.isArray(options?.projects) && options!.projects.length > 0) {
    const rawActiveId = options!.activeProjectId || options!.projects[0]?.id || 'card_default';
    const requestedActiveId = rawActiveId === 'card_1793331172761' ? 'card_default' : rawActiveId;
    const rawMapped = options!.projects.map((p: any) => {
      const normalizedId = p.id === 'card_1793331172761' ? 'card_default' : (p.id || 'card_default');
      const isTarget = normalizedId === requestedActiveId || p.id === rawActiveId;
      const pData = isTarget
        ? cleaned
        : p.data
        ? sanitizeWeddingDataMedia({ ...p.data, ownerUsername: targetUser })
        : cleaned;
      return {
        ...p,
        id: normalizedId,
        title:
          p.title ||
          `${pData.groomShortName || pData.groomName || 'Chú Rể'} & ${pData.brideShortName || pData.brideName || 'Cô Dâu'}`,
        updatedAt: isTarget ? nowStr : p.updatedAt || nowStr,
        data: { ...pData, ownerUsername: targetUser }
      };
    });

    const sanitizedProjects = deduplicateAndSanitizeProjects(rawMapped, targetUser);
    const activeMatch =
      sanitizedProjects.find((p: any) => p.id === requestedActiveId) || sanitizedProjects[0];

    store.byAccount[targetUser] = {
      projects: sanitizedProjects,
      activeProjectId: activeMatch ? activeMatch.id : 'card_default',
      updatedAt: nowStr,
      updatedAtMs: nowMs
    };
  } else if (store.byAccount[targetUser]) {
    const existingBackup = store.byAccount[targetUser];
    const rawActiveId = options?.activeProjectId || existingBackup.activeProjectId || 'card_default';
    const activeId = rawActiveId === 'card_1793331172761' ? 'card_default' : rawActiveId;
    const hasMatch = existingBackup.projects.some((p: any) => p.id === activeId || p.id === rawActiveId);
    const rawNext = hasMatch
      ? existingBackup.projects.map((p: any) =>
          p.id === activeId || p.id === rawActiveId
            ? {
                ...p,
                id: activeId,
                title: `${cleaned.groomShortName || cleaned.groomName || 'Chú Rể'} & ${cleaned.brideShortName || cleaned.brideName || 'Cô Dâu'}`,
                updatedAt: nowStr,
                data: cleaned
              }
            : p
        )
      : [
          {
            id: activeId,
            title: `${cleaned.groomShortName || cleaned.groomName || 'Chú Rể'} & ${cleaned.brideShortName || cleaned.brideName || 'Cô Dâu'}`,
            updatedAt: nowStr,
            data: cleaned
          },
          ...existingBackup.projects
        ];

    const deduped = deduplicateAndSanitizeProjects(rawNext, targetUser);
    const finalActive = deduped.find((p: any) => p.id === activeId) || deduped[0];

    store.byAccount[targetUser] = {
      projects: deduped,
      activeProjectId: finalActive ? finalActive.id : 'card_default',
      updatedAt: nowStr,
      updatedAtMs: nowMs
    };
  } else {
    const id = options?.activeProjectId === 'card_1793331172761' ? 'card_default' : (options?.activeProjectId || 'card_default');
    store.byAccount[targetUser] = {
      projects: [
        {
          id,
          title: `${cleaned.groomShortName || cleaned.groomName || 'Chú Rể'} & ${cleaned.brideShortName || cleaned.brideName || 'Cô Dâu'}`,
          updatedAt: nowStr,
          data: cleaned
        }
      ],
      activeProjectId: id,
      updatedAt: nowStr,
      updatedAtMs: nowMs
    };
  }
}

function escapeHtmlAttr(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildAbsoluteOrigin(req: express.Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

function resolveSideAndDataForRequest(req: express.Request, store: StoredState): { side: SideType; data: WeddingData } {
  const pathname = req.path.toLowerCase();
  const sideQuery = String(req.query.side || '').toLowerCase().trim();

  // 1. Explicit query parameter (?side=groom or ?side=bride) ALWAYS takes top priority
  if (sideQuery === 'groom' || sideQuery === 'nhatrai' || sideQuery === 'nha-trai') {
    const targetData = store.bySlug['nha-trai']?.data || store.bySlug['quanghung-minhtue']?.data || store.defaultData;
    return { side: 'groom', data: targetData };
  }
  if (sideQuery === 'bride' || sideQuery === 'nhagai' || sideQuery === 'nha-gai') {
    const targetData = store.bySlug['nha-gai']?.data || store.bySlug['minhtue-quanghung']?.data || store.defaultData;
    return { side: 'bride', data: targetData };
  }

  // 2. Explicit path /nha-trai vs /nha-gai
  if (pathname.includes('nha-trai') || pathname.includes('nhatrai')) {
    const targetData = store.bySlug['nha-trai']?.data || store.bySlug['quanghung-minhtue']?.data || store.defaultData;
    return { side: 'groom', data: targetData };
  }
  if (pathname.includes('nha-gai') || pathname.includes('nhagai')) {
    const targetData = store.bySlug['nha-gai']?.data || store.bySlug['minhtue-quanghung']?.data || store.defaultData;
    return { side: 'bride', data: targetData };
  }

  // 3. Exact slug match in store.bySlug (/i/:slug)
  if (pathname.startsWith('/i/')) {
    const rawSlug = pathname.replace(/^\/i\//, '').replace(/\/+$/, '');
    if (rawSlug && store.bySlug[rawSlug]) {
      return store.bySlug[rawSlug];
    }
    const cleanSlug = rawSlug.replace(/[^a-z0-9]/g, '');
    if (cleanSlug && store.bySlug[cleanSlug]) {
      return store.bySlug[cleanSlug];
    }
  }

  // 4. Fallback name-order comparison so /i/quanghung-minhtue -> groom and /i/minhtue-quanghung -> bride
  const idxGroom = pathname.indexOf('quanghung');
  const idxBride = pathname.indexOf('minhtue');
  if (idxGroom !== -1 && idxBride !== -1) {
    if (idxGroom < idxBride) {
      return { side: 'groom', data: store.bySlug['nha-trai']?.data || store.defaultData };
    } else {
      return { side: 'bride', data: store.bySlug['nha-gai']?.data || store.defaultData };
    }
  }
  if (idxBride !== -1 || pathname.includes('bride')) {
    return { side: 'bride', data: store.bySlug['nha-gai']?.data || store.defaultData };
  }
  if (idxGroom !== -1 || pathname.includes('groom')) {
    return { side: 'groom', data: store.bySlug['nha-trai']?.data || store.defaultData };
  }

  return { side: 'groom', data: store.defaultData };
}

function formatSolarDateVN(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return clean;
}

function resolveSideOpenGraphDescription(isGroom: boolean, data: WeddingData): string {
  const groomShort = data.groomShortName || data.groomName || 'Quang Hưng';
  const brideShort = data.brideShortName || data.brideName || 'Minh Tuệ';

  if (!isGroom) {
    const party = data.partyBride || DEFAULT_WEDDING_DATA.partyBride;
    const brideDate = formatSolarDateVN(party.date) || '22/11/2026';
    const brideTime = (party.time === '22:00' ? '10:00' : party.time) || '10:00';
    const brideVenue = party.venueAddress || 'Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang';
    const pType = getPartyTypeLabel(party);
    const customDesc = data.shareBride?.description?.trim() || '';
    if (customDesc && (customDesc.includes('vào lúc') || customDesc.includes('tại'))) {
      return customDesc;
    }
    return `Kính mời quý khách tới dự ${pType.labelLower} của ${brideShort} & ${groomShort} vào lúc ${brideTime} ngày ${brideDate} tại ${brideVenue}`.trim();
  } else {
    const party = data.partyGroom || DEFAULT_WEDDING_DATA.partyGroom;
    const groomDate = formatSolarDateVN(party.date) || '29/11/2026';
    const groomTime = party.time || '16:00';
    const groomVenue = party.venueAddress || 'Số nhà 10, Đường số 4, thôn Đằng Xá, xã Hoằng Hóa, tỉnh Thanh Hóa';
    const pType = getPartyTypeLabel(party);
    const customDesc = data.shareGroom?.description?.trim() || '';
    if (customDesc && (customDesc.includes('vào lúc') || customDesc.includes('tại'))) {
      return customDesc;
    }
    return `Kính mời quý khách tới dự ${pType.labelLower} của ${groomShort} & ${brideShort} vào lúc ${groomTime} ngày ${groomDate} tại ${groomVenue}`.trim();
  }
}

function injectOpenGraphAndState(html: string, req: express.Request, store: StoredState): string {
  const { side, data } = resolveSideAndDataForRequest(req, store);
  const isGroom = side === 'groom';
  const origin = buildAbsoluteOrigin(req);

  const groomShort = data.groomShortName || data.groomName || 'Quang Hưng';
  const brideShort = data.brideShortName || data.brideName || 'Minh Tuệ';

  const party = isGroom ? (data.partyGroom || DEFAULT_WEDDING_DATA.partyGroom) : (data.partyBride || DEFAULT_WEDDING_DATA.partyBride);
  const pType = getPartyTypeLabel(party);

  const titleText = isGroom
    ? `Thiệp Mời ${pType.labelCap} - ${groomShort} & ${brideShort}`
    : `Thiệp Mời ${pType.labelCap} - ${brideShort} & ${groomShort}`;

  const shareObj = isGroom ? data.shareGroom : data.shareBride;
  const rawTitle = shareObj?.title?.trim();

  // Query parameter overrides (top priority!)
  const queryTitle = (req.query.t || req.query.title || req.query.og_title) as string | undefined;
  const queryDesc = (req.query.d || req.query.desc || req.query.og_desc) as string | undefined;
  const queryImg = (req.query.img || req.query.og_image) as string | undefined;

  const finalTitle = queryTitle?.trim() || rawTitle || titleText;
  const finalDesc = queryDesc?.trim() || resolveSideOpenGraphDescription(isGroom, data);

  const title = escapeHtmlAttr(finalTitle);
  const desc = escapeHtmlAttr(finalDesc);

  const rawImg =
    queryImg ||
    shareObj?.coverPhotoUrl ||
    data.shareCoverPhotoUrl ||
    data.heroPhotoUrl ||
    DEFAULT_WEDDING_DATA.shareCoverPhotoUrl;

  const absoluteImg = escapeHtmlAttr(
    rawImg.startsWith('http://') || rawImg.startsWith('https://')
      ? rawImg
      : `${origin}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`
  );

  const fullUrl = escapeHtmlAttr(`${origin}${req.originalUrl}`);

  let updated = html
    .replace(/<title>.*?<\/title>/is, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${desc}" />`)
    .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${title}" />`)
    .replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${desc}" />`
    )
    .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${absoluteImg}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`)
    .replace(
      /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${desc}" />`
    )
    .replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${absoluteImg}" />`);

  if (!updated.includes('property="og:url"')) {
    updated = updated.replace('</head>', `  <meta property="og:url" content="${fullUrl}" />\n  </head>`);
  }

  const safeJson = JSON.stringify({
    side,
    data,
    users: store.users || [],
    accountBackups: store.byAccount || {}
  }).replace(/</g, '\\u003c');
  const bootstrapScript = `<script>window.__INITIAL_WEDDING_STATE__ = ${safeJson};</script>`;
  updated = updated.replace('</head>', `  ${bootstrapScript}\n  </head>`);

  return updated;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  const store = loadStore();

  // Sanitize & deduplicate all account backups and defaultData on startup
  store.defaultData = sanitizeWeddingDataMedia(store.defaultData);
  if (!store.defaultData.lastSavedAt || store.defaultData.lastSavedAt.startsWith('03:') || store.defaultData.lastSavedAt.startsWith('05:')) {
    store.defaultData.lastSavedAt = formatVietnamDateTime(new Date(store.defaultData.updatedAtMs || Date.now()));
  }
  if (!store.defaultData.publishedAt || store.defaultData.publishedAt.startsWith('03:') || store.defaultData.publishedAt.startsWith('05:')) {
    store.defaultData.publishedAt = store.defaultData.lastSavedAt;
  }
  store.users = (store.users || []).map(sanitizeUserAccount);

  for (const [accKey, accVal] of Object.entries(store.byAccount || {})) {
    if (accVal && Array.isArray(accVal.projects) && accVal.projects.length > 0) {
      const deduped = deduplicateAndSanitizeProjects(accVal.projects, accKey);
      const normActiveId = accVal.activeProjectId === 'card_1793331172761' ? 'card_default' : accVal.activeProjectId;
      const bestActive =
        deduped.find((p: any) => p.id === normActiveId) || deduped[0];
      store.byAccount[accKey] = {
        ...accVal,
        projects: deduped,
        activeProjectId: bestActive ? bestActive.id : 'card_default',
        updatedAt: bestActive?.updatedAt || formatVietnamDateTime()
      };
      if (accKey === 'admin@123' && bestActive?.data) {
        store.defaultData = sanitizeWeddingDataMedia(bestActive.data);
      }
    }
  }

  registerSlugsForWeddingData(store, store.defaultData);
  saveStore(store);

  // Serve persisted uploaded media files (checks public/api/media, public/assets/uploaded and .data/media)
  app.get('/api/media/:filename', (req, res) => {
    const rawFilename = path.basename(req.params.filename);
    const remapped = normalizeUrlToRelative(`/api/media/${rawFilename}`);
    const filename = path.basename(remapped);

    let filePath = path.join(PUBLIC_API_MEDIA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_MEDIA_DIR, filename);
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.join(MEDIA_DIR, filename);
    }
    if (!fs.existsSync(filePath)) {
      res.status(404).end();
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg'
    };
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    fs.createReadStream(filePath).pipe(res);
  });

  // Upload a single base64 media file and get back a short /api/media/... path
  app.post('/api/upload-media', (req, res) => {
    const { dataUrl, role } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Missing dataUrl' });
      return;
    }
    const url = persistDataUrlToMedia(dataUrl, role);
    res.json({ url });
  });

  // Get current wedding data (optionally by slug or side)
  app.get('/api/wedding-data', (req, res) => {
    const slug = String(req.query.slug || '').toLowerCase().trim();
    const sideParam = String(req.query.side || '').toLowerCase().trim();
    if ((sideParam === 'groom' || sideParam === 'nha-trai' || sideParam === 'nhatrai') && store.bySlug['nha-trai']) {
      res.json(store.bySlug['nha-trai']);
      return;
    }
    if ((sideParam === 'bride' || sideParam === 'nha-gai' || sideParam === 'nhagai') && store.bySlug['nha-gai']) {
      res.json(store.bySlug['nha-gai']);
      return;
    }
    if (slug && store.bySlug[slug]) {
      res.json(store.bySlug[slug]);
      return;
    }
    const cleanSlug = slug.replace(/[^a-z0-9]/g, '');
    if (cleanSlug && store.bySlug[cleanSlug]) {
      res.json(store.bySlug[cleanSlug]);
      return;
    }
    res.json({ side: 'groom', data: store.defaultData });
  });

  // Save/sync wedding data ("Lưu thông tin thiệp") so short links & account backups always have latest data & OG tags
  app.post('/api/wedding-data', (req, res) => {
    try {
      const incoming = req.body?.data;
      const username = req.body?.username;
      const projects = req.body?.projects;
      const activeProjectId = req.body?.activeProjectId;
      const replaceProjects = Boolean(req.body?.replaceProjects);

      if (!incoming || typeof incoming !== 'object') {
        res.status(400).json({ error: 'Invalid wedding data' });
        return;
      }
      const nowStr = formatVietnamDateTime();
      const nowMs = Date.now();
      const cleaned = sanitizeWeddingDataMedia({
        ...store.defaultData,
        ...incoming,
        lastSavedAt: nowStr,
        updatedAtMs: nowMs
      });
      store.defaultData = cleaned;
      registerSlugsForWeddingData(store, cleaned, username);
      syncCardIntoAccountBackups(store, cleaned, { username, projects, activeProjectId, nowStr, replaceProjects });

      saveStore(store);
      res.json({
        ok: true,
        data: cleaned,
        savedAt: nowStr,
        accountBackup: store.byAccount[(username || cleaned.ownerUsername || 'admin@123').toLowerCase().trim()]
      });
    } catch (e) {
      console.error('Error saving wedding data:', e);
      res.status(500).json({ error: 'Failed to save wedding data' });
    }
  });

  // Publish & synchronize card ("Chế độ Xuất thiệp") across all mobile phones and computers
  app.post('/api/publish-card', (req, res) => {
    try {
      const incoming = req.body?.data;
      const username = req.body?.username;
      const projects = req.body?.projects;
      const activeProjectId = req.body?.activeProjectId;

      if (!incoming || typeof incoming !== 'object') {
        res.status(400).json({ error: 'Invalid wedding data' });
        return;
      }

      const publishedAt = formatVietnamDateTime();
      const nowMs = Date.now();
      const nextVersion = (Number(incoming.publishedVersion || store.defaultData.publishedVersion || 0) || 0) + 1;

      const cleaned = sanitizeWeddingDataMedia({
        ...store.defaultData,
        ...incoming,
        isPublished: true,
        publishedAt,
        lastSavedAt: publishedAt,
        publishedVersion: nextVersion,
        updatedAtMs: nowMs,
        ownerUsername: username || incoming.ownerUsername || store.defaultData.ownerUsername || 'admin@123'
      });

      store.defaultData = cleaned;
      registerSlugsForWeddingData(store, cleaned, username);
      syncCardIntoAccountBackups(store, cleaned, { username, projects, activeProjectId, nowStr: publishedAt });

      saveStore(store);

      const groomSlug = (cleaned.customSlugGroom || '').trim().replace(/^\/+|\/+$/g, '');
      const brideSlug = (cleaned.customSlugBride || '').trim().replace(/^\/+|\/+$/g, '');

      res.json({
        ok: true,
        data: cleaned,
        publishedAt,
        publishedVersion: nextVersion,
        groomPath: groomSlug ? `/i/${groomSlug}` : '/nha-trai',
        bridePath: brideSlug ? `/i/${brideSlug}` : '/nha-gai'
      });
    } catch (e) {
      console.error('Error publishing wedding card:', e);
      res.status(500).json({ error: 'Failed to publish wedding card' });
    }
  });

  // Cross-device account & multi-card backup synchronization
  app.get('/api/sync-account', (req, res) => {
    const username = String(req.query.username || '').toLowerCase().trim();
    let accountData = username ? store.byAccount[username] || null : null;

    if (username && !accountData) {
      if (store.defaultData && (store.defaultData.ownerUsername?.toLowerCase().trim() === username || username === 'admin@123')) {
        accountData = {
          projects: [
            {
              id: 'card_default',
              title: `${store.defaultData.groomShortName || store.defaultData.groomName || 'Chú Rể'} & ${store.defaultData.brideShortName || store.defaultData.brideName || 'Cô Dâu'}`,
              updatedAt: store.defaultData.lastSavedAt || formatVietnamDateTime(),
              data: store.defaultData
            }
          ],
          activeProjectId: 'card_default',
          updatedAt: store.defaultData.lastSavedAt || formatVietnamDateTime(),
          updatedAtMs: store.defaultData.updatedAtMs || Date.now()
        };
        store.byAccount[username] = accountData;
        saveStore(store);
      }
    }

    res.json({
      ok: true,
      users: store.users || [],
      accountBackup: accountData,
      defaultData: store.defaultData
    });
  });

  app.post('/api/sync-account', (req, res) => {
    try {
      const { username, projects, activeProjectId, users, replaceUsers, forceSync, replaceProjects } = req.body || {};
      const nowStr = formatVietnamDateTime();
      const nowMs = Date.now();

      if (Array.isArray(users) && users.length > 0) {
        store.users = mergeUsersOnServer(store.users || [], users, Boolean(replaceUsers));
      }

      if (username && typeof username === 'string' && Array.isArray(projects) && projects.length > 0) {
        const userKey = username.toLowerCase().trim();
        const existingBackup = store.byAccount[userKey];
        const existingMs = Number(existingBackup?.updatedAtMs) || 0;
        const incomingMaxMs = Math.max(
          0,
          ...projects.map((p: any) => Number(p?.data?.updatedAtMs) || 0)
        );

        if (forceSync || replaceProjects || !existingBackup || incomingMaxMs >= existingMs) {
          const sanitizedProjects = deduplicateAndSanitizeProjects(projects, userKey);
          const normActiveId = activeProjectId === 'card_1793331172761' ? 'card_default' : activeProjectId;
          const chosenActive =
            sanitizedProjects.find((p: any) => p.id === normActiveId) || sanitizedProjects[0];

          store.byAccount[userKey] = {
            projects: sanitizedProjects,
            activeProjectId: chosenActive ? chosenActive.id : 'card_default',
            updatedAt: nowStr,
            updatedAtMs: Math.max(incomingMaxMs, nowMs)
          };

          if (chosenActive?.data) {
            store.defaultData = chosenActive.data;
            registerSlugsForWeddingData(store, chosenActive.data, userKey);
          }
        }
      }

      saveStore(store);
      res.json({
        ok: true,
        updatedAt: nowStr,
        users: store.users,
        accountBackup: username ? store.byAccount[String(username).toLowerCase().trim()] : null,
        defaultData: store.defaultData
      });
    } catch (e) {
      console.error('Error syncing account:', e);
      res.status(500).json({ error: 'Failed to sync account' });
    }
  });

  const distDir = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.join(distDir, 'index.html'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    // Intercept HTML page routes BEFORE vite static middleware so /nha-trai, /nha-gai, /i/:slug get dynamic OG tags
    app.get(['/', '/nha-trai', '/nha-trai/', '/nha-gai', '/nha-gai/', '/i/:slug'], async (req, res, next) => {
      try {
        const rawHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const finalHtml = injectOpenGraphAndState(transformed, req, store);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const rawHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const finalHtml = injectOpenGraphAndState(transformed, req, store);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

    app.get(['/', '/nha-trai', '/nha-trai/', '/nha-gai', '/nha-gai/', '/i/:slug'], (req, res) => {
      const finalHtml = injectOpenGraphAndState(baseHtml, req, store);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
    });

    app.use(express.static(distDir, { index: false }));

    app.get('*', (req, res) => {
      const finalHtml = injectOpenGraphAndState(baseHtml, req, store);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wedding Invitation Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
