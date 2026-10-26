import React from 'react';

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Story Narrative */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mt-1 mb-6 tracking-tight text-[#1B4332] leading-tight">
              Kisah Kopi Sewu
            </h2>
            <div className="space-y-4 text-neutral-600 text-sm leading-relaxed font-normal">
              <p>
                Berakar dari kecintaan mendalam terhadap kekayaan kopi tanah air, Kopi Sewu hadir sebagai ruang temu hangat bagi para penikmat kopi artisan, teh daun lepas, dan cerita keseharian.
              </p>
              <p>
                Kami bermitra langsung dengan kelompok tani lokal dari berbagai dataran tinggi nusantara. Praktik perdagangan yang berkeadilan menjamin kualitas panen terbaik sekaligus mendukung keberlanjutan mata pencaharian komunitas petani.
              </p>
              <p>
                Lebih dari sekadar secangkir seduhan, Kopi Sewu adalah tempat untuk berkarya, berdiskusi santai, atau menikmati hening di tengah riuhnya hari.
              </p>
            </div>
            
            {/* Clean Stats Counters */}
            <div className="grid grid-cols-3 gap-3.5 mt-8 pt-8 border-t border-[#E5E7EB]">
              <div className="bg-white p-4 rounded-xl text-center border border-[#E5E7EB] shadow-xs">
                <div className="text-2xl font-bold text-[#1B4332] mb-0.5">5+</div>
                <div className="text-xs text-[#2D6A4F] font-medium">Tahun Melayani</div>
              </div>
              <div className="bg-white p-4 rounded-xl text-center border border-[#E5E7EB] shadow-xs">
                <div className="text-2xl font-bold text-[#1B4332] mb-0.5">12+</div>
                <div className="text-xs text-[#2D6A4F] font-medium">Petani Mitra</div>
              </div>
              <div className="bg-white p-4 rounded-xl text-center border border-[#E5E7EB] shadow-xs">
                <div className="text-2xl font-bold text-[#1B4332] mb-0.5">50+</div>
                <div className="text-xs text-[#2D6A4F] font-medium">Tim & Barista</div>
              </div>
            </div>
          </div>

          {/* Aesthetic Editorial Visual */}
          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
                alt="Interior Kedai Kopi Sewu"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Kedai Utama Kopi Sewu</h3>
                  <p className="text-xs text-neutral-200">Ruang seduh hangat dengan pencahayaan alami dan suasana yang ramah.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
