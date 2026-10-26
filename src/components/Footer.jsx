import React from 'react';

export const Footer = ({
  onOpenOrderModal,
  onOpenTrackOrder,
  onOpenAdminPortal,
  onOpenInfoModal
}) => {
  return (
    <footer className="bg-[#0F291E] text-white py-14 border-t border-[#1B4332]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Column 1 - Brand Summary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-cursive text-3xl text-white tracking-wide">Kopi Sewu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#52796F]"></span>
            </div>
            <p className="mb-4 text-xs text-neutral-400 leading-relaxed font-light">
              Menyajikan seduhan kopi artisanal dari biji pilihan petani nusantara serta racikan teh daun premium dalam suasana hangat.
            </p>
            <p className="text-[11px] text-neutral-500 mb-4">
              © 2026 Kopi Sewu. Seluruh hak cipta dilindungi.
            </p>
            <button
              onClick={onOpenAdminPortal}
              className="text-xs text-[#A3B18A] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors duration-150"
            >
              <i className="fas fa-lock text-[10px]" />
              <span>Portal Manajemen Admin</span>
            </button>
          </div>

          {/* Column 2 - Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white uppercase tracking-wider text-[11px]">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-150">Beranda</a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors duration-150">Menu Pilihan</a>
              </li>
              <li>
                <a href="#outlets" className="hover:text-white transition-colors duration-150">Lokasi Outlet</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors duration-150">Tentang Kami</a>
              </li>
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-white transition-colors duration-150 cursor-pointer text-left"
                >
                  Lacak Pesanan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderModal}
                  className="hover:text-white transition-colors duration-150 cursor-pointer text-left"
                >
                  Pesan Online
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 - Policies & Info */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white uppercase tracking-wider text-[11px]">
              Ketentuan & Bantuan
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li>
                <button
                  onClick={() => onOpenInfoModal('Kebijakan Privasi', 'Kopi Sewu berkomitmen menjaga kerahasiaan data pelanggan, riwayat pemesanan, dan email buletin. Data Anda tidak akan dibagikan kepada pihak ketiga tanpa persetujuan.')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer text-left"
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('Syarat & Ketentuan', 'Pemesanan di Kopi Sewu tunduk pada ketersediaan bahan baku segar harian. Setiap pesanan disiapkan dengan standar kebersihan dan higienitas tertinggi.')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer text-left"
                >
                  Syarat & Ketentuan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('Kebijakan Pengiriman', 'Layanan pesan antar tersedia untuk radius kota melalui kurir internal dan mitra pengiriman terpercaya guna menjaga kesegaran minuman panas maupun dingin.')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer text-left"
                >
                  Kebijakan Pengiriman
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('Kebijakan Pengembalian', 'Jika pesanan Anda tidak sesuai atau mengalami kerusakan kemasan saat diterima, silakan hubungi tim kami dalam 1 jam untuk penggantian langsung.')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer text-left"
                >
                  Kebijakan Pengembalian
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('Pertanyaan Umum (FAQ)', 'T: Apakah biji kopi Kopi Sewu 100% lokal nusantara?\nJ: Benar, kami bermitra langsung dengan petani di Aceh Gayo, Toraja, Kintamani, dan Jawa Barat.\n\nT: Apakah tersedia menu non-kopi?\nJ: Ya, kami memiliki aneka pilihan teh premium, matcha latte, dan mocktail segar.')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer text-left"
                >
                  Pertanyaan Umum (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Snippet */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white uppercase tracking-wider text-[11px]">
              Kedai Pusat
            </h4>
            <address className="not-italic text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>
                Kedai Utama Malioboro<br />
                Jl. Malioboro No. 1000, Yogyakarta
              </p>
              <p>
                Email: <a href="mailto:kontak@kopisewu.id" className="hover:text-white transition-colors duration-150">kontak@kopisewu.id</a>
              </p>
              <p>Telepon: +62 812-3456-7890</p>
            </address>
          </div>
        </div>

        <div className="border-t border-[#1B4332] mt-12 pt-6 text-center text-[11px] text-neutral-500">
          <p>Kopi Sewu · Kopi Berkualitas, Cerita di Setiap Cangkir.</p>
        </div>
      </div>
    </footer>
  );
};
