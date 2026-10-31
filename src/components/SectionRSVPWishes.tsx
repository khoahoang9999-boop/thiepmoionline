import React, { useState } from 'react';
import { InvitationData, ThemeConfig, GuestRSVP } from '../types/invitation';
import confetti from 'canvas-confetti';
import { Send, Heart, Gift, CheckCircle2, MessageSquare, Phone, Users } from 'lucide-react';

interface SectionRSVPWishesProps {
  invitation: InvitationData;
  theme: ThemeConfig;
  wishes: GuestRSVP[];
  onAddWishes: (w: GuestRSVP) => void;
  onOpenGiftModal: () => void;
  guestName: string;
}

export const SectionRSVPWishes: React.FC<SectionRSVPWishesProps> = ({
  invitation,
  theme,
  wishes,
  onAddWishes,
  onOpenGiftModal,
  guestName
}) => {
  const [name, setName] = useState(guestName || '');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [dietary, setDietary] = useState('Bình thường');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRsvp: GuestRSVP = {
      id: `w-${Date.now()}`,
      guestName: name.trim(),
      phone: phone.trim() || '---',
      attending,
      guestCount,
      dietary,
      wishes: message.trim() || (attending === 'yes' ? 'Hân hoan chúc mừng ngày vui!' : 'Xin gửi lời chúc phúc từ phương xa!'),
      createdAt: 'Vừa xong'
    };

    onAddWishes(newRsvp);
    setSubmitted(true);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      // ignore
    }
  };

  return (
    <section id="section-rsvp" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Chapter Title */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.25em] text-stone-400 font-sans font-medium">
          Trang 4 · Xác Nhận & Lời Chúc
        </span>
        <h2 className="text-3xl sm:text-4xl font-luxury font-medium text-stone-900 mt-2 tracking-tight">
          Xác Nhận Tham Dự & Sổ Lưu Bút
        </h2>
        <div className="w-12 h-px bg-stone-300 mx-auto my-4" />
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          Sự hiện diện của bạn là niềm vinh hạnh to lớn. Xin vui lòng phản hồi trước{' '}
          <strong className="text-stone-800">{invitation.rsvpDeadline}</strong> để chúng tôi chuẩn bị tiếp đón chu đáo nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: RSVP Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-luxury font-semibold text-stone-900">
                Cảm Ơn Bạn Rất Nhiều!
              </h3>
              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Chúng tôi đã nhận được phản hồi và lời chúc ý nghĩa của bạn. Rất mong chờ được đón tiếp bạn trong ngày vui!
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-medium text-stone-500 hover:text-stone-800 underline mt-2"
              >
                Gửi thêm lời chúc khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-lg font-luxury font-semibold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-700" />
                <span>Phiếu Xác Nhận (RSVP)</span>
              </h3>

              {/* Attendance Choice */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-2">
                  Bạn có thể đến chung vui không?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttending('yes')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all ${
                      attending === 'yes'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    🎉 Chắc chắn sẽ tham dự
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttending('no')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all ${
                      attending === 'no'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    💌 Rất tiếc bận dịp này
                  </button>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Họ và tên của bạn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Hoàng"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Phone and guest count row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    Số điện thoại liên hệ
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0909 xxx xxx"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                    />
                  </div>
                </div>

                {attending === 'yes' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">
                      Số lượng người đi cùng
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                      >
                        <option value={1}>Đi 1 mình</option>
                        <option value={2}>Đi 2 người (Cùng người thương)</option>
                        <option value={3}>Đi 3 người</option>
                        <option value={4}>Gia đình (4 người trở lên)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Dietary Requirement */}
              {attending === 'yes' && (
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    Khẩu vị đặc biệt / Kiêng khem
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                  >
                    <option value="Bình thường">Thực đơn tiệc bình thường</option>
                    <option value="Ăn chay (Vegetarian)">Ăn chay thanh tịnh</option>
                    <option value="Dị ứng hải sản">Dị ứng hải sản / tôm cua</option>
                    <option value="Không dùng cồn">Không dùng đồ uống có cồn</option>
                  </select>
                </div>
              )}

              {/* Wishes / Messages */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Lời chúc mừng gửi trao
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Gửi gắm những lời chúc tốt đẹp nhất..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Send className="w-4 h-4" />
                <span>Gửi Xác Nhận Tham Dự</span>
              </button>
            </form>
          )}

          {/* Gift Box / Banking info button */}
          <div className="mt-6 pt-6 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Gửi quà hoặc tiền mừng từ xa?
            </span>
            <button
              onClick={onOpenGiftModal}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-50 transition-colors text-stone-700"
            >
              <Gift className="w-3.5 h-3.5 text-amber-700" />
              <span>Hộp Mừng Quà & STK</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Wish Wall / Guestbook (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-500" />
              <h3 className="text-lg font-luxury font-semibold text-stone-900">
                Sổ Lưu Bút ({wishes.length})
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              Live updates
            </span>
          </div>

          {/* Wishes List */}
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {wishes.map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-stone-800">
                    {w.guestName}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {w.createdAt}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 italic leading-relaxed">
                  "{w.wishes}"
                </p>
                {w.attending === 'yes' && (
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 pt-0.5">
                    <span>✓ Sẽ tham dự ({w.guestCount} khách)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Contact */}
      <div className="mt-16 text-center text-xs text-stone-500 space-y-1 border-t border-stone-200/60 pt-8">
        <p>Mọi thắc mắc xin vui lòng liên hệ Ban Tổ Chức: {invitation.contactPhone}</p>
        <p className="font-luxury italic text-stone-400">
          Chân thành cảm ơn sự hiện diện và chúc phúc của quý vị.
        </p>
      </div>
    </section>
  );
};
