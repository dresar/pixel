# BrevetAI Backend Server

Backend terpisah untuk platform BrevetAI — dibangun dengan **Hono.js** (ultra-ringan) + **Drizzle ORM** + **Neon PostgreSQL**.

## Stack

| Komponen | Teknologi |
|---|---|
| Framework | Hono.js 4.x |
| Database | Neon PostgreSQL (via Drizzle ORM) |
| Auth | Better-Auth |
| AI | Google Gemini |
| Media Storage | Cloudinary |
| Build | esbuild → single `app.js` |
| Runtime | Node.js 18+ |

## Struktur Folder

```
server/
├── src/
│   ├── app.ts                    ← Entry point
│   ├── config/
│   │   ├── env.ts                ← Validasi env dengan Zod
│   │   ├── database.ts           ← Drizzle + Neon
│   │   └── cloudinary.ts         ← Cloudinary SDK
│   ├── database/
│   │   └── schema/               ← Drizzle schema
│   ├── shared/
│   │   ├── errors/AppError.ts    ← Custom error class
│   │   ├── middleware/           ← Auth & CORS middleware
│   │   └── utils/                ← Logger, response, slug
│   └── features/
│       ├── auth/                 ← Better-Auth routes
│       ├── modules/              ← Modul, chapter, lesson
│       ├── ai-engine/            ← Gemini AI
│       ├── quiz/                 ← Kuis & percobaan
│       ├── users/                ← Profil pengguna
│       ├── media/                ← Upload Cloudinary
│       ├── glossary/             ← Glosarium perpajakan
│       ├── referensi/            ← Referensi hukum
│       └── notifications/        ← Notifikasi
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── build.mjs                     ← esbuild script
├── .env                          ← Environment variables
└── .env.example                  ← Template env
```

## Cara Menjalankan

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env dan isi semua variabel yang dibutuhkan
```

### 3. Development
```bash
npm run dev
# Server berjalan di http://localhost:3001
```

### 4. Build untuk cPanel
```bash
npm run build
# Output: app.js (single bundled file)
```

### 5. Jalankan di Production
```bash
node app.js
```

## API Endpoints

### Public
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/` | Info server |
| GET | `/api/health` | Health check |
| GET | `/api/roadmap` | Roadmap yang diterbitkan |
| GET | `/api/roadmap/realtime` | Data roadmap + stats |
| GET | `/api/glosarium` | Daftar glosarium |
| GET | `/api/referensi` | Referensi hukum |

### Auth (Better-Auth)
| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-up/email` | Daftar |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/get-session` | Ambil sesi aktif |

### Protected (Perlu Login)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/materi` | Daftar materi siswa |
| GET | `/api/materi/:slug` | Konten pelajaran |
| GET | `/api/modules` | Daftar modul |
| GET | `/api/users/profil` | Profil pengguna |
| PATCH | `/api/users/profil` | Update profil |
| POST | `/api/ai/proses` | Proses permintaan AI |
| POST | `/api/ai/chat` | Chat AI |
| GET | `/api/ai/riwayat` | Riwayat percakapan |
| GET | `/api/notifikasi` | Notifikasi |

### Admin Only
| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/admin/modules` | Buat modul baru |
| POST | `/api/admin/modules/:id/terbitkan` | Terbitkan modul |
| DELETE | `/api/admin/modules/:id` | Hapus modul |
| GET | `/api/users/admin/daftar` | Daftar pengguna |
| POST | `/api/media/unggah` | Upload media |

## Deploy ke cPanel

1. Build: `npm run build` → menghasilkan `app.js`
2. Upload `app.js` dan `.env` ke server cPanel
3. Di cPanel → **Node.js App** → Set entry point ke `app.js`
4. Set environment variables di cPanel atau via `.env`
5. Klik **Start Application**

> **Port**: cPanel akan otomatis assign port, atau bisa set via `PORT` env variable.
