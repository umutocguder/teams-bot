import Foundation
import CoreGraphics
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
🚀 Teams & Mac Always-Active Keep-Alive v2.0
=======================================================\(reset)
🟢 Durum: Aktif
- Ekran / Mac Uyku Modu Engelleme: AÇIK (IOKit Display & System Sleep Assertion)
- Donanım Seviyesi HID Canlılık: AÇIK (.hidSystemState + DeclareUserActivity)
- Sinyal Aralığı: 30 Saniye
💡 Çıkmak için: \(yellow)Ctrl + C\(reset)
""")

// 1. Ekranın ve Mac'in uyku moduna geçmesini donanım/işletim sistemi seviyesinde engelle
var displayAssertionID: IOPMAssertionID = 0
let displayResult = IOPMAssertionCreateWithName(
    kIOPMAssertionTypePreventUserIdleDisplaySleep as CFString,
    IOPMAssertionLevel(kIOPMAssertionLevelOn),
    "Teams Keep Alive Display Sleep Prevention" as CFString,
    &displayAssertionID
)

var systemAssertionID: IOPMAssertionID = 0
let systemResult = IOPMAssertionCreateWithName(
    kIOPMAssertionTypePreventUserIdleSystemSleep as CFString,
    IOPMAssertionLevel(kIOPMAssertionLevelOn),
    "Teams Keep Alive System Sleep Prevention" as CFString,
    &systemAssertionID
)

if displayResult == kIOReturnSuccess && systemResult == kIOReturnSuccess {
    print("\(green)✓ macOS Ekran ve Sistem Uyku Modu kilidi başarıyla devrede.\(reset)")
} else {
    print("\(yellow)⚠️ Uyarı: Uyku modu assertion oluşturulamadı.\(reset)")
}

// SIGINT / SIGTERM yakalandığında kilitleri serbest bırakıp çık
func cleanupAndExit() {
    if displayAssertionID != 0 { IOPMAssertionRelease(displayAssertionID) }
    if systemAssertionID != 0 { IOPMAssertionRelease(systemAssertionID) }
    print("\n\(yellow)🛑 Keep-Alive durduruldu. Uyku kilitleri serbest bırakıldı.\(reset)")
    exit(0)
}

signal(SIGINT) { _ in cleanupAndExit() }
signal(SIGTERM) { _ in cleanupAndExit() }

var pulseCount = 0
let hidSource = CGEventSource(stateID: .hidSystemState)

while true {
    // 1. Sistem seviyesinde kullanıcı aktivitesi bildir (HID idle timer sıfırlar)
    var activityAssertionID: IOPMAssertionID = 0
    IOPMAssertionDeclareUserActivity("Teams Keep Alive User Active" as CFString, kIOPMUserActiveLocal, &activityAssertionID)
    
    // 2. Fare konumunu al ve donanım seviyesinde 1px mikro hareket ver
    let currentLocation = CGEvent(source: nil)?.location ?? CGPoint(x: 500, y: 500)
    let offset: CGFloat = (pulseCount % 2 == 0) ? 1.0 : -1.0
    
    if let moveEvent = CGEvent(mouseEventSource: hidSource, mouseType: .mouseMoved, mouseCursorPosition: CGPoint(x: currentLocation.x + offset, y: currentLocation.y), mouseButton: .left) {
        moveEvent.post(tap: .cghidEventTap)
    }
    
    Thread.sleep(forTimeInterval: 0.05)
    
    if let returnEvent = CGEvent(mouseEventSource: hidSource, mouseType: .mouseMoved, mouseCursorPosition: currentLocation, mouseButton: .left) {
        returnEvent.post(tap: .cghidEventTap)
    }
    
    pulseCount += 1
    print("[\(getCurrentTime())] \(green)✓ Canlılık & Ekran Kilidi tazelendi (#\(pulseCount))\(reset) - Mac: Uyanık, Teams: Online (Yeşil)")
    fflush(stdout)
    
    // 30 saniye bekle
    Thread.sleep(forTimeInterval: 30)
}
