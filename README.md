# Microsoft Teams Bot (TypeScript)

Bu proje, **Microsoft Bot Framework SDK** (`botbuilder`) ve **TypeScript** kullanılarak geliştirilmiş modern bir Microsoft Teams botudur.

## 🚀 Özellikler
- **Mesaj ve Mention Dinleyici:** Teams kanallarında ve birebir sohbetlerde mesajları işler.
- **Adaptive Cards:** Zengin görsel, butonlu ve formlu kart desteği.
- **Komut Sistemi:** `ping`, `yardım`, `durum`, `kart` vb. hazır komutlar.
- **Sağlık Kontrolü:** `/api/health` endpoint'i üzerinden durum izleme.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleme
```bash
npm install
```

### 2. Ortam Değişkenleri (.env)
`.env.example` dosyasını `.env` olarak kopyalayın ve Azure Bot kimlik bilgilerinizi girin (Yerel test için boş bırakılabilir):
```env
MicrosoftAppId=
MicrosoftAppPassword=
MicrosoftAppType=MultiTenant
MicrosoftAppTenantId=
PORT=3978
```

### 3. Geliştirme Modunda Başlatma
```bash
npm run dev
```

### 4. Derleme ve Canlıya Alma
```bash
npm run build
npm start
```

---

## 🌐 Teams / Yerel Test Entegrasyonu

Botu Microsoft Teams veya Bot Framework Emulator ile yerel ortamda test etmek için bir tünel (örneğin `ngrok` veya `Dev Tunnels`) kullanabilirsiniz:

```bash
# ngrok ile 3978 portunu tünelleme
ngrok http 3978
```

Elde edilen genel adresi (`https://<ngrok-id>.ngrok-free.app/api/messages`) Azure Bot Configuration > Messaging Endpoint alanına kaydedin.
