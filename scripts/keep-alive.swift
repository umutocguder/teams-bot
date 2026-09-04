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
🚀 Teams & Mac Guaranteed Mouse Mover v5.0
=======================================================\(reset)
🟢 Durum: Aktif
- Çalışma Şekli: Her 15 saniyede bir KESİNTİSİZ fareyi 80px oynatır
- Odak ve Tuş: Shift tuşu darbesi ve arka plandaki Teams'e anlık canlılık pingi
- Görünürlük: İmleç ekranda gözle görülür şekilde hareket eder
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

func pingTeamsFocus() {
    let script = """
    tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set frontAppName to name of frontApp
    end tell
    if frontAppName is not "MSTeams" and frontAppName is not "Microsoft Teams" then
        tell application "Microsoft Teams" to activate
        delay 0.1
        tell application frontAppName to activate
    end if
    """
    if let appleScript = NSAppleScript(source: script) {
        var error: NSDictionary?
        appleScript.executeAndReturnError(&error)
    }
}

var moveCount = 0

while true {
    let currentLocation = CGEvent(source: nil)?.location ?? CGPoint(x: 500, y: 500)
    let direction: CGFloat = (moveCount % 2 == 0) ? 80.0 : -80.0
    let targetLocation = CGPoint(x: currentLocation.x + direction, y: currentLocation.y)
    
    // 1. İmleci ekranda 80 piksel kaydır (Gözle net görülür)
    CGWarpMouseCursorPosition(targetLocation)
    if let moveEvent = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: targetLocation, mouseButton: .left) {
        moveEvent.post(tap: .cghidEventTap)
    }
    
    // 2. Görünmez Shift tuşu darbesi (Tüm uygulamaları ve Teams WebView'i uyandırır)
    if let shiftDown = CGEvent(keyboardEventSource: nil, virtualKey: 56, keyDown: true) {
        shiftDown.post(tap: .cghidEventTap)
    }
    Thread.sleep(forTimeInterval: 0.05)
    if let shiftUp = CGEvent(keyboardEventSource: nil, virtualKey: 56, keyDown: false) {
        shiftUp.post(tap: .cghidEventTap)
    }
    
    // İmleç hareketini kullanıcının görmesi için 0.4 saniye bekle
    Thread.sleep(forTimeInterval: 0.4)
    
    // 3. İmleci orijinal yerine geri getir
    CGWarpMouseCursorPosition(currentLocation)
    if let returnEvent = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: currentLocation, mouseButton: .left) {
        returnEvent.post(tap: .cghidEventTap)
    }
    
    // 4. Her 4 hamlede bir (dakikada bir) Teams'e anlık odak pingi atarak Yeşil durumu tazele
    if moveCount % 4 == 0 {
        pingTeamsFocus()
    }
    
    // 5. Sistem seviyesinde kullanıcı aktivitesi bildir
    var activityID: IOPMAssertionID = 0
    IOPMAssertionDeclareUserActivity("Teams Visible Keep Alive" as CFString, kIOPMUserActiveLocal, &activityID)
    
    moveCount += 1
    print("[\(getCurrentTime())] \(green)✓ 80px Fare Hareketi yapıldı (#\(moveCount))\(reset) -> Teams: Online (Yeşil)")
    fflush(stdout)
    
    // 15 saniye bekle
    Thread.sleep(forTimeInterval: 15)
}
