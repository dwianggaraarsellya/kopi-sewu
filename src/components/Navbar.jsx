import React, { useState } from 'react';

export const Navbar = ({
  onOpenOrderModal,
  onOpenTrackOrder,
  onOpenAdminPortal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#1B4332] text-white border-b border-[#2D6A4F]/40 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3.5">
        <div className="flex justify-between items-center">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <a href="#" className="flex items-center gap-2 group">
              <span className="font-cursive text-3xl tracking-wide text-white group-hover:text-[#A3B18A] transition-colors duration-150">
                Kopi Sewu
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#52796F]"></span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-normal">
            <a href="#" className="text-[#A3B18A] hover:text-white transition-colors duration-150">
              Beranda
            </a>
            <a href="#menu" className="text-neutral-200 hover:text-white transition-colors duration-150">
              Menu
            </a>
            <a href="#outlets" className="text-neutral-200 hover:text-white transition-colors duration-150 flex items-center gap-1.5">
              <i className="fas fa-map-marker-alt text-xs text-[#A3B18A]"></i>
              <span>Lokasi</span>
            </a>
            <a href="#about" className="text-neutral-200 hover:text-white transition-colors duration-150">
              Tentang
            </a>
            <a href="#contact" className="text-neutral-200 hover:text-white transition-colors duration-150">
              Kontak
            </a>

            {/* Track Order Action */}
            <button
              onClick={onOpenTrackOrder}
              className="text-xs text-neutral-200 hover:text-white bg-[#143628] hover:bg-[#1B4332] border border-[#2D6A4F] px-3 py-1.5 rounded-md transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
              title="Lacak status pesanan Anda"
            >
              <i className="fas fa-search text-[11px] text-[#A3B18A]"></i>
              <span>Lacak Pesanan</span>
            </button>

            {/* Order Online Button */}
            <button
              onClick={onOpenOrderModal}
              className="bg-[#2D6A4F] hover:bg-[#388E3C] text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center gap-2 border border-[#40916C]/50"
            >
              <i className="fas fa-shopping-bag text-xs"></i>
              <span>Pesan Online</span>
            </button>

            {/* Admin Portal Gateway */}
            <button
              onClick={onOpenAdminPortal}
              className="text-xs text-[#A3B18A] hover:text-white px-2 py-1.5 rounded transition-colors duration-150 cursor-pointer flex items-center gap-1 opacity-80 hover:opacity-100"
              title="Dashboard Pengelolaan Bisnis"
            >
              <i className="fas fa-lock text-[10px]"></i>
              <span>Admin</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenOrderModal}
              className="bg-[#2D6A4F] text-white px-2.5 py-1.5 rounded text-xs font-medium"
              aria-label="Pesan online"
            >
              <i className="fas fa-shopping-bag mr-1"></i>
              <span>Pesan</span>
            </button>

            <button
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              className="text-neutral-200 hover:text-white focus:outline-none p-1.5 cursor-pointer"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[#2D6A4F]/40 space-y-2">
            <a
              href="#"
              onClick={closeMobileMenu}
              className="block py-1.5 text-[#A3B18A] font-medium text-sm"
            >
              Beranda
            </a>
            <a
              href="#menu"
              onClick={closeMobileMenu}
              className="block py-1.5 text-neutral-200 hover:text-white transition-colors text-sm"
            >
              Menu
            </a>
            <a
              href="#outlets"
              onClick={closeMobileMenu}
              className="block py-1.5 text-neutral-200 hover:text-white transition-colors text-sm"
            >
              Lokasi Outlet
            </a>
            <a
              href="#about"
              onClick={closeMobileMenu}
              className="block py-1.5 text-neutral-200 hover:text-white transition-colors text-sm"
            >
              Tentang Kami
            </a>
            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="block py-1.5 text-neutral-200 hover:text-white transition-colors text-sm"
            >
              Kontak
            </a>

            <div className="pt-2 border-t border-[#2D6A4F]/30 space-y-2">
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenTrackOrder();
                }}
                className="w-full py-2 bg-[#143628] text-neutral-200 hover:text-white font-medium text-xs rounded border border-[#2D6A4F] text-center"
              >
                <i className="fas fa-search mr-1.5 text-[#A3B18A]"></i>
                Lacak Status Pesanan
              </button>

              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenOrderModal();
                }}
                className="w-full bg-[#2D6A4F] hover:bg-[#388E3C] py-2 rounded text-white font-medium text-xs text-center cursor-pointer"
              >
                <i className="fas fa-shopping-bag mr-1.5"></i>
                Pesan Online Sekarang
              </button>

              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenAdminPortal();
                }}
                className="w-full py-1.5 text-center text-xs text-[#A3B18A] hover:text-white rounded"
              >
                <i className="fas fa-lock mr-1.5 text-[10px]"></i>
                Portal Admin & Manajemen
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
