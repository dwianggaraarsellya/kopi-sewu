import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'kopi_sewu_db.json');

const initialProducts = [
  {
    id: 'c1',
    name: 'Kopi Sewu Signature',
    price: 25000,
    costPrice: 11000,
    formattedPrice: 'Rp 25.000',
    description: 'Racikan khas biji kopi arabika pilihan nusantara dengan sentuhan gula aren organik dan susu segar gurih.',
    category: 'coffee',
    stock: 85,
    isAvailable: true,
    temperature: 'Hot / Iced',
    sizes: '12oz / 16oz'
  },
  {
    id: 'c2',
    name: 'Espresso Single Origin',
    price: 20000,
    costPrice: 8000,
    formattedPrice: 'Rp 20.000',
    description: 'Ekstraksi espresso murni dengan crema tebal keemasan, aroma karamel kuat, dan aftertaste manis seimbang.',
    category: 'coffee',
    stock: 120,
    isAvailable: true,
    temperature: 'Hot Only',
    sizes: '1oz / 2oz'
  },
  {
    id: 'c3',
    name: 'Cappuccino Nusantara',
    price: 28000,
    costPrice: 12000,
    formattedPrice: 'Rp 28.000',
    description: 'Espresso mantap dipadukan dengan steamed milk dan lapisan foam sutra tebal, ditaburi bubuk kayu manis.',
    category: 'coffee',
    stock: 64,
    isAvailable: true,
    temperature: 'Hot / Iced',
    sizes: '8oz / 12oz'
  },
  {
    id: 'c4',
    name: 'Iced Latte Aren',
    price: 30000,
    costPrice: 13000,
    formattedPrice: 'Rp 30.000',
    description: 'Espresso dingin berpadu dengan susu pasteurisasi segar berkualitas dan es kristal menyegarkan.',
    category: 'coffee',
    stock: 75,
    isAvailable: true,
    temperature: 'Regular / Large',
    sizes: '12oz / 16oz'
  },
  {
    id: 'c5',
    name: 'Mocha Dark Cocoa',
    price: 32000,
    costPrice: 14000,
    formattedPrice: 'Rp 32.000',
    description: 'Perpaduan mewah antara espresso, cokelat artisanal kental, susu hangat, dan whipped cream lembut.',
    category: 'coffee',
    stock: 45,
    isAvailable: true,
    temperature: 'Hot / Iced',
    sizes: '12oz / 16oz'
  },
  {
    id: 'c6',
    name: 'Cold Brew 18 Jam',
    price: 28000,
    costPrice: 10000,
    formattedPrice: 'Rp 28.000',
    description: 'Diseduh dingin perlahan selama 18 jam menghasilkan rasa kopi yang sangat halus, manis alami, dan ramah lambung.',
    category: 'coffee',
    stock: 35,
    isAvailable: true,
    temperature: 'Iced',
    sizes: '12oz / 16oz'
  },
  {
    id: 't1',
    name: 'Teh Hijau Pilihan',
    price: 18000,
    costPrice: 6000,
    formattedPrice: 'Rp 18.000',
    description: 'Daun teh hijau segar dari dataran tinggi pegunungan, kaya antioksidan dengan rasa lembut menyegarkan.',
    category: 'tea',
    stock: 90,
    isAvailable: true,
    temperature: 'Hot / Iced',
    sizes: '12oz / 16oz'
  },
  {
    id: 't2',
    name: 'Earl Grey Bergamot',
    price: 22000,
    costPrice: 7500,
    formattedPrice: 'Rp 22.000',
    description: 'Teh hitam klasik berpadu aroma minyak citrus bergamot yang harum, elegan, dan menenangkan.',
    category: 'tea',
    stock: 70,
    isAvailable: true,
    temperature: 'Hot / Iced',
    sizes: '12oz / 16oz'
  },
  {
    id: 't3',
    name: 'Chamomile Honey',
    price: 20000,
    costPrice: 7000,
    formattedPrice: 'Rp 20.000',
    description: 'Seduhan bunga chamomile alami bebas kafein dengan khasiat relaksasi dan aroma apel lembut.',
    category: 'tea',
    stock: 50,
    isAvailable: true,
    temperature: 'Hot Only',
    sizes: '12oz'
  },
  {
    id: 't4',
    name: 'Masala Chai Rempah',
    price: 25000,
    costPrice: 9000,
    formattedPrice: 'Rp 25.000',
    description: 'Teh hitam beraroma rempah nusantara: kayu manis, kapulaga, cengkeh, dan jahe bersama susu hangat.',
    category: 'tea',
    stock: 40,
    isAvailable: true,
    temperature: 'Hot Only',
    sizes: '12oz'
  },
  {
    id: 't5',
    name: 'Rooibos Herbal',
    price: 22000,
    costPrice: 7500,
    formattedPrice: 'Rp 22.000',
    description: 'Teh herbal organik bebas kafein dengan rasa manis alami serta sentuhan rasa kacang yang khas.',
    category: 'tea',
    stock: 60,
    isAvailable: true,
    temperature: 'Hot / Iced',
    sizes: '12oz / 16oz'
  },
  {
    id: 't6',
    name: 'Matcha Latte Ceremonial',
    price: 30000,
    costPrice: 12000,
    formattedPrice: 'Rp 30.000',
    description: 'Bubuk matcha murni kualitas ceremonial dikocok lembut bersama steamed milk gurih dan creamy.',
    category: 'tea',
    stock: 48,
    isAvailable: true,
    temperature: 'Hot / Iced',
    sizes: '12oz / 16oz'
  },
  {
    id: 'p1',
    name: 'Butter Croissant',
    price: 22000,
    costPrice: 9000,
    formattedPrice: 'Rp 22.000',
    description: 'Croissant renyah berlapis khas Prancis, dipanggang dengan mentega pilihan. Lembut dan wangi.',
    category: 'pastry',
    stock: 25,
    isAvailable: true
  },
  {
    id: 'p2',
    name: 'Banana Bread Panggang',
    price: 18000,
    costPrice: 7000,
    formattedPrice: 'Rp 18.000',
    description: 'Bolu pisang panggang lembut buatan sendiri dengan taburan potongan kacang kenari renyah.',
    category: 'pastry',
    stock: 30,
    isAvailable: true
  },
  {
    id: 'p3',
    name: 'Fresh Blueberry Muffin',
    price: 20000,
    costPrice: 8000,
    formattedPrice: 'Rp 20.000',
    description: 'Muffin lezat berisi buah blueberry segar yang mekar sempurna dipanggang setiap pagi.',
    category: 'pastry',
    stock: 22,
    isAvailable: true
  },
  {
    id: 'p4',
    name: 'Avocado Toast Sourdough',
    price: 35000,
    costPrice: 15000,
    formattedPrice: 'Rp 35.000',
    description: 'Roti sourdough panggang dengan alpukat mentega lumat, tomat ceri, wijen, dan chili flakes pedas ringan.',
    category: 'pastry',
    stock: 18,
    isAvailable: true
  },
  {
    id: 'p5',
    name: 'Fruit Salad & Madu Hutan',
    price: 28000,
    costPrice: 11000,
    formattedPrice: 'Rp 28.000',
    description: 'Kombinasi potongan buah segar musiman disajikan dengan yoghurt plain dan madu alami.',
    category: 'pastry',
    stock: 15,
    isAvailable: true
  },
  {
    id: 'p6',
    name: 'Grilled Cheese Sandwich',
    price: 38000,
    costPrice: 16000,
    formattedPrice: 'Rp 38.000',
    description: 'Sandwich panggang renyah dengan lelehan keju mozzarella, cheddar, tomat segar, dan rempah aromatik.',
    category: 'pastry',
    stock: 20,
    isAvailable: true
  }
];

const initialOutlets = [
  {
    id: 'out-1',
    name: 'Kopi Sewu - Malioboro Flagship',
    city: 'Yogyakarta',
    address: 'Jl. Malioboro No. 1000, Sosromenduran, Gedong Tengen, Kota Yogyakarta, DIY 55271',
    phone: '+62 812-3456-7890',
    latitude: -7.7925769,
    longitude: 110.3638421,
    openingTime: '07:00',
    closingTime: '23:00',
    isActive: true
  },
  {
    id: 'out-2',
    name: 'Kopi Sewu - Senopati Space',
    city: 'Jakarta Selatan',
    address: 'Jl. Senopati No. 45, Selong, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12110',
    phone: '+62 811-9876-5432',
    latitude: -6.230752,
    longitude: 106.810574,
    openingTime: '07:00',
    closingTime: '22:00',
    isActive: true
  },
  {
    id: 'out-3',
    name: 'Kopi Sewu - Dago Pines',
    city: 'Bandung',
    address: 'Jl. Ir. H. Juanda No. 320, Dago, Coblong, Kota Bandung, Jawa Barat 40135',
    phone: '+62 813-2233-4455',
    latitude: -6.877864,
    longitude: 107.619225,
    openingTime: '08:00',
    closingTime: '22:00',
    isActive: true
  }
];

function generateSeedOrders() {
  const seedOrders = [];
  const now = new Date();

  for (let daysAgo = 14; daysAgo >= 0; daysAgo--) {
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const ordersToday = 4 + (daysAgo % 4);

    for (let j = 0; j < ordersToday; j++) {
      const orderHour = 8 + ((j * 3) % 13);
      orderDate.setHours(orderHour, Math.floor(Math.random() * 59));

      const outlet = initialOutlets[j % initialOutlets.length];
      const p1 = initialProducts[j % 6];
      const p2 = initialProducts[6 + (j % 6)];
      const qty1 = 1 + (j % 3);
      const qty2 = j % 2 === 0 ? 1 : 0;

      const items = [
        {
          id: `item-${daysAgo}-${j}-1`,
          productId: p1.id,
          name: p1.name,
          price: p1.price,
          costPrice: p1.costPrice,
          quantity: qty1
        }
      ];

      if (qty2 > 0) {
        items.push({
          id: `item-${daysAgo}-${j}-2`,
          productId: p2.id,
          name: p2.name,
          price: p2.price,
          costPrice: p2.costPrice,
          quantity: qty2
        });
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = j % 5 === 0 ? 5000 : 0;
      const totalAmount = Math.max(0, subtotal - discount);
      const orderId = `KSW-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${String(daysAgo * 10 + j + 1).padStart(3, '0')}`;

      const statuses = daysAgo === 0 ? ['ready', 'preparing', 'completed'] : ['completed', 'completed', 'completed'];
      const status = statuses[j % statuses.length];

      seedOrders.push({
        id: orderId,
        customerName: ['Andi Wijaya', 'Budi Santoso', 'Citra Lestari', 'Dedi Pratama', 'Eka Rahmawati', 'Fajar Hidayat', 'Gita Gutawa', 'Hadi Kurniawan'][j % 8],
        customerPhone: `0812${String(10000000 + daysAgo * 100 + j).slice(-8)}`,
        outletId: outlet.id,
        outletName: outlet.name,
        orderType: j % 3 === 0 ? 'delivery' : j % 3 === 1 ? 'dine_in' : 'takeaway',
        deliveryAddress: j % 3 === 0 ? `Jl. Mawar No. ${j + 1}, ${outlet.city}` : undefined,
        items,
        subtotal,
        discount,
        totalAmount,
        paymentMethod: j % 3 === 0 ? 'qris' : j % 3 === 1 ? 'bank_transfer' : 'cash',
        paymentStatus: 'paid',
        status,
        notes: j % 4 === 0 ? 'Sedikit gula, es normal' : undefined,
        createdAt: orderDate.toISOString()
      });
    }
  }

  return seedOrders;
}

const initialExpenses = [
  {
    id: 'exp-1',
    category: 'bahan_baku',
    categoryLabel: 'Bahan Baku & Biji Kopi',
    description: 'Pengadaan Biji Kopi Arabika Gayo & Susu Pasteurisasi Mingguan',
    amount: 3500000,
    outletId: 'out-1',
    outletName: 'Kopi Sewu - Malioboro Flagship',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'exp-2',
    category: 'operasional',
    categoryLabel: 'Operasional & Utilitas',
    description: 'Tagihan Listrik & Air Bersih Kedai Periode Berjalan',
    amount: 1450000,
    outletId: 'out-1',
    outletName: 'Kopi Sewu - Malioboro Flagship',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'exp-3',
    category: 'bahan_baku',
    categoryLabel: 'Bahan Baku & Biji Kopi',
    description: 'Restock Kemasan Cup Kopi Ramah Lingkungan & Sedotan Kertas (1000 pcs)',
    amount: 850000,
    outletId: 'out-2',
    outletName: 'Kopi Sewu - Senopati Space',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'exp-4',
    category: 'pemasaran',
    categoryLabel: 'Pemasaran & Promosi',
    description: 'Iklan Promosi Menu Musiman di Media Sosial & Brosur Komunitas',
    amount: 600000,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'exp-5',
    category: 'operasional',
    categoryLabel: 'Operasional & Utilitas',
    description: 'Perawatan & Kalibrasi Mesin Espresso La Marzocco',
    amount: 750000,
    outletId: 'out-3',
    outletName: 'Kopi Sewu - Dago Pines',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin'
  }
];

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Gagal membaca file database, inisialisasi baru:', err);
    }

    const initialData = {
      users: [
        {
          id: 'user-admin-1',
          username: 'admin',
          name: 'Administrator Kopi Sewu',
          role: 'admin',
          token: 'kopi_sewu_admin_token_2026'
        }
      ],
      products: initialProducts,
      outlets: initialOutlets,
      orders: generateSeedOrders(),
      expenses: initialExpenses,
      subscribers: [
        {
          id: 'sub-1',
          email: 'pecintakopi@gmail.com',
          subscribedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      contactMessages: []
    };

    this.save(initialData);
    return initialData;
  }

  save(newData) {
    if (newData) {
      this.data = newData;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Gagal menulis ke file database:', err);
    }
  }

  get() {
    return this.data;
  }
}

export const db = new Database();
