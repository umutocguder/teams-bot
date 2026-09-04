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
🚀 Teams & Mac Visible Mouse Mover (Keep-Alive v3.0)
=======================================================\(reset)
🟢 Durum: Aktif
- Fare Hareketi: Gerçek ve görünür (25 piksel kaydırma & geri alma)
- Kontrol Aralığı: Her 15 saniyede bir kontrol
- Akıllı Algılama: Siz çalışırken dokunmaz, boşta kaldığınızda fareyi oynatır
- Uyku Ayarı: Sistemin uyku ayarlarını zorlamaz, kapağı kapattığınızda uyur
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
    // Kullanıcının son ne zaman klavye/fare kullandığını kontrol et
    let idleSeconds = CGEventSource.secondsSinceLastEventType(.combinedSessionState, eventType: CGEventType(rawValue: UInt32.max)!)
    
    // Eğer kullanıcı en az 10 saniyedir boşta ise fareyi görünür şekilde hareket ettir
    if idleSeconds >= 10.0 {
        let currentLocation = CGEvent(source: nil)?.location ?? CGPoint(x: 500, y: 500)
        let direction: CGFloat = (moveCount % 2 == 0) ? 25.0 : -25.0
        let targetLocation = CGPoint(x: currentLocation.x + direction, y: currentLocation.y)
        
        // 1. İmleci ekranda fiziksel/görünür olarak kaydır
        CGWarpMouseCursorPosition(targetLocation)
        if let moveEvent = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: targetLocation, mouseButton: .left) {
            moveEvent.post(tap: .cghidEventTap)
        }
        
        // Gözle görülmesi ve uygulamanın algılaması için 0.25 saniye bekle
        Thread.sleep(forTimeInterval: 0.25)
        
        // 2. Orijinal konuma geri getir
        CGWarpMouseCursorPosition(currentLocation)
        if let returnEvent = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: currentLocation, mouseButton: .left) {
            returnEvent.post(tap: .cghidEventTap)
        }
        
        // 3. Kullanıcı aktivitesini sisteme bildir
        var activityID: IOPMAssertionID = 0
        IOPMAssertionDeclareUserActivity("Teams Visible Keep Alive" as CFString, kIOPMUserActiveLocal, &activityID)
        
        moveCount += 1
        print("[\(getCurrentTime())] \(green)✓ Fare görünür şekilde hareket ettirildi (#\(moveCount))\(reset) - Boşta kalma süresi sıfırlandı -> Teams: Online (Yeşil)")
        fflush(stdout)
    }
    
    // 15 saniye bekle
    Thread.sleep(forTimeInterval: 15)
}
