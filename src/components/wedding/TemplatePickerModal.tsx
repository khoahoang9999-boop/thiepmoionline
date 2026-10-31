import React, { useState } from 'react';
import { ThemeTemplate } from '../../types/wedding';
import { X, Check, Sparkles, Eye, Palette } from 'lucide-react';

interface TemplateItem {
  id: ThemeTemplate;
  name: string;
  category: 'codien' | 'minimalism' | 'hoaco' | 'hiendai';
  categoryLabel: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  colors: string[];
  previewGradient: string;
  previewHeroUrl: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'imperial-dragon',
    name: 'Hoàng Triều Khắc Rồng',
    category: 'codien',
    categoryLabel: 'Cổ Điển & Rồng Phượng',
    description: 'Dải gấm thêu rồng hoàng gia, Song Hỷ 囍 xanh navy, 2 avatar tròn cùng lịch mini trái tim.',
    badge: 'Mẫu Đang Chọn',
    badgeColor: 'bg-blue-600',
    colors: ['#1C3766', '#E5C378', '#F4F1E8'],
    previewGradient: 'from-[#1C3766] via-[#2A4B82] to-[#F4F1E8]',
    previewHeroUrl: ''
  },
  {
    id: 'burgundy-roses',
    name: 'Minimalism - Đỏ Đậm Quý Phái',
    category: 'minimalism',
    categoryLabel: 'Tối Giản & Sang Trọng',
    description: 'Tông đỏ burgundy đậm, hoa hồng nhũ vàng kim, phong thư sáp niêm phong sang trọng lịch thiệp.',
    badge: 'Mới',
    badgeColor: 'bg-rose-600',
    colors: ['#58181E', '#DFB76C', '#FAF8F5'],
    previewGradient: 'from-[#58181E] via-[#7B242C] to-[#FAF8F5]',
    previewHeroUrl: '/public/assets/aistudio/_C08B82F5-9EFA-4B88-B9A6-400741E6CF43__04930616.png'
  },
  {
    id: 'long-phung-red',
    name: 'Long Phụng V4 - Đỏ Hoàng Gia',
    category: 'codien',
    categoryLabel: 'Cổ Điển & Rồng Phượng',
    description: 'Họa tiết Long Phụng hòa minh uốn lượn, chữ Hỷ vàng kim cung đình Á Đông.',
    badge: 'Hot',
    badgeColor: 'bg-amber-600',
    colors: ['#8A1B22', '#F1D084', '#FFFDF9'],
    previewGradient: 'from-[#8A1B22] via-[#A82830] to-[#FFFDF9]',
    previewHeroUrl: '/public/assets/aistudio/image_5fcc155f.png'
  },
  {
    id: 'vintage-brown',
    name: 'Minimalism - Nâu Đậm Vintage',
    category: 'minimalism',
    categoryLabel: 'Tối Giản & Sang Trọng',
    description: 'Phong thư màu nâu cà phê, hoa khô thạch thảo, ảnh cưới Polaroid lãng mạn.',
    badge: 'Thịnh Hành',
    badgeColor: 'bg-stone-700',
    colors: ['#4A3728', '#D4AF37', '#F5EFEB'],
    previewGradient: 'from-[#4A3728] via-[#684E3A] to-[#F5EFEB]',
    previewHeroUrl: '/public/assets/aistudio/_C08B82F5-9EFA-4B88-B9A6-400741E6CF43__04930616.png'
  },
  {
    id: 'pastel-floral',
    name: 'Hoa Khô V2 - Lam & Pastel',
    category: 'hoaco',
    categoryLabel: 'Hoa Cỏ & Lãng Mạn',
    description: 'Họa tiết hoa khô màu xanh pastel nhẹ nhàng, vòm gương nghệ thuật phong cách Hàn Quốc.',
    badge: 'Mới',
    badgeColor: 'bg-sky-600',
    colors: ['#3A6B88', '#B7D5E5', '#F8FAFC'],
    previewGradient: 'from-[#3A6B88] via-[#6BA4C3] to-[#F8FAFC]',
    previewHeroUrl: '/public/assets/aistudio/image_5fcc155f.png'
  },
  {
    id: 'modern-emerald',
    name: 'Hiện Đại - Xanh Ngọc Lâu Đài',
    category: 'hiendai',
    categoryLabel: 'Sang Trọng & Hiện Đại',
    description: 'Phong cách Santorini lâu đài cổ tích, trời xanh mây trắng lãng mạn phóng khoáng.',
    badge: 'Hot',
    badgeColor: 'bg-emerald-600',
    colors: ['#1A4D43', '#88C9BA', '#F3F9F8'],
    previewGradient: 'from-[#1A4D43] via-[#2D7365] to-[#F3F9F8]',
    previewHeroUrl: '/public/assets/aistudio/_C08B82F5-9EFA-4B88-B9A6-400741E6CF43__04930616.png'
  }
];

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeTemplate;
  onSelectTheme: (theme: ThemeTemplate) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Kho Mẫu Thiệp Mời Online
              </h3>
              <p className="text-xs text-stone-500">
                Lựa chọn phong cách thiết kế phù hợp với gu thẩm mỹ của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 shrink-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất cả mẫu ({TEMPLATES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('codien')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'codien'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Cổ Điển &amp; Rồng Phượng
          </button>
          <button
            onClick={() => setSelectedCategory('minimalism')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'minimalism'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tối Giản &amp; Sang Trọng
          </button>
          <button
            onClick={() => setSelectedCategory('hoaco')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'hoaco'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Hoa Cỏ &amp; Pastel
          </button>
          <button
            onClick={() => setSelectedCategory('hiendai')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'hiendai'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Hiện Đại &amp; Santorini
          </button>
        </div>

        {/* Template Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {filteredTemplates.map((tpl) => {
            const isSelected = currentTheme === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => onSelectTheme(tpl.id)}
                className={`relative rounded-2xl border-2 p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? 'border-[#E01460] bg-rose-50/30 ring-2 ring-[#E01460]/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    {tpl.categoryLabel}
                  </span>
                  {tpl.badge && (
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${tpl.badgeColor || 'bg-stone-700'}`}>
                      {tpl.badge}
                    </span>
                  )}
                </div>

                {/* Mockup Card Graphic */}
                <div className={`w-full h-44 rounded-xl overflow-hidden relative shadow-inner bg-gradient-to-br ${tpl.previewGradient} flex flex-col items-center justify-center p-3 text-center`}>
                  {/* Ornamental Emblem */}
                  <div className="w-16 h-16 rounded-full border-2 border-white/80 shadow-md mb-2 bg-white/15 backdrop-blur-xs flex items-center justify-center text-white font-serif text-2xl font-bold">
                    囍
                  </div>

                  <span className="font-serif font-bold text-xs text-white drop-shadow-md">
                    {tpl.name}
                  </span>

                  {/* Palette dots */}
                  <div className="flex items-center gap-1.5 mt-2 bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {tpl.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-white/40 shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Info & Apply */}
                <div className="mt-3 space-y-1">
                  <h4 className="font-bold text-sm text-stone-900 font-serif">
                    {tpl.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                {/* Button */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">
                    {isSelected ? 'Đang kích hoạt' : 'Chọn mẫu'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTheme(tpl.id);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#E01460] text-white shadow-xs'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chọn</span>
                      </>
                    ) : (
                      <span>Áp dụng mẫu</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            Mẫu thiệp đã bao gồm giao diện tương tác, đếm ngược và bản đồ Google Maps.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
