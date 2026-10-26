import React from 'react';

const teamMembers = [
  {
    name: 'Arga Pratama',
    role: 'Founder & Head Barista',
    bio: 'Kecintaannya pada eksplorasi cita rasa kopi nusantara mendorongnya mengkurasi biji kopi pilihan dan melatih barista dengan kalibrasi seduh presisi.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Nabila Putri',
    role: 'Tea & Beverage Specialist',
    bio: 'Meracik varian teh daun lepas dan sajian herbal Kopi Sewu. Pemahamannya tentang harmoni rasa menciptakan seduhan yang menenangkan.',
    image: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Rizky Fauzan',
    role: 'Head Pastry Chef',
    bio: 'Memadukan seni pastry modern dengan bahan lokal berkualitas untuk memanggang aneka roti dan kudapan segar setiap pagi.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export const TeamSection = () => {
  return (
    <div className="pt-16 border-t border-[#E5E7EB]">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mt-1 mb-3 text-[#1B4332] tracking-tight">
          Kenali Tim Kami
        </h2>
        <p className="text-neutral-500 text-sm font-normal">
          Dedikasi penuh dari para artisan yang bersemangat menyajikan pengalaman terbaik di setiap kunjungan Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className="bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:border-[#52796F] transition-all duration-150 flex flex-col shadow-xs"
          >
            <div className="h-60 overflow-hidden bg-neutral-100">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-base font-semibold text-neutral-800 mb-0.5">{member.name}</h3>
              <p className="text-xs text-[#2D6A4F] font-medium mb-3">{member.role}</p>
              <p className="text-xs text-neutral-500 leading-relaxed font-normal flex-1">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
