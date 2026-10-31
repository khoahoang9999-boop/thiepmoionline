import React, { useState, useRef } from 'react';
import { MUSIC_PLAYLIST } from '../../data/weddingDefault';
import { acousticAudio } from '../../utils/audioPlayer';
import { 
  X, 
  Music2, 
  Check, 
  Play, 
  Pause, 
  Upload, 
  Link, 
  Volume2, 
  FileAudio,
  Sparkles
} from 'lucide-react';

interface MusicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrackId: string;
  onSelectTrack: (id: string, customUrl?: string, customName?: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  customAudioUrl?: string;
  customAudioName?: string;
}

export const MusicPickerModal: React.FC<MusicPickerModalProps> = ({
  isOpen,
  onClose,
  selectedTrackId,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  customAudioUrl,
  customAudioName
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload'>('preset');
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (id: string) => {
    acousticAudio.setTrack(id);
    onSelectTrack(id);
    if (!isPlaying) {
      acousticAudio.play();
      onTogglePlay();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setUploadError('Vui lòng chọn tệp âm thanh hợp lệ (.mp3, .wav, .m4a, .ogg)');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      let finalAudioUrl = result;
      try {
        const res = await fetch('/api/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: result })
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.url) {
            finalAudioUrl = json.url;
          }
        }
      } catch {
        // Fallback to dataUrl if offline
      }
      acousticAudio.setTrack('custom-upload', finalAudioUrl);
      onSelectTrack('custom-upload', finalAudioUrl, file.name);
      acousticAudio.play();
      if (!isPlaying) {
        onTogglePlay();
      }
    };
    reader.onerror = () => {
      setUploadError('Không thể đọc tệp âm thanh. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    acousticAudio.setTrack('custom-upload', urlInput.trim());
    onSelectTrack('custom-upload', urlInput.trim(), 'Nhạc online từ URL');
    acousticAudio.play();
    if (!isPlaying) {
      onTogglePlay();
    }
    setUrlInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200">
        
        {/* Header (image_6fa049ac.png) */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif">
                Chọn Nhạc Nền Thiệp Cưới
              </h3>
              <p className="text-[11px] text-stone-500">
                Nhạc tự động phát khi khách mở thiệp hoặc bấm nút âm thanh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: [ Kho Nhạc Mẫu Có Sẵn ] ↔ [ Tải Nhạc Của Bạn ] */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preset')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'preset'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Kho nhạc có sẵn (4 bài)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-pink-600" />
            <span>Tải nhạc bên ngoài</span>
          </button>
        </div>

        {/* Content Tab 1: Preset Tracks */}
        {activeTab === 'preset' ? (
          <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {MUSIC_PLAYLIST.map((track) => {
              const isSelected = selectedTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectPreset(track.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500/10'
                      : 'border-stone-200 hover:border-pink-200 hover:bg-stone-50/80'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-stone-900">
                        {track.title}
                      </h4>
                      {isSelected && isPlaying && (
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 h-full bg-pink-500 animate-pulse" />
                          <span className="w-0.5 h-2 bg-pink-500 animate-pulse delay-75" />
                          <span className="w-0.5 h-full bg-pink-500 animate-pulse delay-150" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      {track.artist} · <span className="text-pink-600 font-medium">{track.category}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <span className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="text-stone-400 group-hover:text-pink-600 text-xs font-medium">
                        Chọn
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Content Tab 2: Custom Upload & URL */
          <div className="mt-4 space-y-4">
            {/* Upload from local device */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 hover:border-pink-500 bg-stone-50 text-center transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileAudio className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-800">
                Tải file nhạc từ máy tính hoặc điện thoại
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Hỗ trợ định dạng: .MP3, .M4A, .WAV, .AAC
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Chọn tệp nhạc của bạn
              </button>
            </div>

            {/* Direct online audio URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-stone-500" />
                <span>Hoặc dán đường dẫn link nhạc online (MP3 Direct Link):</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://domain.com/bai-hat-cuoi.mp3"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                {uploadError}
              </p>
            )}

            {/* Currently active custom audio */}
            {customAudioUrl && (
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-pink-600 animate-ping" />
                  <span className="font-semibold text-pink-900 truncate">
                    {customAudioName || 'Nhạc tùy chỉnh đã tải lên'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    acousticAudio.setTrack('custom-upload', customAudioUrl);
                    onSelectTrack('custom-upload', customAudioUrl, customAudioName);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    selectedTrackId === 'custom-upload'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  {selectedTrackId === 'custom-upload' ? 'Đang chọn' : 'Chọn bài này'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Play Action (image_6fa049ac.png) */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current text-pink-600" />
                <span>Tạm dừng thử</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-pink-600" />
                <span>Nghe thử nhạc</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#E01460] hover:bg-[#C20E50] text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Xác nhận
          </button>
        </div>

      </div>
    </div>
  );
};
