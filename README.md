# Kopi Sewu — Full-Stack Coffee Shop Management System

Platform bisnis coffee shop modern terintegrasi yang menggabungkan website pelanggan interaktif, sistem pemesanan online multi-outlet, pelacakan pesanan real-time, dashboard manajemen administrasi, laporan laba rugi keuangan, pencetakan struk/dokumen resmi, serta modul prediksi bisnis berbasis data penjualan historis.


1. Dokumentasi API Backend

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/auth/login` | Login admin dan penerbitan token sesi |
| `GET` | `/api/auth/me` | Verifikasi token admin |
| `GET` | `/api/products` | Mengambil katalog menu dan kategori (opsional filter) |
| `POST` | `/api/products` | Menambah produk baru (Admin) |
| `PUT` | `/api/products/:id` | Memperbarui produk & stok (Admin) |
| `DELETE` | `/api/products/:id` | Menonaktifkan ketersediaan produk (Admin) |
| `GET` | `/api/outlets` | Mengambil daftar outlet lengkap dengan kalkulasi live `isOpenNow` |
| `POST` | `/api/outlets` | Menambah cabang outlet baru (Admin) |
| `PUT` | `/api/outlets/:id` | Memperbarui data outlet (Admin) |
| `GET` | `/api/orders` | Mengambil data pesanan (filter status/outlet/ID) |
| `GET` | `/api/orders/:id` | Mengambil detail 1 pesanan untuk pelacakan pelanggan |
| `POST` | `/api/orders` | Checkout pemesanan baru (validasi harga & stok server) |
| `PATCH` | `/api/orders/:id/status`| Memperbarui status pengerjaan pesanan (Admin) |
| `GET` | `/api/finance/summary` | Mengambil rekapitulasi laba rugi dan arus kas (Admin) |
| `GET` | `/api/finance/expenses`| Mengambil daftar pengeluaran operasional (Admin) |
| `POST` | `/api/finance/expenses`| Mencatat pengeluaran operasional baru (Admin) |
| `GET` | `/api/forecast` | Analisis tren deret waktu & estimasi bahan baku (Admin) |
| `POST` | `/api/contact` | Mengirimkan pesan dari form kontak |
| `POST` | `/api/newsletter`| Mendaftarkan alamat email buletin |
| `GET` | `/api/health` | Status server dan statistik database |

---

2. Cara Menjalankan Project

1. **Instalasi Dependencies**:
   ```bash
   npm install
   ```

2. **Menjalankan Server Terintegrasi (Development)**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000` dengan frontend React dan backend Express aktif secara simultan.

3. **Build untuk Production**:
   ```bash
   npm run build
   ```

4. **Menjalankan Server Standalone**:
   ```bash
   npm start
   ```
