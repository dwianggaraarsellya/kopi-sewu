import React from 'react';

const features = [
  {
    title: 'Bahan Baku Pilihan',
    subtitle: 'Premium Ingredients',
    desc: 'Bekerja sama langsung dengan kelompok petani dataran tinggi nusantara untuk memastikan biji kopi dan pucuk teh dipetik pada kematangan optimal.',
    icon: 'fa-seedling',
    image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Penyeduhan Ahli & Presisi',
    subtitle: 'Expert Preparation',
    desc: 'Setiap barista Kopi Sewu menguasai kalibrasi manual brew maupun espresso modern demi konsistensi ekstraksi dan profil rasa yang seimbang.',
    icon: 'fa-mug-hot',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Suasana Tenang & Hangat',
    subtitle: 'Warm Atmosphere',
    desc: 'Kedai kami dirancang sebagai ruang yang ramah dan menenangkan untuk bercengkerama, bekerja dengan fokus, atau menikmati waktu santai Anda.',
    icon: 'fa-heart',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white border-t border-[#E5E7EB]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#1B4332] mt-1 mb-3 tracking-tight">
            Mengapa Memilih Kopi Sewu
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Komitmen kami untuk selalu menghadirkan pengalaman seduhan terbaik dan keramahan khas nusantara.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item) => (
            <div
              key={item.title}
              className="feature-card bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:border-[#52796F] transition-all duration-150 flex flex-col justify-between"
            >
              <div className="h-44 overflow-hidden bg-neutral-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-[#2D6A4F] text-2xl mb-3">
                  <i className={`fas ${item.icon}`} />
                </div>
                <h3 className="text-base font-semibold mb-1.5 text-neutral-800">{item.title}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed flex-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
