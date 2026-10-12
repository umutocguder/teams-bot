# Teams Bot — Development & Architectural Guidelines

Bu doküman, **Teams Bot** projesinin mimari standartlarını, kurallarını ve geliştirme süreçlerini belirler.

---

## 1. Proje Kimliği ve Amacı
- **Proje Adı**: Teams Bot
- **Amaç**: Microsoft Teams toplantılarını ve mesajlarını otomatikleştiren, durum güncellemelerini takip eden akıllı bot çözümü.
- **Geliştirici**: Umut Öçgüder <umutocgdr@gmail.com> / 11Hopem
- **Logo**: `assets/logo.svg`

---

## 2. Mimari ve Teknoloji Yığını
- **Çalışma Ortamı**: Node.js, TypeScript
- **Telemetri**: Dual-tier `src/telemetry.ts` (Yerel JSONL + Firebase `hopem-software-cloud`)
- **Telif**: `Created by 11Hopem`

---

## 3. Test ve Çalıştırma
- **Testleri Çalıştırma**: `npm test`
