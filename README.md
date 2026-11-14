# Tugas 1: ExpressJS Backend

REST API manajemen produk sederhana menggunakan ExpressJS. Data disimpan sementara di memori, sehingga akan kembali ke data awal ketika server dimulai ulang. Proyek ini tidak menggunakan database.

## Menjalankan aplikasi

Gunakan Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Server berjalan di `http://localhost:3000`. Untuk menjalankan tes:

```bash
npm test
```

## Endpoint

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/health` | Memeriksa status server |
| `GET` | `/api/products` | Mengambil semua produk |
| `GET` | `/api/products?search=pul` | Mencari produk berdasarkan nama |
| `GET` | `/api/products/:id` | Mengambil detail satu produk |
| `POST` | `/api/products` | Menambahkan produk |
| `PUT` | `/api/products/:id` | Mengganti nama dan harga produk |
| `PATCH` | `/api/products/:id` | Memperbarui nama dan harga produk |
| `DELETE` | `/api/products/:id` | Menghapus produk |

Contoh body untuk `POST`, `PUT`, dan `PATCH`:

```json
{
	"name": "Buku Agenda",
	"price": 15000
}
```

Nama wajib diisi, sedangkan harga harus berupa bilangan bulat nol atau lebih. Respons API menggunakan JSON dengan properti `status`, `message`, dan `data`.