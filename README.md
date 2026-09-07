# MonoHTML Engine

*Build once. Double-click anywhere.*

MonoHTML Engine adalah framework sederhana untuk membuat game 2D lokal berbasis HTML5 Canvas, tanpa dependensi eksternal, dan kompatibel untuk dijalankan langsung dari file lokal. Framework ini cocok untuk prototyping, mini game, dan game ringan yang ingin berjalan offline.

## Fitur utama

- Berbasis HTML5 Canvas
- Offline-friendly, tidak memerlukan server atau jaringan
- Menyediakan manager untuk scene, input, audio, tween, animasi, UI, storage, responsive, fullscreen, dan rotate
- Mendukung asset gambar yang di-embed sebagai base64 melalui file asset pack
- Dapat dijalankan langsung dari browser tanpa build step
- Struktur modular dengan folder engine, scenes, assets, dan tools

## Struktur folder

```text
assets/
  asset.pack.js
  css/
  images/
  js/
engine/
  config.js
  main.js
  core/
  helpers/
  scenes/
  ui/
scenes/
  credits-scene.js
  game-over-scene.js
  game-scene.js
  main-menu-scene.js
  result-scene.js
  setting-scene.js
  routes/
  ui/
tools/
  asset-pack-generator.js
index.html
package.json
README.md
```

## Cara kerja asset pack

File [assets/asset.pack.js](assets/asset.pack.js) berisi objek global:

```js
window.__ASSETS_PACK__ = {
  images: {
    "ui/background": "data:image/png;base64,..."
  }
};
```

Saat engine dimuat, file ini dipakai oleh [engine/main.js](engine/main.js) untuk mendaftarkan gambar ke dalam asset manager.

## Menghasilkan asset pack dari folder gambar

Semua gambar yang ditempatkan di folder [assets/images](assets/images) bisa dikonversi otomatis menjadi base64.

### Generate satu kali

```bash
npm run build:assets
```

### Watch mode (otomatis saat ada perubahan)

```bash
npm run watch:assets
```

Script generator berada di [tools/asset-pack-generator.js](tools/asset-pack-generator.js).

## Menjalankan framework

Buka file [index.html](index.html) di browser, atau jalankan dari server lokal jika Anda ingin pengalaman yang lebih konsisten.

## Catatan penting

- Gambar yang ingin dipakai harus diletakkan di folder [assets/images](assets/images)
- Nama file dan struktur folder akan dipakai sebagai key asset saat dikonversi
- Jika [assets/asset.pack.js](assets/asset.pack.js) belum ada, file tersebut akan dibuat otomatis oleh generator

## Kontribusi dan pengembangan

Framework ini terus disusun secara modular dan cocok untuk kebutuhan prototyping, mini game, atau game lokal ringan.
