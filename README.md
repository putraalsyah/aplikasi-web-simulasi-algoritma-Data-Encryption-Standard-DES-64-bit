# 🔐 DES Simulator — Web Simulasi Data Encryption Standard

Aplikasi web interaktif untuk mensimulasikan algoritma **Data Encryption Standard (DES)** secara lengkap dan transparan, mulai dari Key Schedule hingga 16 putaran Feistel.
www.desputraaliansyah.my.id

> **Tugas Mata Kuliah Kriptografi — Semester Genap 2025/2026**

---

## ✨ Fitur

| Komponen | Keterangan |
|---|---|
| Input fleksibel | Biner (64-bit) atau Heksadesimal (16 karakter) |
| Mode Enkripsi & Dekripsi | Pilihan di panel kiri |
| Key Schedule | Tampilan PC-1, C0/D0, shift, PC-2, dan semua K1–K16 |
| 16 Round Feistel | Setiap round ditampilkan lengkap: Ekspansi E, XOR, S-Box, Permutasi P |
| Visualisasi S-Box | Baris, kolom, dan nilai output tiap S-Box |
| Round-Trip Test | Enkripsi hasil dekripsi (verifikasi bolak-balik) |
| Toggle format | Konversi biner ↔ hex langsung di input |
| Contoh bawaan | Test vector DES standar |
| 100% Frontend | Tidak butuh internet saat dijalankan (kecuali font Google) |

---

## 🗂️ Struktur Proyek

```
des-simulator/
├── index.html              # Halaman utama aplikasi
├── app.py                  # Server Python Flask (opsional)
├── requirements.txt        # Dependensi Python
├── README.md               # Dokumentasi ini
└── static/
    ├── css/
    │   └── style.css       # Stylesheet utama
    └── js/
        ├── des.js          # Logika DES (murni JavaScript)
        └── ui.js           # Rendering UI dan controller
```

---

## 🚀 Cara Menjalankan

### Opsi 1 — Buka Langsung (Paling Mudah)

Cukup buka file `index.html` di browser. **Tidak perlu server, tidak perlu install apapun.**

```
Klik dua kali pada index.html  →  Browser langsung membuka aplikasi
```

### Opsi 2 — Python HTTP Server (Lokal)

Jika ingin server lokal sederhana tanpa Flask:

```bash
# Python 3
python -m http.server 8000

# Buka browser → http://localhost:8000
```

### Opsi 3 — Flask Server (Python)

Untuk deploy ke VPS atau menjalankan via Flask:

```bash
# 1. Install dependensi
pip install -r requirements.txt

# 2. Jalankan server
python app.py

# 3. Buka browser → http://localhost:5000
```

Untuk mengubah port:

```bash
PORT=8080 python app.py
```

### Opsi 4 — Deploy ke Hosting (domain .my.id)

1. Upload seluruh isi folder ke server/VPS
2. Pastikan web server (Nginx/Apache) mengarah ke `index.html`
3. Atau gunakan layanan static hosting seperti **Netlify**, **Vercel**, atau **Cloudflare Pages**

**Contoh konfigurasi Nginx sederhana:**
```nginx
server {
    listen 80;
    server_name namamu.my.id;
    root /var/www/des-simulator;
    index index.html;
}
```

---

## 🧪 Cara Menggunakan Aplikasi

### Langkah 1 — Masukkan Plaintext/Ciphertext
- Format **Heksadesimal**: `0123456789ABCDEF` (16 karakter)
- Format **Biner**: `0000000100100011...` (64 karakter 0/1)
- Gunakan tombol **⇄ Biner/Hex** untuk toggle format

### Langkah 2 — Masukkan Kunci (64-bit)
- Format sama: hex 16 karakter atau biner 64 bit
- Contoh: `133457799BBCDFF1`

### Langkah 3 — Pilih Mode
- **🔒 Enkripsi** → Plaintext → Ciphertext
- **🔓 Dekripsi** → Ciphertext → Plaintext

### Langkah 4 — Lihat Hasil
Hasil tampil dalam 3 tab:

| Tab | Isi |
|---|---|
| **Key Schedule** | PC-1, C0/D0, semua 16 subkunci K1–K16 dengan detail shift dan PC-2 |
| **IP & Rounds** | Initial Permutation, 16 putaran Feistel (bisa diklik untuk expand) |
| **IP⁻¹ & Output** | Pre-output swap, Final Permutation, hasil akhir biner & hex |

### Fitur Tambahan
- **📂 Contoh** → Mengisi test vector DES standar (FIPS)
- **🗑️ Reset** → Membersihkan semua input dan output
- **🔁 Round-Trip Test** → Otomatis enkripsi hasil dekripsi (atau sebaliknya) untuk verifikasi
- **📋 Salin Hasil** → Menyalin ciphertext/plaintext ke clipboard

---

## 🔬 Test Vector (Verifikasi)

Gunakan nilai ini untuk verifikasi kebenaran implementasi:

| Parameter | Nilai (Hex) |
|---|---|
| Plaintext | `0123456789ABCDEF` |
| Kunci | `133457799BBCDFF1` |
| Ciphertext | `85E813540F0AB405` |

Nilai ini adalah test vector resmi dari spesifikasi DES (FIPS PUB 46-3).

---

## ⚙️ Detail Teknis Implementasi

### Tabel Permutasi
Semua tabel permutasi DES diimplementasikan sesuai standar FIPS PUB 46-3:
- **PC-1** (64→56 bit), **PC-2** (56→48 bit)
- **IP** & **IP⁻¹** (Initial & Final Permutation)
- **E** (Expansion, 32→48 bit)
- **P** (Permutasi 32-bit dalam F-function)

### S-Box
8 S-Box masing-masing memetakan 6-bit input → 4-bit output:
- Bit 1 dan 6 → nomor baris (0–3)
- Bit 2–5 → nomor kolom (0–15)

### Key Schedule
1. PC-1 → kunci 56-bit (C0 || D0)
2. Untuk setiap round 1–16: left shift C dan D sesuai jadwal `[1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1]`
3. PC-2 → subkunci 48-bit (K_i)
4. Untuk **dekripsi**: subkunci digunakan secara terbalik (K16 → K1)

### Feistel Function f(R, K)
1. Ekspansi E: R (32-bit) → 48-bit
2. XOR dengan subkunci K (48-bit)
3. Substitusi 8 S-Box: 48-bit → 32-bit
4. Permutasi P: 32-bit → 32-bit

---

## 📚 Referensi

1. NIST. (1999). *FIPS PUB 46-3: Data Encryption Standard*. National Institute of Standards and Technology.
2. Schneier, B. (1996). *Applied Cryptography* (2nd ed.). Wiley.
3. Stallings, W. (2017). *Cryptography and Network Security* (7th ed.). Pearson.

---

## ⚠️ Catatan Akademik

- Seluruh logika DES diimplementasikan sendiri (**tanpa library CryptoJS atau sejenisnya**)
- Kode terdokumentasi dan dapat diaudit
- Implementasi mengikuti FIPS PUB 46-3 secara ketat
