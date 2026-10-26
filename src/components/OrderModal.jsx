import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const OrderModal = ({
  isOpen,
  onClose,
  preSelectedItem,
  preSelectedOutlet,
  onOrderSuccessViewStatus
}) => {
  const [products, setProducts] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [orderType, setOrderType] = useState('dine_in');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getProducts().then((res) => {
        if (res && res.data) {
          setProducts(res.data);
          if (selectedItems.length === 0) {
            if (preSelectedItem) {
              setSelectedItems([{
                productId: preSelectedItem.id,
                name: preSelectedItem.name,
                price: preSelectedItem.price,
                quantity: 1
              }]);
            } else if (res.data.length > 0) {
              setSelectedItems([{
                productId: res.data[0].id,
                name: res.data[0].name,
                price: res.data[0].price,
                quantity: 1
              }]);
            }
          }
        }
      }).catch((err) => console.error(err));

      api.getOutlets().then((res) => {
        if (res && res.data) {
          setOutlets(res.data);
          if (preSelectedOutlet) {
            setSelectedOutletId(preSelectedOutlet.id);
          } else if (res.data.length > 0 && !selectedOutletId) {
            setSelectedOutletId(res.data[0].id);
          }
        }
      }).catch((err) => console.error(err));
    }
  }, [isOpen, preSelectedItem, preSelectedOutlet]);

  if (!isOpen) return null;

  const handleAddItem = (item) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.productId === item.id);
      if (existing) {
        return prev.map((i) => i.productId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((it) => (it.productId === productId ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const totalAmount = selectedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Silakan lengkapi nama dan nomor WhatsApp Anda.');
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMessage('Pilih minimal satu menu untuk dipesan.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Alamat pengiriman wajib diisi untuk layanan pesan antar.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.createOrder({
        customerName,
        customerPhone,
        outletId: selectedOutletId || (outlets[0] && outlets[0].id ? outlets[0].id : 'out-1'),
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        items: selectedItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          notes: it.notes
        })),
        paymentMethod,
        notes
      });
      setOrderSuccess({ id: res.data.id, total: res.data.totalAmount });
    } catch (err) {
      const msg = err && err.message ? err.message : 'Gagal mengirim pesanan.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setOrderSuccess(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col border border-[#E5E7EB] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1B4332] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#2D6A4F]/40">
          <div className="flex items-center gap-2">
            <i className="fas fa-shopping-bag text-sm text-[#A3B18A]" />
            <div>
              <h3 className="font-semibold text-sm leading-tight text-white">Pemesanan Online Kopi Sewu</h3>
              <p className="text-[10px] text-neutral-300">Sistem Pemesanan Terintegrasi</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="text-neutral-300 hover:text-white p-1 cursor-pointer transition-colors"
            aria-label="Tutup modal"
          >
            <i className="fas fa-times text-base" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-neutral-800">
          {orderSuccess ? (
            <div className="text-center py-5 space-y-3.5">
              <div className="w-12 h-12 bg-[#E8F5E9] text-[#2D6A4F] rounded-full flex items-center justify-center mx-auto text-xl border border-[#C8E6C9]">
                <i className="fas fa-check" />
              </div>
              <h4 className="text-base font-bold text-[#1B4332]">Pesanan Berhasil Dikonfirmasi!</h4>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                Nomor Antrean Pesanan:
                <strong className="text-neutral-900 font-mono text-sm block mt-0.5 bg-[#F8F9FA] py-1 px-2 rounded border border-[#E5E7EB]">
                  {orderSuccess.id}
                </strong>
              </p>

              <div className="bg-[#F8F9FA] p-3.5 rounded-lg border border-[#E5E7EB] text-xs text-left space-y-2">
                <div className="flex justify-between font-semibold text-neutral-800">
                  <span>Total Tagihan:</span>
                  <span className="text-[#1B4332]">
                    Rp {orderSuccess.total.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Metode Pembayaran:</span>
                  <span className="uppercase font-medium text-neutral-700">{paymentMethod}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Layanan:</span>
                  <span className="font-medium text-neutral-700">
                    {orderType === 'dine_in' ? 'Dine In' : orderType === 'takeaway' ? 'Bawa Pulang' : 'Pesan Antar'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 pt-2 border-t border-[#E5E7EB]">
                  Pesanan telah masuk ke sistem outlet. Simpan nomor pesanan untuk melacak status pembuatan.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {onOrderSuccessViewStatus && (
                  <button
                    onClick={() => {
                      const id = orderSuccess.id;
                      resetAndClose();
                      onOrderSuccessViewStatus(id);
                    }}
                    className="flex-1 py-2 bg-white hover:bg-neutral-50 text-[#1B4332] rounded-lg text-xs font-medium transition-colors border border-[#E5E7EB] cursor-pointer"
                  >
                    <i className="fas fa-search mr-1.5 text-[#52796F]" />
                    Lacak Pesanan
                  </button>
                )}
                <button
                  onClick={resetAndClose}
                  className="flex-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle text-xs shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Outlet & Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Outlet Pilihan</label>
                  <select
                    value={selectedOutletId}
                    onChange={(e) => setSelectedOutletId(e.target.value)}
                    className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2 bg-white focus:outline-none focus:border-[#2D6A4F] text-neutral-800"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Pilihan Layanan</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#F8F9FA] rounded-lg border border-[#E5E7EB] text-xs">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        orderType === 'dine_in'
                          ? 'bg-[#1B4332] text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Dine In
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        orderType === 'takeaway'
                          ? 'bg-[#1B4332] text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Bawa Pulang
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        orderType === 'delivery'
                          ? 'bg-[#1B4332] text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Antar
                    </button>
                  </div>
                </div>
              </div>

              {orderType === 'delivery' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Alamat Pengantaran</label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Alamat lengkap, nomor rumah / patokan lokasi..."
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] text-neutral-800"
                  />
                </div>
              )}

              {/* Items In Order */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5 text-[11px] tracking-wide">
                  Daftar Pesanan ({selectedItems.reduce((s, it) => s + it.quantity, 0)} item)
                </label>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-2.5 bg-[#F8F9FA] rounded-lg text-xs border border-[#E5E7EB]"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-neutral-800 block text-xs">{item.name}</span>
                        <span className="text-[#1B4332] font-semibold text-[11px]">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, -1)}
                          className="w-5 h-5 bg-white rounded border border-[#E5E7EB] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, 1)}
                          className="w-5 h-5 bg-white rounded border border-[#E5E7EB] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <select
                    className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2 bg-white text-neutral-700 focus:outline-none focus:border-[#2D6A4F]"
                    onChange={(e) => {
                      const found = products.find((p) => p.id === e.target.value);
                      if (found) handleAddItem(found);
                    }}
                    value=""
                  >
                    <option value="" disabled>+ Tambah menu lain...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.formattedPrice}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Nama Pemesan</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] text-neutral-800"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'qris', label: 'QRIS', icon: 'fa-qrcode' },
                    { id: 'bank_transfer', label: 'Transfer Bank', icon: 'fa-university' },
                    { id: 'cash', label: 'Tunai di Kasir', icon: 'fa-money-bill-wave' }
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition-colors duration-150 cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'border-[#2D6A4F] bg-[#E8F5E9] text-[#1B4332] font-semibold'
                          : 'border-[#E5E7EB] bg-white text-neutral-600 hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <i className={`fas ${pm.icon} text-xs text-[#52796F]`} />
                      <span className="text-[11px]">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Kurang manis, tanpa sedotan"
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D6A4F] text-neutral-800"
                />
              </div>

              {/* Total & Action */}
              <div className="pt-3 border-t border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-neutral-600">Total Tagihan:</span>
                  <span className="text-base font-bold text-[#1B4332]">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading || selectedItems.length === 0}
                  className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white py-2.5 rounded-lg font-medium text-xs transition-colors duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs" />
                      <span>Mengonfirmasi Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle text-xs" />
                      <span>Konfirmasi & Buat Pesanan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
