/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { WeddingData, SideType, ThemeTemplate, CardOpeningStyle, GuestItem, getPartyTypeLabel } from './types/wedding';
import { UserAccount } from './types/auth';
import {
  getCurrentUser,
  setCurrentUserStore,
  getStoredUsers,
  saveStoredUsers,
  mergeUsersByTimestamp,
  isImageAvatarUrl
} from './services/authStore';
import { DEFAULT_WEDDING_DATA, MUSIC_PLAYLIST } from './data/weddingDefault';
import { WeddingEditor } from './components/wedding/WeddingEditor';
import { WeddingPreview } from './components/wedding/WeddingPreview';
import { ImperialDragonCard } from './components/wedding/ImperialDragonCard';
import { MusicPickerModal } from './components/wedding/MusicPickerModal';
import { TemplatePickerModal } from './components/wedding/TemplatePickerModal';
import { InvitationCoverModal } from './components/wedding/InvitationCoverModal';
import { ProjectManagerModal, WeddingProject } from './components/wedding/ProjectManagerModal';
import { PublishCardModal } from './components/wedding/PublishCardModal';
import { CustomLinkModal } from './components/wedding/CustomLinkModal';
import { GuestListModal } from './components/wedding/GuestListModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { AdminDashboardModal } from './components/auth/AdminDashboardModal';
import { TrialExpiredModal } from './components/wedding/TrialExpiredModal';
import {
  decodeWeddingDataFromParam,
  buildShareableSideUrl,
  toAbsoluteUrl,
  normalizeRelativeAssetUrl,
  syncWeddingDataToServer,
  publishWeddingCardToServer,
  syncAccountWithServer,
  fetchAccountBackupFromServer,
  saveStateToIndexedDB,
  loadStateFromIndexedDB,
  formatVietnamDateTime
} from './utils/shareLinkCodec';
import { FallingPetals } from './components/FallingPetals';
import { formatVietnameseSolarDate } from './utils/lunarCalendar';
import { acousticAudio } from './utils/audioPlayer';
import { UserAvatar } from './components/common/UserAvatar';
import { 
  Edit3, 
  Eye, 
  Music, 
  Share2, 
  Check, 
  Smartphone,
  Monitor,
  ExternalLink,
  Palette,
  Save,
  FolderHeart,
  LogIn,
  UserPlus,
  Shield,
  LogOut,
  CloudUpload,
  User,
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX,
  Users
} from 'lucide-react';

const mergeWeddingData = (raw: any): WeddingData => {
  if (!raw || typeof raw !== 'object') return DEFAULT_WEDDING_DATA;
  const oldParty = raw.party || {};

  const groomAvatar =
    typeof raw.groomAvatarUrl === 'string' && raw.groomAvatarUrl.trim() !== ''
      ? normalizeRelativeAssetUrl(raw.groomAvatarUrl, 'groom')
      : raw.groomAvatarUrl === ''
      ? ''
      : DEFAULT_WEDDING_DATA.groomAvatarUrl;
  const brideAvatar =
    typeof raw.brideAvatarUrl === 'string' && raw.brideAvatarUrl.trim() !== ''
      ? normalizeRelativeAssetUrl(raw.brideAvatarUrl, 'bride')
      : raw.brideAvatarUrl === ''
      ? ''
      : DEFAULT_WEDDING_DATA.brideAvatarUrl;
  const heroPhoto =
    typeof raw.heroPhotoUrl === 'string' && raw.heroPhotoUrl.trim() !== ''
      ? normalizeRelativeAssetUrl(raw.heroPhotoUrl, 'hero')
      : raw.heroPhotoUrl === ''
      ? ''
      : DEFAULT_WEDDING_DATA.heroPhotoUrl;
  const sharePhoto =
    normalizeRelativeAssetUrl(raw.shareCoverPhotoUrl, 'share') || DEFAULT_WEDDING_DATA.shareCoverPhotoUrl;

  const rawGallery =
    Array.isArray(raw.galleryPhotos) && raw.galleryPhotos.length > 0
      ? raw.galleryPhotos.map((u: string) => normalizeRelativeAssetUrl(u, 'gallery')).filter(Boolean)
      : DEFAULT_WEDDING_DATA.galleryPhotos;
  const gallery = Array.from(new Set(rawGallery));
  if (gallery.length === 1 && gallery[0] === '/api/media/media_48034d471b1e1c49.jpg') {
    gallery.push('/api/media/media_cca42efe1813d7a6.jpg');
  }

  const rawShareGroom = raw.shareGroom || {};
  const rawShareBride = raw.shareBride || {};

  const groomSharePhoto =
    normalizeRelativeAssetUrl(rawShareGroom.coverPhotoUrl, 'share') ||
    sharePhoto ||
    DEFAULT_WEDDING_DATA.shareGroom?.coverPhotoUrl;
  const brideSharePhoto =
    normalizeRelativeAssetUrl(rawShareBride.coverPhotoUrl, 'share') ||
    sharePhoto ||
    DEFAULT_WEDDING_DATA.shareBride?.coverPhotoUrl;

  const groomPos = raw.groomAvatarPosition || DEFAULT_WEDDING_DATA.groomAvatarPosition;
  const bridePos = raw.brideAvatarPosition || DEFAULT_WEDDING_DATA.brideAvatarPosition;

  return {
    ...DEFAULT_WEDDING_DATA,
    ...raw,
    coverBackgroundUrl:
      normalizeRelativeAssetUrl(raw.coverBackgroundUrl, 'cover') || DEFAULT_WEDDING_DATA.coverBackgroundUrl,
    groomAvatarUrl: groomAvatar,
    brideAvatarUrl: brideAvatar,
    heroPhotoUrl: heroPhoto,
    shareCoverPhotoUrl: sharePhoto,
    galleryPhotos: gallery,
    customAudioUrl: raw.customAudioUrl ? normalizeRelativeAssetUrl(raw.customAudioUrl) : undefined,
    groomFamily: {
      ...DEFAULT_WEDDING_DATA.groomFamily,
      ...(raw.groomFamily || {})
    },
    brideFamily: {
      ...DEFAULT_WEDDING_DATA.brideFamily,
      ...(raw.brideFamily || {})
    },
    ceremony: {
      ...DEFAULT_WEDDING_DATA.ceremony,
      ...(raw.ceremony || {})
    },
    ceremonyGroom: {
      ...DEFAULT_WEDDING_DATA.ceremonyGroom,
      ...(raw.ceremonyGroom || raw.ceremony || {})
    },
    ceremonyBride: {
      ...DEFAULT_WEDDING_DATA.ceremonyBride,
      ...(raw.ceremonyBride || raw.ceremony || {})
    },
    partyGroom: (() => {
      const mergedGroom = {
        ...DEFAULT_WEDDING_DATA.partyGroom,
        ...(raw.partyGroom ? raw.partyGroom : oldParty)
      };
      if (
        mergedGroom.mapCoordinates &&
        Math.abs(mergedGroom.mapCoordinates.lat - 22.10026) < 0.001 &&
        Math.abs(mergedGroom.mapCoordinates.lng - 105.0259) < 0.001 &&
        (mergedGroom.venueAddress || '').toLowerCase().includes('thanh hóa')
      ) {
        mergedGroom.mapCoordinates = { lat: 19.85950, lng: 105.85420 };
        mergedGroom.mapEmbedUrl = 'https://maps.google.com/maps?q=19.85950,105.85420&hl=vi&z=15&output=embed';
      }
      return mergedGroom;
    })(),
    partyBride: (() => {
      const mergedBride = {
        ...DEFAULT_WEDDING_DATA.partyBride,
        ...(raw.partyBride || {})
      };
      if (mergedBride.time === '22:00') {
        mergedBride.time = '10:00';
        mergedBride.welcomeTime = '10:00';
        mergedBride.diningTime = '10:30';
      }
      return mergedBride;
    })(),
    shareTitle: raw.shareTitle || DEFAULT_WEDDING_DATA.shareTitle,
    shareDescription: raw.shareDescription || DEFAULT_WEDDING_DATA.shareDescription,
    shareDateText: raw.shareDateText || DEFAULT_WEDDING_DATA.shareDateText,
    customSlugGroom: raw.customSlugGroom || DEFAULT_WEDDING_DATA.customSlugGroom || 'quanghung-minhtue',
    customSlugBride: raw.customSlugBride || DEFAULT_WEDDING_DATA.customSlugBride || 'minhtue-quanghung',
    shareGroom: (() => {
      const gParty = raw.partyGroom || DEFAULT_WEDDING_DATA.partyGroom;
      const gDate = formatVietnameseSolarDate(gParty.date) || '29/11/2026';
      const gPType = getPartyTypeLabel(gParty);
      const groomShort = raw.groomShortName || raw.groomName || 'Quang Hưng';
      const brideShort = raw.brideShortName || raw.brideName || 'Minh Tuệ';
      const defaultFullDesc = `Kính mời quý khách tới dự ${gPType.labelLower} của ${groomShort} & ${brideShort} vào lúc ${gParty.time || '16:00'} ngày ${gDate} tại ${gParty.venueAddress || ''}`;

      let rawDesc =
        typeof rawShareGroom.description === 'string' && rawShareGroom.description.trim() !== ''
          ? rawShareGroom.description.trim()
          : defaultFullDesc;

      if (!rawDesc.includes('vào lúc') && !rawDesc.includes('tại')) {
        rawDesc = defaultFullDesc;
      }
      if (rawDesc.includes('Nhà Gái')) {
        rawDesc = rawDesc.replace(/Nhà Gái/g, 'Nhà Trai');
      }
      rawDesc = rawDesc
        .replace(/Thân mời quý khách đến dự/gi, 'Kính mời quý khách tới dự')
        .replace(/dự tiệc báo hỷ Nhà Trai của/gi, 'dự tiệc báo hỷ của')
        .replace(/dự tiệc hỷ của/gi, `dự ${gPType.labelLower} của`);

      let title = (rawShareGroom.title && rawShareGroom.title.trim() !== '')
        ? rawShareGroom.title.trim()
        : `Thiệp Mời ${gPType.labelCap} - ${groomShort} & ${brideShort}`;
      if (title.includes('Tiệc Hỷ -') || title.includes('Tiệc Nhà Trai -')) {
        title = `Thiệp Mời ${gPType.labelCap} - ${groomShort} & ${brideShort}`;
      }

      return {
        ...DEFAULT_WEDDING_DATA.shareGroom!,
        ...rawShareGroom,
        title,
        dateText: rawShareGroom.dateText || gDate,
        description: rawDesc,
        coverPhotoUrl: groomSharePhoto,
        coverPosition: rawShareGroom.coverPosition || raw.shareCoverPosition || DEFAULT_WEDDING_DATA.shareGroom!.coverPosition
      };
    })(),
    shareBride: (() => {
      const bParty = raw.partyBride || DEFAULT_WEDDING_DATA.partyBride;
      const bDate = formatVietnameseSolarDate(bParty.date) || '22/11/2026';
      const bPType = getPartyTypeLabel(bParty);
      const bTimeStr = bParty.time === '22:00' ? '10:00' : (bParty.time || '10:00');
      const brideShort = raw.brideShortName || raw.brideName || 'Minh Tuệ';
      const groomShort = raw.groomShortName || raw.groomName || 'Quang Hưng';
      const defaultFullDesc = `Kính mời quý khách tới dự ${bPType.labelLower} của ${brideShort} & ${groomShort} vào lúc ${bTimeStr} ngày ${bDate} tại ${bParty.venueAddress || ''}`;

      let rawDesc =
        typeof rawShareBride.description === 'string' && rawShareBride.description.trim() !== ''
          ? rawShareBride.description.trim()
          : defaultFullDesc;

      if (!rawDesc.includes('vào lúc') && !rawDesc.includes('tại')) {
        rawDesc = defaultFullDesc;
      }
      if (rawDesc.includes('22:00')) {
        rawDesc = rawDesc.replace(/22:00/g, '10:00');
      }
      if (rawDesc.includes('Nhà Trai')) {
        rawDesc = rawDesc.replace(/Nhà Trai/g, 'Nhà Gái');
      }
      if (rawDesc.includes('Quang Hưng & Minh Tuệ') && !rawDesc.includes('Minh Tuệ & Quang Hưng')) {
        rawDesc = rawDesc.replace(/Quang Hưng & Minh Tuệ/g, 'Minh Tuệ & Quang Hưng');
      }
      rawDesc = rawDesc
        .replace(/Thân mời quý khách đến dự thông tin về tiệc hỷ Nhà Gái của/gi, `Kính mời quý khách tới dự ${bPType.labelLower} của`)
        .replace(/Thân mời quý khách đến dự/gi, 'Kính mời quý khách tới dự')
        .replace(/dự tiệc báo hỷ Nhà Gái của/gi, 'dự tiệc báo hỷ của')
        .replace(/dự tiệc hỷ của/gi, `dự ${bPType.labelLower} của`);

      let title = (rawShareBride.title && rawShareBride.title.trim() !== '')
        ? rawShareBride.title.trim()
        : `Thiệp Mời ${bPType.labelCap} - ${brideShort} & ${groomShort}`;
      if (title.includes('Tiệc Hỷ -') || title.includes('Tiệc Nhà Gái -')) {
        title = `Thiệp Mời ${bPType.labelCap} - ${brideShort} & ${groomShort}`;
      }

      return {
        ...DEFAULT_WEDDING_DATA.shareBride!,
        ...rawShareBride,
        title,
        dateText: rawShareBride.dateText || bDate,
        description: rawDesc,
        coverPhotoUrl: brideSharePhoto,
        coverPosition: rawShareBride.coverPosition || raw.shareCoverPosition || DEFAULT_WEDDING_DATA.shareBride!.coverPosition
      };
    })(),
    groomAvatarPosition: groomPos,
    brideAvatarPosition: bridePos,
    groomAvatarPositionGroom: raw.groomAvatarPositionGroom || groomPos,
    brideAvatarPositionGroom: raw.brideAvatarPositionGroom || bridePos,
    groomAvatarPositionBride: raw.groomAvatarPositionBride || groomPos,
    brideAvatarPositionBride: raw.brideAvatarPositionBride || bridePos,
    heroPhotoPosition: raw.heroPhotoPosition || DEFAULT_WEDDING_DATA.heroPhotoPosition,
    shareCoverPosition: raw.shareCoverPosition || DEFAULT_WEDDING_DATA.shareCoverPosition,
    autoScroll: raw.autoScroll !== undefined ? raw.autoScroll : true,
    autoPlayMusic: raw.autoPlayMusic !== undefined ? raw.autoPlayMusic : true,
    fallingPetals: raw.fallingPetals !== undefined ? raw.fallingPetals : true,
    autoPlay3dGallery: raw.autoPlay3dGallery !== undefined ? raw.autoPlay3dGallery : true,
    isPublished: raw.isPublished !== undefined ? raw.isPublished : true,
    updatedAtMs: typeof raw.updatedAtMs === 'number' ? raw.updatedAtMs : 0
  };
};

const deduplicateProjectsList = (rawList: WeddingProject[]): WeddingProject[] => {
  const byId = new Map<string, WeddingProject>();
  for (const p of rawList) {
    if (!p || !p.data) continue;
    const mergedData = mergeWeddingData(p.data);
    const title =
      p.title ||
      `${mergedData.groomShortName || mergedData.groomName || 'Chú Rể'} & ${mergedData.brideShortName || mergedData.brideName || 'Cô Dâu'}`;
    const normId = p.id === 'card_1793331172761' ? 'card_default' : (p.id || `card_${Date.now()}`);
    const cleanUpdatedAt =
      !p.updatedAt || p.updatedAt.startsWith('03:') || p.updatedAt.startsWith('05:')
        ? formatVietnamDateTime(new Date(mergedData.updatedAtMs || Date.now()))
        : p.updatedAt;
    const item: WeddingProject = {
      id: normId,
      title,
      updatedAt: cleanUpdatedAt,
      data: {
        ...mergedData,
        lastSavedAt: cleanUpdatedAt
      }
    };
    const prev = byId.get(normId);
    if (!prev || (Number(item.data.updatedAtMs) || 0) >= (Number(prev.data.updatedAtMs) || 0)) {
      byId.set(normId, item);
    }
  }
  return Array.from(byId.values());
};

const loadInitialWeddingData = (): WeddingData => {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const encodedParam = params.get('d');
      if (encodedParam) {
        const decoded = decodeWeddingDataFromParam(encodedParam);
        if (decoded) {
          return mergeWeddingData(decoded);
        }
      }

      const savedRaw = localStorage.getItem('wedding_custom_data');
      const localData = savedRaw ? mergeWeddingData(JSON.parse(savedRaw)) : null;

      const serverBootstrap = (window as any).__INITIAL_WEDDING_STATE__;
      if (serverBootstrap && serverBootstrap.data) {
        const serverData = mergeWeddingData(serverBootstrap.data);
        const serverMs = Number(serverData.updatedAtMs) || 0;
        const localMs = Number(localData?.updatedAtMs) || 0;

        if (!localData || serverMs >= localMs) {
          try {
            localStorage.setItem('wedding_custom_data', JSON.stringify(serverData));
          } catch {}
          return serverData;
        }
        return localData;
      }

      if (localData) {
        return localData;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_WEDDING_DATA;
};

const detectInitialSide = (initialData: WeddingData): SideType => {
  if (typeof window === 'undefined') return 'groom';
  const pathname = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const sideParam = (params.get('side') || '').toLowerCase();

  // 1. Explicit query parameter ?side=groom or ?side=bride always takes top priority
  if (sideParam === 'groom' || sideParam === 'nhatrai' || sideParam === 'nha-trai') {
    return 'groom';
  }
  if (sideParam === 'bride' || sideParam === 'nhagai' || sideParam === 'nha-gai') {
    return 'bride';
  }

  // 2. Explicit path /nha-trai vs /nha-gai
  if (pathname.includes('nha-trai') || pathname.includes('nhatrai')) {
    return 'groom';
  }
  if (pathname.includes('nha-gai') || pathname.includes('nhagai')) {
    return 'bride';
  }

  // 3. Slug /i/:slug matching (check exact custom slug and name order so quanghung-minhtue vs minhtue-quanghung never collide)
  if (pathname.startsWith('/i/')) {
    const rawSlug = pathname.replace(/^\/i\//, '').replace(/\/+$/, '');
    const cleanSlug = rawSlug.replace(/[^a-z0-9]/g, '');
    const brideSlug = (initialData.customSlugBride || 'minhtue-quanghung').toLowerCase().replace(/[^a-z0-9]/g, '');
    const groomSlug = (initialData.customSlugGroom || 'quanghung-minhtue').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanSlug && cleanSlug === groomSlug) {
      return 'groom';
    }
    if (cleanSlug && cleanSlug === brideSlug) {
      return 'bride';
    }

    const groomIdx = cleanSlug.indexOf('quanghung');
    const brideIdx = cleanSlug.indexOf('minhtue');
    if (groomIdx !== -1 && brideIdx !== -1) {
      return groomIdx < brideIdx ? 'groom' : 'bride';
    }

    if (
      cleanSlug.startsWith('minhtue') ||
      cleanSlug.includes('nhagai') ||
      cleanSlug.includes('bride') ||
      cleanSlug.includes('gai')
    ) {
      return 'bride';
    }
    if (
      cleanSlug.startsWith('quanghung') ||
      cleanSlug.includes('nhatrai') ||
      cleanSlug.includes('groom') ||
      cleanSlug.includes('trai')
    ) {
      return 'groom';
    }
    const serverBootstrap = (window as any).__INITIAL_WEDDING_STATE__;
    if (serverBootstrap?.side === 'bride') {
      return 'bride';
    }
  }
  return 'groom';
};

export default function App() {
  const [weddingData, setWeddingData] = useState<WeddingData>(loadInitialWeddingData);
  const hasLocalUserEditedRef = useRef<boolean>(false);
  const latestLocalUpdateMsRef = useRef<number>(Number(weddingData.updatedAtMs) || 0);

  // Multi-Project / Multi-Couple list for reusable Web Studio
  const [projects, setProjects] = useState<WeddingProject[]>(() => {
    try {
      const savedProjects = localStorage.getItem('wedding_projects_v1');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deduped = deduplicateProjectsList(parsed);
          if (deduped.length > 0) return deduped;
        }
      }
    } catch (e) {
      // ignore
    }
    const initial = loadInitialWeddingData();
    return [
      {
        id: 'card_default',
        title: `${initial.groomShortName || 'Quang Hưng'} & ${initial.brideShortName || 'Minh Tuệ'}`,
        updatedAt: new Date().toLocaleString('vi-VN'),
        data: initial
      }
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      return localStorage.getItem('wedding_active_project_id') || 'card_default';
    } catch {
      return 'card_default';
    }
  });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Detect whether current URL is a shared guest link (/nha-trai, /nha-gai, /i/:slug, ?side=groom, ?side=bride, or ?d=...)
  const [isGuestLink] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const sideParam = (params.get('side') || '').toLowerCase();
    return (
      pathname.includes('nha-trai') ||
      pathname.includes('nhatrai') ||
      pathname.includes('nha-gai') ||
      pathname.includes('nhagai') ||
      pathname.startsWith('/i/') ||
      sideParam === 'groom' ||
      sideParam === 'bride' ||
      sideParam === 'nhatrai' ||
      sideParam === 'nha-trai' ||
      sideParam === 'nhagai' ||
      sideParam === 'nha-gai' ||
      params.has('d')
    );
  });

  // Authentication & Modals
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  // Close auth dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setIsAuthDropdownOpen(false);
      }
    };
    if (isAuthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isAuthDropdownOpen]);

  // Current view mode: 'edit' (Chỉnh sửa) vs 'preview' (Xem trước)
  const [currentMode, setCurrentMode] = useState<'edit' | 'preview'>(isGuestLink ? 'preview' : 'edit');

  // Active side: 'groom' (Thếp Nhà Trai) vs 'bride' (Thếp Nhà Gái)
  const [activeSide, setActiveSide] = useState<SideType>(() => detectInitialSide(loadInitialWeddingData()));

  const [guestName, setGuestName] = useState<string>('');
  // When viewing card / guest link, default to the luxury "Mở thiệp" greeting cover!
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(true);
  const [phonePreviewCoverKey, setPhonePreviewCoverKey] = useState<number>(0);
  const [isPhoneCoverActive, setIsPhoneCoverActive] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isCustomLinkModalOpen, setIsCustomLinkModalOpen] = useState(false);
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(() => weddingData.autoScroll !== false);

  const triggerPhoneOpeningReview = (style?: CardOpeningStyle) => {
    if (style) {
      handleUpdateWeddingData({
        ...weddingData,
        cardOpeningStyle: style
      });
    }
    setPhonePreviewCoverKey((prev) => prev + 1);
    setIsPhoneCoverActive(true);
  };

  useEffect(() => {
    setIsAutoScrollEnabled(weddingData.autoScroll !== false);
  }, [weddingData.autoScroll]);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setIsAdminModalOpen(false);
    setCurrentMode('edit'); // Vào ngay cửa sổ chỉnh sửa cho cả Admin và User
    // Synchronize account projects & users with server across devices
    fetchAccountBackupFromServer(user.username).then((res) => {
      if (res?.users && Array.isArray(res.users) && res.users.length > 0) {
        const mergedUsers = mergeUsersByTimestamp(getStoredUsers(), res.users);
        saveStoredUsers(mergedUsers, { syncToServer: false });
        const freshUser = mergedUsers.find(
          (u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase()
        );
        if (freshUser) {
          setCurrentUser(freshUser);
          setCurrentUserStore(freshUser);
        }
      }

      if (res?.accountBackup && Array.isArray(res.accountBackup.projects) && res.accountBackup.projects.length > 0) {
        const rawRestored = res.accountBackup.projects.map((p: any) => {
          const mergedProjData = mergeWeddingData({ ...p.data, ownerUsername: user.username });
          return {
            id: p.id || `card_${Date.now()}`,
            title:
              p.title ||
              `${mergedProjData.groomShortName || mergedProjData.groomName || 'Chú Rể'} & ${mergedProjData.brideShortName || mergedProjData.brideName || 'Cô Dâu'}`,
            updatedAt: p.updatedAt || new Date().toLocaleString('vi-VN'),
            data: mergedProjData
          };
        });
        const restoredProjects = deduplicateProjectsList(rawRestored);
        const requestedActiveId = res.accountBackup.activeProjectId || restoredProjects[0]?.id || 'card_default';
        const activeProj =
          restoredProjects.find((p: any) => p.id === requestedActiveId) || restoredProjects[0];
        const nextActiveId = activeProj ? activeProj.id : 'card_default';

        hasLocalUserEditedRef.current = false;
        setProjects(restoredProjects);
        setActiveProjectId(nextActiveId);
        if (activeProj) {
          latestLocalUpdateMsRef.current = Number(activeProj.data.updatedAtMs) || Date.now();
          setWeddingData(activeProj.data);
          saveStateToIndexedDB('wedding_custom_data', activeProj.data);
          saveStateToIndexedDB('wedding_projects_v1', restoredProjects);
          try {
            localStorage.setItem('wedding_projects_v1', JSON.stringify(restoredProjects));
            localStorage.setItem('wedding_active_project_id', nextActiveId);
            localStorage.setItem('wedding_custom_data', JSON.stringify(activeProj.data));
          } catch {}
        }
      } else {
        // Stamp ownerUsername on current local projects and sync to server backup
        const stampedProjects = deduplicateProjectsList(
          projects.map((p) => ({
            ...p,
            data: mergeWeddingData({ ...p.data, ownerUsername: user.username })
          }))
        );
        setProjects(stampedProjects);
        const activeProj = stampedProjects.find((p) => p.id === activeProjectId) || stampedProjects[0];
        const effectiveActiveId = activeProj ? activeProj.id : activeProjectId;
        if (activeProj) {
          setActiveProjectId(effectiveActiveId);
          setWeddingData(activeProj.data);
          saveStateToIndexedDB('wedding_custom_data', activeProj.data);
          saveStateToIndexedDB('wedding_projects_v1', stampedProjects);
        }
        syncAccountWithServer({
          username: user.username,
          projects: stampedProjects,
          activeProjectId: effectiveActiveId,
          users: getStoredUsers(),
          forceSync: true
        });
      }
    });
  };

  const handleLogout = () => {
    setCurrentUserStore(null);
    setCurrentUser(null);
  };

  // Sync audio track metadata with player (do NOT auto-play while in edit mode)
  useEffect(() => {
    acousticAudio.setTrack(weddingData.selectedMusicId || 'acoustic-romance', weddingData.customAudioUrl);
  }, [weddingData.selectedMusicId, weddingData.customAudioUrl]);

  useEffect(() => {
    const unsubscribe = acousticAudio.subscribe((playing) => {
      setIsPlayingMusic(playing);
    });
    return unsubscribe;
  }, []);

  // Fetch latest server-persisted wedding data & account sync on mount (so mobile phones & computers stay 100% in sync)
  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    const slug = pathname.startsWith('/i/') ? pathname.replace(/^\/i\//, '').replace(/\/+$/, '') : '';
    const detectedSide = detectInitialSide(weddingData);

    if (isGuestLink) {
      setActiveSide(detectedSide);
      const params = new URLSearchParams();
      if (slug) params.set('slug', slug);
      params.set('side', detectedSide);
      const qs = params.toString();

      fetch(`/api/wedding-data${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          if (res && res.data) {
            const merged = mergeWeddingData(res.data);
            latestLocalUpdateMsRef.current = Math.max(latestLocalUpdateMsRef.current, Number(merged.updatedAtMs) || 0);
            setWeddingData(merged);
            setIsAutoScrollEnabled(merged.autoScroll !== false);
            setActiveSide(detectInitialSide(merged));
          }
        })
        .catch(() => {
          // ignore
        });
      return;
    }

    // Studio mode: restore from IndexedDB & Server Account Backup without competing race conditions
    (async () => {
      const idbData = await loadStateFromIndexedDB<WeddingData>('wedding_custom_data');
      const idbProjects = await loadStateFromIndexedDB<WeddingProject[]>('wedding_projects_v1');

      const effectiveUsername = currentUser?.username || 'admin@123';
      const res = await fetchAccountBackupFromServer(effectiveUsername);

      if (res?.users && Array.isArray(res.users) && res.users.length > 0) {
        const mergedUsers = mergeUsersByTimestamp(getStoredUsers(), res.users);
        saveStoredUsers(mergedUsers, { syncToServer: false });

        if (currentUser) {
          const freshCurrent = mergedUsers.find(
            (u) => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          if (freshCurrent) {
            setCurrentUser(freshCurrent);
            setCurrentUserStore(freshCurrent);
          }
        }
      }

      if (hasLocalUserEditedRef.current) return;

      if (res?.accountBackup && Array.isArray(res.accountBackup.projects) && res.accountBackup.projects.length > 0) {
        const rawRestored = res.accountBackup.projects.map((p: any) => {
          const pData = mergeWeddingData({ ...p.data, ownerUsername: effectiveUsername });
          return {
            id: p.id || `card_${Date.now()}`,
            title:
              p.title ||
              `${pData.groomShortName || pData.groomName || 'Chú Rể'} & ${pData.brideShortName || pData.brideName || 'Cô Dâu'}`,
            updatedAt: p.updatedAt || new Date().toLocaleString('vi-VN'),
            data: pData
          };
        });
        const restoredProjects = deduplicateProjectsList(rawRestored);
        const requestedActiveId = res.accountBackup.activeProjectId || restoredProjects[0]?.id || 'card_default';
        const activeProj =
          restoredProjects.find((p: any) => p.id === requestedActiveId) || restoredProjects[0];
        const nextActiveId = activeProj ? activeProj.id : 'card_default';

        const serverMs = Number(activeProj?.data?.updatedAtMs) || 0;
        const idbMs = Number(idbData?.updatedAtMs) || 0;

        if (idbData && idbMs > serverMs && Array.isArray(idbProjects) && idbProjects.length > 0) {
          const cleanIdbData = mergeWeddingData(idbData);
          const cleanIdbProjects = deduplicateProjectsList(idbProjects);
          setProjects(cleanIdbProjects);
          setWeddingData(cleanIdbData);
          syncWeddingDataToServer(cleanIdbData, {
            username: effectiveUsername,
            projects: cleanIdbProjects,
            activeProjectId
          });
          return;
        }

        setProjects(restoredProjects);
        setActiveProjectId(nextActiveId);
        if (activeProj) {
          latestLocalUpdateMsRef.current = Math.max(latestLocalUpdateMsRef.current, serverMs);
          setWeddingData(activeProj.data);
          setIsAutoScrollEnabled(activeProj.data.autoScroll !== false);
          saveStateToIndexedDB('wedding_custom_data', activeProj.data);
          saveStateToIndexedDB('wedding_projects_v1', restoredProjects);
        }
        try {
          localStorage.setItem('wedding_projects_v1', JSON.stringify(restoredProjects));
          localStorage.setItem('wedding_active_project_id', nextActiveId);
          if (activeProj) {
            localStorage.setItem('wedding_custom_data', JSON.stringify(activeProj.data));
          }
        } catch {}
      } else if (res?.defaultData) {
        const mergedDefault = mergeWeddingData(res.defaultData);
        setWeddingData(mergedDefault);
        saveStateToIndexedDB('wedding_custom_data', mergedDefault);
        try {
          localStorage.setItem('wedding_custom_data', JSON.stringify(mergedDefault));
        } catch {}
      }
    })();
  }, [isGuestLink]);

  // Real-time active usage timer for logged-in user session (local only, does not overwrite server profile)
  useEffect(() => {
    if (!currentUser) return;

    const timer = setInterval(() => {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          todaySeconds: (prev.todaySeconds || 0) + 1
        };
        const users = getStoredUsers();
        const nextUsers = users.map((u) => {
          if (u.id === prev.id || u.username.toLowerCase() === prev.username.toLowerCase()) {
            return {
              ...u,
              ...updated,
              avatarUrl: prev.avatarUrl || u.avatarUrl
            };
          }
          return u;
        });
        saveStoredUsers(nextUsers, { syncToServer: false });
        setCurrentUserStore(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser?.id]);

  // Check if link or card is a 3-day trial card that has expired
  const isTrialExpired = (() => {
    if (currentUser?.role === 'admin') return false;
    if (currentUser?.expiryDate && !currentUser.expiryDate.includes('dùng thử') && !currentUser.expiryDate.includes('3 ngày')) {
      return false;
    }
    if (weddingData.isExtended) return false;
    const created = weddingData.createdTime;
    if (!created) return false;
    const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
    return ageDays > 3;
  })();

  const isPetalsActive = weddingData.fallingPetals !== false;
  const [copiedSide, setCopiedSide] = useState<'groom' | 'bride' | null>(null);
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('desktop');
  const phoneContainerRef = useRef<HTMLDivElement | null>(null);

  // Read URL pathname and query parameter for personalized guest name and side (/nha-trai, /nha-gai, /i/:slug)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('to') || params.get('guest');
    if (guestParam) {
      setGuestName(guestParam);
    }
    setActiveSide(detectInitialSide(weddingData));
  }, []);

  // Sync document title and meta share tags dynamically per active side (Nhà Trai vs Nhà Gái)
  useEffect(() => {
    const isGroom = activeSide === 'groom';
    const groomShort = weddingData.groomShortName || weddingData.groomName || 'Quang Hưng';
    const brideShort = weddingData.brideShortName || weddingData.brideName || 'Minh Tuệ';

    const party = isGroom ? weddingData.partyGroom : weddingData.partyBride;
    const pType = getPartyTypeLabel(party);
    const dateStr = formatVietnameseSolarDate(party.date);
    const timeStr = (party.time === '22:00' ? '10:00' : party.time) || (isGroom ? '16:00' : '10:00');
    const venue = party.venueAddress || '';

    const defaultTitle = isGroom
      ? `Thiệp Mời ${pType.labelCap} - ${groomShort} & ${brideShort}`
      : `Thiệp Mời ${pType.labelCap} - ${brideShort} & ${groomShort}`;

    const defaultDesc = isGroom
      ? `Kính mời quý khách tới dự ${pType.labelLower} của ${groomShort} & ${brideShort} vào lúc ${timeStr} ngày ${dateStr} tại ${venue}`
      : `Kính mời quý khách tới dự ${pType.labelLower} của ${brideShort} & ${groomShort} vào lúc ${timeStr} ngày ${dateStr} tại ${venue}`;

    const sideShare = isGroom
      ? (weddingData.shareGroom || {
          title: defaultTitle,
          description: defaultDesc,
          dateText: weddingData.shareDateText,
          coverPhotoUrl: weddingData.shareCoverPhotoUrl
        })
      : (weddingData.shareBride || {
          title: defaultTitle,
          description: defaultDesc,
          dateText: weddingData.shareDateText,
          coverPhotoUrl: weddingData.shareCoverPhotoUrl
        });

    let displayTitle = (sideShare.title && sideShare.title.trim() !== '') ? sideShare.title.trim() : defaultTitle;

    let displayDesc = sideShare.description || defaultDesc;
    displayDesc = displayDesc
      .replace(/Thân mời quý khách đến dự/gi, 'Kính mời quý khách tới dự')
      .replace(/22:00/g, '10:00');
    const rawCoverImg = sideShare.coverPhotoUrl || weddingData.heroPhotoUrl || DEFAULT_WEDDING_DATA.shareCoverPhotoUrl;
    const absoluteCoverImg = toAbsoluteUrl(rawCoverImg, window.location.origin);

    document.title = displayTitle;

    const metaUpdates: [string, string][] = [
      ['meta[property="og:title"]', displayTitle],
      ['meta[property="og:description"]', displayDesc],
      ['meta[property="og:image"]', absoluteCoverImg],
      ['meta[name="twitter:title"]', displayTitle],
      ['meta[name="twitter:description"]', displayDesc],
      ['meta[name="twitter:image"]', absoluteCoverImg]
    ];

    metaUpdates.forEach(([selector, content]) => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute('content', content);
      }
    });
  }, [
    activeSide,
    weddingData.groomShortName,
    weddingData.groomName,
    weddingData.brideShortName,
    weddingData.brideName,
    weddingData.shareGroom,
    weddingData.shareBride,
    weddingData.shareTitle,
    weddingData.shareDescription,
    weddingData.shareCoverPhotoUrl,
    weddingData.shareDateText,
    weddingData.heroPhotoUrl
  ]);

  // Subscribe to audio player state so UI is always 100% in sync
  useEffect(() => {
    const unsub = acousticAudio.subscribe((playing) => {
      setIsPlayingMusic(playing);
    });
    return unsub;
  }, []);

  // Chỉ phát nhạc ở trang xem trước (preview) hoặc khi vào link thiệp cưới (isGuestLink).
  // Khi chuyển sang trang chỉnh sửa (edit), lập tức tắt/dừng nhạc hoàn toàn.
  useEffect(() => {
    const isPreview = currentMode === 'preview' || isGuestLink;

    if (isPreview) {
      if (weddingData.autoPlayMusic !== false) {
        acousticAudio.setTrack(weddingData.selectedMusicId || 'acoustic-romance', weddingData.customAudioUrl);
        acousticAudio.play();
      }
    } else {
      // Chuyển sang trang chỉnh sửa -> Tắt nhạc ngay lập tức
      acousticAudio.pause();
    }
  }, [currentMode, isGuestLink, weddingData.autoPlayMusic, weddingData.selectedMusicId, weddingData.customAudioUrl]);

  // High-precision 60fps Auto-Scroll (works on iOS Safari, Android Chrome, Zalo & Facebook WebViews)
  useEffect(() => {
    if (currentMode !== 'preview' || isCoverOpen || !isAutoScrollEnabled) return;

    let animId: number | null = null;
    let isUserInteracting = false;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;
    let hasStarted = false;
    let lastFrameTime = 0;
    let scrollAccumulator = 0;
    let touchStartY = 0;

    // Speed in pixels per second (~62 px/s is smooth and easy to read on mobile & desktop)
    const SPEED_PX_PER_SEC = 62;

    const startTimer = setTimeout(() => {
      hasStarted = true;
      lastFrameTime = performance.now();
      startScrollLoop();
    }, 900);

    const startScrollLoop = () => {
      if (animId !== null) return;

      const step = (now: number) => {
        if (isUserInteracting) {
          animId = null;
          return;
        }

        const dt = lastFrameTime ? Math.min(64, Math.max(0, now - lastFrameTime)) : 16;
        lastFrameTime = now;

        const scrollEl = document.scrollingElement || document.documentElement;
        const currentScroll = window.scrollY || scrollEl.scrollTop || 0;
        const maxScroll = Math.max(0, scrollEl.scrollHeight - window.innerHeight);

        if (maxScroll > 10 && currentScroll < maxScroll - 2) {
          scrollAccumulator += (SPEED_PX_PER_SEC * dt) / 1000;
          const intStep = Math.floor(scrollAccumulator);
          if (intStep >= 1) {
            scrollAccumulator -= intStep;
            window.scrollBy(0, intStep);
            if ((window.scrollY || scrollEl.scrollTop) === currentScroll) {
              scrollEl.scrollTop = currentScroll + intStep;
            }
          }
          animId = requestAnimationFrame(step);
        } else {
          animId = null;
        }
      };

      lastFrameTime = performance.now();
      animId = requestAnimationFrame(step);
    };

    const pauseForManualScroll = () => {
      isUserInteracting = true;
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isUserInteracting = false;
        lastFrameTime = performance.now();
        scrollAccumulator = 0;
        if (hasStarted) {
          startScrollLoop();
        }
      }, 2600);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY ?? touchStartY;
      if (Math.abs(currentY - touchStartY) > 6) {
        pauseForManualScroll();
      }
    };

    const handleTouchEnd = () => {
      if (isUserInteracting) {
        pauseForManualScroll();
      }
    };

    window.addEventListener('wheel', pauseForManualScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', pauseForManualScroll, { passive: true });

    return () => {
      clearTimeout(startTimer);
      if (resumeTimeout) clearTimeout(resumeTimeout);
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('wheel', pauseForManualScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('keydown', pauseForManualScroll);
    };
  }, [currentMode, activeSide, isCoverOpen, isAutoScrollEnabled]);

  const syncProjectsToStorage = (nextProjects: WeddingProject[], nextActiveId?: string) => {
    setProjects(nextProjects);
    saveStateToIndexedDB('wedding_projects_v1', nextProjects);
    try {
      localStorage.setItem('wedding_projects_v1', JSON.stringify(nextProjects));
      if (nextActiveId) {
        localStorage.setItem('wedding_active_project_id', nextActiveId);
      }
    } catch (e) {
      // ignore localStorage quota errors (IndexedDB and server hold the full data)
    }
  };

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdateWeddingData = (newData: WeddingData) => {
    const nowMs = Date.now();
    hasLocalUserEditedRef.current = true;
    latestLocalUpdateMsRef.current = nowMs;

    const cleaned = mergeWeddingData({
      ...newData,
      ownerUsername: currentUser?.username || newData.ownerUsername || 'admin@123',
      updatedAtMs: nowMs
    });
    setWeddingData(cleaned);
    saveStateToIndexedDB('wedding_custom_data', cleaned);

    const hasMatchingProject = projects.some((p) => p.id === activeProjectId);
    const effectiveActiveId = hasMatchingProject ? activeProjectId : (projects[0]?.id || 'card_default');
    if (effectiveActiveId !== activeProjectId) {
      setActiveProjectId(effectiveActiveId);
    }

    const updatedList =
      projects.length > 0
        ? projects.map((p) =>
            p.id === effectiveActiveId
              ? {
                  ...p,
                  title: `${cleaned.groomShortName || cleaned.groomName} & ${cleaned.brideShortName || cleaned.brideName}`,
                  updatedAt: new Date().toLocaleString('vi-VN'),
                  data: cleaned
                }
              : p
          )
        : [
            {
              id: effectiveActiveId,
              title: `${cleaned.groomShortName || cleaned.groomName} & ${cleaned.brideShortName || cleaned.brideName}`,
              updatedAt: new Date().toLocaleString('vi-VN'),
              data: cleaned
            }
          ];

    try {
      localStorage.setItem('wedding_custom_data', JSON.stringify(cleaned));
    } catch (e) {
      // ignore
    }
    syncProjectsToStorage(updatedList, effectiveActiveId);

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncWeddingDataToServer(cleaned, {
        username: currentUser?.username || 'admin@123',
        projects: updatedList,
        activeProjectId: effectiveActiveId
      });
    }, 150);
  };

  const handleSelectProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const nowMs = Date.now();
    hasLocalUserEditedRef.current = true;
    latestLocalUpdateMsRef.current = nowMs;
    const stampedData = mergeWeddingData({
      ...target.data,
      ownerUsername: currentUser?.username || target.data.ownerUsername || 'admin@123',
      updatedAtMs: nowMs
    });
    const updatedList = projects.map((p) => (p.id === id ? { ...p, data: stampedData } : p));
    setActiveProjectId(id);
    setWeddingData(stampedData);
    saveStateToIndexedDB('wedding_custom_data', stampedData);
    syncProjectsToStorage(updatedList, id);
    syncWeddingDataToServer(stampedData, {
      username: currentUser?.username || 'admin@123',
      projects: updatedList,
      activeProjectId: id
    });
    try {
      localStorage.setItem('wedding_active_project_id', id);
      localStorage.setItem('wedding_custom_data', JSON.stringify(stampedData));
    } catch (e) {}
  };

  const handleCreateProject = async (newProj: WeddingProject) => {
    const nowMs = Date.now();
    hasLocalUserEditedRef.current = true;
    latestLocalUpdateMsRef.current = nowMs;

    const mergedData = mergeWeddingData({
      ...newProj.data,
      updatedAtMs: nowMs,
      ownerUsername: currentUser?.username || 'admin@123'
    });

    const coupleKey = `${(mergedData.groomName || '').toLowerCase().trim()}_${(mergedData.brideName || '').toLowerCase().trim()}`;
    const existingSameCouple = projects.find(
      (p) =>
        `${(p.data?.groomName || '').toLowerCase().trim()}_${(p.data?.brideName || '').toLowerCase().trim()}` ===
        coupleKey
    );

    const targetId = existingSameCouple ? existingSameCouple.id : newProj.id || `card_${nowMs}`;

    const stampedProj: WeddingProject = {
      ...newProj,
      id: targetId,
      title:
        newProj.title ||
        `${mergedData.groomShortName || mergedData.groomName || 'Chú Rể'} & ${mergedData.brideShortName || mergedData.brideName || 'Cô Dâu'}`,
      updatedAt: new Date().toLocaleString('vi-VN'),
      data: mergedData
    };
    const nextList = [stampedProj, ...projects.filter((p) => p.id !== targetId)];
    setActiveProjectId(stampedProj.id);
    setWeddingData(stampedProj.data);
    saveStateToIndexedDB('wedding_custom_data', stampedProj.data);
    syncProjectsToStorage(nextList, stampedProj.id);
    try {
      localStorage.setItem('wedding_active_project_id', stampedProj.id);
      localStorage.setItem('wedding_custom_data', JSON.stringify(stampedProj.data));
    } catch (e) {}
    setCurrentMode('edit');

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedMessage(`Đã nhập & đồng bộ thiệp lúc ${timeStr}`);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);

    const serverCleaned = await syncWeddingDataToServer(stampedProj.data, {
      username: currentUser?.username || 'admin@123',
      projects: nextList,
      activeProjectId: stampedProj.id
    });
    if (serverCleaned) {
      const cleanMerged = mergeWeddingData(serverCleaned);
      setWeddingData(cleanMerged);
      saveStateToIndexedDB('wedding_custom_data', cleanMerged);
      const updatedAfterServer = nextList.map((p) =>
        p.id === stampedProj.id ? { ...p, data: cleanMerged } : p
      );
      syncProjectsToStorage(updatedAfterServer, stampedProj.id);
      try {
        localStorage.setItem('wedding_custom_data', JSON.stringify(cleanMerged));
      } catch {}
    }
  };

  const handleDuplicateProject = (proj: WeddingProject) => {
    const dupData = { ...JSON.parse(JSON.stringify(proj.data)), updatedAtMs: Date.now() };
    const dup: WeddingProject = {
      id: `card_${Date.now()}`,
      title: `${proj.title} (Bản sao)`,
      updatedAt: new Date().toLocaleString('vi-VN'),
      data: dupData
    };
    const nextList = [dup, ...projects];
    setActiveProjectId(dup.id);
    setWeddingData(dup.data);
    saveStateToIndexedDB('wedding_custom_data', dup.data);
    syncProjectsToStorage(nextList, dup.id);
    syncWeddingDataToServer(dup.data, {
      username: currentUser?.username || 'admin@123',
      projects: nextList,
      activeProjectId: dup.id
    });
    try {
      localStorage.setItem('wedding_custom_data', JSON.stringify(dup.data));
    } catch (e) {}
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const target = projects.find((p) => p.id === id);
    if (!window.confirm(`Bạn có chắc muốn xoá bộ thiệp "${target?.title || ''}" không?`)) return;
    const remaining = projects.filter((p) => p.id !== id);
    const nextActive = id === activeProjectId ? remaining[0] : projects.find((p) => p.id === activeProjectId) || remaining[0];
    const stampedActiveData = { ...nextActive.data, updatedAtMs: Date.now() };
    const finalRemaining = remaining.map((p) => (p.id === nextActive.id ? { ...p, data: stampedActiveData } : p));
    setActiveProjectId(nextActive.id);
    setWeddingData(stampedActiveData);
    saveStateToIndexedDB('wedding_custom_data', stampedActiveData);
    syncProjectsToStorage(finalRemaining, nextActive.id);
    syncWeddingDataToServer(stampedActiveData, {
      username: currentUser?.username || 'admin@123',
      projects: finalRemaining,
      activeProjectId: nextActive.id
    });
    try {
      localStorage.setItem('wedding_custom_data', JSON.stringify(stampedActiveData));
    } catch (e) {}
  };

  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [lastSavedMessage, setLastSavedMessage] = useState<string>('');

  const handleExplicitSave = async () => {
    try {
      const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const nowMs = Date.now();
      hasLocalUserEditedRef.current = true;
      latestLocalUpdateMsRef.current = nowMs;
      const stampedData = mergeWeddingData({
        ...weddingData,
        ownerUsername: currentUser?.username || weddingData.ownerUsername || 'admin@123',
        updatedAtMs: nowMs
      });
      setWeddingData(stampedData);
      saveStateToIndexedDB('wedding_custom_data', stampedData);
      const updatedList = projects.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              title: `${stampedData.groomShortName || stampedData.groomName} & ${stampedData.brideShortName || stampedData.brideName}`,
              updatedAt: new Date().toLocaleString('vi-VN'),
              data: stampedData
            }
          : p
      );
      try {
        localStorage.setItem('wedding_custom_data', JSON.stringify(stampedData));
      } catch {}
      syncProjectsToStorage(updatedList, activeProjectId);
      await syncWeddingDataToServer(stampedData, {
        username: currentUser?.username || 'admin@123',
        projects: updatedList,
        activeProjectId
      });
      setLastSavedMessage(`Đã lưu & đồng bộ lúc ${nowTime}`);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
    } catch (e) {
      console.error('Save error', e);
    }
  };

  const handlePublishCard = async (dataToPublish?: WeddingData): Promise<WeddingData | null> => {
    const nowMs = Date.now();
    hasLocalUserEditedRef.current = true;
    latestLocalUpdateMsRef.current = nowMs;
    const targetData = mergeWeddingData({
      ...(dataToPublish || weddingData),
      ownerUsername: currentUser?.username || weddingData.ownerUsername || 'admin@123',
      updatedAtMs: nowMs
    });
    const res = await publishWeddingCardToServer(targetData, {
      username: currentUser?.username || 'admin@123',
      projects,
      activeProjectId
    });
    const finalData = res?.data ? mergeWeddingData(res.data) : {
      ...targetData,
      isPublished: true,
      publishedAt: new Date().toLocaleString('vi-VN'),
      publishedVersion: (targetData.publishedVersion || 0) + 1
    };

    setWeddingData(finalData);
    saveStateToIndexedDB('wedding_custom_data', finalData);
    try {
      localStorage.setItem('wedding_custom_data', JSON.stringify(finalData));
    } catch {}
    const updatedList = projects.map((p) =>
      p.id === activeProjectId
        ? {
            ...p,
            title: `${finalData.groomShortName || finalData.groomName} & ${finalData.brideShortName || finalData.brideName}`,
            updatedAt: finalData.publishedAt || new Date().toLocaleString('vi-VN'),
            data: finalData
          }
        : p
    );
    syncProjectsToStorage(updatedList, activeProjectId);

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedMessage(`Đã xuất thiệp & đồng bộ lúc ${timeStr}`);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2800);
    return finalData;
  };

  const handleResetDefaultData = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại dữ liệu thiệp cưới gốc ban đầu không? Mọi nội dung tùy chỉnh của bộ thiệp này sẽ được thiết lập lại.')) {
      handleUpdateWeddingData(DEFAULT_WEDDING_DATA);
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedMessage(`Đã khôi phục gốc lúc ${timeStr}`);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
    }
  };

  const handleToggleTheme = (theme: ThemeTemplate) => {
    handleUpdateWeddingData({ ...weddingData, themeTemplate: theme });
  };

  const handleToggleMusic = () => {
    const playing = acousticAudio.toggle();
    setIsPlayingMusic(playing);
  };

  const handleSwitchToPreview = () => {
    setCurrentMode('preview');
    setIsCoverOpen(true);
    setIsAutoScrollEnabled(weddingData.autoScroll !== false);
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (weddingData.autoPlayMusic !== false) {
      acousticAudio.setTrack(weddingData.selectedMusicId || 'acoustic-romance', weddingData.customAudioUrl);
      acousticAudio.play();
    }
  };

  // Copy direct short, clean link (/nha-trai, /nha-gai, or /i/:slug) and publish/sync data to server
  const handleCopySideLink = async (side: SideType) => {
    const synced = await handlePublishCard(weddingData);
    const url = buildShareableSideUrl(window.location.origin, side, synced || weddingData, {
      guestName
    });
    navigator.clipboard.writeText(url);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 2200);
  };

  const currentTrack = MUSIC_PLAYLIST.find((m) => m.id === weddingData.selectedMusicId) || MUSIC_PLAYLIST[0];

  return (
    <div className="min-h-screen bg-[#EDE7DE] text-stone-900 font-sans antialiased selection:bg-rose-100 selection:text-rose-900 flex flex-col">
      
      {/* ================= MASTER TOP NAVIGATION BAR (Hidden when guest clicks shared link) ================= */}
      {!isGuestLink && (
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4 overflow-visible relative">
          
          {/* Left Multi-Project Manager & Template Picker Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C3766] text-white hover:bg-blue-950 text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              title="Quản lý danh sách thiệp & tạo thiệp cưới mới cho nhiều cặp đôi"
            >
              <FolderHeart className="w-3.5 h-3.5 text-amber-300" />
              <span>Danh Sách Thiệp</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-semibold">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              title="Mở kho mẫu thiệp để chọn phong cách"
            >
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span>Kho Mẫu Thiệp</span>
            </button>
          </div>

          {/* Center Mode Switcher: [ Chỉnh sửa ] ↔ [ Xem trước ] */}
          <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 shadow-inner shrink-0 whitespace-nowrap">
            <button
              onClick={() => {
                setCurrentMode('edit');
                acousticAudio.pause();
              }}
              className={`px-4 sm:px-6 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                currentMode === 'edit'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
            <button
              onClick={handleSwitchToPreview}
              className={`px-4 sm:px-6 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                currentMode === 'preview'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước</span>
            </button>
          </div>

          {/* Right Action Buttons: Save, Music & Account Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Explicit Save button ("Lưu thông tin thiệp") */}
            <button
              onClick={handleExplicitSave}
              title="Lưu thông tin thiệp và đồng bộ lên hệ thống"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                isSavedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Đã lưu &amp; đồng bộ!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lưu thông tin thiệp</span>
                </>
              )}
            </button>

            {/* Music Trigger */}
            <button
              onClick={() => setIsMusicModalOpen(true)}
              title={`Nhạc nền: ${currentTrack.title}`}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Music className={`w-3.5 h-3.5 ${isPlayingMusic ? 'text-pink-600 animate-spin' : ''}`} />
              <span className="hidden lg:inline truncate max-w-[120px]">{currentTrack.title}</span>
            </button>

            {/* Unified Auth Dropdown Menu (Đăng Nhập / Đăng Ký & Quản Trị / Tài Khoản) */}
            <div className="relative shrink-0" ref={authDropdownRef}>
              {!currentUser ? (
                /* Unauthenticated: Single 'Đăng Nhập / Đăng Ký' button */
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAuthDropdownOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-stone-100 text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap border border-stone-700 active:scale-95 select-none"
                  title="Đăng nhập hoặc Đăng ký tài khoản"
                  aria-expanded={isAuthDropdownOpen}
                >
                  <User className="w-3.5 h-3.5 text-stone-300" />
                  <span>Đăng Nhập / Đăng Ký</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-300 transition-transform duration-200 ${isAuthDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                /* Authenticated: Pill capsule badge matching the UI/UX design (Avatar + Truncated Name + ADMIN badge) */
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAuthDropdownOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5E5E5] hover:bg-[#DCDCDC] text-stone-900 text-xs font-semibold border border-stone-300 transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 select-none"
                  title="Menu tài khoản cá nhân & quản trị"
                  aria-expanded={isAuthDropdownOpen}
                >
                  <UserAvatar user={currentUser} size="xs" />
                  <span className="max-w-[130px] truncate text-stone-900 font-bold">{currentUser.fullName}</span>
                  {currentUser.role === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-[#FF9800] text-stone-950 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-600 transition-transform duration-200 ${isAuthDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Dropdown Menu Container */}
              {isAuthDropdownOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-stone-200/90 py-2 z-[100] divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-150"
                  style={{ minWidth: '270px' }}
                >
                  {!currentUser ? (
                    /* Dropdown list for Guest / Unauthenticated users */
                    <div className="p-1 space-y-1">
                      <div className="px-3 py-2 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-800">Tài khoản &amp; Hệ thống</p>
                        <p className="text-[11px] text-stone-500">Đăng nhập để đồng bộ &amp; quản lý thiệp cưới</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthDropdownOpen(false);
                          setAuthInitialTab('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <LogIn className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">Đăng Nhập</div>
                          <div className="text-[10px] text-stone-500">Truy cập tài khoản cá nhân</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthDropdownOpen(false);
                          setAuthInitialTab('register');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">Đăng Ký Tài Khoản</div>
                          <div className="text-[10px] text-stone-500">Tạo tài khoản mới miễn phí</div>
                        </div>
                      </button>
                    </div>
                  ) : (
                    /* Dropdown list for Authenticated users */
                    <>
                      {/* User Info Header */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <UserAvatar user={currentUser} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-stone-900 truncate">{currentUser.fullName}</p>
                            {currentUser.role === 'admin' ? (
                              <span className="px-1.5 py-0.2 rounded-sm bg-[#FF9800] text-stone-950 text-[9px] font-black uppercase shrink-0">
                                ADMIN
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 text-[9px] font-semibold uppercase shrink-0">
                                USER
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate">@{currentUser.username}</p>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="p-1.5 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAuthDropdownOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <User className="w-4 h-4 text-stone-500" />
                          <div className="flex-1">
                            <div className="font-semibold text-stone-900">Hồ sơ &amp; Đổi mật khẩu</div>
                            <div className="text-[10px] text-stone-500">Xem và cập nhật thông tin cá nhân</div>
                          </div>
                        </button>

                        {/* Admin specific action: Quản lý tài khoản */}
                        {currentUser.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAuthDropdownOpen(false);
                              setIsAdminModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100/90 rounded-xl transition-colors cursor-pointer text-left border border-amber-200/70"
                          >
                            <Shield className="w-4 h-4 text-amber-800 shrink-0" />
                            <div className="flex-1">
                              <div>Quản lý tài khoản</div>
                              <div className="text-[10px] font-normal text-amber-800/80">Bảng Quản Trị &amp; Cấp quyền</div>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Integrated Logout Option at Bottom */}
                      <div className="p-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAuthDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Floating Petals Animation */}
      <FallingPetals active={isPetalsActive} />

      {/* ================= MAIN CONTENT AREA ================= */}
      {currentMode === 'edit' && !isGuestLink ? (
        // EDIT MODE: Desktop Split View (Editor on Left, Live Phone Preview on Right)
        <div className="flex-1 w-full max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-8 items-start">
          
          {/* Left Column: Full Wedding Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  Thiết Lập Thiệp: {weddingData.groomShortName || weddingData.groomName || 'Chú Rể'} & {weddingData.brideShortName || weddingData.brideName || 'Cô Dâu'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      setAuthInitialTab('register');
                      setIsAuthModalOpen(true);
                      return;
                    }
                    setIsProjectModalOpen(true);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1C3766] font-bold border border-blue-200 cursor-pointer"
                >
                  + Đổi / Tạo cặp đôi mới
                </button>
              </div>
              <span className="text-xs text-stone-500 hidden sm:inline">
                {lastSavedMessage || 'Thay đổi tự động lưu & xem trước tức thì'}
              </span>
            </div>

            <WeddingEditor
              data={weddingData}
              onChange={(newData) => {
                if (!currentUser) {
                  setAuthInitialTab('login');
                  setIsAuthModalOpen(true);
                  return;
                }
                handleUpdateWeddingData(newData);
              }}
              activeSide={activeSide}
              onChangeSide={setActiveSide}
              onOpenMusicModal={() => {
                if (!currentUser) {
                  setAuthInitialTab('login');
                  setIsAuthModalOpen(true);
                  return;
                }
                setIsMusicModalOpen(true);
              }}
              onOpenTemplateModal={() => {
                if (!currentUser) {
                  setAuthInitialTab('login');
                  setIsAuthModalOpen(true);
                  return;
                }
                setIsTemplateModalOpen(true);
              }}
              onOpenPublishModal={() => {
                setIsPublishModalOpen(true);
              }}
              onSave={() => {
                if (!currentUser) {
                  setAuthInitialTab('login');
                  setIsAuthModalOpen(true);
                  return;
                }
                handleExplicitSave();
              }}
              onResetDefault={handleResetDefaultData}
              onSwitchToPreview={handleSwitchToPreview}
              currentUser={currentUser}
              onRequireAuth={(tab) => {
                setAuthInitialTab(tab);
                setIsAuthModalOpen(true);
              }}
              onImportJsonData={(importedData) => {
                handleUpdateWeddingData(importedData);
                const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setLastSavedMessage(`Đã nhập file .JSON & đồng bộ lúc ${timeStr}`);
                setIsSavedRecently(true);
                setTimeout(() => setIsSavedRecently(false), 3000);
              }}
              onTestOpeningStyle={(style) => {
                triggerPhoneOpeningReview(style);
              }}
              onOpenGuestListModal={() => setIsGuestListModalOpen(true)}
            />
          </div>

          {/* Right Column: Live Phone Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 hidden lg:block sticky top-14 space-y-2">
            {/* Compact Header & Side Switcher merged into 1 card */}
            <div className="max-w-[390px] mx-auto bg-white p-2 rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                  XEM TRƯỚC THỰC TẾ ({activeSide === 'groom' ? 'NHÀ TRAI' : 'NHÀ GÁI'})
                </span>
                <button
                  onClick={handleSwitchToPreview}
                  className="text-[11px] text-pink-600 hover:text-pink-800 font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem toàn màn hình</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setActiveSide('groom')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeSide === 'groom'
                      ? 'bg-[#1C3766] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>🤵 Thếp Nhà Trai</span>
                </button>
                <button
                  onClick={() => setActiveSide('bride')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeSide === 'bride'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>👰 Thếp Nhà Gái</span>
                </button>
              </div>

              {/* Instant Replay Opening Effect Button for live phone review */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => triggerPhoneOpeningReview()}
                  className="w-full py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200/90 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[11px] shadow-2xs"
                  title="Chạy lại hiệu ứng mở thiệp trực tiếp ngay trên màn hình điện thoại này"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>↺ Xem lại hiệu ứng mở thiệp</span>
                </button>
              </div>
            </div>

            {/* Smartphone Bezel Simulator - shifted UP, compact height fitting viewport */}
            <div className="w-full max-w-[390px] mx-auto bg-stone-900 rounded-[38px] p-2 shadow-2xl border-4 border-stone-700 transition-all">
              <div
                ref={phoneContainerRef}
                className="w-full h-[500px] max-h-[calc(100vh-160px)] min-h-[420px] rounded-[28px] overflow-y-auto overscroll-contain bg-[#F4F1E8] relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {/* Dynamic island */}
                <div className="sticky top-1.5 z-50 mx-auto w-20 h-3.5 bg-black rounded-full shadow-xs flex items-center justify-center pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 border border-stone-800" />
                </div>

                {/* IN-PHONE LIVE 3D OPENING COVER REVIEW (Trực tiếp mở nhẹ nhàng như cửa sổ trên điện thoại) */}
                {isPhoneCoverActive && (
                  <InvitationCoverModal
                    key={`phone-cover-${phonePreviewCoverKey}`}
                    data={weddingData}
                    activeSide={activeSide}
                    guestName={guestName}
                    isOpen={isPhoneCoverActive}
                    embedded={true}
                    autoPlayAnimation={true}
                    onOpenCard={() => {
                      setIsPhoneCoverActive(false);
                    }}
                  />
                )}

                {weddingData.themeTemplate === 'imperial-dragon' ? (
                  <ImperialDragonCard
                    data={weddingData}
                    activeSide={activeSide}
                    onChangeSide={setActiveSide}
                    guestName={guestName}
                  />
                ) : (
                  <WeddingPreview
                    data={weddingData}
                    activeSide={activeSide}
                    onChangeSide={setActiveSide}
                    guestName={guestName}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // PREVIEW / GUEST VIEW MODE: Full Screen Luxury Wedding Card Experience
        <div className="flex-1 w-full flex flex-col items-center relative py-3 sm:py-6 px-2 sm:px-4">
          
          {/* Top Control Bar in Preview: Only shown in Studio web app (!isGuestLink) */}
          {!isGuestLink && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5 z-30 max-w-4xl w-full">
              
              {/* Separate Mode Switcher: [ 🤵 Xem Thếp Nhà Trai | 👰 Xem Thếp Nhà Gái ] */}
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-full border border-stone-200 shadow-sm flex items-center gap-1 text-xs font-sans">
                <button
                  onClick={() => setActiveSide('groom')}
                  className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSide === 'groom'
                      ? 'bg-[#1C3766] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>🤵 Thếp Nhà Trai</span>
                </button>
                <button
                  onClick={() => setActiveSide('bride')}
                  className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSide === 'bride'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>👰 Thếp Nhà Gái</span>
                </button>
              </div>

              {/* Direct 1-Click Publish & Copy Link Buttons */}
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-full border border-stone-200 shadow-sm flex items-center gap-1 text-xs font-sans">
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full font-extrabold bg-gradient-to-r from-[#1C3766] to-blue-900 text-amber-200 hover:from-blue-950 hover:to-blue-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Mở chế độ Xuất thiệp & đồng bộ đa nền tảng"
                >
                  <CloudUpload className="w-3.5 h-3.5 text-amber-300" />
                  <span>🚀 Xuất thiệp</span>
                </button>
                <span className="text-stone-300">|</span>
                <button
                  onClick={() => handleCopySideLink('groom')}
                  className="px-3 py-1.5 rounded-full font-semibold text-blue-900 hover:bg-blue-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Đồng bộ & Sao chép link ngắn gọn gửi riêng cho khách Nhà Trai"
                >
                  {copiedSide === 'groom' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Đã đồng bộ &amp; chép Link Nhà Trai!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>Copy Link Nhà Trai</span>
                    </>
                  )}
                </button>
                <span className="text-stone-300">|</span>
                <button
                  onClick={() => handleCopySideLink('bride')}
                  className="px-3 py-1.5 rounded-full font-semibold text-rose-900 hover:bg-rose-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Đồng bộ & Sao chép link ngắn gọn gửi riêng cho khách Nhà Gái"
                >
                  {copiedSide === 'bride' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Đã đồng bộ &amp; chép Link Nhà Gái!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-rose-700" />
                      <span>Copy Link Nhà Gái</span>
                    </>
                  )}
                </button>
              </div>

              {/* Device View Bar: [ 📱 Điện thoại ] | [ 💻 Máy tính (Web) ] */}
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-full border border-stone-200 shadow-sm flex items-center gap-1 text-xs font-sans">
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deviceView === 'mobile'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Xem giao diện chuẩn màn hình điện thoại"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>📱 Điện thoại</span>
                </button>
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deviceView === 'desktop'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Xem giao diện mở rộng trên máy tính / web"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>💻 Web / Máy tính</span>
                </button>
              </div>

              {/* Button to Re-trigger 3D Opening Animation */}
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-full border border-stone-200 shadow-sm flex items-center gap-1 text-xs font-sans">
                <button
                  onClick={() => setIsCoverOpen(true)}
                  className="px-3 py-1.5 rounded-full font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-200/80"
                  title="Mở lại màn hình chào đón và trải nghiệm hiệu ứng mở thiệp 3D"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>💌 Xem lại Mở Thiệp 3D</span>
                </button>
              </div>
            </div>
          )}

          {/* Cover Modal ("Mở thiệp") */}
          <InvitationCoverModal
            data={weddingData}
            activeSide={activeSide}
            guestName={guestName}
            isOpen={isCoverOpen}
            onOpenCard={() => {
              setIsCoverOpen(false);
              setIsAutoScrollEnabled(true);
              window.scrollTo({ top: 0, behavior: 'auto' });
            }}
            onMusicStarted={() => setIsPlayingMusic(true)}
          />

          {/* Card Container - Auto responsive on mobile, switchable on desktop */}
          <div className={`w-full transition-all duration-300 mx-auto ${
            deviceView === 'mobile' 
              ? 'max-w-[420px] shadow-2xl rounded-3xl overflow-hidden border border-stone-300' 
              : 'max-w-2xl sm:max-w-3xl shadow-2xl rounded-3xl overflow-hidden border border-stone-300'
          }`}>
            {weddingData.themeTemplate === 'imperial-dragon' ? (
              <ImperialDragonCard
                data={weddingData}
                activeSide={activeSide}
                onChangeSide={setActiveSide}
                guestName={guestName}
              />
            ) : (
              <WeddingPreview
                data={weddingData}
                activeSide={activeSide}
                onChangeSide={setActiveSide}
                guestName={guestName}
                onOpenMusicModal={() => setIsMusicModalOpen(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* Multi-Couple Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        currentWeddingData={weddingData}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onImportProject={handleCreateProject}
        currentUser={currentUser}
        onRequireAuth={(tab) => {
          setAuthInitialTab(tab);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Music Selection Modal (Supports 4 Distinct Melodies & Custom Upload) */}
      <MusicPickerModal
        isOpen={isMusicModalOpen}
        onClose={() => {
          setIsMusicModalOpen(false);
          if (currentMode === 'edit') {
            acousticAudio.pause();
          }
        }}
        selectedTrackId={weddingData.selectedMusicId}
        onSelectTrack={(id, customUrl, customName) => 
          handleUpdateWeddingData({
            ...weddingData,
            selectedMusicId: id,
            customAudioUrl: customUrl !== undefined ? customUrl : weddingData.customAudioUrl,
            customAudioName: customName !== undefined ? customName : weddingData.customAudioName
          })
        }
        isPlaying={isPlayingMusic}
        onTogglePlay={handleToggleMusic}
        customAudioUrl={weddingData.customAudioUrl}
        customAudioName={weddingData.customAudioName}
      />

      {/* Template Showcase Modal (Kho Mẫu Thiệp Mời) */}
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTheme={weddingData.themeTemplate}
        onSelectTheme={handleToggleTheme}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          currentUser={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
        />
      )}

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Trial 3-Day Expiry Overlay */}
      <TrialExpiredModal
        isOpen={isTrialExpired}
        coupleNames={`${weddingData.groomShortName || 'Chú Rể'} & ${weddingData.brideShortName || 'Cô Dâu'}`}
        onOpenRegister={() => {
          setAuthInitialTab('register');
          setIsAuthModalOpen(true);
        }}
        onOpenLogin={() => {
          setAuthInitialTab('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Publish & Synchronize Card Modal ("Chế độ Xuất thiệp") */}
      <PublishCardModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        weddingData={weddingData}
        onChangeData={handleUpdateWeddingData}
        onSaveCard={handleExplicitSave}
        onPublishCard={handlePublishCard}
        onOpenCustomLinkModal={() => setIsCustomLinkModalOpen(true)}
      />

      {/* Custom Link Slug Modal */}
      <CustomLinkModal
        isOpen={isCustomLinkModalOpen}
        activeSide={activeSide}
        weddingData={weddingData}
        onClose={() => setIsCustomLinkModalOpen(false)}
        onSaveSlug={(newSlug, side) => {
          if (side === 'groom') {
            handleUpdateWeddingData({ ...weddingData, customSlugGroom: newSlug });
          } else {
            handleUpdateWeddingData({ ...weddingData, customSlugBride: newSlug });
          }
        }}
      />

      {/* Guest List & Honorifics Manager Modal */}
      <GuestListModal
        isOpen={isGuestListModalOpen}
        weddingData={weddingData}
        activeSide={activeSide}
        onClose={() => setIsGuestListModalOpen(false)}
        onUpdateGuests={(updatedGuests: GuestItem[]) => {
          handleUpdateWeddingData({
            ...weddingData,
            guests: updatedGuests
          });
        }}
      />
    </div>
  );
}
