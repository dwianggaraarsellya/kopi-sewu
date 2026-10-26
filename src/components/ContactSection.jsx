import React, { useState } from 'react';
import { api } from '../services/api.js';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
    if (status) setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', message: 'Mohon lengkapi nama, email, dan pesan Anda.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await api.sendContact(formData);
      setStatus({ type: 'success', message: res.message || 'Pesan Anda berhasil terkirim ke tim Kopi Sewu!' });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      const msg = err && err.message ? err.message : 'Terjadi kendala saat mengirim pesan.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white text-neutral-800 border-t border-[#E5E7EB]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mt-1 mb-3 tracking-tight text-[#1B4332]">
            Hubungi Kopi Sewu
          </h2>
          <p className="text-neutral-500 text-sm font-normal leading-relaxed">
            Punya pertanyaan mengenai varietas kopi, reservasi ruang temu, atau ingin bermitra? Kami siap menyapa Anda.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Contact Form */}
          <div className="lg:w-1/2">
            <form onSubmit={handleSubmit} className="bg-white p-7 rounded-xl border border-[#E5E7EB] text-neutral-800 space-y-4">
              {status && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    status.type === 'success'
                      ? 'bg-[#E8F5E9] border border-[#C8E6C9] text-[#1B4332]'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mt-0.5 text-xs`} />
                  <span>{status.message}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block mb-1 text-xs font-medium text-neutral-700">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama Anda"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] focus:bg-white text-neutral-800 transition-colors duration-150"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-1 text-xs font-medium text-neutral-700">Alamat Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] focus:bg-white text-neutral-800 transition-colors duration-150"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block mb-1 text-xs font-medium text-neutral-700">Nomor Telepon / WhatsApp</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0812-xxxx-xxxx"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] focus:bg-white text-neutral-800 transition-colors duration-150"
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-1 text-xs font-medium text-neutral-700">Pesan Anda</label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                  required
                  className="w-full px-3.5 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] focus:bg-white text-neutral-800 transition-colors duration-150"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-5 py-2.5 rounded-lg font-medium text-xs w-full transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin text-xs" />
                    <span>Mengirim Pesan...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane text-xs" />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div className="lg:w-1/2 flex flex-col justify-between">
            <div className="bg-white rounded-xl p-7 border border-[#E5E7EB] shadow-xs h-full flex flex-col justify-between text-neutral-800">
              <div>
                <h3 className="text-xl font-semibold mb-6 text-[#1B4332] tracking-tight">
                  Informasi Kantor & Kedai Utama
                </h3>

                <div className="space-y-5 text-xs text-neutral-600">
                  <div className="flex items-start gap-3.5">
                    <div className="text-[#2D6A4F] mt-0.5 text-sm">
                      <i className="fas fa-map-marker-alt" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-0.5">Lokasi Utama</h4>
                      <p className="leading-relaxed text-neutral-500">
                        Jl. Malioboro No. 1000, Sosromenduran, Gedong Tengen<br />
                        Kota Yogyakarta, D.I. Yogyakarta 55271
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="text-[#2D6A4F] mt-0.5 text-sm">
                      <i className="fas fa-envelope" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-0.5">Email Korespondensi</h4>
                      <a href="mailto:kontak@kopisewu.id" className="text-neutral-600 hover:text-[#1B4332] transition-colors duration-150">
                        kontak@kopisewu.id
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="text-[#2D6A4F] mt-0.5 text-sm">
                      <i className="fas fa-phone-alt" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-0.5">Layanan Pelanggan</h4>
                      <p className="text-neutral-500">+62 812-3456-7890</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="text-[#2D6A4F] mt-0.5 text-sm">
                      <i className="fas fa-clock" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-0.5">Jam Operasional Kedai</h4>
                      <p className="leading-relaxed text-neutral-500">
                        Senin - Jumat: 07.00 - 22.00 WIB<br />
                        Sabtu - Minggu: 07.00 - 23.00 WIB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E7EB] mt-6">
                <span className="text-[11px] uppercase tracking-wider text-[#2D6A4F] font-medium block mb-2">
                  Terhubung di Media Sosial
                </span>
                <div className="flex space-x-4 text-neutral-400">
                  <a href="#" aria-label="Facebook" className="hover:text-[#1B4332] transition-colors duration-150 text-sm">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a href="#" aria-label="Instagram" className="hover:text-[#1B4332] transition-colors duration-150 text-sm">
                    <i className="fab fa-instagram" />
                  </a>
                  <a href="#" aria-label="Twitter" className="hover:text-[#1B4332] transition-colors duration-150 text-sm">
                    <i className="fab fa-twitter" />
                  </a>
                  <a href="#" aria-label="WhatsApp" className="hover:text-[#1B4332] transition-colors duration-150 text-sm">
                    <i className="fab fa-whatsapp" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Map Embed */}
        <div className="mt-12 rounded-xl overflow-hidden border border-[#E5E7EB] shadow-xs">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.973950454374!2d110.36384217589333!3d-7.792576977335606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5742a17b134d%3A0x6007e60058bc26e8!2sJl.%20Malioboro%2C%20Sosromenduran%2C%20Gedong%20Tengen%2C%20Kota%20Yogyakarta%2C%20Daerah%20Istimewa%20Yogyakarta!5e0!3m2!1sid!2sid!4v1714000000000!5m2!1sid!2sid"
            width="100%"
            height="360"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            title="Peta Lokasi Kopi Sewu"
            className="w-full h-72 md:h-80"
          />
        </div>
      </div>
    </section>
  );
};
