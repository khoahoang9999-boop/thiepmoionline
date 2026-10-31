import React, { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Search
} from 'lucide-react';

interface MapLocationPickerProps {
  lat: number;
  lng: number;
  address?: string;
  sideLabel?: string;
  onChangeCoordinates: (lat: number, lng: number) => void;
}

// Common Vietnamese locations fallback dictionary for instant offline/online accuracy
const VN_LOCATION_FALLBACKS: { keywords: string[]; lat: number; lng: number; label: string }[] = [
  {
    keywords: ['đằng xã', 'hoằng đạo', 'hoằng hóa', 'thanh hóa'],
    lat: 19.85950,
    lng: 105.85420,
    label: 'Thôn Đằng Xã, Hoằng Hóa, Thanh Hóa'
  },
  {
    keywords: ['thanh hóa'],
    lat: 19.80669,
    lng: 105.78518,
    label: 'TP. Thanh Hóa, Tỉnh Thanh Hóa'
  },
  {
    keywords: ['làng bát', 'hàm yên', 'tuyên quang'],
    lat: 22.10026,
    lng: 105.02590,
    label: 'Thôn 1 Làng Bát, Hàm Yên, Tuyên Quang'
  },
  {
    keywords: ['tuyên quang'],
    lat: 21.82356,
    lng: 105.21424,
    label: 'TP. Tuyên Quang, Tỉnh Tuyên Quang'
  }
];

function parseDmsToDecimal(dmsStr: string): { lat: number; lng: number } | null {
  const regex =
    /(\d+)\s*°\s*(\d+)\s*['’]\s*(\d+(?:\.\d+)?)\s*["”]?\s*([NSns])[,\s]+(\d+)\s*°\s*(\d+)\s*['’]\s*(\d+(?:\.\d+)?)\s*["”]?\s*([EWew])/;
  const m = dmsStr.match(regex);
  if (!m) return null;
  let lat = Number(m[1]) + Number(m[2]) / 60 + Number(m[3]) / 3600;
  if (m[4].toUpperCase() === 'S') lat = -lat;
  let lng = Number(m[5]) + Number(m[6]) / 60 + Number(m[7]) / 3600;
  if (m[8].toUpperCase() === 'W') lng = -lng;
  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  lat,
  lng,
  address = '',
  sideLabel = 'Địa điểm',
  onChangeCoordinates
}) => {
  const [pasteInput, setPasteInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Geocode an address string via fallback dictionary + OpenStreetMap Nominatim
  const geocodeAddressText = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) {
      showStatus('Vui lòng nhập địa chỉ hoặc tọa độ cần tìm.', 'error');
      return;
    }

    setIsSearchingAddress(true);
    const lower = clean.toLowerCase().normalize('NFC');

    // 1. Check exact local fallback first for instant response on known communes/villages
    for (const item of VN_LOCATION_FALLBACKS) {
      const matchCount = item.keywords.filter((k) => lower.includes(k)).length;
      if (matchCount >= 2 || (item.keywords.length === 1 && matchCount === 1)) {
        setIsSearchingAddress(false);
        onChangeCoordinates(item.lat, item.lng);
        showStatus(`Đã định vị: ${item.label} (${item.lat.toFixed(5)}, ${item.lng.toFixed(5)})`);
        return;
      }
    }

    // 2. Try OpenStreetMap Nominatim with progressive simplification of Vietnamese address
    const parts = clean.split(',').map((p) => p.trim()).filter(Boolean);
    const candidates: string[] = [clean];
    if (parts.length >= 2) {
      candidates.push(parts.slice(-2).join(', '));
    }
    if (parts.length >= 3) {
      candidates.push(parts.slice(-3).join(', '));
    }

    for (const candidate of candidates) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(candidate)}`,
          { headers: { 'Accept-Language': 'vi' } }
        );
        if (res.ok) {
          const results = await res.json();
          if (Array.isArray(results) && results.length > 0) {
            const foundLat = Number(parseFloat(results[0].lat).toFixed(5));
            const foundLng = Number(parseFloat(results[0].lon).toFixed(5));
            if (!isNaN(foundLat) && !isNaN(foundLng)) {
              setIsSearchingAddress(false);
              onChangeCoordinates(foundLat, foundLng);
              showStatus(`Đã tìm thấy vị trí (${sideLabel}): ${foundLat}, ${foundLng}`);
              return;
            }
          }
        }
      } catch (e) {
        // continue to next candidate
      }
    }

    setIsSearchingAddress(false);
    showStatus('Không tìm thấy tọa độ tự động cho địa chỉ này. Hãy dán tọa độ (VD: 19.85950, 105.85420).', 'error');
  };

  // Parse paste text (supports !3d!4d, @lat,lng, DMS, raw numbers, or address search)
  const handleParseAndApply = async () => {
    const raw = pasteInput.trim();
    if (!raw) {
      if (address.trim()) {
        await geocodeAddressText(address);
      }
      return;
    }

    // Pattern 1: Google Maps !3dLAT!4dLNG pin coordinates (most accurate pin in Google Maps URLs)
    const pin3d4d = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (pin3d4d) {
      const parsedLat = Number(parseFloat(pin3d4d[1]).toFixed(5));
      const parsedLng = Number(parseFloat(pin3d4d[2]).toFixed(5));
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        onChangeCoordinates(parsedLat, parsedLng);
        setPasteInput('');
        showStatus(`Đã lấy tọa độ ghim Google Maps: ${parsedLat}, ${parsedLng}`);
        return;
      }
    }

    // Pattern 2: URL with @lat,lng or q=lat,lng or ll=lat,lng or place/lat,lng
    const urlMatch = raw.match(/(?:[@?&](?:q|ll|query)?=?|\/place\/)(-?\d{1,2}\.\d+)[,\s+]+(-?\d{2,3}\.\d+)/);
    if (urlMatch) {
      const parsedLat = Number(parseFloat(urlMatch[1]).toFixed(5));
      const parsedLng = Number(parseFloat(urlMatch[2]).toFixed(5));
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        onChangeCoordinates(parsedLat, parsedLng);
        setPasteInput('');
        showStatus(`Đã cập nhật tọa độ: ${parsedLat}, ${parsedLng}`);
        return;
      }
    }

    // Pattern 3: DMS coordinates (e.g. 19°51'34.2"N 105°51'15.1"E)
    const dms = parseDmsToDecimal(raw);
    if (dms) {
      onChangeCoordinates(dms.lat, dms.lng);
      setPasteInput('');
      showStatus(`Đã chuyển đổi tọa độ độ-phút-giây: ${dms.lat}, ${dms.lng}`);
      return;
    }

    // Pattern 4: Raw comma or space separated decimal numbers
    const numMatch = raw.match(/^\s*(-?\d{1,2}(?:\.\d+)?)[,\s\t;|]+(-?\d{2,3}(?:\.\d+)?)\s*$/);
    if (numMatch) {
      const parsedLat = Number(parseFloat(numMatch[1]).toFixed(5));
      const parsedLng = Number(parseFloat(numMatch[2]).toFixed(5));
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        onChangeCoordinates(parsedLat, parsedLng);
        setPasteInput('');
        showStatus(`Đã cập nhật tọa độ: ${parsedLat}, ${parsedLng}`);
        return;
      }
    }

    // Pattern 5: Treat as an address or place name and geocode it!
    await geocodeAddressText(raw);
    setPasteInput('');
  };

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showStatus('Trình duyệt không hỗ trợ định vị GPS.', 'error');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false);
        const userLat = Number(position.coords.latitude.toFixed(5));
        const userLng = Number(position.coords.longitude.toFixed(5));
        onChangeCoordinates(userLat, userLng);
        showStatus(`Đã lấy vị trí GPS hiện tại (${sideLabel}): ${userLat}, ${userLng}`);
      },
      (error) => {
        setIsGettingLocation(false);
        // If GPS is blocked in iframe or denied, automatically fallback to locating from the entered address!
        if (address && address.trim()) {
          geocodeAddressText(address);
          return;
        }
        let msg = 'Không thể lấy GPS thiết bị. Hãy bấm "Lấy theo địa chỉ" hoặc dán tọa độ.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Trình duyệt chặn quyền GPS. Đã hỗ trợ nút "Tìm theo địa chỉ" kế bên!';
        }
        showStatus(msg, 'error');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Fine-tune nudge coordinates (0.0005 deg is ~55 meters)
  const handleNudge = (deltaLat: number, deltaLng: number) => {
    const newLat = Number((lat + deltaLat).toFixed(5));
    const newLng = Number((lng + deltaLng).toFixed(5));
    onChangeCoordinates(newLat, newLng);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=vi&z=15&output=embed`;

  return (
    <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-stone-50 border border-stone-200">
      
      {/* Header & Current Coords */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-stone-800 block">
              Bản đồ &amp; Tọa độ GPS ({sideLabel})
            </span>
            <span className="text-[11px] text-stone-500 font-mono">
              Vĩ độ: <strong>{lat.toFixed(5)}</strong> | Kinh độ: <strong>{lng.toFixed(5)}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {address && (
            <button
              type="button"
              onClick={() => geocodeAddressText(address)}
              disabled={isSearchingAddress}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#1C3766] text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title={`Tìm vị trí bản đồ theo địa chỉ ${sideLabel} đã nhập ở trên`}
            >
              <Search className={`w-3.5 h-3.5 ${isSearchingAddress ? 'animate-spin' : ''}`} />
              <span>{isSearchingAddress ? 'Đang định vị...' : `Định vị theo địa chỉ ${sideLabel}`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-pink-500 hover:bg-pink-50 text-stone-700 hover:text-pink-700 text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin text-pink-600' : 'text-pink-600'}`} />
            <span>{isGettingLocation ? 'Đang lấy GPS...' : 'Lấy vị trí hiện tại'}</span>
          </button>
        </div>
      </div>

      {/* Paste coordinates, Google Maps link, or Address to search */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-stone-700">
          Nhập địa chỉ, dán tọa độ hoặc liên kết Google Maps ({sideLabel}):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleParseAndApply())}
            placeholder="VD: 19.85950, 105.85420 hoặc nhập: Hoằng Hóa, Thanh Hóa"
            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
          <button
            type="button"
            onClick={handleParseAndApply}
            disabled={isSearchingAddress}
            className="px-4 py-1.5 rounded-lg bg-[#1C3766] hover:bg-[#13274A] text-white text-xs font-semibold shrink-0 transition-colors active:scale-95 shadow-2xs cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span>⚠️</span>}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Presets & Fine-tuning */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-stone-500 font-medium">Mẫu nhanh:</span>
          <button
            type="button"
            onClick={() => {
              onChangeCoordinates(19.85950, 105.85420);
              showStatus('Đã gán tọa độ Nhà Trai: Thôn Đằng Xã, Hoằng Hóa, Thanh Hóa (19.85950, 105.85420)');
            }}
            className="px-2.5 py-1 rounded-md bg-blue-100/80 hover:bg-blue-200 text-[#1C3766] font-semibold transition-colors cursor-pointer"
          >
            🤵 Thôn Đằng Xã, Thanh Hóa
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeCoordinates(22.10026, 105.02590);
              showStatus('Đã gán tọa độ Nhà Gái: Thôn 1 Làng Bát, Hàm Yên, Tuyên Quang (22.10026, 105.02590)');
            }}
            className="px-2.5 py-1 rounded-md bg-rose-100/80 hover:bg-rose-200 text-rose-900 font-semibold transition-colors cursor-pointer"
          >
            👰 Thôn 1 Làng Bát, Tuyên Quang
          </button>
        </div>

        {/* Nudge controls */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-lg">
          <span className="text-stone-400 text-[10px] font-medium mr-1">Vi chỉnh:</span>
          <button
            type="button"
            onClick={() => handleNudge(0.0005, 0)}
            title="Dịch lên Bắc"
            className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(-0.0005, 0)}
            title="Dịch xuống Nam"
            className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(0, -0.0005)}
            title="Dịch sang Tây"
            className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(0, 0.0005)}
            title="Dịch sang Đông"
            className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Interactive Map Embed */}
      <div className="space-y-1">
        <div className="rounded-xl overflow-hidden border border-stone-300 h-64 sm:h-72 bg-stone-100 relative shadow-inner">
          <iframe
            key={`${sideLabel}-${lat}-${lng}`}
            title={`Bản đồ vị trí tổ chức ${sideLabel}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 pt-1">
          <span>* Bản đồ hiển thị vị trí ghim thực tế của {sideLabel} trên thiệp cưới</span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-pink-600 hover:text-pink-700 font-semibold inline-flex items-center gap-1 underline"
          >
            <span>Mở trên Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

    </div>
  );
};
