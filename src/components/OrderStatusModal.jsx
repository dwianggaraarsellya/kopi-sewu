import React, { useState } from 'react';
import { api } from '../services/api.js';

export const OrderStatusModal = ({ isOpen, onClose, initialOrderId }) => {
  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOrderById(searchId.trim());
      if (res && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      setOrder(null);
      const msg = err && err.message ? err.message : 'Pesanan tidak ditemukan. Periksa kembali ID pesanan Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'pending', label: 'Menunggu', icon: 'fa-clock' },
    { key: 'preparing', label: 'Sedang Diseduh', icon: 'fa-coffee' },
    { key: 'ready', label: 'Siap Diambil/Antar', icon: 'fa-check' },
    { key: 'completed', label: 'Selesai', icon: 'fa-box' }
  ];

  const getStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex((s) => s.key === status);
  };

  const activeStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col border border-[#E5E7EB] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1B4332] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#2D6A4F]/40">
          <div className="flex items-center gap-2">
            <i className="fas fa-receipt text-sm text-[#A3B18A]" />
            <h3 className="font-semibold text-sm">Cek Status Pesanan</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-white p-1 cursor-pointer transition-colors"
            aria-label="Tutup"
          >
            <i className="fas fa-times text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-neutral-800">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan ID Pesanan (cth: KSW-...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F] text-neutral-800"
            />
            <button
              type="submit"
              disabled={loading || !searchId.trim()}
              className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-search text-xs" />}
              <span>Lacak</span>
            </button>
          </form>

          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <i className="fas fa-exclamation-circle text-xs shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="space-y-5">
              {/* Order Info Banner */}
              <div className="bg-[#F8F9FA] p-3.5 rounded-lg border border-[#E5E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">ID Pesanan</span>
                  <span className="font-mono font-semibold text-neutral-800 text-sm">{order.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block">Total Tagihan</span>
                  <span className="font-semibold text-[#1B4332] text-sm">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Status Stepper - Calm and Clean (No pulsing) */}
              {order.status === 'cancelled' ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 text-xs font-medium">
                  <i className="fas fa-ban mr-1.5" /> Pesanan Ini Dibatalkan
                </div>
              ) : (
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {steps.map((st, i) => {
                      const isDone = i <= activeStep;
                      const isCurrent = i === activeStep;
                      return (
                        <div key={st.key} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1.5 transition-colors duration-150 ${
                              isDone
                                ? 'bg-[#2D6A4F] text-white'
                                : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                            } ${isCurrent ? 'ring-2 ring-[#52796F]' : ''}`}
                          >
                            <i className={`fas ${st.icon} text-[11px]`} />
                          </div>
                          <span
                            className={`text-[10px] leading-tight font-medium ${
                              isDone ? 'text-[#1B4332]' : 'text-neutral-400'
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="border-t border-[#E5E7EB] pt-3.5 space-y-2.5">
                <h4 className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                  Rincian Pemesanan
                </h4>
                <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E5E7EB] space-y-1.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Outlet:</span>
                    <strong className="text-neutral-800 font-medium">{order.outletName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Layanan:</span>
                    <strong className="text-neutral-800 font-medium">
                      {order.orderType === 'dine_in' ? 'Dine In' : order.orderType === 'takeaway' ? 'Bawa Pulang' : 'Pesan Antar'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pembayaran:</span>
                    <strong className="text-neutral-800 font-medium uppercase">
                      {order.paymentMethod} ({order.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu'})
                    </strong>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex justify-between pt-1 border-t border-[#E5E7EB]">
                      <span>Alamat:</span>
                      <span className="text-right max-w-xs text-neutral-700">{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pt-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-neutral-100 last:border-none">
                      <span className="text-neutral-700">{it.quantity}x {it.name}</span>
                      <span className="font-medium text-neutral-900">
                        Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
