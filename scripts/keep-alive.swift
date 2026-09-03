import Foundation
import CoreGraphics

// ANSI Renk Kodları
let green = "\u{001B}[32m"
let cyan = "\u{001B}[36m"
let yellow = "\u{001B}[33m"
let reset = "\u{001B}[0m"

func getCurrentTime() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "HH:mm:ss"
    return formatter.string(from: Date())
}

print("""
\(cyan)=======================================================
🚀 Teams & Mac Always-Active Keep-Alive Script
=======================================================\(reset)
🟢 Durum: Aktif (Her 60 saniyede bir Teams ve Mac canlı tutuluyor)
💡 Çıkmak için: \(yellow)Ctrl + C\(reset)
""")

// SIGINT (Ctrl+C) yakalama
signal(SIGINT) { _ in
    print("\n\(yellow)🛑 Keep-Alive durduruldu. Çıkılıyor...\(reset)")
    exit(0)
}

var pulseCount = 0

while true {
    let currentLocation = CGEvent(source: nil)?.location ?? CGPoint(x: 500, y: 500)
    
    // 1 piksel sağa hareket ettir
    if let moveRight = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: CGPoint(x: currentLocation.x + 1, y: currentLocation.y), mouseButton: .left) {
        moveRight.post(tap: .cghidEventTap)
    }
    
    // 50ms bekle
    Thread.sleep(forTimeInterval: 0.05)
    
    // Orijinal konuma geri getir
    if let moveBack = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: currentLocation, mouseButton: .left) {
        moveBack.post(tap: .cghidEventTap)
    }
    
    pulseCount += 1
    print("[\(getCurrentTime())] \(green)✓ Canlılık sinyali gönderildi (Sinyal #\(pulseCount))\(reset) - Teams Durumu: Online (Yeşil)")
    
    // 60 saniye bekle
    Thread.sleep(forTimeInterval: 60)
}
