# Book Store & Library Management System

Aplikasi **Book Store & Library Management System** berbasis Next.js
yang menggabungkan fitur toko buku online dan sistem peminjaman
perpustakaan. Aplikasi memiliki dua role, yaitu `user` dan `admin`,
serta menggunakan inventaris terpisah dari data buku.

> **Status proyek:** Perancangan arsitektur dan database. Implementasi
> fitur dapat dikembangkan secara bertahap mengikuti roadmap di bawah.

------------------------------------------------------------------------

## Daftar Isi

-   [Gambaran Umum](#gambaran-umum)
-   [Fitur Utama](#fitur-utama)
-   [Teknologi](#teknologi)
-   [Struktur Folder](#struktur-folder)
-   [Role dan Hak Akses](#role-dan-hak-akses)
-   [Desain Database](#desain-database)
-   [Aturan dan Alur Bisnis](#aturan-dan-alur-bisnis)
-   [Persiapan Development](#persiapan-development)
-   [Konfigurasi Environment](#konfigurasi-environment)
-   [Drizzle ORM](#drizzle-orm)
-   [API Design](#api-design)
-   [Keamanan dan Konsistensi Data](#keamanan-dan-konsistensi-data)
-   [Roadmap](#roadmap)
-   [Catatan Pengembangan](#catatan-pengembangan)

------------------------------------------------------------------------

## Gambaran Umum

Proyek ini menyediakan dua layanan dalam satu aplikasi:

1.  **Book Store** --- pengguna dapat menjelajahi katalog, memasukkan
    buku ke cart, melakukan checkout, mengunggah bukti transfer, dan
    melihat riwayat transaksi.
2.  **Library Management** --- pengguna dapat mengajukan peminjaman
    buku. Pengajuan harus disetujui admin sebelum buku dapat diambil.
    Sistem juga mencatat pengambilan dan pengembalian buku.

Data katalog dan inventaris dipisahkan. Informasi judul, penulis,
penerbit, kategori, dan harga disimpan pada tabel `books`, sedangkan
jumlah stok disimpan pada tabel `stocks`. Setiap buku memiliki tepat
satu record stok melalui relasi one-to-one.

## Fitur Utama

### User

-   Registrasi dan login.
-   Melihat katalog dan detail buku.
-   Menjelajahi buku berdasarkan kategori.
-   Menambahkan, mengubah jumlah, dan menghapus item cart.
-   Checkout pembelian.
-   Melakukan pembayaran transfer secara manual.
-   Mengunggah bukti pembayaran.
-   Melihat status dan riwayat transaksi.
-   Mengajukan peminjaman buku.
-   Melihat status pengajuan dan riwayat peminjaman.
-   Melihat tenggat pengembalian.

### Admin

-   Dashboard ringkasan.
-   CRUD buku.
-   CRUD kategori.
-   Mengelola stok dan penambahan stok.
-   Melihat serta memproses pengajuan peminjaman.
-   Mencatat buku yang sudah diambil dan dikembalikan.
-   Memeriksa bukti pembayaran.
-   Menyetujui atau menolak pembayaran.
-   Melihat data transaksi.
-   Mengelola pengguna dan status akun.

### Batasan fitur yang telah diputuskan

-   Cart hanya digunakan untuk **pembelian**, bukan peminjaman.
-   Peminjaman menggunakan mekanisme **persetujuan admin**.
-   Pembayaran menggunakan **transfer manual**, bukan payment gateway.
-   Role aplikasi terdiri dari `user` dan `admin`.

------------------------------------------------------------------------

## Teknologi

  Teknologi                 Kegunaan
  ------------------------- ------------------------------------
  Next.js 16 (App Router)   Framework aplikasi full-stack
  React                     UI
  TypeScript                Static typing
  Tailwind CSS              Styling
  Drizzle ORM               ORM dan query database
  MariaDB                   Relational database
  MySQL2                    Driver koneksi database
  Auth.js                   Authentication dan session
  Zod                       Validasi input
  Drizzle Kit               Generate dan menjalankan migration

Versi paket sebaiknya mengikuti versi stabil yang kompatibel saat proyek
diinisialisasi. Periksa dokumentasi resmi masing-masing teknologi
sebelum upgrade major version.

------------------------------------------------------------------------

## Struktur Folder

Struktur awal yang direkomendasikan:

``` text
book-store/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (user)/
│   │   ├── books/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── loans/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── books/
│   │   ├── categories/
│   │   ├── stocks/
│   │   ├── loans/
│   │   ├── transactions/
│   │   ├── users/
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── books/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── loans/
│   │   ├── transactions/
│   │   └── stocks/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── books/
│   ├── cart/
│   ├── loans/
│   ├── transactions/
│   └── admin/
│
├── lib/
│   ├── auth/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── categories.ts
│   │   │   ├── books.ts
│   │   │   ├── stocks.ts
│   │   │   ├── carts.ts
│   │   │   ├── loans.ts
│   │   │   ├── transactions.ts
│   │   │   ├── stock-movements.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   ├── relations.ts
│   │   └── seed.ts
│   ├── services/
│   ├── validations/
│   └── utils.ts
│
├── types/
│   ├── auth.ts
│   ├── user.ts
│   ├── book.ts
│   ├── cart.ts
│   ├── loan.ts
│   └── transaction.ts
│
├── drizzle/
├── public/
├── auth.ts
├── proxy.ts
├── drizzle.config.ts
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

### Tanggung jawab direktori

-   `app/`: halaman, layout, dan Route Handlers.
-   `app/api/`: endpoint backend menggunakan Next.js Route Handlers.
-   `components/`: komponen UI reusable. Komponen yang membutuhkan
    state, event handler, atau browser API menggunakan directive
    `"use client"`.
-   `lib/db/`: koneksi database, schema, relasi, migration support, dan
    seed.
-   `lib/services/`: business logic seperti checkout, verifikasi
    pembayaran, peminjaman, dan perubahan stok.
-   `lib/validations/`: schema validasi Zod.
-   `lib/auth/` dan `auth.ts`: konfigurasi authentication.
-   `types/`: tipe TypeScript yang digunakan lintas fitur.
-   `proxy.ts`: pemeriksaan awal/routing berdasarkan session. Setiap
    operasi sensitif tetap wajib melakukan otorisasi di server.

> Pada Next.js 16, konvensi `middleware.ts` telah digantikan oleh
> `proxy.ts`. Jika menggunakan versi Next.js yang lebih lama, ikuti
> konvensi sesuai versi framework tersebut.

------------------------------------------------------------------------

## Role dan Hak Akses

  Fitur                                User    Admin
  ----------------------------------- ------- -------
  Melihat katalog dan detail buku       Ya      Ya
  Mengelola cart sendiri                Ya     Tidak
  Checkout pembelian                    Ya     Tidak
  Mengunggah bukti transfer             Ya     Tidak
  Melihat transaksi sendiri             Ya     Tidak
  Mengajukan peminjaman                 Ya     Tidak
  Melihat peminjaman sendiri            Ya     Tidak
  CRUD buku                            Tidak    Ya
  CRUD kategori                        Tidak    Ya
  Mengelola stok                       Tidak    Ya
  Menyetujui/menolak peminjaman        Tidak    Ya
  Mencatat pengambilan/pengembalian    Tidak    Ya
  Memverifikasi pembayaran             Tidak    Ya
  Melihat seluruh transaksi            Tidak    Ya
  Mengelola pengguna                   Tidak    Ya

Role disimpan pada kolom `users.role` dengan nilai `user` atau `admin`.
Jangan mempercayai role yang dikirim dari client. Role harus dibaca dari
session/identitas yang tervalidasi di server.

------------------------------------------------------------------------

## Desain Database

Database menggunakan MariaDB dengan Drizzle ORM MySQL dialect
(`drizzle-orm/mysql-core`).

### Daftar tabel

  Tabel                 Fungsi
  --------------------- -------------------------------------
  `users`               Akun, password hash, dan role
  `categories`          Kategori buku
  `books`               Informasi katalog buku
  `stocks`              Jumlah inventaris untuk setiap buku
  `carts`               Cart milik user
  `cart_items`          Detail buku di dalam cart
  `loans`               Header pengajuan peminjaman
  `loan_items`          Buku dan jumlah pada pengajuan
  `transactions`        Header transaksi pembelian
  `transaction_items`   Snapshot detail buku pada transaksi
  `stock_movements`     Audit perubahan stok

### Relasi utama

  Relasi                             Kardinalitas
  ---------------------------------- --------------
  Users → Carts                      One-to-one
  Users → Loans                      One-to-many
  Users → Transactions               One-to-many
  Categories → Books                 One-to-many
  Books → Stocks                     One-to-one
  Carts → Cart Items                 One-to-many
  Books → Cart Items                 One-to-many
  Loans → Loan Items                 One-to-many
  Books → Loan Items                 One-to-many
  Transactions → Transaction Items   One-to-many
  Books → Transaction Items          One-to-many
  Books → Stock Movements            One-to-many

`approved_by` pada `loans` dan `verified_by` pada `transactions` mengacu
ke `users.id` sebagai admin yang melakukan tindakan.

### Ringkasan kolom penting

**users**

-   `id`, `name`, `email`, `password`, `role`, `is_active`
-   `created_at`, `updated_at`

**categories**

-   `id`, `name`, `slug`, `description`

**books**

-   `id`, `category_id`, `title`, `slug`, `isbn`
-   `author`, `publisher`, `publication_year`
-   `description`, `image`, `price`, `status`
-   `created_at`, `updated_at`

**stocks**

-   `id`, `book_id` (UNIQUE)
-   `total_quantity`, `available_quantity`
-   `reserved_quantity`, `borrowed_quantity`
-   `updated_at`

**carts**

-   `id`, `user_id` (UNIQUE), `created_at`, `updated_at`

**cart_items**

-   `id`, `cart_id`, `book_id`, `quantity`, `created_at`
-   Kombinasi `cart_id` dan `book_id` harus UNIQUE.

**loans**

-   `id`, `user_id`, `loan_number`, `status`
-   `loan_date`, `due_date`
-   `approved_by`, `approved_at`
-   `borrowed_at`, `returned_at`
-   `rejection_reason`, `notes`
-   `created_at`, `updated_at`

**loan_items**

-   `id`, `loan_id`, `book_id`, `quantity`

**transactions**

-   `id`, `user_id`, `invoice_number`, `total_amount`
-   `payment_method`, `status`, `payment_proof`
-   `verified_by`, `verified_at`, `paid_at`
-   `rejection_reason`, `created_at`, `updated_at`

**transaction_items**

-   `id`, `transaction_id`, `book_id`
-   `book_title`, `price`, `quantity`, `subtotal`

**stock_movements**

-   `id`, `book_id`, `user_id`, `type`, `quantity`
-   `before_quantity`, `after_quantity`
-   `reference_number`, `notes`, `created_at`

### Enum status

**users.role**

-   `user`
-   `admin`

**books.status**

-   `draft`
-   `published`
-   `archived`

**loans.status**

-   `pending`
-   `approved`
-   `rejected`
-   `borrowed`
-   `returned`
-   `overdue`
-   `cancelled`

**transactions.status**

-   `pending`
-   `awaiting_verification`
-   `paid`
-   `rejected`
-   `cancelled`
-   `refunded`

**transactions.payment_method**

-   `bank_transfer`
-   `cash`

**stock_movements.type**

-   `initial`
-   `restock`
-   `purchase`
-   `loan_reserved`
-   `loan_issued`
-   `loan_returned`
-   `loan_released`
-   `adjustment`

------------------------------------------------------------------------

## Aturan dan Alur Bisnis

### 1. Pengelolaan stok

Stok dipisahkan dari tabel `books` agar data katalog tidak bercampur
dengan inventaris.

Persamaan stok:

``` text
total_quantity =
  available_quantity +
  reserved_quantity +
  borrowed_quantity
```

Contoh:

  Kondisi                         Available   Reserved   Borrowed   Total
  ----------------------------- ----------- ---------- ---------- -------
  Stok awal                              20          0          0      20
  Peminjaman disetujui 5 buku            15          5          0      20
  Buku diambil                           15          0          5      20
  Buku dikembalikan                      20          0          0      20
  Pembelian berhasil 3 buku              17          0          0      17

Makna kolom:

-   `available_quantity`: stok yang tersedia untuk pembelian atau
    pengajuan peminjaman.
-   `reserved_quantity`: stok yang telah dialokasikan untuk peminjaman
    yang disetujui tetapi belum diambil.
-   `borrowed_quantity`: stok yang sedang berada pada peminjam.
-   `total_quantity`: jumlah fisik buku yang dimiliki dan belum terjual.

Ketika pembelian berhasil, jumlah fisik (`total_quantity`) dan jumlah
tersedia (`available_quantity`) berkurang. Ketika buku hilang atau
rusak, sistem perlu menyediakan proses adjustment dan pencatatan
alasannya.

### 2. Alur pembelian dan pembayaran manual

1.  User memilih buku dan memasukkannya ke cart.
2.  User mengubah quantity atau menghapus item cart.
3.  Saat checkout, server memeriksa harga dan stok terbaru.
4.  Server membuat `transactions` dengan status `pending`.
5.  Server membuat `transaction_items` dengan snapshot judul dan harga.
6.  User melakukan transfer sesuai instruksi pembayaran.
7.  User mengunggah bukti transfer.
8.  Status transaksi menjadi `awaiting_verification`.
9.  Admin memeriksa bukti pembayaran.
10. Jika valid, status menjadi `paid` dan stok dikurangi.
11. Jika bukti tidak valid, admin dapat mengubah status menjadi
    `rejected` dan memberikan alasan.

**Aturan penting:**

-   Harga dan subtotal harus dihitung ulang di server.
-   Jangan menggunakan total harga dari request client sebagai sumber
    kebenaran.
-   Stok harus dikunci dan diverifikasi kembali ketika checkout atau
    pembayaran dikonfirmasi.
-   Jika stok tidak lagi cukup ketika pembayaran diverifikasi, transaksi
    tidak boleh diproses seolah-olah berhasil. Admin perlu menangani
    kasus tersebut.
-   Kebijakan batas waktu pembayaran dan pembatalan perlu ditetapkan
    sebelum fitur checkout dirilis.

### 3. Alur peminjaman

1.  User memilih buku dan quantity yang ingin dipinjam.
2.  Server memeriksa stok tersedia.
3.  Sistem membuat `loans` dan `loan_items` dengan status `pending`.
4.  Admin memeriksa pengajuan.
5.  Jika ditolak, status menjadi `rejected` dan stok tidak berubah.
6.  Jika disetujui, status menjadi `approved`; stok berpindah dari
    available ke reserved.
7.  Saat buku diserahkan kepada user, admin mencatat pengambilan. Status
    menjadi `borrowed`; stok berpindah dari reserved ke borrowed.
8.  Saat buku dikembalikan, admin mengonfirmasi pengembalian. Status
    menjadi `returned`; stok berpindah dari borrowed ke available.

Status `overdue` dapat ditentukan berdasarkan `due_date` dan status
peminjaman yang masih aktif. Pekerjaan terjadwal dapat ditambahkan untuk
memperbarui status tersebut.

### 4. Riwayat perubahan stok

Setiap perubahan stok harus dicatat di `stock_movements`, termasuk:

-   Penambahan stok.
-   Pembelian berhasil.
-   Persetujuan peminjaman.
-   Penyerahan buku.
-   Pengembalian buku.
-   Pelepasan reservasi.
-   Penyesuaian stok.

Catatan stok berfungsi sebagai audit trail. Perubahan stok dan
pencatatan movement harus dilakukan dalam transaksi database yang sama.

------------------------------------------------------------------------

## Persiapan Development

### Prasyarat

Pastikan perangkat sudah memiliki:

-   Node.js versi yang kompatibel dengan Next.js 16.
-   npm.
-   MariaDB Server.
-   Git.

### 1. Buat proyek Next.js

``` bash
npx create-next-app@latest book-store
```

Pilih TypeScript, App Router, dan Tailwind CSS saat konfigurasi. Masuk
ke direktori:

``` bash
cd book-store
```

### 2. Install dependensi database

``` bash
npm install drizzle-orm mysql2
npm install -D drizzle-kit
```

### 3. Install dependensi validasi dan autentikasi

``` bash
npm install zod
npm install next-auth
```

Konfigurasi Auth.js dan adapter Drizzle perlu disesuaikan dengan versi
paket yang dipilih. Jika menggunakan Drizzle Adapter, pasang paket
adapter yang sesuai dan pastikan schema tabel autentikasi Auth.js
tersedia. Tabel `users` aplikasi dapat diperluas atau dipetakan sesuai
kebutuhan adapter; jangan menganggap schema user sederhana di dokumen
ini otomatis sudah memenuhi seluruh kontrak adapter.

### 4. Buat database MariaDB

Masuk ke MariaDB:

``` bash
sudo mariadb
```

Buat database:

``` sql
CREATE DATABASE book_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Keluar:

``` sql
EXIT;
```

Gunakan akun database khusus aplikasi untuk development dan production.
Hindari menggunakan akun `root` untuk koneksi aplikasi di production.

------------------------------------------------------------------------

## Konfigurasi Environment

Buat file `.env` di root proyek:

``` env
DATABASE_URL="mysql://book_store_user:your_password@localhost:3306/book_store"

AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_URL="http://localhost:3000"
```

Contoh pembuatan secret:

``` bash
openssl rand -base64 32
```

Simpan contoh variabel tanpa secret asli pada `.env.example`:

``` env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"
```

Pastikan `.env` masuk ke `.gitignore`. Jangan commit password, token,
secret, atau kredensial database.

------------------------------------------------------------------------

## Drizzle ORM

### 1. Konfigurasi Drizzle Kit

Buat `drizzle.config.ts`:

``` ts
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "mysql",
  schema: "./lib/db/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

Pastikan `dotenv` tersedia untuk konfigurasi CLI:

``` bash
npm install -D dotenv
```

### 2. Koneksi database

Contoh `lib/db/index.ts`:

``` ts
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

import * as schema from "./schema";
import * as relations from "./relations";

const pool = mysql.createPool(
  process.env.DATABASE_URL!
);

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations,
  },
  mode: "default",
});
```

### 3. Export schema

Contoh `lib/db/schema/index.ts`:

``` ts
export * from "./users";
export * from "./categories";
export * from "./books";
export * from "./stocks";
export * from "./carts";
export * from "./loans";
export * from "./transactions";
export * from "./stock-movements";
```

Pastikan file schema juga mengekspor tabel `cartItems`, `loanItems`, dan
`transactionItems`.

### 4. Tambahkan scripts

Tambahkan ke bagian `scripts` pada `package.json`:

``` json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 5. Generate dan jalankan migration

``` bash
npm run db:generate
npm run db:migrate
```

Periksa hasil migration sebelum menjalankannya pada database penting.
Gunakan migration yang tersimpan di Git agar perubahan schema dapat
ditinjau dan direproduksi.

`db:push` tersedia untuk eksperimen lokal, tetapi workflow utama proyek
sebaiknya menggunakan `generate` dan `migrate`.

### 6. Jalankan development server

``` bash
npm run dev
```

Buka:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## API Design

Endpoint berikut adalah rancangan awal Route Handlers di `app/api/`.
Implementasikan validasi, autentikasi, otorisasi, dan penanganan error
pada setiap endpoint.

### Authentication

  ---------------------------------------------------------------------------------
  Method            Endpoint                    Akses             Kegunaan
  ----------------- --------------------------- ----------------- -----------------
  POST              `/api/auth/register`        Public            Registrasi user

  GET/POST          `/api/auth/[...nextauth]`   Auth.js           Authentication
                                                                  handler
  ---------------------------------------------------------------------------------

### Books

  --------------------------------------------------------------------------------
  Method            Endpoint            Akses             Kegunaan
  ----------------- ------------------- ----------------- ------------------------
  GET               `/api/books`        Public            Daftar buku

  GET               `/api/books/[id]`   Public            Detail buku

  POST              `/api/books`        Admin             Membuat buku

  PATCH             `/api/books/[id]`   Admin             Mengubah buku

  DELETE            `/api/books/[id]`   Admin             Mengarsipkan/menghapus
                                                          buku sesuai kebijakan
  --------------------------------------------------------------------------------

### Categories

  ------------------------------------------------------------------------------
  Method            Endpoint                 Akses             Kegunaan
  ----------------- ------------------------ ----------------- -----------------
  GET               `/api/categories`        Public            Daftar kategori

  POST              `/api/categories`        Admin             Membuat kategori

  PATCH             `/api/categories/[id]`   Admin             Mengubah kategori

  DELETE            `/api/categories/[id]`   Admin             Menghapus
                                                               kategori jika
                                                               aman
  ------------------------------------------------------------------------------

### Cart

  Method   Endpoint                 Akses   Kegunaan
  -------- ------------------------ ------- ----------------------
  GET      `/api/cart`              User    Melihat cart sendiri
  POST     `/api/cart/items`        User    Menambahkan item
  PATCH    `/api/cart/items/[id]`   User    Mengubah quantity
  DELETE   `/api/cart/items/[id]`   User    Menghapus item

### Transactions

  ----------------------------------------------------------------------------------------------
  Method            Endpoint                                 Akses             Kegunaan
  ----------------- ---------------------------------------- ----------------- -----------------
  POST              `/api/transactions/checkout`             User              Membuat transaksi
                                                                               dari cart

  GET               `/api/transactions`                      User/Admin        Riwayat sesuai
                                                                               hak akses

  GET               `/api/transactions/[id]`                 Pemilik/Admin     Detail transaksi

  POST              `/api/transactions/[id]/payment-proof`   Pemilik           Upload bukti
                                                                               transfer

  PATCH             `/api/admin/transactions/[id]/verify`    Admin             Verifikasi
                                                                               pembayaran
  ----------------------------------------------------------------------------------------------

### Loans

  ---------------------------------------------------------------------------------------
  Method            Endpoint                          Akses             Kegunaan
  ----------------- --------------------------------- ----------------- -----------------
  POST              `/api/loans`                      User              Membuat pengajuan

  GET               `/api/loans`                      User/Admin        Daftar peminjaman
                                                                        sesuai hak akses

  GET               `/api/loans/[id]`                 Pemilik/Admin     Detail peminjaman

  PATCH             `/api/admin/loans/[id]/approve`   Admin             Menyetujui
                                                                        pengajuan

  PATCH             `/api/admin/loans/[id]/reject`    Admin             Menolak pengajuan

  PATCH             `/api/admin/loans/[id]/issue`     Admin             Mencatat
                                                                        pengambilan

  PATCH             `/api/admin/loans/[id]/return`    Admin             Mencatat
                                                                        pengembalian
  ---------------------------------------------------------------------------------------

### Stocks

  Method   Endpoint                         Akses   Kegunaan
  -------- -------------------------------- ------- --------------------
  GET      `/api/stocks`                    Admin   Melihat inventaris
  GET      `/api/stocks/[bookId]`           Admin   Detail stok buku
  POST     `/api/stocks/[bookId]/restock`   Admin   Menambah stok
  POST     `/api/stocks/[bookId]/adjust`    Admin   Penyesuaian stok

Endpoint di atas merupakan rancangan, bukan klaim bahwa seluruh endpoint
sudah tersedia. Implementasi dapat memakai Route Handler atau Server
Actions sesuai kebutuhan, tetapi business logic sebaiknya tetap berada
di `lib/services/`.

------------------------------------------------------------------------

## Keamanan dan Konsistensi Data

### Authentication dan authorization

-   Hash password menggunakan algoritma yang sesuai, misalnya Argon2id
    atau bcrypt.
-   Jangan menyimpan password plaintext.
-   Validasi session pada setiap operasi privat.
-   Periksa role admin di server.
-   User hanya boleh mengakses cart, transaksi, dan peminjaman miliknya
    sendiri.
-   Jangan mempercayai `userId`, `role`, harga, subtotal, atau total
    yang dikirim client.

### Database transaction dan race condition

Operasi berikut harus dijalankan secara atomik:

-   Checkout dan pengurangan stok saat pembayaran berhasil.
-   Persetujuan peminjaman dan reservasi stok.
-   Pencatatan pengambilan buku.
-   Pengembalian buku.
-   Pembatalan peminjaman yang sudah direservasi.
-   Penyesuaian stok dan pembuatan audit movement.

Gunakan database transaction serta row locking (`SELECT ... FOR UPDATE`)
pada record stok yang akan diubah. Periksa kembali ketersediaan stok di
dalam transaksi, bukan hanya saat halaman dibuka.

### Upload bukti pembayaran

-   Validasi tipe MIME, ekstensi, ukuran, dan isi file.
-   Buat nama file unik.
-   Simpan file di storage, bukan sebagai binary di tabel transaksi.
-   Batasi akses bukti pembayaran agar tidak dapat dilihat publik tanpa
    izin.
-   Simpan path atau URL storage pada `payment_proof`.
-   Jangan mempercayai nama file dari client.

### Integritas database

-   Gunakan foreign key dan unique constraint.
-   `stocks.book_id` harus UNIQUE.
-   `carts.user_id` harus UNIQUE jika satu cart aktif per user.
-   Kombinasi `cart_items.cart_id` dan `book_id` harus UNIQUE.
-   Gunakan tipe `DECIMAL` untuk nilai uang, bukan floating point.
-   Hindari menghapus buku yang sudah direferensikan transaksi atau
    peminjaman; gunakan status `archived`.
-   Pastikan jumlah stok tidak negatif dan persamaan stok selalu
    terpenuhi.

------------------------------------------------------------------------

## Roadmap

  Tahap   Pekerjaan                                  Status
  ------- ------------------------------------------ ----------
  1       Inisialisasi Next.js dan struktur folder   Planned
  2       Setup MariaDB dan Drizzle ORM              Planned
  3       Database schema dan migration              Designed
  4       Authentication dan role                    Planned
  5       CRUD buku, kategori, dan stok              Planned
  6       Katalog dan detail buku                    Planned
  7       Cart dan checkout                          Planned
  8       Pembayaran manual dan verifikasi admin     Planned
  9       Peminjaman dan pengembalian                Planned
  10      Dashboard admin                            Planned
  11      Testing dan deployment                     Planned

------------------------------------------------------------------------

## Catatan Pengembangan

1.  **Schema awal perlu ditinjau sebelum production.** Pastikan semua
    tabel, relasi, index, dan constraint sudah diuji dengan versi
    Drizzle dan MariaDB yang digunakan.
2.  **Auth.js memerlukan schema adapter yang sesuai.** Jika menggunakan
    Drizzle Adapter, lengkapi tabel account, session, dan verification
    token sesuai konfigurasi authentication yang dipilih.
3.  **Status `overdue` perlu mekanisme pembaruan.** Status dapat
    dihitung ketika data dibaca atau diperbarui oleh scheduled job.
4.  **Kebijakan pembayaran perlu ditentukan.** Tentukan batas waktu
    transfer, pembatalan otomatis, dan penanganan pembayaran yang
    terlambat.
5.  **Reservasi stok pembelian belum menjadi bagian dari desain awal.**
    Jika ingin menahan stok sejak checkout sampai pembayaran, tambahkan
    mekanisme reservation dan masa kedaluwarsa. Jika tidak, stok cukup
    diperiksa dan dikurangi ketika pembayaran diverifikasi.
6.  **Kebijakan pengembalian perlu ditentukan.** Tentukan penanganan
    buku rusak/hilang, keterlambatan, dan denda jika diperlukan.
7.  **Gunakan migration untuk perubahan schema.** Jangan mengubah
    database production secara manual tanpa migration yang tercatat.

------------------------------------------------------------------------

## License

Belum ditentukan. Tambahkan lisensi (misalnya MIT) jika proyek akan
dipublikasikan atau dibagikan secara terbuka.
