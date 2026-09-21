# TürkAnime Mirror & Arşiv 📺

TürkAnime TV'nin arşivlenmiş ~6,100 animesini, 89,000+ bölümünü ve çoklu video sağlayıcılarını (GDrive, Mail.ru, Sibnet, Ok.ru, Clone vb.) modern, hızlı ve Vercel/Obsidian estetiğinde sunan **%100 statik** web uygulaması.

> **Soru:** *"Data dosyalarını zip ile mi vermeliyim? Yoksa repolardan çekebilir misin?"*  
> **Cevap:** Hiçbir veri zip dosyası yüklemenize gerek yoktur. Uygulama verileri doğrudan açık kaynak GitHub Raw CDN üzerinden canlı ve CORS kısıtlamasız olarak çeker. Ayrıca 6,107 animelik arama indeksi ve afiş meta verileri doğrudan `public/data/` içinde hazır olarak derlenmiştir.

---

## 🚀 GitHub Pages'te Yayınlama (Adım Adım)

Bu proje istemci tarafında (SPA) çalıştığı için herhangi bir sunucu veya veritabanı kurulumuna ihtiyaç duymaz.

### Yöntem 1: Tek Komutla `gh-pages` ile Yayınlama

1. Repoyu bilgisayarınıza klonlayın:
   ```bash
   git clone <REPO_LINKINIZ>
   cd turkanime-arsiv
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Statik siteyi derleyin:
   ```bash
   npm run build
   ```

4. `gh-pages` paketiyle doğrudan GitHub Pages dalına gönderin:
   ```bash
   npx gh-pages -d dist
   ```

Tebrikler! Siteniz birkaç saniye içinde `https://<kullanici-adiniz>.github.io/<repo-adiniz>/` adresinde yayında olacaktır.

---

### Yöntem 2: GitHub Actions ile Otomatik Dağıtım

Reponuzun ana dizininde `.github/workflows/deploy.yml` dosyasını oluşturun ve şu içeriği yapıştırın:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

Artık `main` dalına her `git push` yaptığınızda GitHub sitenizi otomatik olarak derleyip yayına alacaktır.

---

## 🌟 Özellikler

- **6,107+ Anime Kataloğu:** Tüm seriler, filmler ve OVA'lar.
- **Anında Arama:** Başlık, Japonca isim ve tür bazlı anlık sonuçlar (`/` veya `Ctrl+K` kısayolu).
- **Çoklu Video Sunucusu:** GDrive, Mail.ru, Sibnet, Ok.ru, Voe, Filemoon, Sendvid, vb.
- **Yerel Depolama (LocalStorage):** Favori seriler ve izleme geçmişi tarayıcınızda güvenle saklanır.
- **Günün Animesi & Rastgele Keşif:** Her gün değişen yüksek puanlı günün animesi ve tek tıkla rastgele anime bulucu.
