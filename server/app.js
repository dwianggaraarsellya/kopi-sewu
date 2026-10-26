import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/database.js';
import { getFinancialSummary } from './services/financeService.js';
import { calculateBusinessForecast } from './services/forecastService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Native CORS Middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Auth Token Verification Helper
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Autentikasi admin diperlukan.' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const database = db.get();
  const user = database.users.find((u) => u.token === token && u.role === 'admin');
  if (!user) {
    return res.status(403).json({ success: false, message: 'Token admin tidak valid atau kedaluwarsa.' });
  }
  req.user = user;
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  // Pre-configured secure admin credential
  if (username.trim() === 'admin' && (password === 'kopisewu2026' || password === 'admin123')) {
    const database = db.get();
    const adminUser = database.users.find((u) => u.username === 'admin') || {
      id: 'user-admin-1',
      username: 'admin',
      name: 'Administrator Kopi Sewu',
      role: 'admin',
      token: 'kopi_sewu_admin_token_2026'
    };

    return res.json({
      success: true,
      message: 'Login berhasil.',
      token: adminUser.token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Username atau password salah.' });
});

app.get('/api/auth/me', verifyAdminToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// --- PRODUCTS / MENU ROUTES ---
app.get('/api/products', (req, res) => {
  const database = db.get();
  let items = [...database.products];

  const category = req.query.category;
  if (category && category !== 'all') {
    items = items.filter((p) => p.category === category);
  }

  const search = req.query.search;
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    count: items.length,
    data: items,
    categories: {
      coffee: items.filter((p) => p.category === 'coffee'),
      tea: items.filter((p) => p.category === 'tea'),
      pastry: items.filter((p) => p.category === 'pastry')
    }
  });
});

// Legacy menu route backward-compatibility
app.get('/api/menu', (req, res) => {
  const database = db.get();
  let items = [...database.products];
  const category = req.query.category;
  if (category) {
    items = items.filter((p) => p.category === category);
  }
  res.json({
    success: true,
    count: items.length,
    data: items,
    categories: {
      coffee: items.filter((p) => p.category === 'coffee'),
      tea: items.filter((p) => p.category === 'tea'),
      pastry: items.filter((p) => p.category === 'pastry')
    }
  });
});

app.post('/api/products', verifyAdminToken, (req, res) => {
  const { name, price, costPrice, category, description, stock, temperature, sizes } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Nama, harga, dan kategori wajib diisi.' });
  }

  const database = db.get();
  const numPrice = Number(price);
  const numCost = Number(costPrice) || Math.round(numPrice * 0.45);

  const newProduct = {
    id: `p-${Date.now().toString(36)}`,
    name: name.trim(),
    price: numPrice,
    costPrice: numCost,
    formattedPrice: `Rp ${numPrice.toLocaleString('id-ID')}`,
    description: description?.trim() || '',
    category: category,
    stock: Number(stock) || 50,
    isAvailable: true,
    temperature: temperature || 'Hot / Iced',
    sizes: sizes || '12oz / 16oz'
  };

  database.products.unshift(newProduct);
  db.save();

  res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan.', data: newProduct });
});

app.put('/api/products/:id', verifyAdminToken, (req, res) => {
  const database = db.get();
  const productIndex = database.products.findIndex((p) => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  const current = database.products[productIndex];
  const { name, price, costPrice, category, description, stock, isAvailable, temperature, sizes } = req.body;

  const numPrice = price !== undefined ? Number(price) : current.price;
  const numCost = costPrice !== undefined ? Number(costPrice) : current.costPrice;

  const updated = {
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    price: numPrice,
    costPrice: numCost,
    formattedPrice: `Rp ${numPrice.toLocaleString('id-ID')}`,
    category: category !== undefined ? category : current.category,
    description: description !== undefined ? description.trim() : current.description,
    stock: stock !== undefined ? Number(stock) : current.stock,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : current.isAvailable,
    temperature: temperature !== undefined ? temperature : current.temperature,
    sizes: sizes !== undefined ? sizes : current.sizes
  };

  database.products[productIndex] = updated;
  db.save();

  res.json({ success: true, message: 'Produk berhasil diperbarui.', data: updated });
});

app.delete('/api/products/:id', verifyAdminToken, (req, res) => {
  const database = db.get();
  const product = database.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  // Soft delete / disable
  product.isAvailable = false;
  db.save();

  res.json({ success: true, message: 'Produk dinonaktifkan.', data: product });
});

// --- OUTLETS ROUTES ---
app.get('/api/outlets', (req, res) => {
  const database = db.get();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeNumber = currentHour * 60 + currentMinute;

  // Enrich with live open status calculation
  const enrichedOutlets = database.outlets.map((outlet) => {
    let isOpenNow = false;
    try {
      const [openH, openM] = outlet.openingTime.split(':').map(Number);
      const [closeH, closeM] = outlet.closingTime.split(':').map(Number);
      const openTimeNumber = openH * 60 + openM;
      const closeTimeNumber = closeH * 60 + closeM;

      if (closeTimeNumber > openTimeNumber) {
        isOpenNow = currentTimeNumber >= openTimeNumber && currentTimeNumber <= closeTimeNumber;
      } else {
        // Over midnight
        isOpenNow = currentTimeNumber >= openTimeNumber || currentTimeNumber <= closeTimeNumber;
      }
    } catch {
      isOpenNow = true;
    }

    return {
      ...outlet,
      isOpenNow: outlet.isActive && isOpenNow
    };
  });

  const city = req.query.city;
  const filtered = city ? enrichedOutlets.filter((o) => o.city.toLowerCase().includes(city.toLowerCase())) : enrichedOutlets;

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.post('/api/outlets', verifyAdminToken, (req, res) => {
  const { name, city, address, phone, latitude, longitude, openingTime, closingTime } = req.body;
  if (!name || !city || !address) {
    return res.status(400).json({ success: false, message: 'Nama, kota, dan alamat outlet wajib diisi.' });
  }

  const database = db.get();
  const newOutlet = {
    id: `out-${Date.now().toString(36)}`,
    name: name.trim(),
    city: city.trim(),
    address: address.trim(),
    phone: phone?.trim() || '+62 812-0000-0000',
    latitude: Number(latitude) || -7.7925,
    longitude: Number(longitude) || 110.3638,
    openingTime: openingTime || '07:00',
    closingTime: closingTime || '22:00',
    isActive: true
  };

  database.outlets.push(newOutlet);
  db.save();

  res.status(201).json({ success: true, message: 'Outlet berhasil ditambahkan.', data: newOutlet });
});

app.put('/api/outlets/:id', verifyAdminToken, (req, res) => {
  const database = db.get();
  const outlet = database.outlets.find((o) => o.id === req.params.id);
  if (!outlet) {
    return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan.' });
  }

  const { name, city, address, phone, latitude, longitude, openingTime, closingTime, isActive } = req.body;
  if (name !== undefined) outlet.name = name.trim();
  if (city !== undefined) outlet.city = city.trim();
  if (address !== undefined) outlet.address = address.trim();
  if (phone !== undefined) outlet.phone = phone.trim();
  if (latitude !== undefined) outlet.latitude = Number(latitude);
  if (longitude !== undefined) outlet.longitude = Number(longitude);
  if (openingTime !== undefined) outlet.openingTime = openingTime;
  if (closingTime !== undefined) outlet.closingTime = closingTime;
  if (isActive !== undefined) outlet.isActive = Boolean(isActive);

  db.save();
  res.json({ success: true, message: 'Outlet berhasil diperbarui.', data: outlet });
});

// --- ORDERS ROUTES ---
app.get('/api/orders', (req, res) => {
  const database = db.get();
  let ordersList = [...database.orders];

  const orderId = req.query.orderId;
  if (orderId) {
    const single = ordersList.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
    if (!single) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    return res.json({ success: true, data: single });
  }

  const status = req.query.status;
  if (status && status !== 'all') {
    ordersList = ordersList.filter((o) => o.status === status);
  }

  const outletId = req.query.outletId;
  if (outletId && outletId !== 'all') {
    ordersList = ordersList.filter((o) => o.outletId === outletId);
  }

  const search = req.query.search;
  if (search) {
    const q = search.toLowerCase();
    ordersList = ordersList.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q));
  }

  // Sort descending by date
  ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, count: ordersList.length, data: ordersList });
});

app.get('/api/orders/:id', (req, res) => {
  const database = db.get();
  const order = database.orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
  }
  res.json({ success: true, data: order });
});

// Customer Checkout
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, outletId, orderType, deliveryAddress, items, paymentMethod, notes } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ success: false, message: 'Nama pemesan wajib diisi.' });
  }
  if (!customerPhone || customerPhone.trim().length < 8) {
    return res.status(400).json({ success: false, message: 'Nomor WhatsApp / telepon tidak valid.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Pilih minimal satu menu untuk dipesan.' });
  }

  const database = db.get();
  const selectedOutlet = database.outlets.find((o) => o.id === outletId) || database.outlets[0];

  // SERVER-SIDE VALIDATION & PRICE RE-CALCULATION
  const validatedItems = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const product = database.products.find((p) => p.id === item.productId || p.id === item.id);
    if (!product) {
      return res.status(400).json({ success: false, message: `Produk ID '${item.productId || item.id}' tidak ditemukan di katalog.` });
    }
    if (!product.isAvailable) {
      return res.status(400).json({ success: false, message: `Maaf, produk '${product.name}' saat ini sedang habis.` });
    }

    const qty = Math.max(1, Number(item.quantity) || 1);

    // Deduct stock safely
    product.stock = Math.max(0, product.stock - qty);

    validatedItems.push({
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      costPrice: product.costPrice,
      quantity: qty,
      notes: item.notes?.trim() || ''
    });

    calculatedSubtotal += product.price * qty;
  }

  const now = new Date();
  const orderId = `KSW-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(database.orders.length + 1).padStart(3, '0')}`;

  const newOrder = {
    id: orderId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    outletId: selectedOutlet.id,
    outletName: selectedOutlet.name,
    orderType: orderType || 'dine_in',
    deliveryAddress: orderType === 'delivery' ? deliveryAddress?.trim() : undefined,
    items: validatedItems,
    subtotal: calculatedSubtotal,
    discount: 0,
    totalAmount: calculatedSubtotal,
    paymentMethod: paymentMethod || 'qris',
    paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid',
    status: 'pending',
    notes: notes?.trim() || undefined,
    createdAt: now.toISOString()
  };

  database.orders.unshift(newOrder);
  db.save();

  res.status(201).json({
    success: true,
    message: 'Pesanan Anda berhasil dikonfirmasi dan sedang disiapkan!',
    data: newOrder
  });
});

app.patch('/api/orders/:id/status', verifyAdminToken, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status pesanan tidak valid.' });
  }

  const database = db.get();
  const order = database.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
  }

  order.status = status;
  if (status === 'completed' && order.paymentStatus === 'unpaid') {
    order.paymentStatus = 'paid';
  }
  db.save();

  res.json({ success: true, message: `Status pesanan diubah menjadi: ${status}`, data: order });
});

// --- FINANCE & EXPENSES ROUTES ---
app.get('/api/finance/summary', verifyAdminToken, (req, res) => {
  const period = req.query.period;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const outletId = req.query.outletId;

  const summary = getFinancialSummary({ period, startDate, endDate, outletId });
  res.json({ success: true, data: summary });
});

app.get('/api/finance/expenses', verifyAdminToken, (_req, res) => {
  const database = db.get();
  res.json({ success: true, count: database.expenses.length, data: database.expenses });
});

app.post('/api/finance/expenses', verifyAdminToken, (req, res) => {
  const { category, description, amount, outletId } = req.body;
  if (!category || !description || !amount) {
    return res.status(400).json({ success: false, message: 'Kategori, deskripsi, dan nominal biaya wajib diisi.' });
  }

  const categoryLabels = {
    bahan_baku: 'Bahan Baku & Biji Kopi',
    gaji: 'Gaji Karyawan',
    sewa: 'Sewa Tempat & Bangunan',
    operasional: 'Operasional & Utilitas',
    pemasaran: 'Pemasaran & Promosi',
    lainnya: 'Pengeluaran Lainnya'
  };

  const database = db.get();
  const matchedOutlet = outletId ? database.outlets.find((o) => o.id === outletId) : undefined;

  const newExpense = {
    id: `exp-${Date.now().toString(36)}`,
    category: category,
    categoryLabel: categoryLabels[category] || 'Operasional',
    description: description.trim(),
    amount: Math.abs(Number(amount)),
    outletId: matchedOutlet?.id,
    outletName: matchedOutlet?.name,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  };

  database.expenses.unshift(newExpense);
  db.save();

  res.status(201).json({ success: true, message: 'Pengeluaran berhasil dicatat.', data: newExpense });
});

// --- BUSINESS FORECAST ROUTE ---
app.get('/api/forecast', verifyAdminToken, (_req, res) => {
  const forecastResult = calculateBusinessForecast();
  res.json({ success: true, data: forecastResult });
});

// --- CONTACT & NEWSLETTER ROUTES ---
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Nama, email, dan pesan wajib diisi.' });
  }

  const database = db.get();
  const contact = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || '',
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  database.contactMessages.unshift(contact);
  db.save();

  res.status(201).json({ success: true, message: 'Pesan Anda telah diterima oleh tim Kopi Sewu.', data: contact });
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Format alamat email tidak valid.' });
  }

  const database = db.get();
  const exists = database.subscribers.some((s) => s.email.toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return res.json({ success: true, message: 'Email Anda sudah terdaftar dalam buletin Kopi Sewu.' });
  }

  database.subscribers.unshift({
    id: `sub_${Date.now()}`,
    email: email.trim().toLowerCase(),
    subscribedAt: new Date().toISOString()
  });
  db.save();

  res.status(201).json({ success: true, message: 'Selamat datang! Anda telah berlangganan buletin Kopi Sewu.' });
});

// Health check
app.get('/api/health', (_req, res) => {
  const database = db.get();
  res.json({
    status: 'ok',
    appName: 'Kopi Sewu Management System API',
    version: '2.0.0',
    stats: {
      productsCount: database.products.length,
      outletsCount: database.outlets.length,
      ordersCount: database.orders.length,
      expensesCount: database.expenses.length
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint tidak ditemukan.' });
});

// Error middleware
app.use((err, _req, res, _next) => {
  console.error('[Kopi Sewu Server Error]:', err);
  res.status(500).json({ success: false, message: 'Terjadi kendala pada server.' });
});
