# Dokumentasi API

Base URL: `http://localhost:3000`

- Modul **Auth**: `/api/auth` — register, login, verifikasi email, reset password, refresh token.
- Modul **Users**: `/api/users` — profil user (wajib login).

Semua request dan response menggunakan `Content-Type: application/json`.

## Format Response Umum

Semua endpoint mengembalikan bentuk `ApiResponse<T>`:

```json
{
    "success": true,
    "message": "pesan status",
    "data": {},
    "errors": null
}
```

| Field     | Tipe                             | Keterangan                                    |
|-----------|----------------------------------|-----------------------------------------------|
| `success` | `boolean`                        | `true` jika berhasil                          |
| `message` | `string`                         | Pesan status                                  |
| `data`    | `T \| null`                      | Payload data (bentuk tergantung endpoint)     |
| `errors`  | `string \| string[] \| null`     | Detail error, `null` jika sukses              |

### Format Error

| Kondisi                  | Status | Contoh response                                                                                     |
|--------------------------|--------|------------------------------------------------------------------------------------------------------|
| Validasi zod gagal       | 400    | `{"success":false,"message":"Validation Error","data":null,"errors":["username: minimal 5 karakter"]}` |
| Request error (bisnis)   | 4xx    | `{"success":false,"message":"Request Error","data":null,"errors":"Username or email already exists"}`  |
| Error Mongoose           | 400    | `{"success":false,"message":"Mongoose Validation Error","data":null,"errors":"..."}`                   |
| Auth error / sesi        | 401    | `{"success":false,"message":"Unauthorized","data":null,"errors":"Session not found"}`                  |
| Token kedaluwarsa        | 401    | `{"success":false,"message":"Unauthorized","data":null,"errors":"Token Expired"}`                      |
| Token tidak valid        | 401    | `{"success":false,"message":"Unauthorized","data":null,"errors":"Invalid Token"}`                      |
| Error tak terduga        | 500    | `{"success":false,"message":"internal server error","data":null,"errors":"..."}`                       |

---

## Alur Autentikasi

```
Register ──> Email verifikasi terkirim ──> Klik link (verify-email) ──> Login ──> accessToken (15 menit) + refreshToken (1 hari)
                                                                                        │
                                                          accessToken kedaluwarsa ──> refresh-token ──> accessToken baru
```

> **Penting:** Login hanya diizinkan setelah email diverifikasi.

---

## 1. Register

Mendaftarkan user baru. Email verifikasi otomatis dikirim ke alamat email yang didaftarkan. User **belum bisa login** sebelum verifikasi.

- **URL**: `POST /api/auth/register`

### Request Body

| Field             | Tipe                   | Validasi                        |
|-------------------|------------------------|---------------------------------|
| `firstName`       | `string`               | 3–100 karakter                  |
| `lastName`        | `string`               | 3–100 karakter                  |
| `email`           | `string`               | Email valid, 3–100 karakter     |
| `username`        | `string`               | 5–100 karakter                  |
| `password`        | `string`               | 6–100 karakter                  |
| `confirmPassword` | `string`               | Harus sama dengan `password`    |
| `gender`          | `"male"` \| `"female"` | Hanya `male` atau `female`      |

> **Role:** setiap user baru otomatis mendapat role `mahasiswa`. Field `role` di body **diabaikan** — role hanya bisa diubah oleh admin (mencegah pendaftaran sebagai admin).

```json
{
    "firstName": "Budi",
    "lastName": "Santoso",
    "email": "budi@mail.com",
    "username": "budisan",
    "password": "rahasia123",
    "confirmPassword": "rahasia123",
    "gender": "male"
}
```

### Response — 201 Created

```json
{
    "success": true,
    "message": "User created successfully, please check your email to verify your account",
    "data": {
        "email": "budi@mail.com",
        "username": "budisan",
        "id": "6a5a032d0e8266e22e594468"
    },
    "errors": null
}
```

### Kemungkinan Error

| Status | Penyebab                                    |
|--------|---------------------------------------------|
| 400    | Validasi gagal / username atau email sudah terdaftar |

---

## 2. Login

Login dengan username dan password. Email **harus sudah diverifikasi**.

- **URL**: `POST /api/auth/login`

### Request Body

| Field      | Tipe     | Validasi        |
|------------|----------|-----------------|
| `username` | `string` | 5–100 karakter  |
| `password` | `string` | 6–100 karakter  |

```json
{
    "username": "budisan",
    "password": "rahasia123"
}
```

### Response — 200 OK

```json
{
    "success": true,
    "message": "User login successfully",
    "data": {
        "email": "budi@mail.com",
        "username": "budisan",
        "id": "6a5a032d0e8266e22e594468",
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi..."
    },
    "errors": null
}
```

| Token          | Masa berlaku | Kegunaan                                    |
|----------------|--------------|---------------------------------------------|
| `accessToken`  | 15 menit     | Header `X-API-TOKEN` untuk endpoint terproteksi |
| `refreshToken` | 1 hari       | Meminta access token baru via `/refresh-token` |

### Kemungkinan Error

| Status | Penyebab                                |
|--------|------------------------------------------|
| 400    | Validasi gagal / username atau password salah |
| 403    | Email belum diverifikasi                 |

---

## 2b. Login via Google (OAuth)

Login/daftar otomatis pakai akun Google. Frontend memakai Google Identity Services untuk mendapatkan sebuah **ID token**, lalu mengirimnya ke endpoint ini untuk diverifikasi server-side.

- **URL**: `POST /api/auth/google`

### Request Body

| Field     | Tipe     | Validasi        |
|-----------|----------|------------------|
| `idToken` | `string` | wajib diisi      |

```json
{
    "idToken": "eyJhbGciOi..."
}
```

### Perilaku

- Jika `googleId` dari token sudah pernah login sebelumnya → langsung login akun tersebut.
- Jika belum, tapi email dari Google sudah terdaftar (register manual) → akun ditautkan ke `googleId` ini dan otomatis dianggap terverifikasi.
- Jika email belum terdaftar sama sekali → akun baru dibuat otomatis (`isVerified: true`, tanpa password/gender — bisa dilengkapi lewat `PATCH /api/users/me`).

### Response — 200 OK

Sama persis dengan response Login (lihat di atas): `{ email, username, id, accessToken, refreshToken }`.

### Kemungkinan Error

| Status | Penyebab                                          |
|--------|----------------------------------------------------|
| 400    | Token Google tidak valid/kedaluwarsa, atau email Google belum terverifikasi |

### Konfigurasi

Butuh `GOOGLE_CLIENT_ID` di `.env` backend (dan `VITE_GOOGLE_CLIENT_ID` yang sama nilainya di `.env` frontend), diambil dari Google Cloud Console → OAuth consent screen → Credentials → OAuth Client ID (Web application).

---

## 3. Verify Email

Memverifikasi email user. Endpoint ini diakses melalui link yang dikirim ke email saat register (atau resend).

- **URL**: `GET /api/auth/verify-email?token=<jwt>`

### Query Parameter

| Param   | Tipe     | Keterangan                          |
|---------|----------|-------------------------------------|
| `token` | `string` | Token JWT dari link email           |

### Response — 200 OK

```json
{
    "success": true,
    "message": "Verify email successfully",
    "data": null,
    "errors": null
}
```

### Kemungkinan Error

| Status | Penyebab                    |
|--------|------------------------------|
| 400    | User sudah terverifikasi     |
| 401    | Token tidak valid / kedaluwarsa |
| 404    | User tidak ditemukan         |

---

## 4. Resend Verify Email

Mengirim ulang email verifikasi (jika email pertama tidak sampai).

- **URL**: `POST /api/auth/resend-verify-email`

### Request Body

```json
{
    "email": "budi@mail.com"
}
```

### Response — 200 OK

```json
{
    "success": true,
    "message": "Verification email has been sent",
    "data": null,
    "errors": null
}
```

### Kemungkinan Error

| Status | Penyebab                 |
|--------|---------------------------|
| 400    | User sudah terverifikasi  |
| 404    | Email tidak ditemukan     |

---

## 5. Forgot Password

Mengirim kode verifikasi 6 digit ke email user untuk proses reset password.

- **URL**: `POST /api/auth/forgot-password`

### Request Body

```json
{
    "email": "budi@mail.com"
}
```

### Response — 200 OK

```json
{
    "success": true,
    "message": "Verification code has been sent to your email",
    "data": 483921,
    "errors": null
}
```

> `data` berisi kode verifikasi (number).

### Kemungkinan Error

| Status | Penyebab                        |
|--------|----------------------------------|
| 400    | Gagal mengirim kode verifikasi   |
| 404    | Email tidak ditemukan            |

---

## 6. Verify Code

Memvalidasi kode verifikasi dari email. Jika benar, mengembalikan token untuk reset password.

- **URL**: `POST /api/auth/verify-code?email=<email>`

### Query Parameter

| Param   | Tipe     | Keterangan       |
|---------|----------|------------------|
| `email` | `string` | Email user       |

### Request Body

| Field              | Tipe     | Validasi                |
|--------------------|----------|--------------------------|
| `verificationCode` | `number` | 6 digit (100000–999999)  |

```json
{
    "verificationCode": 483921
}
```

### Response — 200 OK

```json
{
    "success": true,
    "message": "Verification code successfully",
    "data": {
        "token": "eyJhbGciOi..."
    },
    "errors": null
}
```

> `token` dipakai sebagai query param pada `/reset-password`. Kode verifikasi dihapus setelah dipakai (sekali pakai).

### Kemungkinan Error

| Status | Penyebab                               |
|--------|-----------------------------------------|
| 400    | Kode belum dikirim / kode salah / validasi gagal |
| 404    | Email tidak ditemukan                   |

---

## 7. Reset Password

Mengganti password menggunakan token dari `/verify-code`.

- **URL**: `POST /api/auth/reset-password?token=<jwt>`

### Query Parameter

| Param   | Tipe     | Keterangan                     |
|---------|----------|--------------------------------|
| `token` | `string` | Token dari endpoint verify-code |

### Request Body

| Field             | Tipe     | Validasi                     |
|-------------------|----------|-------------------------------|
| `password`        | `string` | 6–100 karakter                |
| `confirmPassword` | `string` | Harus sama dengan `password`  |

```json
{
    "password": "passwordbaru123",
    "confirmPassword": "passwordbaru123"
}
```

### Response — 200 OK

```json
{
    "success": true,
    "message": "Reset password successfully",
    "data": null,
    "errors": null
}
```

### Kemungkinan Error

| Status | Penyebab                                              |
|--------|--------------------------------------------------------|
| 400    | Validasi gagal / password baru sama dengan password lama |
| 401    | Token tidak valid / kedaluwarsa                        |
| 404    | User tidak ditemukan                                   |

---

## 8. Refresh Token

Membuat access token baru menggunakan refresh token (saat access token kedaluwarsa).

- **URL**: `POST /api/auth/refresh-token`

### Request Body

```json
{
    "refreshToken": "eyJhbGciOi..."
}
```

### Response — 200 OK

```json
{
    "success": true,
    "message": "Create access token successfully",
    "data": {
        "token": "eyJhbGciOi..."
    },
    "errors": null
}
```

### Kemungkinan Error

| Status | Penyebab                                          |
|--------|----------------------------------------------------|
| 401    | Sesi tidak ditemukan / token kedaluwarsa / user tidak ditemukan / token tidak valid |

---

# Modul Users

Semua endpoint di bawah ini **terproteksi** — wajib mengirim header:

```
X-API-TOKEN: <accessToken>
```

| Status | Penyebab                        |
|--------|----------------------------------|
| 401    | Header tidak ada / token invalid / user tidak ditemukan |

---

## 9. Get Me

Mengambil data user yang sedang login.

- **URL**: `GET /api/users/me`

### Response — 200 OK

```json
{
    "success": true,
    "message": "User retrieved successfully",
    "data": {
        "id": "6a5a179cc6251de1aa1a3ea9",
        "firstName": "Budi",
        "lastName": "Santoso",
        "email": "budi@mail.com",
        "username": "budisan",
        "gender": "male",
        "role": "mahasiswa",
        "isVerified": true
    },
    "errors": null
}
```

> `role`: `mahasiswa` (default) | `dosen` | `ukm` | `eksternal` | `admin`.

---

## 10. Update Me

Update profil (partial — kirim field yang mau diubah saja, minimal satu). Email, password, dan role **tidak bisa** diubah lewat endpoint ini.

- **URL**: `PATCH /api/users/me`

### Request Body

| Field       | Tipe                   | Validasi                             |
|-------------|------------------------|--------------------------------------|
| `firstName` | `string` (opsional)    | 3–100 karakter                       |
| `lastName`  | `string` (opsional)    | 3–100 karakter                       |
| `username`  | `string` (opsional)    | 5–100 karakter, belum dipakai user lain |
| `gender`    | opsional               | `male` atau `female`                 |

```json
{
    "firstName": "Budi",
    "username": "budibaru"
}
```

### Response — 200 OK

Sama seperti Get Me (data user setelah update).

| Status | Penyebab                                          |
|--------|----------------------------------------------------|
| 400    | Body kosong / validasi gagal / username sudah dipakai |

---

## 11. Update Password

Ganti password. **Wajib menyertakan password lama.** Setelah berhasil, semua sesi (refresh token) dicabut — perangkat lain harus login ulang.

- **URL**: `PATCH /api/users/me/password`

### Request Body

| Field             | Tipe     | Validasi                              |
|-------------------|----------|----------------------------------------|
| `oldPassword`     | `string` | Harus cocok dengan password saat ini  |
| `newPassword`     | `string` | 6–100 karakter, ≠ password lama       |
| `confirmPassword` | `string` | Harus sama dengan `newPassword`       |

```json
{
    "oldPassword": "rahasia123",
    "newPassword": "barubaru123",
    "confirmPassword": "barubaru123"
}
```

### Response — 200 OK

```json
{
    "success": true,
    "message": "Password updated successfully, please login again on other devices",
    "data": null,
    "errors": null
}
```

| Status | Penyebab                                                      |
|--------|----------------------------------------------------------------|
| 400    | Password lama salah / konfirmasi tidak cocok / baru = lama    |
