import React, { useState, useEffect } from 'react';

export const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-6 bg-[#1B4332] hover:bg-[#2D6A4F] text-white w-9 h-9 rounded-full shadow-md transition-colors duration-150 z-40 cursor-pointer flex items-center justify-center border border-[#2D6A4F]/60"
    >
      <i className="fas fa-arrow-up text-xs" />
    </button>
  );
};
