import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const MenuSection = ({ onSelectItemForOrder }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getMenu()
      .then((res) => {
        if (isMounted && res.data) {
          setItems(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load menu:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: 'Semua Menu', icon: 'fa-utensils' },
    { id: 'coffee', label: 'Kopi Nusantara', icon: 'fa-coffee' },
    { id: 'tea', label: 'Teh Daun Pilihan', icon: 'fa-leaf' },
    { id: 'pastry', label: 'Kudapan & Pastry', icon: 'fa-bread-slice' }
  ];

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  const renderCard = (item) => (
    <div
      key={item.id}
      className="menu-item bg-white rounded-xl p-6 flex flex-col justify-between border border-[#E5E7EB] hover:border-[#52796F] transition-all duration-150"
    >
      <div>
        <div className="flex justify-between items-start gap-3 mb-2.5">
          <h4 className="text-base font-semibold text-neutral-800 leading-snug">
            {item.name}
          </h4>
          <span className="text-[#1B4332] font-semibold text-sm whitespace-nowrap bg-[#F4F6F4] px-2.5 py-0.5 rounded text-right">
            {item.formattedPrice}
          </span>
        </div>
        <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3 mb-5">
          {item.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
          {item.temperature && (
            <span className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-150 text-neutral-600">
              {item.temperature}
            </span>
          )}
          {item.sizes && (
            <span className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-150 text-neutral-600">
              {item.sizes}
            </span>
          )}
        </div>

        {onSelectItemForOrder && (
          <button
            onClick={() => onSelectItemForOrder(item)}
            className="text-xs bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-3 py-1.5 rounded-md font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
          >
            <i className="fas fa-plus text-[10px]"></i>
            <span>Pesan</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section id="menu" className="py-20 bg-white border-t border-[#E5E7EB]">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-[#1B4332] mt-1 mb-3 tracking-tight">
            Menu Kopi Sewu
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Temukan ragam racikan kopi artisan nusantara, sajian teh pilihan, serta kudapan segar yang diracik khusus untuk menemani setiap cerita.
          </p>

          {/* Minimalist Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-[#1B4332] text-white border border-[#1B4332]'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E5E7EB]'
                }`}
              >
                <i className={`fas ${cat.icon} text-[10px] opacity-75`}></i>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-neutral-400 py-12 text-sm font-normal">
            <i className="fas fa-spinner fa-spin mr-2"></i> Memuat daftar menu...
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(renderCard)}
          </div>
        )}
      </div>
    </section>
  );
};
