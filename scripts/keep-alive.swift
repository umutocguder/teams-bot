import Foundation
import CoreGraphics
import ApplicationServices
import IOKit.pwr_mgt

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
🚀 Teams & Mac Active Keep-Alive v3.1
=======================================================\(reset)
🟢 Durum: Aktif
- Fare: 30 piksel görünür fiziksel hareket (sağ/sol)
- Klavye: Zararsız Shift darbesi (Teams ve arka plan pencerelerini uyandırır)
- Kontrol Aralığı: Her 8 saniyede bir kontrol
- Boşta Kalma Eşiği: 5 saniye
💡 Çıkmak için: \(yellow)Ctrl + C\(reset)
""")
fflush(stdout)

signal(SIGINT) { _ in
    print("\n\(yellow)🛑 Keep-Alive durduruldu. Çıkılıyor...\(reset)")
    exit(0)
}
signal(SIGTERM) { _ in
    print("\n\(yellow)🛑 Keep-Alive durduruldu. Çıkılıyor...\(reset)")
    exit(0)
}

var moveCount = 0

while true {
    let idleSeconds = CGEventSource.secondsSinceLastEventType(.combinedSessionState, eventType: CGEventType(rawValue: UInt32.max)!)
    
    // Kullanıcı 5 saniyedir boşta ise harekete geç
    if idleSeconds >= 5.0 {
        let currentLocation = CGEvent(source: nil)?.location ?? CGPoint(x: 500, y: 500)
        let direction: CGFloat = (moveCount % 2 == 0) ? 30.0 : -30.0
        let targetLocation = CGPoint(x: currentLocation.x + direction, y: currentLocation.y)
        
        // 1. İmleci ekranda fiziksel olarak kaydır
        CGWarpMouseCursorPosition(targetLocation)
        if let moveEvent = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: targetLocation, mouseButton: .left) {
            moveEvent.post(tap: .cghidEventTap)
        }
        
        // 2. Zararsız Shift tuşu darbesi (Teams'in arka planda uyumasını önler)
        if let shiftDown = CGEvent(keyboardEventSource: nil, virtualKey: 56, keyDown: true) {
            shiftDown.post(tap: .cghidEventTap)
        }
        Thread.sleep(forTimeInterval: 0.05)
        if let shiftUp = CGEvent(keyboardEventSource: nil, virtualKey: 56, keyDown: false) {
            shiftUp.post(tap: .cghidEventTap)
        }
        
        // Gözle görülmesi için kısa bekleme
        Thread.sleep(forTimeInterval: 0.2)
        
        // 3. İmleci eski konumuna getir
        CGWarpMouseCursorPosition(currentLocation)
        if let returnEvent = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: currentLocation, mouseButton: .left) {
            returnEvent.post(tap: .cghidEventTap)
        }
        
        // 4. Sistem seviyesi aktivite tazeleme
        var activityID: IOPMAssertionID = 0
        IOPMAssertionDeclareUserActivity("Teams Visible Keep Alive" as CFString, kIOPMUserActiveLocal, &activityID)
        
        moveCount += 1
        print("[\(getCurrentTime())] \(green)✓ Fare oynatıldı & Shift tazelendi (#\(moveCount))\(reset) -> Teams: Online (Yeşil)")
        fflush(stdout)
    }
    
    // 8 saniye bekle
    Thread.sleep(forTimeInterval: 8)
}
