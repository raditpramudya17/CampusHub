# Dokumentasi Kode — Backend

Backend REST API berbasis **Express 5 + TypeScript 7 + MongoDB (Mongoose)** dengan arsitektur modular (module-based MVC).

## Teknologi

| Teknologi      | Kegunaan                                          |
|----------------|---------------------------------------------------|
| Express 5      | Web framework                                     |
| TypeScript 7   | Bahasa (dijalankan dengan `tsx`)                  |
| Mongoose 9     | ODM MongoDB                                       |
| Zod 4          | Validasi input                                    |
| jsonwebtoken   | Access token & refresh token (JWT)                |
| bcrypt         | Hashing password (salt round 10)                  |
| Nodemailer     | Pengiriman email (verifikasi & kode reset)        |
| Pino           | Logging                                           |
| nanoid         | Generate kode verifikasi 6 digit                  |
| dotenv         | Konfigurasi environment                           |
| Vitest         | Testing                                           |

## Menjalankan Proyek

```bash
npm install        # install dependensi
npm run dev        # dev server dengan hot-reload (tsx watch)
npm run build      # compile ke dist/
npm start          # jalankan hasil build
npm test           # jalankan test (vitest)
```

## Environment Variables (`.env`)

| Variabel             | Keterangan                                    |
|----------------------|-----------------------------------------------|
| `PORT`               | Port server (default 3000)                    |
| `MONGODB_URI`        | Connection string MongoDB                     |
| `JWT_ACCESS_SECRET`  | Secret untuk access token (berlaku 15 menit)  |
| `JWT_REFRESH_SECRET` | Secret untuk refresh token (berlaku 1 hari)   |
| `LOG_LEVEL`          | Level log pino (default `debug`)              |
| `APP_URL`            | Base URL aplikasi (untuk link verifikasi email) |
| `SMTP_HOST`          | Host server SMTP                              |
| `SMTP_PORT`          | Port SMTP                                     |
| `SMTP_USER`          | Username/email SMTP                           |
| `SMTP_PASSWORD`      | Password SMTP                                 |

## Struktur Folder

```
backend/
├── mongoose/
│   └── config.ts                  # Koneksi MongoDB + debug logging query
├── docs/
│   ├── api.md                     # Dokumentasi endpoint API
│   └── code.md                    # Dokumentasi kode (file ini)
└── src/
    ├── main.ts                    # Entry point: load .env, start server
    ├── applications/
    │   ├── web.ts                 # Instance Express: middleware + router + error handler
    │   └── logging.ts             # Logger pino
    ├── errors/
    │   ├── response-error.ts      # ResponseError(status, message) — error bisnis
    │   └── auth-error.ts          # AuthError — error autentikasi (401)
    ├── middlewares/
    │   ├── auth-middleware.ts     # Proteksi endpoint via header X-API-TOKEN
    │   └── error-middleware.ts    # Error handler terpusat → ApiResponse
    ├── types/
    │   ├── common.types.ts        # ApiResponse<T>, TokenPayload
    │   ├── user.types.ts          # UserTypes, UserRequest
    │   └── auth.types.ts          # Tipe request/response auth, SessionTypes
    ├── utils/
    │   ├── jwt.ts                 # Class JWT: sign/verify access & refresh token
    │   └── nodemailer.ts          # Class Nodemailer: kirim email verifikasi & kode
    ├── validations/
    │   ├── validation.ts          # Validation.validate(schema, data) — wrapper zod
    │   └── fields.ts              # Definisi field zod yang dipakai bersama
    └── modules/
        ├── auth/                  # Modul autentikasi
        │   ├── controllers/auth.controller.ts
        │   ├── models/session.model.ts
        │   ├── responses/auth.response.ts
        │   ├── routers/auth.router.ts
        │   ├── services/auth.service.ts
        │   └── validations/auth.validation.ts
        └── user/
            └── models/user.model.ts
```

## Alur Request

```
Request
  → Router   (modules/*/routers)      : mapping URL → controller
  → Controller (modules/*/controllers): ambil body/query, panggil service, bungkus ApiResponse
  → Service  (modules/*/services)     : validasi (zod), logika bisnis, akses model
  → Model    (modules/*/models)       : skema & query Mongoose
  → errorMiddleware                   : semua error dilempar via next(e) dan dipetakan ke response
```

Setiap lapisan punya tanggung jawab tunggal:
- **Controller** tidak berisi logika bisnis — hanya HTTP.
- **Service** tidak tahu tentang `req`/`res` — mudah diuji unit.
- **Validasi** dilakukan di service melalui `Validation.validate` dengan skema dari `AuthValidation`.

---

## Penjelasan Per File

### `src/main.ts`
Entry point. Memuat `.env`, lalu menjalankan `web.listen(PORT)`.

### `mongoose/config.ts`
Membuka koneksi MongoDB saat modul di-import dan mengaktifkan `mongoose.set("debug")` sehingga setiap query tercatat di log (collection, method, query). Semua model meng-import mongoose dari file ini agar koneksi dan logging konsisten.

### `src/applications/web.ts`
Membuat instance Express:
- `express.json()` dan `express.urlencoded()` untuk parsing body
- Mount `authRouter` di `/api/auth`
- `errorMiddleware` dipasang **terakhir** (error handler Express harus paling akhir)

### `src/applications/logging.ts`
Logger [pino](https://getpino.io) dengan level dari `LOG_LEVEL`.

### `src/errors/`
| Class           | Kegunaan                                         | Status HTTP |
|-----------------|--------------------------------------------------|-------------|
| `ResponseError` | Error bisnis dengan status kustom                | sesuai `status` |
| `AuthError`     | Error autentikasi (token/sesi)                   | 401         |

### `src/middlewares/error-middleware.ts`
Error handler terpusat. Memetakan setiap jenis error ke response JSON:

| Error                            | Status | Catatan                                        |
|----------------------------------|--------|------------------------------------------------|
| `ZodError`                       | 400    | `errors` = array `"field: pesan"`              |
| `ResponseError`                  | dinamis| Status dari konstruktor                        |
| `MongooseError`                  | 400    | Error database/validasi Mongoose               |
| `AuthError`                      | 401    |                                                |
| `TokenExpiredError`              | 401    | Dicek **sebelum** `JsonWebTokenError` (subclass-nya) |
| `JsonWebTokenError`              | 401    |                                                |
| lainnya                          | 500    |                                                |

### `src/middlewares/auth-middleware.ts`
Middleware proteksi endpoint. Membaca header `X-API-TOKEN`, memverifikasi JWT access token, mengambil user dari database, lalu menempelkannya ke `req.user`. Melempar `AuthError` jika token tidak ada atau user tidak ditemukan.

### `src/types/`
- **`common.types.ts`**
  - `ApiResponse<T>` — bentuk baku semua response API
  - `TokenPayload` — payload JWT (`{ id: string }` + klaim standar)
- **`user.types.ts`**
  - `UserTypes` — bentuk dokumen user
  - `UserRequest` — `Request` Express + properti `user` (diisi `authMiddleware`)
- **`auth.types.ts`**
  - `SessionTypes` — dokumen sesi refresh token
  - `AuthRegisterRequest`, `AuthLoginRequest`, `AuthResetPasswordRequest` — bentuk body request
  - `AuthResponse` (dengan token), `AuthRegisterResponse` (tanpa token), `AuthTokenResponse`

### `src/utils/jwt.ts`
Class `JWT` (static):

| Method                | Keterangan                                              |
|-----------------------|---------------------------------------------------------|
| `sign(payload)`       | Access token, berlaku **15 menit**                      |
| `signRefresh(payload)`| Refresh token, berlaku **1 hari**, dengan `jti` unik (`randomUUID`) agar tidak pernah duplikat di collection Session |
| `verify(token)`       | Verifikasi access token → `TokenPayload`                |
| `verifyRefresh(token)`| Verifikasi refresh token → `TokenPayload`               |

### `src/utils/nodemailer.ts`
Class `Nodemailer` (static) dengan transport SMTP dari `.env`:

| Method                        | Keterangan                                          |
|-------------------------------|-----------------------------------------------------|
| `sendVerifyEmail(token, email)` | Kirim link verifikasi `GET /api/auth/verify-email?token=...` |
| `sendVerificationCode(email)`   | Kirim kode 6 digit (nanoid), return kodenya (number) |

### `src/validations/`
- **`validation.ts`** — `Validation.validate(schema, data)`: menjalankan `schema.parse`; jika gagal melempar `ZodError` yang ditangani `errorMiddleware`.
- **`fields.ts`** — definisi aturan tiap field (email, username 5–100, password 6–100, gender enum, dsb.) agar konsisten di semua skema.

---

## Modul Auth (`src/modules/auth/`)

### `validations/auth.validation.ts`
Class `AuthValidation` berisi skema zod:

| Skema              | Kegunaan                                              |
|--------------------|-------------------------------------------------------|
| `REGISTER`         | Body register + refine `password === confirmPassword` |
| `LOGIN`            | Body login                                            |
| `RESET_PASSWORD`   | Body reset password + refine konfirmasi               |
| `TOKEN`            | Validasi string token                                 |
| `EMAIL`            | Validasi email                                        |
| `VERIFICATION_CODE`| Angka 6 digit                                         |

### `models/session.model.ts`
Skema `Session` — menyimpan refresh token per login:

| Field       | Tipe       | Keterangan                       |
|-------------|------------|-----------------------------------|
| `user`      | `ObjectId` | Referensi ke `User`               |
| `token`     | `string`   | Refresh token, **unique**         |
| `expiresAt` | `Date`     | Kedaluwarsa sesi (15 hari)        |
| timestamps  | otomatis   | `createdAt`, `updatedAt`          |

### `modules/user/models/user.model.ts`
Skema `User`:

| Field              | Tipe                   | Keterangan                    |
|--------------------|------------------------|-------------------------------|
| `firstName`        | `string`               | wajib                         |
| `lastName`         | `string`               | wajib                         |
| `email`            | `string`               | wajib, **unique index**       |
| `username`         | `string`               | wajib, **unique index**       |
| `password`         | `string`               | hash bcrypt                   |
| `gender`           | `"male"` \| `"female"` | enum                          |
| `isVerified`       | `boolean`              | default `false`               |
| `verificationCode` | `number \| null`       | kode reset password, sekali pakai |

### `responses/auth.response.ts`
Fungsi pembentuk response (mencegah bocornya field sensitif seperti `password`):
- `authResponse(user, accessToken, refreshToken)` — untuk login
- `registerResponse(user)` — untuk register (tanpa token)

### `services/auth.service.ts`
Class `AuthService` (static) — seluruh logika bisnis auth:

| Method                       | Logika                                                                                     |
|------------------------------|--------------------------------------------------------------------------------------------|
| `register(request)`          | Validasi → cek duplikat username/email → hash password → simpan user → kirim email verifikasi (non-blocking; kegagalan SMTP hanya dicatat warning) → return data user tanpa token |
| `login(request)`             | Validasi → cek user & password (bcrypt) → **tolak jika `isVerified` false (403)** → buat access+refresh token → simpan Session → return user + token |
| `resendVerifyEmail(email)`   | Cek user ada & belum terverifikasi → kirim ulang email verifikasi                          |
| `verifyEmail(token)`         | Verifikasi JWT → cek user → tolak jika sudah terverifikasi → set `isVerified = true`       |
| `forgotPassword(email)`      | Cek user → kirim kode 6 digit ke email → simpan kode di user                               |
| `verificationCode(code, email)` | Cocokkan kode → hapus kode (sekali pakai) → return token reset                          |
| `resetPassword(request, token)` | Verifikasi token → tolak jika password baru sama dengan lama → hash & simpan            |
| `session(refreshToken)`      | Verifikasi refresh token → cek Session di DB → hapus jika kedaluwarsa → terbitkan access token baru |

### `controllers/auth.controller.ts`
Class `AuthController` (static) — satu method per endpoint. Pola setiap method:
1. Ambil data dari `req.body` / `req.query`
2. Panggil method `AuthService` terkait
3. Bungkus hasil dalam `ApiResponse` dengan status yang sesuai
4. `catch (e) { next(e) }` → error diteruskan ke `errorMiddleware`

### `routers/auth.router.ts`
Mapping endpoint (semua relatif terhadap `/api/auth`):

| Method | Path                    | Controller           |
|--------|-------------------------|----------------------|
| POST   | `/register`             | `register`           |
| POST   | `/login`                | `login`              |
| GET    | `/verify-email`         | `verifyEmail`        |
| POST   | `/resend-verify-email`  | `resendVerifyEmail`  |
| POST   | `/verify-code`          | `verifyCode`         |
| POST   | `/forgot-password`      | `forgotPassword`     |
| POST   | `/reset-password`       | `resetPassword`      |
| POST   | `/refresh-token`        | `session`            |

Detail request/response setiap endpoint: lihat [`api.md`](./api.md).

---

## Konsep Keamanan

1. **Password** di-hash dengan bcrypt (salt round 10); tidak pernah dikirim balik di response.
2. **Verifikasi email wajib** sebelum login (403 jika belum).
3. **Dua jenis token**: access (15 menit, header `X-API-TOKEN`) dan refresh (1 hari, disimpan di collection `Session` sehingga bisa dicabut dari sisi server).
4. **Refresh token unik** — diberi `jti` acak agar login berkali-kali tidak menghasilkan token yang sama (unique index di Session).
5. **Kode reset password sekali pakai** — dihapus setelah diverifikasi.
6. **Validasi input terpusat** dengan zod pada setiap request.
