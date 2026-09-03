# Teams Bot Proje Günlüğü (Worklog & AI Context Handoff)

Bu dosya, Microsoft Teams Bot projesinde gerçekleştirilen tüm teknik kararları, mimari yapıyı ve mevcut durumu başka bir geliştirici veya yapay zeka modelinin bağlam kaybı olmadan devam edebilmesi için belgeler.

---

### [2026-09-03 15:47] Proje Başlatma ve Temel Bot Mimarisi Kurulumu
- **Görev ve Amaç**: `/Users/umut/mycodespace/teams-bot` altında sıfırdan TypeScript + Microsoft Bot Framework tabanlı Teams Bot projesinin kurulması.
- **Teknik Kararlar ve Mimari Değişiklikler**:
  - **SDK / Çatı:** `@microsoft/botbuilder` (v4) seçildi. Teams için en kararlı ve resmi SDK'dır.
  - **Sunucu Katmanı:** `restify` HTTP sunucusu ve `CloudAdapter` ile Bot Framework kimlik doğrulama katmanı bağlandı.
  - **Bot Mantığı:** `TeamsActivityHandler` genişletilerek `src/bot.ts` içinde `onMessage`, `onMembersAdded`, `onTurnError` akışları kuruldu.
  - **Kart Mimarisi:** `src/cards/welcomeCard.ts` ile Adaptive Card v1.4 şablonu oluşturuldu.
  - **Endpointler:**
    - `POST /api/messages`: Teams bot mesajlaşma webhook'u.
    - `GET /api/health`: Canlılık ve sağlık kontrolü.
- **Etkilenen Dosyalar ve Bileşenler**:
  - [src/index.ts](file:///Users/umut/mycodespace/teams-bot/src/index.ts): Sunucu ve Adaptör giriş noktası.
  - [src/bot.ts](file:///Users/umut/mycodespace/teams-bot/src/bot.ts): TeamsActivityHandler komut işleyici.
  - [src/config.ts](file:///Users/umut/mycodespace/teams-bot/src/config.ts): Ortam değişkenleri ve yapılandırma.
  - [src/cards/welcomeCard.ts](file:///Users/umut/mycodespace/teams-bot/src/cards/welcomeCard.ts): Adaptive Card bileşeni.
  - [package.json](file:///Users/umut/mycodespace/teams-bot/package.json), [tsconfig.json](file:///Users/umut/mycodespace/teams-bot/tsconfig.json), [.env.example](file:///Users/umut/mycodespace/teams-bot/.env.example), [.gitignore](file:///Users/umut/mycodespace/teams-bot/.gitignore)
- **Mevcut Durum ve Doğrulama**:
  - `npm run build` hatasız derlendi (`dist/` üretildi).
  - Sunucu `http://localhost:3978` üzerinde test edildi ve `/api/health` 200 OK döndü.
  - Git reposu `main` dalı ve kişisel e-posta (`umutocgdr@gmail.com`) ile başlatıldı.
- **Sıradaki Adımlar**:
  - İsteğe bağlı: Yapay Zeka (Gemini / OpenAI) LLM entegrasyonu veya özel şirket/proje webhook bildirimlerinin eklenmesi.
  - Azure Bot App Registration tanımlanması ve manifest paketinin (.zip) hazırlanması.
  - GitHub reposu oluşturulup push edilmesi (`gh repo create`).

### [2026-09-03 15:48] GitHub Private Push, Antigravity Proje Kaydı ve Keep-Alive Scripti
- **Görev ve Amaç**: Projenin GitHub'a Private (Gizli) olarak pushlanması, Antigravity Projects listesine kaydedilmesi ve Teams'te sürekli Online (Yeşil) kalmayı sağlayan yerel macOS Keep-Alive aracının geliştirilmesi.
- **Teknik Kararlar ve Mimari Değişiklikler**:
  - `gh repo create teams-bot --private --source=. --push` ile repo `https://github.com/umutocguder/teams-bot` adresinde private olarak oluşturuldu ve bağlandı.
  - `04d4ee5d-76d7-4366-8330-4c1f99f7487c.json` ile Antigravity Projects yapılandırmasına `teams-bot` eklendi.
  - `scripts/keep-alive.swift` ve derlenmiş `bin/keep-alive` geliştirildi:
    - macOS `CoreGraphics` (`CGEventPost` to `.cghidEventTap`) kullanılarak her 60 saniyede bir 1px mikro hareket ile sistem boşta sayacı (idle timer) sıfırlanıyor.
    - `npm run keep-alive` betiği eklendi.
- **Etkilenen Dosyalar ve Bileşenler**:
  - [scripts/keep-alive.swift](file:///Users/umut/mycodespace/teams-bot/scripts/keep-alive.swift)
  - [package.json](file:///Users/umut/mycodespace/teams-bot/package.json)
  - [README.md](file:///Users/umut/mycodespace/teams-bot/README.md)
  - [WORKLOG.md](file:///Users/umut/mycodespace/teams-bot/WORKLOG.md)
- **Mevcut Durum ve Doğrulama**:
  - GitHub repo private olarak doğrulandı (`isPrivate: true`).
  - Swift derlemesi tamamlandı (`swiftc` -> `bin/keep-alive`).
  - Antigravity proje kaydı tamamlandı.
- **Sıradaki Adımlar**: Kullanıcının dilerse Antigravity sol menüsünden `teams-bot` projesini seçerek izole çalışmaya başlaması.

### [2026-09-03 15:53] macOS LaunchAgent Otomasyonu (Auto-Start on Boot & Keep-Alive)
- **Görev ve Amaç**: Bilgisayar her açıldığında Keep-Alive betiğinin arka planda otomatik başlaması ve olası bir durmada kendiliğinden yeniden ayağa kalkması (`KeepAlive: true`).
- **Teknik Kararlar ve Mimari Değişiklikler**:
  - `~/Library/LaunchAgents/com.umut.teams-keep-alive.plist` dosyası oluşturuldu.
  - `RunAtLoad` ve `KeepAlive` özellikleri `true` yapılarak macOS `launchd` sistem servisine bağlandı.
  - Servis yönetimi için `npm run keep-alive:service-start`, `npm run keep-alive:service-stop` ve `npm run keep-alive:service-status` scriptleri `package.json`'a eklendi.
- **Etkilenen Dosyalar ve Bileşenler**:
  - `~/Library/LaunchAgents/com.umut.teams-keep-alive.plist`
  - [package.json](file:///Users/umut/mycodespace/teams-bot/package.json)
  - [WORKLOG.md](file:///Users/umut/mycodespace/teams-bot/WORKLOG.md)
- **Mevcut Durum ve Doğrulama**:
  - `launchctl load` çalıştırıldı ve servis arka planda PID ile aktif olarak doğrulandı.

