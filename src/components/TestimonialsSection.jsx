import React from 'react';

const testimonials = [
  {
    name: 'Bayu Wicaksono',
    role: 'Pelanggan Setia',
    quote: 'Kopi Sewu Signature adalah perpaduan rasa kopi terbaik yang pernah saya nikmati. Selalu mampir sebelum ke kantor, baristanya ramah dan konsisten menjaga rasa.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    stars: 5
  },
  {
    name: 'Clara Anindita',
    role: 'Pencinta Teh Daun',
    quote: 'Pilihan teh daun lepas di Kopi Sewu sangat beragam. Teh chamomile dengan madu alami di sini selalu menjadi pilihan terbaik untuk menenangkan pikiran di sore hari.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    stars: 5
  },
  {
    name: 'Dimas Anggoro',
    role: 'Digital Nomad',
    quote: 'Ruang paling nyaman untuk bekerja. Suasana tenang, tempat duduk ergonomis, dan seduhan Cold Brew-nya luar biasa segar menemani produktivitas harian.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    stars: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white border-t border-[#E5E7EB]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#1B4332] mt-1 mb-3 tracking-tight">
            Apa Kata Sahabat Kopi Sewu
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Pengalaman nyata dari mereka yang telah menjadikan Kopi Sewu sebagai bagian dari rutinitas harian.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="bg-white p-7 rounded-xl border border-[#E5E7EB] hover:border-[#52796F] transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#2D6A4F] text-xs mb-4">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <i key={i} className="fas fa-star" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-6 text-xs leading-relaxed font-light">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center pt-4 border-t border-[#F3F4F6]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover mr-3.5 border border-[#E5E7EB]"
                />
                <div>
                  <h4 className="font-semibold text-neutral-800 text-xs">{item.name}</h4>
                  <p className="text-[11px] text-neutral-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
