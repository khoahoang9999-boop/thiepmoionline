import React, { useState, useEffect } from 'react';
import { isImageAvatarUrl } from '../../services/authStore';

export const ADMIN_FALLBACK_AVATAR = '/api/media/media_04bbb52038e5c1c2.jpg';

interface UserAvatarProps {
  user?: {
    fullName?: string;
    avatarUrl?: string;
    role?: string;
    username?: string;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-16 h-16 text-2xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'xs',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const [triedAdminFallback, setTriedAdminFallback] = useState(false);

  const rawAvatar = (user?.avatarUrl || '').trim();
  const isAdmin = user?.role === 'admin';

  // Determine initial image candidate
  const effectiveImageUrl = React.useMemo(() => {
    if (rawAvatar && isImageAvatarUrl(rawAvatar) && !rawAvatar.includes('_16F35F95')) {
      return rawAvatar;
    }
    if (isAdmin) {
      return ADMIN_FALLBACK_AVATAR;
    }
    return '';
  }, [rawAvatar, isAdmin]);

  // Reset error states when user avatar changes
  useEffect(() => {
    setHasError(false);
    setTriedAdminFallback(false);
  }, [effectiveImageUrl]);

  const handleImageError = () => {
    if (isAdmin && !triedAdminFallback && effectiveImageUrl !== ADMIN_FALLBACK_AVATAR) {
      // Try the official admin portrait once
      setTriedAdminFallback(true);
    } else {
      setHasError(true);
    }
  };

  const currentSrc =
    triedAdminFallback && isAdmin ? ADMIN_FALLBACK_AVATAR : effectiveImageUrl;

  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.xs;
  const initialLetter = (user?.fullName || user?.username || 'U').trim().charAt(0).toUpperCase();

  // If we have an image and haven't failed both the primary and fallback
  if (currentSrc && !hasError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-stone-200 overflow-hidden shrink-0 border border-white/80 shadow-2xs relative flex items-center justify-center select-none ${className}`}
      >
        <img
          src={currentSrc}
          alt={user?.fullName || 'Avatar'}
          onError={handleImageError}
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // If user selected an emoji avatar (like ⭐, 👨‍🏫, 🦉)
  if (rawAvatar && !isImageAvatarUrl(rawAvatar)) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-amber-700 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 border border-white shadow-2xs select-none ${className}`}
      >
        <span>{rawAvatar}</span>
      </div>
    );
  }

  // Fallback to high-class Initial badge
  const bgClass = isAdmin
    ? 'bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 text-white'
    : 'bg-gradient-to-tr from-stone-700 to-stone-600 text-white';

  return (
    <div
      className={`${sizeClasses} rounded-full ${bgClass} flex items-center justify-center font-bold overflow-hidden shrink-0 border border-white shadow-2xs select-none ${className}`}
    >
      <span>{initialLetter}</span>
    </div>
  );
};
