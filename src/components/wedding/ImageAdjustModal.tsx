import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { ImageFrameAdjustment } from '../../types/wedding';

interface ImageAdjustModalProps {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  shape?: 'circle' | 'rect' | 'rect-wide';
  initialAdjustment?: ImageFrameAdjustment;
  onClose: () => void;
  onApply: (newAdjustment: ImageFrameAdjustment) => void;
}

export const ImageAdjustModal: React.FC<ImageAdjustModalProps> = ({
  isOpen,
  imageUrl,
  title = 'Điều chỉnh ảnh đại diện',
  subtitle = 'Kéo để điều chỉnh vị trí, lật ảnh và dùng thanh trượt để phóng to/thu nhỏ lấy trọn ảnh',
  shape = 'circle',
  initialAdjustment,
  onClose,
  onApply
}) => {
  // Spacious frame dimensions matching actual card frames
  const apertureWidth = shape === 'circle' ? 280 : shape === 'rect-wide' ? 360 : 310;
  const apertureHeight = shape === 'circle' ? 280 : shape === 'rect-wide' ? 202 : 360;

  // Zoom: 0.5x to 3.0x (50% to 300%) so user can shrink to fit full photo or zoom in
  const [zoom, setZoom] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [rotate, setRotate] = useState<number>(0);
  // Pixel offset of image relative to aperture center
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialOffsetX: number; initialOffsetY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0
  });

  // Initialize offset, zoom, flip, rotate, and fit mode from initialAdjustment whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const initZoomVal = initialAdjustment?.zoom ? initialAdjustment.zoom / 100 : 1.0;
      setZoom(Math.max(0.5, Math.min(3.0, initZoomVal)));
      setFitMode(initialAdjustment?.fit || 'contain');
      setFlipX(!!initialAdjustment?.flipX);
      setFlipY(!!initialAdjustment?.flipY);
      setRotate(initialAdjustment?.rotate ?? 0);

      const posX = initialAdjustment?.x ?? 50;
      const posY = initialAdjustment?.y ?? 50;

      // tx = -(posX - 50) in % of apertureWidth
      const pixelX = -((posX - 50) / 100) * apertureWidth;
      const pixelY = -((posY - 50) / 100) * apertureHeight;

      setOffset({ x: pixelX, y: pixelY });
    }
  }, [isOpen, imageUrl, initialAdjustment, apertureWidth, apertureHeight]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialOffsetX: offset.x,
      initialOffsetY: offset.y
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const maxBoundX = apertureWidth * 1.5;
    const maxBoundY = apertureHeight * 1.5;

    const newX = Math.max(-maxBoundX, Math.min(maxBoundX, dragStartRef.current.initialOffsetX + dx));
    const newY = Math.max(-maxBoundY, Math.min(maxBoundY, dragStartRef.current.initialOffsetY + dy));

    setOffset({ x: newX, y: newY });
  }, [isDragging, apertureWidth, apertureHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: e.touches[0].clientX,
        mouseY: e.touches[0].clientY,
        initialOffsetX: offset.x,
        initialOffsetY: offset.y
      };
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.mouseX;
    const dy = e.touches[0].clientY - dragStartRef.current.mouseY;

    const maxBoundX = apertureWidth * 1.5;
    const maxBoundY = apertureHeight * 1.5;

    const newX = Math.max(-maxBoundX, Math.min(maxBoundX, dragStartRef.current.initialOffsetX + dx));
    const newY = Math.max(-maxBoundY, Math.min(maxBoundY, dragStartRef.current.initialOffsetY + dy));

    setOffset({ x: newX, y: newY });
  }, [isDragging, apertureWidth, apertureHeight]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom support (0.5x to 3.0x)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((prev) => Math.min(3.0, Math.max(0.5, parseFloat((prev + delta).toFixed(2)))));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (!isOpen) return null;

  const handleFitEntireImage = () => {
    setFitMode('contain');
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  };

  const handleFillFrame = () => {
    setFitMode('cover');
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  };

  const handleApply = () => {
    // Convert pixel offset relative to apertureWidth / apertureHeight to % shift
    const txPercent = (offset.x / apertureWidth) * 100;
    const tyPercent = (offset.y / apertureHeight) * 100;

    const computedX = Math.round((50 - txPercent) * 10) / 10;
    const computedY = Math.round((50 - tyPercent) * 10) / 10;
    const computedZoom = Math.round(zoom * 100);

    onApply({
      x: computedX,
      y: computedY,
      zoom: computedZoom,
      fit: fitMode,
      flipX,
      flipY,
      rotate
    });
    onClose();
  };

  const txPercent = (offset.x / apertureWidth) * 100;
  const tyPercent = (offset.y / apertureHeight) * 100;
  const flipXScale = flipX ? -1 : 1;
  const flipYScale = flipY ? -1 : 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[520px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="px-5 sm:px-6 pt-4 pb-3 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-4 sm:right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 font-normal">
            {subtitle}
          </p>
        </div>

        {/* 2. Interactive Photo Viewport */}
        <div 
          className="relative w-full h-[380px] sm:h-[400px] bg-[#4A4E57] overflow-hidden flex items-center justify-center select-none"
          onWheel={handleWheel}
        >
          {/* Draggable Layer with Image matched 1:1 to aperture dimensions */}
          <div 
            className={`absolute inset-0 flex items-center justify-center ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div
              style={{
                width: `${apertureWidth}px`,
                height: `${apertureHeight}px`
              }}
              className="relative flex items-center justify-center pointer-events-none"
            >
              <img
                src={imageUrl}
                alt="Căn chỉnh ảnh"
                draggable={false}
                className="w-full h-full max-w-none pointer-events-none select-none"
                style={{
                  objectFit: fitMode,
                  objectPosition: 'center center',
                  transform: `translate(${txPercent}%, ${tyPercent}%) scale(${zoom}) rotate(${rotate}deg) scaleX(${flipXScale}) scaleY(${flipYScale})`,
                  transformOrigin: 'center center',
                  imageRendering: 'auto'
                }}
              />
            </div>
          </div>

          {/* Mask & Cutout Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {shape === 'circle' ? (
              <div 
                className="rounded-full border-2 border-white/90 transition-all pointer-events-none"
                style={{
                  width: `${apertureWidth}px`,
                  height: `${apertureHeight}px`,
                  boxShadow: '0 0 0 9999px rgba(30, 34, 42, 0.65)'
                }}
              />
            ) : (
              <div 
                className="rounded-2xl border-2 border-white/90 transition-all pointer-events-none"
                style={{
                  width: `${apertureWidth}px`,
                  height: `${apertureHeight}px`,
                  boxShadow: '0 0 0 9999px rgba(30, 34, 42, 0.65)'
                }}
              />
            )}
          </div>
        </div>

        {/* 3. Quick Fit Mode + Zoom & Rotate Sliders + Flip Controls */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-200 space-y-2.5">
          {/* Quick Mode Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-600">
              Chế độ khung hình:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFitEntireImage}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  fitMode === 'contain' && zoom === 1.0 && offset.x === 0 && offset.y === 0
                    ? 'bg-[#1C3766] text-white shadow-2xs'
                    : fitMode === 'contain'
                    ? 'bg-blue-50 text-[#1C3766] border border-blue-200'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Lấy hết toàn bộ ảnh</span>
              </button>

              <button
                type="button"
                onClick={handleFillFrame}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  fitMode === 'cover'
                    ? 'bg-[#1C3766] text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Lấp đầy khung</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoom(1.0);
                  setOffset({ x: 0, y: 0 });
                  setFlipX(false);
                  setFlipY(false);
                  setRotate(0);
                }}
                className="p-1.5 rounded-lg bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 transition-colors"
                title="Đặt lại chính giữa (1.0x, 0° & Mặc định)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zoom Slider (0.5x to 3.0x) */}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-stone-800 whitespace-nowrap">
              Thu phóng:
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-[#E01460] focus:outline-none"
                style={{
                  accentColor: '#E01460'
                }}
              />
            </div>

            <span className="text-xs sm:text-sm text-stone-600 font-mono w-11 text-right font-semibold">
              {zoom.toFixed(2)}x
            </span>
          </div>

          {/* Rotation Slider (-180° to +180°) */}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-stone-800 whitespace-nowrap">
              Góc xoay:
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotate}
                onChange={(e) => setRotate(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
                style={{
                  accentColor: '#D97706'
                }}
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs sm:text-sm text-stone-600 font-mono w-10 text-right font-semibold">
                {rotate}°
              </span>
              <button
                type="button"
                onClick={() => setRotate(0)}
                className="px-1.5 py-0.5 rounded text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold"
                title="Đặt lại 0 độ"
              >
                0°
              </button>
            </div>
          </div>

          {/* Flip Controls (Lật Ảnh Ngang / Dọc) */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/80">
            <span className="text-xs font-semibold text-stone-700">
              Lật xoay hình ảnh:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFlipX(!flipX)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  flipX
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
                title="Lật đối xứng qua trục đứng (Mirror Horizontal)"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Lật ngang</span>
              </button>

              <button
                type="button"
                onClick={() => setFlipY(!flipY)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  flipY
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
                title="Lật đối xứng qua trục ngang (Mirror Vertical)"
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Lật dọc</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons Footer */}
        <div className="px-5 sm:px-6 py-3 bg-white border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 text-xs sm:text-sm font-semibold transition-colors"
          >
            Huỷ
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-7 py-2.5 rounded-xl bg-[#E01460] hover:bg-[#C20E50] text-white text-xs sm:text-sm font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
