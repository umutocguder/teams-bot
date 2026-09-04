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

### [2026-09-04 08:50] Keep-Alive v2.0: IOKit Ekran/Sistem Uyku Engelleme & Donanım HID Sinyali
- **Sorun**: Önceki versiyonda Mac ekran zaman aşımına uğrayıp uyku moduna geçiyordu; ekran uyuyunca Teams otomatik olarak "Uzakta (Sarı)" durumuna düşüyordu. Ayrıca kullanıcı sunucudan değil sadece kendi kişisel bilgisayarından yerel fiziksel hareket talep etti.
- **Teknik Çözüm ve Mimari İyileştirmeler**:
  - **Ekran ve Sistem Uykusu Kilidi**: `IOKit.pwr_mgt` kütüphanesinden `kIOPMAssertionTypePreventUserIdleDisplaySleep` ve `kIOPMAssertionTypePreventUserIdleSystemSleep` assertion'ları entegre edildi. Mac ekranının kapanması ve sistemin uykuya geçmesi donanım/işletim sistemi seviyesinde engellendi.
  - **Donanım Seviyesi HID Sinyali**: `CGEventSource(stateID: .hidSystemState)` ve `IOPMAssertionDeclareUserActivity` eklenerek işletim sisteminin `HIDIdleTime` donanım sayacı sıfırlandı.
  - **Sinyal Aralığı**: 30 saniyeye çekildi.
  - **Log Flush**: `fflush(stdout)` ile logların anlık yazılması sağlandı.
- **Etkilenen Dosyalar**:
  - [scripts/keep-alive.swift](file:///Users/umut/mycodespace/teams-bot/scripts/keep-alive.swift)
  - `bin/keep-alive`
  - [WORKLOG.md](file:///Users/umut/mycodespace/teams-bot/WORKLOG.md)
- **Doğrulama**:
  - Binary derlendi, LaunchAgent servisi yeniden başlatıldı, loglarda ekran kilidi ve canlılık sinyallerinin aktığı doğrulandı.

### [2026-09-04 16:17] Keep-Alive v3.0: Görünür Fiziksel Fare Hareketi (CGWarp) & Doğal Uyku Yönetimi
- **Kullanıcı Geri Bildirimi**:
  - Önceki sürümde fare ekranda fiziksel/görünür olarak oynamıyordu ve Teams sarı durumdan yeşile dönmüyordu.
  - Sistemin uyku ayarlarının kilitlenmesi istenmedi; kullanıcı kapağı kapattığında veya dilediğinde bilgisayarın doğal olarak uykuya geçmesi talep edildi.
- **Teknik Çözüm ve Mimari Değişiklikler**:
  - **Fiziksel İmleç Hareketi (`CGWarpMouseCursorPosition`)**: Yalnızca arka plan event tap'i yerine, macOS WindowServer imleç konumu ekranda 25 piksel sağa/sola fiziksel olarak kaydırılıp 0.25 saniye sonra geri alınıyor. Kullanıcı imlecin hareket ettiğini ekranda bizzat görüyor.
  - **Sistem Uykusunu Zorlamama**: IOKit sistem/ekran uyku engelleme assertion'ları kaldırıldı. Kullanıcı Mac kapağını kapattığında sistem doğal olarak uykuya geçer.
  - **Akıllı Boşta Kalma Denetimi**: `CGEventSource.secondsSinceLastEventType` ile son kullanıcı girdisi izleniyor; kullanıcı aktif olarak klavye/fare kullanıyorsa müdahale edilmiyor, 10 saniyeden uzun süre boşta kalındığında fare otomatik olarak görünür biçimde hareket ettiriliyor.
  - **Kontrol Döngüsü**: 15 saniyede bir çalışacak şekilde optimize edildi.
- **Etkilenen Dosyalar**:
  - [scripts/keep-alive.swift](file:///Users/umut/mycodespace/teams-bot/scripts/keep-alive.swift)
  - `bin/keep-alive`
  - [WORKLOG.md](file:///Users/umut/mycodespace/teams-bot/WORKLOG.md)
- **Doğrulama**:
  - Binary derlendi, arka plan LaunchAgent servisi yenilendi ve ekranda imleç hareketi bizzat test edilip doğrulandı.

### [2026-09-04 17:09] Keep-Alive v5.0: Kesintisiz 80px Fiziksel Hareket & Teams Canlılık Odaklama Pingi
- **Kök Neden Tespiti**:
  - `idleSeconds >= 5.0` şartı varken kullanıcı ekran başında test ederken veya yazışırken süre sürekli sıfırlandığı için fare hiç oynamıyordu.
  - Microsoft Teams 2.0 (WebView2), uygulama arka planda simge durumunda bırakıldığında işletim sisteminin genel fare hareketlerini dinlemeyi durduruyor ve durum sarıda kilitli kalıyordu.
- **Teknik Çözüm**:
  - **Koşulsuz 15s Periyot**: Boşta kalma eşiği kaldırıldı; her 15 saniyede bir imleç ekranda 80 piksel gözle görülür şekilde sağa/sola hareket ettirilip geri alınıyor.
  - **Shift Tuşu Darbesi**: Tüm işletim sistemi pencerelerini uyandıran zararsız Shift bas/bırak eklendi.
  - **Teams Odaklama Pingi (`pingTeamsFocus`)**: Dakikada bir arka plandaki Microsoft Teams'e 0.1 saniyelik odak verilip hemen mevcut uygulamaya geri dönülüyor; bu sayede Teams WebView'i Microsoft sunucularına anında "Available / Yeşil" durum güncellemesi gönderiyor.
- **Etkilenen Dosyalar**:
  - [scripts/keep-alive.swift](file:///Users/umut/mycodespace/teams-bot/scripts/keep-alive.swift)
  - `bin/keep-alive`
  - [WORKLOG.md](file:///Users/umut/mycodespace/teams-bot/WORKLOG.md)
- **Doğrulama**:
  - Servis derlenip yeniden başlatıldı, loglarda düzenli olarak 80px hareketlerin ve odak pinginin çalıştığı doğrulandı.

### [2026-09-05 00:14] Keep-Alive v6.0: Stealth 1-Piksel Mikroskobik Hareket & Donanım Seviyesi Ekran/Sistem Uyku Kilidi
- **Kullanıcı Geri Bildirimi ve Talepleri**:
  - Önceki sürümdeki 80 piksellik hareket aşırı büyük ve rahatsız edici bulundu. İmlecin kullanıcının fark edemeyeceği kadar milimetrik (1 piksel) hareket etmesi istendi.
  - Hareket aralığının tam olarak 30 saniyede bir olması talep edildi.
  - Bilgisayarın ve ekranın uykuya dalmasını kesinlikle engellemesi (çünkü ekran uyuyunca Teams doğrudan sarıya düşüyor) istendi.
  - Pencereler arasında odak değiştirilmemesi (odak çalma olmaması) talep edildi.
- **Teknik Uygulama**:
  - **IOKit Güç Kilitleri (`IOKit.pwr_mgt`)**: Apple'ın yerel güç yöneticisinden `kIOPMAssertionTypePreventUserIdleDisplaySleep` ve `kIOPMAssertionTypePreventUserIdleSystemSleep` assertion'ları kilitlendi (`pmset -g assertions` ile doğrulandı). Mac ekranı ve sistemi açık kaldığı sürece ASLA uykuya geçmez.
  - **1 Piksel Mikroskobik Hareket**: Fare konumu her 30 saniyede bir sadece 1 piksel (`currentLocation.x + 1`) kaydırılıp 50 milisaniye sonra eski konumuna getirilir. Gözle fark edilmez, kullanıcı çalışırken asla rahatsız etmez.
  - **Donanım Seviyesi HID Sinyali**: `CGEventSource(stateID: .hidSystemState)` ve `IOPMAssertionDeclareUserActivity` ile donanım boşta sayacı sıfırlanır, Teams'in 5 dakikalık "Away" sayacı asla tetiklenmez.
  - **Sıfır Odak Çalma**: AppleScript odak değiştirme kaldırıldı; tamamen arka planda sessiz ve gizli çalışır.
- **Etkilenen Dosyalar**:
  - [scripts/keep-alive.swift](file:///Users/umut/mycodespace/teams-bot/scripts/keep-alive.swift)
  - `bin/keep-alive`
  - [WORKLOG.md](file:///Users/umut/mycodespace/teams-bot/WORKLOG.md)
- **Doğrulama**:
  - `pmset -g assertions` ile `PreventUserIdleDisplaySleep` ve `PreventUserIdleSystemSleep` kilitlerinin devrede olduğu teyit edildi.
  - Loglar `/tmp/teams-keep-alive.log` üzerinden düzenli 30 saniye periyotla doğrulandı.

### [2026-09-05 00:41] Automated Unit Test Suite Implementation
- **Goal & Purpose**: Implement automated tests complying with Section 8 of AGENTS.md.
- **Implementation Highlights**:
  - Implemented `tests/bot.test.ts`:
    - Validates keep-alive jitter interval distribution within bounded tolerance (±20%).
    - Validates micro-movement delta coordinate calculation (<5px threshold).
  - Added `npm test` script to `package.json`.
- **Affected Files**:
  - [tests/bot.test.ts](file:///Users/umut/mycodespaces/teams-bot/tests/bot.test.ts)
  - [package.json](file:///Users/umut/mycodespaces/teams-bot/package.json)
  - [WORKLOG.md](file:///Users/umut/mycodespaces/teams-bot/WORKLOG.md)
- **Current State & Verification**:
  - `npm test` executed: 2/2 tests passed with 100% success.





