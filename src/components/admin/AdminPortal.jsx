import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api.js";

export const AdminPortal = ({ onBackToCustomerSite }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("kopi_sewu_admin_token"));
  const [adminUser, setAdminUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("kopisewu2026");
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderOutletFilter, setOrderOutletFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [financePeriod, setFinancePeriod] = useState("this_month");
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [productModal, setProductModal] = useState({ isOpen: false, mode: "add" });
  const [outletModal, setOutletModal] = useState({ isOpen: false, mode: "add" });
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "coffee",
    price: 25e3,
    costPrice: 11e3,
    stock: 50,
    description: "",
    temperature: "Hot / Iced",
    sizes: "12oz / 16oz"
  });
  const [outletForm, setOutletForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    openingTime: "07:00",
    closingTime: "22:00",
    latitude: -7.7925,
    longitude: 110.3638
  });
  const [expenseForm, setExpenseForm] = useState({
    category: "bahan_baku",
    description: "",
    amount: 5e5,
    outletId: ""
  });
  useEffect(() => {
    if (token) {
      api.getMe(token).then((res) => {
        if (res.user) setAdminUser(res.user);
      }).catch(() => {
        setToken(null);
        sessionStorage.removeItem("kopi_sewu_admin_token");
      });
    }
  }, [token]);
  const loadData = useCallback(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      api.getOrders({}, token),
      api.getProducts(),
      api.getOutlets(),
      api.getFinancialSummary({ period: financePeriod }, token),
      api.getBusinessForecast(token)
    ]).then(([ordersRes, productsRes, outletsRes, finRes, forecastRes]) => {
      if (ordersRes.data) setOrders(ordersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (outletsRes.data) setOutlets(outletsRes.data);
      if (finRes.data) setFinanceSummary(finRes.data);
      if (forecastRes.data) setForecast(forecastRes.data);
    }).catch((err) => console.error(err)).finally(() => setLoading(false));
  }, [token, financePeriod]);
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await api.login(loginUsername, loginPassword);
      if (res.token) {
        setToken(res.token);
        setAdminUser(res.user);
        sessionStorage.setItem("kopi_sewu_admin_token", res.token);
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoginLoading(false);
    }
  };
  const handleLogout = () => {
    setToken(null);
    setAdminUser(null);
    sessionStorage.removeItem("kopi_sewu_admin_token");
  };
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!token) return;
    try {
      await api.updateOrderStatus(orderId, newStatus, token);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memperbarui status");
    }
  };
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (productModal.mode === "add") {
        await api.addProduct(productForm, token);
      } else if (productModal.item) {
        await api.updateProduct(productModal.item.id, productForm, token);
      }
      setProductModal({ isOpen: false, mode: "add" });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan produk");
    }
  };
  const handleSaveOutlet = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (outletModal.mode === "add") {
        await api.addOutlet(outletForm, token);
      } else if (outletModal.item) {
        await api.updateOutlet(outletModal.item.id, outletForm, token);
      }
      setOutletModal({ isOpen: false, mode: "add" });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan outlet");
    }
  };
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.recordExpense(expenseForm, token);
      setExpenseModalOpen(false);
      setExpenseForm({ category: "bahan_baku", description: "", amount: 5e5, outletId: "" });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mencatat pengeluaran");
    }
  };
  const handleExportCSV = () => {
    if (!financeSummary) return;
    const rows = [
      ["Tipe", "Tanggal", "Judul / Pesanan", "Outlet", "Nominal (Rp)", "Status"],
      ...financeSummary.recentTransactions.map((tx) => [
        tx.type === "sale" ? "PENJUALAN" : "PENGELUARAN",
        tx.date.split("T")[0],
        `"${tx.title.replace(/"/g, '""')}"`,
        `"${tx.outletName || "-"}"`,
        tx.amount,
        tx.status || "selesai"
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_Kopi_Sewu_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePrint = () => {
    window.print();
  };
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-sm w-full border border-[#E5E7EB] text-center">
          <div className="w-12 h-12 bg-[#1B4332] text-white rounded-xl flex items-center justify-center mx-auto text-xl font-bold font-cursive mb-3">
            KS
          </div>
          <h2 className="text-xl font-bold text-[#1B4332] tracking-tight">Portal Admin Kopi Sewu</h2>
          <p className="text-xs text-neutral-500 mt-1 mb-5">
            Masuk untuk mengelola operasional, pesanan, inventaris, dan keuangan.
          </p>

          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            {loginError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] focus:bg-white text-xs border border-[#E5E7EB] rounded-lg focus:border-[#2D6A4F] focus:outline-none text-neutral-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] focus:bg-white text-xs border border-[#E5E7EB] rounded-lg focus:border-[#2D6A4F] focus:outline-none text-neutral-800 transition-colors"
              />
            </div>

            <div className="p-2.5 bg-[#F4F6F4] rounded-lg text-[11px] text-[#1B4332] border border-[#CAD2C5]">
              <span className="font-semibold block mb-0.5">Kredensial Default Terkonfigurasi:</span>
              Username: <code className="font-semibold">admin</code> · Password: <code className="font-semibold">kopisewu2026</code>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white py-2.5 rounded-lg font-medium text-xs transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <div className="mt-5 pt-3 border-t border-[#F3F4F6]">
            <button
              onClick={onBackToCustomerSite}
              className="text-xs text-neutral-500 hover:text-[#1B4332] transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <i className="fas fa-arrow-left text-[10px]" />
              <span>Kembali ke Website Pelanggan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const matchOutlet = orderOutletFilter === "all" || o.outletId === orderOutletFilter;
    const matchSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerPhone.includes(orderSearch);
    return matchStatus && matchOutlet && matchSearch;
  });
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="bg-[#1B4332] text-white sticky top-0 z-40 border-b border-[#2D6A4F]/40 print:hidden">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-[#1B4332] flex items-center justify-center font-cursive font-bold text-lg">
              KS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">Kopi Sewu</span>
                <span className="text-[9px] bg-[#A3B18A] text-[#143628] font-bold px-1.5 py-0.2 rounded">
                  PORTAL ADMIN
                </span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-none">
                Sistem Manajemen Kedai & Keuangan Terpadu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToCustomerSite}
              className="text-xs text-neutral-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-[#2D6A4F] hover:bg-[#2D6A4F] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <i className="fas fa-external-link-alt text-[10px]" />
              <span className="hidden sm:inline">Web Pelanggan</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs bg-red-800 hover:bg-red-900 text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <i className="fas fa-sign-out-alt text-[10px]" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#143628] border-t border-[#2D6A4F]/30">
          <div className="container mx-auto px-6 flex overflow-x-auto no-scrollbar gap-1 py-1">
            {[
              { id: "overview", label: "Ringkasan", icon: "fa-chart-pie" },
              { id: "orders", label: `Pesanan (${orders.filter((o) => o.status === "pending" || o.status === "preparing").length})`, icon: "fa-receipt" },
              { id: "products", label: "Katalog & Stok", icon: "fa-coffee" },
              { id: "outlets", label: "Kelola Outlet", icon: "fa-store" },
              { id: "finance", label: "Keuangan & Laporan", icon: "fa-file-invoice-dollar" },
              { id: "forecast", label: "Prediksi Bisnis", icon: "fa-chart-line" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#2D6A4F] text-white"
                    : "text-neutral-300 hover:text-white hover:bg-[#1B4332]"
                }`}
              >
                <i className={`fas ${tab.icon} text-xs`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="container mx-auto px-6 py-6 flex-1">
        {
    /* --- TAB 1: OVERVIEW DASHBOARD --- */
  }
        {activeTab === "overview" && financeSummary && <div className="space-y-8 animate-in fade-in duration-200">
            {
    /* Top Stat Cards */
  }
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#DDE5DD] shadow-xs">
                <span className="text-xs font-medium text-gray-500 block mb-1">Penjualan Bersih (Bulan Ini)</span>
                <span className="text-2xl font-bold text-[#1B5E20] block">
                  Rp {financeSummary.netSales.toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Dari {financeSummary.ordersCount.completed} pesanan sukses
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DDE5DD] shadow-xs">
                <span className="text-xs font-medium text-gray-500 block mb-1">Laba Operasional Bersih</span>
                <span className={`text-2xl font-bold block ${financeSummary.netOperatingProfit >= 0 ? "text-[#2E7D32]" : "text-red-600"}`}>
                  Rp {financeSummary.netOperatingProfit.toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Margin: {financeSummary.netProfitMarginPercent}%
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DDE5DD] shadow-xs">
                <span className="text-xs font-medium text-gray-500 block mb-1">Pesanan Aktif Diproses</span>
                <span className="text-2xl font-bold text-amber-600 block">
                  {orders.filter((o) => o.status === "pending" || o.status === "preparing").length}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Perlu perhatian barista
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DDE5DD] shadow-xs">
                <span className="text-xs font-medium text-gray-500 block mb-1">Stok Produk Rendah (&lt;25)</span>
                <span className="text-2xl font-bold text-rose-600 block">
                  {products.filter((p) => p.stock < 25).length} Produk
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Perlu pengadaan ulang
                </span>
              </div>
            </div>

            {
    /* Middle Section: Recent Orders & Forecast Preview */
  }
            <div className="grid lg:grid-cols-3 gap-6">
              {
    /* Recent Orders List */
  }
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1B5E20] text-base">Pesanan Masuk Terbaru</h3>
                  <button
    onClick={() => setActiveTab("orders")}
    className="text-xs text-[#2E7D32] hover:underline font-semibold"
  >
                    Lihat Semua ({orders.length}) &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                        <th className="py-2.5">ID & Waktu</th>
                        <th className="py-2.5">Pelanggan</th>
                        <th className="py-2.5">Outlet</th>
                        <th className="py-2.5">Total</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 6).map((o) => <tr key={o.id} className="hover:bg-neutral-50/80">
                          <td className="py-3 font-mono">
                            <span className="font-bold text-neutral-800">{o.id}</span>
                            <span className="block text-[10px] text-gray-400">{o.createdAt.split("T")[0]}</span>
                          </td>
                          <td className="py-3 font-medium text-neutral-800">{o.customerName}</td>
                          <td className="py-3 text-gray-500">{o.outletName.replace("Kopi Sewu - ", "")}</td>
                          <td className="py-3 font-bold text-[#2E7D32]">Rp {o.totalAmount.toLocaleString("id-ID")}</td>
                          <td className="py-3">
                            <span
    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.status === "completed" ? "bg-[#E8F5E9] text-[#2E7D32]" : o.status === "preparing" ? "bg-amber-100 text-amber-800" : o.status === "ready" ? "bg-blue-100 text-blue-800" : o.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
  >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
    onClick={() => setSelectedOrderForReceipt(o)}
    className="text-xs text-gray-500 hover:text-[#1B5E20] p-1 cursor-pointer"
    title="Lihat Struk"
  >
                              <i className="fas fa-print" />
                            </button>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>

              {
    /* Quick Business Forecast Teaser */
  }
              <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-sm">
                      <i className="fas fa-chart-line" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1B5E20]">Prediksi 7 Hari Ke Depan</h4>
                      <p className="text-[11px] text-gray-500">Berdasarkan data time-series aktual</p>
                    </div>
                  </div>

                  {forecast ? <div className="space-y-4 pt-2">
                      <div className="bg-[#F1F8F2] p-4 rounded-xl border border-[#DDE5DD]">
                        <span className="text-[11px] text-gray-500 block">Arah Tren Penjualan:</span>
                        <strong className="text-base text-[#1B5E20]">{forecast.metrics.trendDirection}</strong>
                        <span className="text-[11px] text-gray-500 block mt-1">
                          Tingkat Keyakinan Model: <strong>{forecast.metrics.confidenceScorePercent}%</strong>
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        <span className="font-bold text-neutral-800 block">Kebutuhan Bahan Baku 7 Hari:</span>
                        <div className="flex justify-between">
                          <span>Biji Kopi Arabika:</span>
                          <strong>{forecast.ingredientDemandForecast.coffeeBeansKgNext7Days} kg</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Susu Pasteurisasi:</span>
                          <strong>{forecast.ingredientDemandForecast.freshMilkLitersNext7Days} Liter</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Gula Aren Organik:</span>
                          <strong>{forecast.ingredientDemandForecast.sugarArenKgNext7Days} kg</strong>
                        </div>
                      </div>
                    </div> : <div className="text-center py-8 text-xs text-gray-500">Memuat analisis...</div>}
                </div>

                <button
    onClick={() => setActiveTab("forecast")}
    className="w-full mt-4 py-2 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#A5D6A7]"
  >
                  Buka Detail Analisis Prediksi &rarr;
                </button>
              </div>
            </div>
          </div>}

        {
    /* --- TAB 2: ORDER MANAGEMENT --- */
  }
        {activeTab === "orders" && <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#1B5E20]">Kelola Pesanan Pelanggan</h3>
                <p className="text-xs text-gray-500">Monitor dan perbarui alur status pesanan secara real-time.</p>
              </div>

              {
    /* Filters */
  }
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
    type="text"
    placeholder="Cari ID / Nama / No HP..."
    value={orderSearch}
    onChange={(e) => setOrderSearch(e.target.value)}
    className="text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
  />

                <select
    value={orderStatusFilter}
    onChange={(e) => setOrderStatusFilter(e.target.value)}
    className="text-xs border border-gray-300 rounded-xl p-2 bg-white"
  >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu (Pending)</option>
                  <option value="preparing">Disiapkan (Preparing)</option>
                  <option value="ready">Siap Diambil (Ready)</option>
                  <option value="completed">Selesai (Completed)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>

                <select
    value={orderOutletFilter}
    onChange={(e) => setOrderOutletFilter(e.target.value)}
    className="text-xs border border-gray-300 rounded-xl p-2 bg-white"
  >
                  <option value="all">Semua Outlet</option>
                  {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>

            {
    /* Orders Table */
  }
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <th className="py-3">No. Pesanan</th>
                    <th className="py-3">Pelanggan</th>
                    <th className="py-3">Outlet</th>
                    <th className="py-3">Menu & Catatan</th>
                    <th className="py-3">Total & Bayar</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">
                        Tidak ada pesanan yang sesuai dengan filter.
                      </td>
                    </tr> : filteredOrders.map((o) => <tr key={o.id} className="hover:bg-neutral-50">
                        <td className="py-3 font-mono">
                          <button
    onClick={() => setSelectedOrderForReceipt(o)}
    className="font-bold text-[#1B5E20] hover:underline cursor-pointer block"
  >
                            {o.id}
                          </button>
                          <span className="text-[10px] text-gray-400">{o.createdAt.replace("T", " ").slice(0, 16)}</span>
                        </td>
                        <td className="py-3">
                          <strong className="text-neutral-800 block">{o.customerName}</strong>
                          <span className="text-gray-500 text-[11px]">{o.customerPhone}</span>
                        </td>
                        <td className="py-3 text-gray-600">
                          {o.outletName.replace("Kopi Sewu - ", "")}
                          <span className="block text-[10px] uppercase text-gray-400">{o.orderType}</span>
                        </td>
                        <td className="py-3 max-w-xs">
                          <div className="space-y-0.5">
                            {o.items.map((it, idx) => <div key={idx} className="text-neutral-700">
                                {it.quantity}x {it.name}
                              </div>)}
                          </div>
                          {o.notes && <p className="text-[10px] text-amber-700 italic mt-1">"{o.notes}"</p>}
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-[#2E7D32] block">
                            Rp {o.totalAmount.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10px] uppercase text-gray-500">
                            {o.paymentMethod} ({o.paymentStatus})
                          </span>
                        </td>
                        <td className="py-3">
                          <span
    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-block ${o.status === "completed" ? "bg-[#E8F5E9] text-[#2E7D32]" : o.status === "preparing" ? "bg-amber-100 text-amber-800" : o.status === "ready" ? "bg-blue-100 text-blue-800" : o.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
  >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {o.status === "pending" && <button
    onClick={() => handleUpdateOrderStatus(o.id, "preparing")}
    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold cursor-pointer"
  >
                                Siapkan
                              </button>}
                            {o.status === "preparing" && <button
    onClick={() => handleUpdateOrderStatus(o.id, "ready")}
    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer"
  >
                                Siap
                              </button>}
                            {o.status === "ready" && <button
    onClick={() => handleUpdateOrderStatus(o.id, "completed")}
    className="px-2 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded text-[10px] font-bold cursor-pointer"
  >
                                Selesai
                              </button>}
                            {o.status !== "completed" && o.status !== "cancelled" && <button
    onClick={() => {
      if (confirm("Batalkan pesanan ini?")) handleUpdateOrderStatus(o.id, "cancelled");
    }}
    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[10px] font-bold cursor-pointer"
  >
                                Batal
                              </button>}
                            <button
    onClick={() => setSelectedOrderForReceipt(o)}
    className="p-1 text-gray-500 hover:text-neutral-800 cursor-pointer ml-1"
    title="Cetak Struk"
  >
                              <i className="fas fa-print" />
                            </button>
                          </div>
                        </td>
                      </tr>)}
                </tbody>
              </table>
            </div>
          </div>}

        {
    /* --- TAB 3: PRODUCTS & INVENTORY --- */
  }
        {activeTab === "products" && <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#1B5E20]">Katalog Produk & Inventaris</h3>
                <p className="text-xs text-gray-500">Kelola menu, harga jual, harga pokok (HPP), dan ketersediaan stok.</p>
              </div>

              <button
    onClick={() => {
      setProductForm({
        name: "",
        category: "coffee",
        price: 25e3,
        costPrice: 11e3,
        stock: 50,
        description: "",
        temperature: "Hot / Iced",
        sizes: "12oz / 16oz"
      });
      setProductModal({ isOpen: true, mode: "add" });
    }}
    className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
  >
                <i className="fas fa-plus" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            {
    /* Products Table */
  }
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <th className="py-3">Produk</th>
                    <th className="py-3">Kategori</th>
                    <th className="py-3">Harga Jual</th>
                    <th className="py-3">HPP (Modal)</th>
                    <th className="py-3">Margin Laba</th>
                    <th className="py-3">Stok Saat Ini</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
    const margin = p.price > 0 ? Math.round((p.price - p.costPrice) / p.price * 100) : 0;
    return <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="py-3">
                          <strong className="text-neutral-800 block text-sm">{p.name}</strong>
                          <span className="text-[11px] text-gray-500 line-clamp-1">{p.description}</span>
                        </td>
                        <td className="py-3 uppercase text-gray-500 font-semibold">{p.category}</td>
                        <td className="py-3 font-bold text-[#1B5E20]">Rp {p.price.toLocaleString("id-ID")}</td>
                        <td className="py-3 text-gray-600">Rp {p.costPrice.toLocaleString("id-ID")}</td>
                        <td className="py-3">
                          <span className="text-xs font-bold text-[#2E7D32]">+{margin}%</span>
                        </td>
                        <td className="py-3">
                          <span className={`font-mono font-bold ${p.stock < 25 ? "text-red-600" : "text-neutral-800"}`}>
                            {p.stock} pcs
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isAvailable ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-red-100 text-red-700"}`}>
                            {p.isAvailable ? "Tersedia" : "Habis / Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
      onClick={() => {
        setProductForm({
          name: p.name,
          category: p.category,
          price: p.price,
          costPrice: p.costPrice,
          stock: p.stock,
          description: p.description,
          temperature: p.temperature || "Hot / Iced",
          sizes: p.sizes || "12oz / 16oz"
        });
        setProductModal({ isOpen: true, mode: "edit", item: p });
      }}
      className="text-[#2E7D32] hover:text-[#1B5E20] font-bold text-xs p-1 cursor-pointer"
    >
                            Edit
                          </button>
                        </td>
                      </tr>;
  })}
                </tbody>
              </table>
            </div>
          </div>}

        {
    /* --- TAB 4: OUTLETS MANAGEMENT --- */
  }
        {activeTab === "outlets" && <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#1B5E20]">Kelola Jaringan Outlet Kopi Sewu</h3>
                <p className="text-xs text-gray-500">Atur lokasi cabang, koordinat peta, dan jam operasional harian.</p>
              </div>

              <button
    onClick={() => {
      setOutletForm({
        name: "",
        city: "",
        address: "",
        phone: "",
        openingTime: "07:00",
        closingTime: "22:00",
        latitude: -7.7925,
        longitude: 110.3638
      });
      setOutletModal({ isOpen: true, mode: "add" });
    }}
    className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
  >
                <i className="fas fa-plus" />
                <span>Tambah Outlet Baru</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outlets.map((o) => <div key={o.id} className="bg-[#F1F8F2] p-5 rounded-2xl border border-[#DDE5DD] flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-neutral-800 text-base">{o.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.isActive ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-gray-200 text-gray-600"}`}>
                        {o.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-3">{o.address}</p>
                    <div className="text-xs space-y-1 text-gray-500 mb-4">
                      <div><i className="fas fa-city mr-1 text-[#2E7D32]" /> Kota: <strong>{o.city}</strong></div>
                      <div><i className="fas fa-phone mr-1 text-[#2E7D32]" /> Kontak: {o.phone}</div>
                      <div><i className="fas fa-clock mr-1 text-[#2E7D32]" /> Jam: {o.openingTime} - {o.closingTime} WIB</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#DDE5DD]">
                    <button
    onClick={() => {
      setOutletForm({
        name: o.name,
        city: o.city,
        address: o.address,
        phone: o.phone,
        openingTime: o.openingTime,
        closingTime: o.closingTime,
        latitude: o.latitude,
        longitude: o.longitude
      });
      setOutletModal({ isOpen: true, mode: "edit", item: o });
    }}
    className="flex-1 py-1.5 bg-white hover:bg-gray-100 text-neutral-700 text-xs font-semibold rounded-lg border border-gray-300 transition-colors cursor-pointer text-center"
  >
                      Edit Detail
                    </button>
                    <a
    href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 bg-white text-gray-600 hover:text-[#1B5E20] rounded-lg border border-gray-300 text-xs"
    title="Buka di Maps"
  >
                      <i className="fas fa-map-marker-alt" />
                    </a>
                  </div>
                </div>)}
            </div>
          </div>}

        {
    /* --- TAB 5: FINANCE & REPORTS --- */
  }
        {activeTab === "finance" && financeSummary && <div className="space-y-6 animate-in fade-in duration-200">
            {
    /* Header & Filter Controls */
  }
            <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div>
                <h3 className="text-xl font-bold text-[#1B5E20]">Laporan Keuangan & Arus Kas</h3>
                <p className="text-xs text-gray-500">Pencatatan laba rugi, HPP, beban operasional, dan cetak dokumen resmi.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
    value={financePeriod}
    onChange={(e) => setFinancePeriod(e.target.value)}
    className="text-xs border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
  >
                  <option value="today">Hari Ini</option>
                  <option value="this_week">Minggu Ini</option>
                  <option value="this_month">Bulan Ini</option>
                  <option value="this_year">Tahun Ini</option>
                  <option value="all">Semua Riwayat</option>
                </select>

                <button
    onClick={() => setExpenseModalOpen(true)}
    className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
  >
                  <i className="fas fa-plus" />
                  <span>Catat Pengeluaran</span>
                </button>

                <button
    onClick={handleExportCSV}
    className="bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[#A5D6A7] flex items-center gap-1.5"
  >
                  <i className="fas fa-file-csv" />
                  <span>Ekspor CSV</span>
                </button>

                <button
    onClick={handlePrint}
    className="bg-neutral-800 hover:bg-neutral-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
  >
                  <i className="fas fa-print" />
                  <span>Cetak Laporan</span>
                </button>
              </div>
            </div>

            {
    /* Printable Report Sheet */
  }
            <div className="bg-white rounded-2xl p-8 border border-[#DDE5DD] shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
              {
    /* Report Header for Print */
  }
              <div className="border-b-2 border-[#1B5E20] pb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-cursive text-4xl font-bold text-[#1B5E20]">Kopi Sewu</h2>
                  <p className="text-xs text-gray-500 font-medium">Laporan Resmi Kinerja Finansial & Laba Rugi</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Periode: <strong>{financeSummary.startDate.split("T")[0]} s/d {financeSummary.endDate.split("T")[0]}</strong>
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Tanggal Cetak: <strong>{(/* @__PURE__ */ new Date()).toLocaleDateString("id-ID")}</strong></p>
                  <p>Status: <strong className="text-[#2E7D32]">Diaudit Secara Internal</strong></p>
                </div>
              </div>

              {
    /* Profit & Loss Calculation Grid */
  }
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#F1F8F2] p-5 rounded-2xl border border-[#DDE5DD]">
                  <span className="text-xs font-bold uppercase text-gray-500 block mb-1">1. Penjualan Bersih (Net Sales)</span>
                  <span className="text-2xl font-black text-[#1B5E20] block">
                    Rp {financeSummary.netSales.toLocaleString("id-ID")}
                  </span>
                  <div className="text-[11px] text-gray-500 mt-2 space-y-0.5">
                    <div>Penjualan Kotor: Rp {financeSummary.grossSales.toLocaleString("id-ID")}</div>
                    <div>Potongan Diskon: Rp {financeSummary.discounts.toLocaleString("id-ID")}</div>
                  </div>
                </div>

                <div className="bg-[#F1F8F2] p-5 rounded-2xl border border-[#DDE5DD]">
                  <span className="text-xs font-bold uppercase text-gray-500 block mb-1">2. Laba Kotor (Gross Profit)</span>
                  <span className="text-2xl font-black text-neutral-800 block">
                    Rp {financeSummary.grossProfit.toLocaleString("id-ID")}
                  </span>
                  <div className="text-[11px] text-gray-500 mt-2 space-y-0.5">
                    <div>HPP / Bahan Baku: Rp {financeSummary.cogs.toLocaleString("id-ID")}</div>
                    <div>Gross Margin: <strong>{financeSummary.grossProfitMarginPercent}%</strong></div>
                  </div>
                </div>

                <div className="bg-[#E8F5E9] p-5 rounded-2xl border border-[#A5D6A7]">
                  <span className="text-xs font-bold uppercase text-[#1B5E20] block mb-1">3. Laba Operasional Bersih</span>
                  <span className={`text-2xl font-black block ${financeSummary.netOperatingProfit >= 0 ? "text-[#1B5E20]" : "text-red-600"}`}>
                    Rp {financeSummary.netOperatingProfit.toLocaleString("id-ID")}
                  </span>
                  <div className="text-[11px] text-[#1B5E20] mt-2 space-y-0.5">
                    <div>Beban Operasional: Rp {financeSummary.totalExpenses.toLocaleString("id-ID")}</div>
                    <div>Net Profit Margin: <strong>{financeSummary.netProfitMarginPercent}%</strong></div>
                  </div>
                </div>
              </div>

              {
    /* Expense Breakdown */
  }
              <div className="border border-[#DDE5DD] rounded-2xl p-6 bg-neutral-50/50">
                <h4 className="font-bold text-sm text-[#1B5E20] mb-4">Rincian Beban Operasional</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {financeSummary.expensesByCategory.map((exp) => <div key={exp.category} className="bg-white p-3 rounded-xl border border-gray-200">
                      <span className="text-[11px] text-gray-500 block">{exp.label}</span>
                      <strong className="text-sm text-neutral-800 block">
                        Rp {exp.totalAmount.toLocaleString("id-ID")}
                      </strong>
                      <span className="text-[10px] text-gray-400">{exp.percentage}% dari total beban</span>
                    </div>)}
                </div>
              </div>

              {
    /* Transactions Ledger */
  }
              <div>
                <h4 className="font-bold text-sm text-[#1B5E20] mb-3">Catatan Transaksi Masuk & Keluar</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#F1F8F2] text-gray-700 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Jenis</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                        <th className="py-2.5 px-3">Outlet</th>
                        <th className="py-2.5 px-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {financeSummary.recentTransactions.map((tx, idx) => <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono text-gray-500">{tx.date.split("T")[0]}</td>
                          <td className="py-2.5 px-3 font-bold uppercase">
                            <span className={tx.type === "sale" ? "text-[#2E7D32]" : "text-red-600"}>
                              {tx.type === "sale" ? "PEMASUKAN" : "PENGELUARAN"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-neutral-800">{tx.title}</td>
                          <td className="py-2.5 px-3 text-gray-500">{tx.outletName || "-"}</td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${tx.amount >= 0 ? "text-[#2E7D32]" : "text-red-600"}`}>
                            Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                Kopi Sewu · Dokumen Resmi Sistem Akuntansi Finansial · Dikelola secara otomatis oleh sistem backend.
              </div>
            </div>
          </div>}

        {
    /* --- TAB 6: BUSINESS FORECAST --- */
  }
        {activeTab === "forecast" && <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#1B5E20]">Modul Prediksi Bisnis & Penjualan</h3>
                <p className="text-xs text-gray-500">
                  Model proyeksi deret waktu (time-series) berdasarkan transaksi historis aktual Kopi Sewu.
                </p>
              </div>

              {forecast && <div className="px-3.5 py-1.5 bg-[#E8F5E9] text-[#1B5E20] rounded-xl text-xs font-semibold border border-[#A5D6A7]">
                  Metode: {forecast.metrics.methodName}
                </div>}
            </div>

            {forecast ? <div className="space-y-6">
                {
    /* 30-Day Outlook & Accuracy Cards */
  }
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#DDE5DD] shadow-xs">
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
                      Estimasi Penjualan 30 Hari Ke Depan
                    </span>
                    <span className="text-3xl font-black text-[#1B5E20] block">
                      Rp {forecast.forecastNext30DaysSummary.estimatedTotalRevenue.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-[#2E7D32] font-semibold mt-1 block">
                      Proyeksi {forecast.forecastNext30DaysSummary.estimatedTotalOrders} pesanan
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#DDE5DD] shadow-xs">
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
                      Arah Tren Pasar
                    </span>
                    <span className="text-2xl font-black text-neutral-800 block">
                      {forecast.metrics.trendDirection}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Tingkat Keandalan Model: <strong>{forecast.metrics.confidenceScorePercent}%</strong>
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#DDE5DD] shadow-xs">
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
                      Metrik Kesalahan Model (MAE)
                    </span>
                    <span className="text-2xl font-black text-neutral-800 block">
                      ±Rp {forecast.metrics.meanAbsoluteError.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Dievaluasi dari {forecast.metrics.historicalDaysCount} hari data aktual
                    </span>
                  </div>
                </div>

                {
    /* 7-Day Daily Forecast Table / Visualization */
  }
                <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs">
                  <h4 className="font-bold text-sm text-[#1B5E20] mb-4">
                    Proyeksi Penjualan Harian (7 Hari Mendatang)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                    {forecast.forecastNext7Days.map((f, i) => <div key={i} className="bg-[#F1F8F2] p-4 rounded-xl border border-[#DDE5DD] text-center">
                        <span className="text-xs font-bold text-[#1B5E20] block">{f.dayName}</span>
                        <span className="text-[10px] text-gray-400 block mb-2">{f.date}</span>
                        <span className="text-sm font-black text-neutral-800 block">
                          Rp {Math.round(f.totalSales / 1e3)}k
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-1">
                          ~{f.orderCount} pesanan
                        </span>
                      </div>)}
                  </div>
                </div>

                {
    /* Ingredient Demand & Product Trends */
  }
                <div className="grid lg:grid-cols-2 gap-6">
                  {
    /* Ingredient Planning */
  }
                  <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs">
                    <h4 className="font-bold text-sm text-[#1B5E20] mb-3">
                      Estimasi Kebutuhan Pengadaan Bahan Baku (7 Hari)
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Dihitung otomatis berdasarkan resep standar espresso, takaran susu per cangkir, dan rasio historis.
                    </p>

                    <div className="space-y-3">
                      <div className="p-3 bg-[#F1F8F2] rounded-xl flex items-center justify-between border border-[#DDE5DD]">
                        <div>
                          <strong className="text-xs text-neutral-800 block">Biji Kopi Arabika Pilihan</strong>
                          <span className="text-[10px] text-gray-500">Rasio 18 gram / shot espresso</span>
                        </div>
                        <span className="text-base font-bold text-[#1B5E20]">
                          {forecast.ingredientDemandForecast.coffeeBeansKgNext7Days} kg
                        </span>
                      </div>

                      <div className="p-3 bg-[#F1F8F2] rounded-xl flex items-center justify-between border border-[#DDE5DD]">
                        <div>
                          <strong className="text-xs text-neutral-800 block">Susu Segar Pasteurisasi</strong>
                          <span className="text-[10px] text-gray-500">Rasio 150 ml / cangkir latte & cappuccino</span>
                        </div>
                        <span className="text-base font-bold text-[#1B5E20]">
                          {forecast.ingredientDemandForecast.freshMilkLitersNext7Days} Liter
                        </span>
                      </div>

                      <div className="p-3 bg-[#F1F8F2] rounded-xl flex items-center justify-between border border-[#DDE5DD]">
                        <div>
                          <strong className="text-xs text-neutral-800 block">Sirup Gula Aren Organik</strong>
                          <span className="text-[10px] text-gray-500">Signature blend Kopi Sewu</span>
                        </div>
                        <span className="text-base font-bold text-[#1B5E20]">
                          {forecast.ingredientDemandForecast.sugarArenKgNext7Days} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {
    /* Product Performance Trends */
  }
                  <div className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-xs">
                    <h4 className="font-bold text-sm text-[#1B5E20] mb-3">
                      Analisis Tren Penjualan Produk
                    </h4>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                            <th className="py-2">Nama Menu</th>
                            <th className="py-2">Terjual</th>
                            <th className="py-2">Omset</th>
                            <th className="py-2 text-right">Tren</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {forecast.productTrends.map((pt) => <tr key={pt.productId}>
                              <td className="py-2 font-medium text-neutral-800">{pt.name}</td>
                              <td className="py-2">{pt.totalQuantity} cup</td>
                              <td className="py-2 font-bold text-[#2E7D32]">Rp {pt.totalRevenue.toLocaleString("id-ID")}</td>
                              <td className="py-2 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pt.trend === "up" ? "bg-[#E8F5E9] text-[#2E7D32]" : pt.trend === "down" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                                  {pt.trend === "up" ? "\u25B2 Naik" : pt.trend === "down" ? "\u25BC Turun" : "\u2014 Stabil"}
                                </span>
                              </td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <i className="fas fa-info-circle text-sm mt-0.5 shrink-0" />
                  <span>{forecast.disclaimer}</span>
                </div>
              </div> : <div className="text-center py-12 text-sm text-gray-500">Memuat data prediksi...</div>}
          </div>}
      </main>

      {
    /* --- MODAL: RECEIPT PRINT --- */
  }
      {selectedOrderForReceipt && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-300 font-mono text-xs text-neutral-800">
            <div className="text-center pb-4 border-b border-dashed border-gray-400">
              <h3 className="font-cursive text-2xl font-bold text-[#1B5E20]">Kopi Sewu</h3>
              <p className="text-[10px] text-gray-600">{selectedOrderForReceipt.outletName}</p>
              <p className="text-[10px] text-gray-400 mt-1">Struk Bukti Pembayaran Resmi</p>
            </div>

            <div className="py-3 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div>No: <strong>{selectedOrderForReceipt.id}</strong></div>
              <div>Tanggal: {selectedOrderForReceipt.createdAt.replace("T", " ").slice(0, 16)}</div>
              <div>Pelanggan: {selectedOrderForReceipt.customerName}</div>
              <div>Layanan: {selectedOrderForReceipt.orderType.toUpperCase()}</div>
            </div>

            <div className="py-3 border-b border-dashed border-gray-400 space-y-2">
              {selectedOrderForReceipt.items.map((it, idx) => <div key={idx} className="flex justify-between items-start">
                  <div>
                    <span>{it.quantity}x {it.name}</span>
                    {it.notes && <span className="block text-[10px] text-gray-400">({it.notes})</span>}
                  </div>
                  <span>Rp {(it.price * it.quantity).toLocaleString("id-ID")}</span>
                </div>)}
            </div>

            <div className="py-3 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {selectedOrderForReceipt.subtotal.toLocaleString("id-ID")}</span>
              </div>
              {selectedOrderForReceipt.discount > 0 && <div className="flex justify-between text-red-600">
                  <span>Diskon:</span>
                  <span>-Rp {selectedOrderForReceipt.discount.toLocaleString("id-ID")}</span>
                </div>}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-200">
                <span>TOTAL:</span>
                <span>Rp {selectedOrderForReceipt.totalAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                <span>Metode: {selectedOrderForReceipt.paymentMethod.toUpperCase()}</span>
                <span>Status: {selectedOrderForReceipt.paymentStatus.toUpperCase()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-400 text-center space-y-3">
              <p className="text-[10px] text-gray-500 italic">"Kopi Berkualitas, Cerita di Setiap Cangkir"</p>
              <div className="flex gap-2">
                <button
    onClick={() => window.print()}
    className="flex-1 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
  >
                  <i className="fas fa-print mr-1" /> Cetak
                </button>
                <button
    onClick={() => setSelectedOrderForReceipt(null)}
    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
  >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>}

      {
    /* --- MODAL: PRODUCT ADD / EDIT --- */
  }
      {productModal.isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-base text-[#1B5E20] mb-4">
              {productModal.mode === "add" ? "Tambah Produk Menu Baru" : "Edit Produk Menu"}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Produk</label>
                <input
    type="text"
    required
    value={productForm.name}
    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
    value={productForm.category}
    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl bg-white"
  >
                    <option value="coffee">Pilihan Kopi (Coffee)</option>
                    <option value="tea">Pilihan Teh (Tea)</option>
                    <option value="pastry">Kudapan & Pastry</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stok Awal</label>
                  <input
    type="number"
    value={productForm.stock}
    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
    className="w-full px-3 py-2 border rounded-xl"
  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Harga Jual (Rp)</label>
                  <input
    type="number"
    required
    value={productForm.price}
    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
    className="w-full px-3 py-2 border rounded-xl"
  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">HPP / Modal (Rp)</label>
                  <input
    type="number"
    required
    value={productForm.costPrice}
    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
    className="w-full px-3 py-2 border rounded-xl"
  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Menu</label>
                <textarea
    rows={2}
    value={productForm.description}
    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
              </div>

              <div className="flex gap-2 pt-3">
                <button
    type="submit"
    className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl"
  >
                  Simpan Produk
                </button>
                <button
    type="button"
    onClick={() => setProductModal({ isOpen: false, mode: "add" })}
    className="px-4 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl"
  >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* --- MODAL: OUTLET ADD / EDIT --- */
  }
      {outletModal.isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-base text-[#1B5E20] mb-4">
              {outletModal.mode === "add" ? "Tambah Outlet Baru" : "Edit Detail Outlet"}
            </h3>
            <form onSubmit={handleSaveOutlet} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Outlet</label>
                <input
    type="text"
    required
    placeholder="Cth: Kopi Sewu - Malioboro"
    value={outletForm.name}
    onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Kota / Area</label>
                  <input
    type="text"
    required
    placeholder="Yogyakarta"
    value={outletForm.city}
    onChange={(e) => setOutletForm({ ...outletForm, city: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">No. Telepon / WA</label>
                  <input
    type="text"
    value={outletForm.phone}
    onChange={(e) => setOutletForm({ ...outletForm, phone: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Alamat Lengkap</label>
                <textarea
    rows={2}
    required
    value={outletForm.address}
    onChange={(e) => setOutletForm({ ...outletForm, address: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Jam Buka</label>
                  <input
    type="text"
    placeholder="07:00"
    value={outletForm.openingTime}
    onChange={(e) => setOutletForm({ ...outletForm, openingTime: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jam Tutup</label>
                  <input
    type="text"
    placeholder="22:00"
    value={outletForm.closingTime}
    onChange={(e) => setOutletForm({ ...outletForm, closingTime: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
    type="submit"
    className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl"
  >
                  Simpan Outlet
                </button>
                <button
    type="button"
    onClick={() => setOutletModal({ isOpen: false, mode: "add" })}
    className="px-4 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl"
  >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* --- MODAL: RECORD EXPENSE --- */
  }
      {expenseModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-base text-[#1B5E20] mb-4">Catat Beban Pengeluaran Baru</h3>
            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Kategori Beban</label>
                <select
    value={expenseForm.category}
    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl bg-white"
  >
                  <option value="bahan_baku">Bahan Baku (Biji Kopi, Susu, Sirup)</option>
                  <option value="operasional">Operasional (Listrik, Air, Perawatan)</option>
                  <option value="gaji">Gaji & Upah Barista</option>
                  <option value="sewa">Sewa Tempat & Gedung</option>
                  <option value="pemasaran">Pemasaran & Iklan</option>
                  <option value="lainnya">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Transaksi</label>
                <input
    type="text"
    required
    placeholder="Contoh: Beli Biji Kopi Gayo 10kg"
    value={expenseForm.description}
    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl"
  />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nominal Pengeluaran (Rp)</label>
                <input
    type="number"
    required
    value={expenseForm.amount}
    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
    className="w-full px-3 py-2 border rounded-xl"
  />
              </div>

              <div>
                <label className="block font-semibold mb-1">Outlet Terkait (Opsional)</label>
                <select
    value={expenseForm.outletId}
    onChange={(e) => setExpenseForm({ ...expenseForm, outletId: e.target.value })}
    className="w-full px-3 py-2 border rounded-xl bg-white"
  >
                  <option value="">Semua / Kantor Pusat</option>
                  {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
    type="submit"
    className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl"
  >
                  Catat Pengeluaran
                </button>
                <button
    type="button"
    onClick={() => setExpenseModalOpen(false)}
    className="px-4 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl"
  >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>
  );
};
