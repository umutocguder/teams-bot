// Teams Web Keep-Alive Content Script
(function () {
  console.log("%c[Teams Keep-Alive] Eklenti başarıyla yüklendi ve aktif!", "color: #107c41; font-weight: bold; font-size: 14px;");

  // 1. Chrome'un arka plan sekmesini uyutmasını (Tab Freezing / Throttling) engellemek için sessiz ses akışı
  try {
    const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
    silentAudio.loop = true;
    silentAudio.volume = 0.01;
    
    // Kullanıcı sayfaya ilk dokunduğunda veya sayfa yüklendiğinde başlat
    const startAudio = () => {
      silentAudio.play().catch(() => {});
      window.removeEventListener("click", startAudio);
    };
    window.addEventListener("click", startAudio);
    silentAudio.play().catch(() => {});
  } catch (e) {
    console.warn("[Teams Keep-Alive] Audio başlatılamadı:", e);
  }

  // 2. Sağ alt köşeye küçük ve şık bir durum göstergesi ekle
  let badge = document.createElement("div");
  badge.id = "teams-keep-alive-badge";
  badge.style.position = "fixed";
  badge.style.bottom = "12px";
  badge.style.right = "12px";
  badge.style.backgroundColor = "rgba(16, 124, 65, 0.9)"; // Teams Yeşili
  badge.style.color = "#ffffff";
  badge.style.padding = "6px 12px";
  badge.style.borderRadius = "20px";
  badge.style.fontSize = "12px";
  badge.style.fontFamily = "Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif";
  badge.style.fontWeight = "600";
  badge.style.zIndex = "999999";
  badge.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  badge.style.pointerEvents = "none";
  badge.style.transition = "all 0.3s ease";
  badge.innerText = "🟢 Teams Keep-Alive: Aktif";
  
  function attachBadge() {
    if (!document.getElementById("teams-keep-alive-badge") && document.body) {
      document.body.appendChild(badge);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachBadge);
  } else {
    attachBadge();
  }

  var pulseCount = 0;

  function sendActivityPulse() {
    pulseCount++;
    const now = new Date().toLocaleTimeString();

    // 1. Web sayfasına ve Teams event listener'larına kullanıcı hareketini simüle et
    const target = document.body || document.documentElement;

    // Mouse Hareketi
    target.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }));
    target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }));
    target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }));

    // Odaklanma (Focus) ve Klavye sinyali
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("visibilitychange"));
    target.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", code: "ShiftLeft", bubbles: true }));
    target.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift", code: "ShiftLeft", bubbles: true }));

    // 2. Rozet ve konsol güncelle
    attachBadge();
    badge.innerText = `🟢 Teams Keep-Alive: Aktif (#${pulseCount})`;
    console.log(`%c[Teams Keep-Alive] Canlılık tazelendi (#${pulseCount}) - ${now}`, "color: #107c41;");
  }

  // Her 30 saniyede bir çalıştır
  setInterval(sendActivityPulse, 30000);

  // İlk açılışta hemen bir kez tetikle
  setTimeout(sendActivityPulse, 3000);
})();
