import React, { useState, useEffect } from 'react';

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    alt: 'Biji kopi pilihan nusantara'
  },
  {
    url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    alt: 'Suasana santai di kedai Kopi Sewu'
  },
  {
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    alt: 'Penyeduhan kopi manual espresso'
  }
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-container relative">
      {/* Calm Background Slides with smooth subtle fade */}
      {heroImages.map((item, index) => (
        <div
          key={item.url}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url('${item.url}')` }}
          role="img"
          aria-label={item.alt}
        />
      ))}

      {/* Hero Content - Clean, Minimalist & Focused */}
      <div className="hero-content flex items-center justify-center h-full text-center text-white py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-cursive text-5xl md:text-7xl font-normal mb-5 tracking-wide text-white">
            Kopi Sewu
          </h1>

          <p className="text-base md:text-xl mb-10 font-light tracking-wide text-neutral-200 max-w-xl mx-auto leading-relaxed">
            Kopi Berkualitas, Cerita di Setiap Cangkir. Hadir menghangatkan setiap momen berharga Anda.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#menu"
              className="w-full sm:w-auto bg-[#2D6A4F] hover:bg-[#388E3C] text-white px-7 py-3 rounded-lg text-sm font-medium transition-colors duration-150 border border-[#40916C]/60"
            >
              Lihat Menu Kami
            </a>
            <a
              href="#outlets"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-7 py-3 rounded-lg text-sm font-medium transition-colors duration-150 border border-white/25"
            >
              Cari Outlet Terdekat
            </a>
          </div>

          {/* Minimalist Slide Indicators */}
          <div className="flex justify-center items-center gap-2 mt-12">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  idx === currentSlide
                    ? 'w-6 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
