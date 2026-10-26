const API_BASE = '/api';

export const api = {
  // Health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Login gagal.');
    return result;
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Sesi autentikasi telah habis.');
    return await res.json();
  },

  // Products
  async getProducts(params) {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Gagal memuat produk.');
    return await res.json();
  },

  // Backward compatibility getMenu
  async getMenu() {
    return this.getProducts();
  },

  async addProduct(product, token) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(product)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menambah produk.');
    return result;
  },

  async updateProduct(id, product, token) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(product)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mengubah produk.');
    return result;
  },

  // Outlets
  async getOutlets(city) {
    const q = city ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetch(`${API_BASE}/outlets${q}`);
    if (!res.ok) throw new Error('Gagal memuat outlet.');
    return await res.json();
  },

  async addOutlet(outlet, token) {
    const res = await fetch(`${API_BASE}/outlets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(outlet)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menambah outlet.');
    return result;
  },

  async updateOutlet(id, outlet, token) {
    const res = await fetch(`${API_BASE}/outlets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(outlet)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal memperbarui outlet.');
    return result;
  },

  // Orders
  async createOrder(payload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mengirim pesanan.');
    return result;
  },

  async getOrders(params, token) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.outletId) query.append('outletId', params.outletId);
    if (params?.search) query.append('search', params.search);
    if (params?.orderId) query.append('orderId', params.orderId);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/orders?${query.toString()}`, { headers });
    if (!res.ok) throw new Error('Gagal memuat pesanan.');
    return await res.json();
  },

  async getOrderById(orderId) {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Pesanan tidak ditemukan.');
    return result;
  },

  async updateOrderStatus(id, status, token) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal memperbarui status.');
    return result;
  },

  // Finance & Accounting
  async getFinancialSummary(params, token) {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.outletId) query.append('outletId', params.outletId);

    const res = await fetch(`${API_BASE}/finance/summary?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal memuat data keuangan.');
    return result;
  },

  async recordExpense(data, token) {
    const res = await fetch(`${API_BASE}/finance/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mencatat pengeluaran.');
    return result;
  },

  // Forecasting
  async getBusinessForecast(token) {
    const res = await fetch(`${API_BASE}/forecast`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal memuat prediksi bisnis.');
    return result;
  },

  // Contact & Newsletter
  async sendContact(data) {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mengirim pesan.');
    return result;
  },

  async subscribeNewsletter(email) {
    const res = await fetch(`${API_BASE}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal berlangganan buletin.');
    return result;
  }
};
