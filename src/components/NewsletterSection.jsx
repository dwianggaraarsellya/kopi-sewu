import React, { useState } from 'react';
import { api } from '../services/api.js';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Silakan masukkan alamat email yang valid.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.subscribeNewsletter(email);
      setFeedback({ type: 'success', message: res.message || 'Terima kasih telah bergabung!' });
      setEmail('');
    } catch (err) {
      const msg = err && err.message ? err.message : 'Terjadi kendala saat berlangganan.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white text-neutral-800 border-t border-[#E5E7EB]">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <h2 className="text-3xl font-bold mt-1 mb-3 tracking-tight text-[#1B4332]">
          Warta Kopi Sewu
        </h2>
        <p className="mb-8 text-neutral-500 text-sm font-normal leading-relaxed max-w-xl mx-auto">
          Dapatkan wawasan seputar panen biji kopi lokal, panduan seduh manual, serta undangan mencicipi sajian musiman pertama kali.
        </p>

        {/* Minimalist Single-Line Form */}
        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Masukkan alamat email Anda"
            required
            className="flex-1 px-4 py-2.5 bg-[#F9FAFB] text-neutral-800 placeholder-neutral-400 text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all duration-150"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2D6A4F] hover:bg-[#1B4332] px-5 py-2.5 rounded-lg font-medium text-white transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap text-xs"
          >
            {loading ? <i className="fas fa-spinner fa-spin" /> : <span>Berlangganan</span>}
          </button>
        </form>

        {feedback && (
          <div
            className={`mt-4 max-w-md mx-auto p-2.5 rounded-lg text-xs font-normal ${
              feedback.type === 'success'
                ? 'bg-[#E8F5E9] text-[#1B4332] border border-[#C8E6C9]'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Minimal Social Links */}
        <div className="mt-10 flex justify-center space-x-6 text-neutral-400">
          <a href="#" aria-label="Instagram Kopi Sewu" className="hover:text-[#1B4332] transition-colors duration-150 text-base">
            <i className="fab fa-instagram" />
          </a>
          <a href="#" aria-label="Facebook Kopi Sewu" className="hover:text-[#1B4332] transition-colors duration-150 text-base">
            <i className="fab fa-facebook-f" />
          </a>
          <a href="#" aria-label="Twitter Kopi Sewu" className="hover:text-[#1B4332] transition-colors duration-150 text-base">
            <i className="fab fa-twitter" />
          </a>
          <a href="#" aria-label="WhatsApp Kopi Sewu" className="hover:text-[#1B4332] transition-colors duration-150 text-base">
            <i className="fab fa-whatsapp" />
          </a>
        </div>
      </div>
    </section>
  );
};
