import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const OutletLocator = ({ onSelectOutletForOrder }) => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getOutlets()
      .then((res) => {
        if (isMounted && res.data) setOutlets(res.data);
      })
      .catch((err) => console.error('Failed to load outlets:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGetLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        setLocationError('Izin lokasi tidak diberikan. Anda tetap dapat memilih outlet secara manual.');
      }
    );
  };

  // Haversine distance in KM
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  const cities = ['all', ...Array.from(new Set(outlets.map((o) => o.city)))];

  const filteredOutlets = outlets
    .filter((o) => {
      const matchCity = selectedCity === 'all' || o.city === selectedCity;
      const matchSearch =
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchSearch;
    })
    .map((o) => {
      const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, o.latitude, o.longitude) : undefined;
      return { ...o, distance };
    })
    .sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  return (
    <section id="outlets" className="py-20 bg-white border-t border-[#E5E7EB]">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-[#1B4332] mt-1 mb-3 tracking-tight">
            Lokasi Outlet Kopi Sewu
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Kunjungi kedai terdekat untuk menikmati suasana hangat dan aroma seduhan segar, atau pesan langsung untuk diambil maupun diantar.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] max-w-4xl mx-auto mb-10 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <i className="fas fa-search absolute left-3.5 top-3 text-neutral-400 text-xs"></i>
              <input
                type="text"
                placeholder="Cari outlet atau area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] text-neutral-800"
              />
            </div>

            {/* City Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
                    selectedCity === c
                      ? 'bg-[#1B4332] text-white'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E5E7EB]'
                  }`}
                >
                  {c === 'all' ? 'Semua Kota' : c}
                </button>
              ))}
            </div>

            {/* Geolocation Button */}
            <button
              onClick={handleGetLocation}
              className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-neutral-50 text-[#1B4332] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer border border-[#E5E7EB]"
            >
              <i className="fas fa-location-arrow text-[#52796F] text-xs"></i>
              <span>{userLocation ? 'Lokasi Aktif' : 'Cari Terdekat'}</span>
            </button>
          </div>

          {locationError && (
            <p className="text-xs text-amber-800 mt-2.5 px-1 flex items-center gap-1.5">
              <i className="fas fa-info-circle text-xs"></i>
              <span>{locationError}</span>
            </p>
          )}
        </div>

        {/* Outlet Grid */}
        {loading ? (
          <div className="text-center py-12 text-neutral-400 font-normal text-sm">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            <span>Memuat data outlet...</span>
          </div>
        ) : filteredOutlets.length === 0 ? (
          <div className="text-center py-12 bg-[#F8F9FA] rounded-xl border border-dashed border-[#E5E7EB] max-w-md mx-auto">
            <i className="fas fa-store-slash text-2xl text-neutral-400 mb-2"></i>
            <p className="text-neutral-600 text-xs">Tidak ada outlet yang sesuai dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOutlets.map((outlet) => (
              <div
                key={outlet.id}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:border-[#52796F] transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className="font-semibold text-base text-neutral-800 leading-snug">
                      {outlet.name}
                    </h3>
                    {/* Calm status badge without blinking or pulsing */}
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1.5 ${
                        outlet.isOpenNow
                          ? 'bg-[#E8F5E9] text-[#1B4332] border border-[#C8E6C9]'
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${outlet.isOpenNow ? 'bg-[#2D6A4F]' : 'bg-neutral-400'}`}></span>
                      <span>{outlet.isOpenNow ? 'Buka' : 'Tutup'}</span>
                    </span>
                  </div>

                  {outlet.distance !== undefined && (
                    <div className="mb-3 text-[11px] text-[#2D6A4F] font-medium">
                      <i className="fas fa-route mr-1 text-[#52796F]"></i> ~{outlet.distance} km dari lokasimu
                    </div>
                  )}

                  <p className="text-xs text-neutral-500 mb-4 leading-relaxed flex items-start gap-2">
                    <i className="fas fa-map-marker-alt text-[#52796F] mt-0.5 shrink-0 text-xs"></i>
                    <span>{outlet.address}</span>
                  </p>

                  <div className="space-y-1.5 text-xs text-neutral-600 mb-6 bg-[#F8F9FA] p-3 rounded-lg border border-[#E5E7EB]/70">
                    <div className="flex items-center gap-2 text-[11px]">
                      <i className="fas fa-clock text-[#52796F] w-3.5 text-center"></i>
                      <span>{outlet.openingTime} - {outlet.closingTime} WIB</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <i className="fas fa-phone-alt text-[#52796F] w-3.5 text-center"></i>
                      <a href={`tel:${outlet.phone}`} className="hover:underline text-neutral-700">
                        {outlet.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#F3F4F6]">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 text-center bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-lg transition-colors duration-150 border border-[#E5E7EB] flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-directions text-[#52796F] text-xs"></i>
                    <span>Arah</span>
                  </a>

                  {onSelectOutletForOrder && (
                    <button
                      onClick={() => onSelectOutletForOrder(outlet)}
                      className="flex-1 py-2 px-3 text-center bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-medium rounded-lg transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-shopping-bag text-xs"></i>
                      <span>Pesan</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
