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
🚀 Teams & Mac Stealth Keep-Alive v6.0 (Milimetrik & Uyku Kilidi)
=======================================================\(reset)
🟢 Durum: Aktif
- Ekran & Sistem Uyku Kilidi: Devrede (Mac ve ekran kesinlikle uykuya geçmez)
- Hareket: 1 piksel mikroskobik (Gözle fark edilmez, kullanıcıyı rahatsız etmez)
- Periyot: Tam olarak her 30 saniyede bir
- Pencerelere / Ekrana Müdahale: Sıfır (Odak çalmaz, arkada sessizce çalışır)
💡 Çıkmak için: \(yellow)Ctrl + C\(reset)
""")
fflush(stdout)

// 1. Ekranın ve sistemin uykuya dalmasını işletim sistemi seviyesinde engelle (Display & System Sleep Assertion)
var displayAssertion: IOPMAssertionID = 0
let displayResult = IOPMAssertionCreateWithName(
    kIOPMAssertionTypePreventUserIdleDisplaySleep as CFString,
    IOPMAssertionLevel(kIOPMAssertionLevelOn),
    "Teams Keep-Alive Display Sleep Prevention" as CFString,
    &displayAssertion
)

var systemAssertion: IOPMAssertionID = 0
let systemResult = IOPMAssertionCreateWithName(
    kIOPMAssertionTypePreventUserIdleSystemSleep as CFString,
    IOPMAssertionLevel(kIOPMAssertionLevelOn),
    "Teams Keep-Alive System Sleep Prevention" as CFString,
    &systemAssertion
)

if displayResult == kIOReturnSuccess && systemResult == kIOReturnSuccess {
    print("\(green)✓ macOS Ekran ve Sistem uyku kilidi başarıyla kilitlendi.\(reset)")
} else {
    print("\(yellow)⚠️ Uyarı: Uyku kilidi başlatılamadı.\(reset)")
}
fflush(stdout)

func cleanupAndExit() {
    if displayAssertion != 0 { IOPMAssertionRelease(displayAssertion) }
    if systemAssertion != 0 { IOPMAssertionRelease(systemAssertion) }
    print("\n\(yellow)🛑 Keep-Alive durduruldu. Uyku kilitleri serbest bırakıldı.\(reset)")
    exit(0)
}

signal(SIGINT) { _ in cleanupAndExit() }
signal(SIGTERM) { _ in cleanupAndExit() }

var pulseCount = 0
let hidSource = CGEventSource(stateID: .hidSystemState)

while true {
    // 1. Kullanıcının mevcut fare konumunu al
    let currentLocation = CGEvent(source: nil)?.location ?? CGPoint(x: 500, y: 500)
    let offset: CGFloat = (pulseCount % 2 == 0) ? 1.0 : -1.0
    let targetLocation = CGPoint(x: currentLocation.x + offset, y: currentLocation.y)
    
    // 2. 1 piksellik mikroskobik hareket uygula (Gözle fark edilmez)
    if let moveEvent = CGEvent(mouseEventSource: hidSource, mouseType: .mouseMoved, mouseCursorPosition: targetLocation, mouseButton: .left) {
        moveEvent.post(tap: .cghidEventTap)
    }
    
    // 50 milisaniye sonra eski pikseline geri getir
    Thread.sleep(forTimeInterval: 0.05)
    
    if let returnEvent = CGEvent(mouseEventSource: hidSource, mouseType: .mouseMoved, mouseCursorPosition: currentLocation, mouseButton: .left) {
        returnEvent.post(tap: .cghidEventTap)
    }
    
    // 3. Donanım seviyesinde kullanıcı aktivitesi bildir (HID sayacını ve Teams timer'ını sıfırlar)
    var activityID: IOPMAssertionID = 0
    IOPMAssertionDeclareUserActivity("Teams Stealth Keep Alive" as CFString, kIOPMUserActiveLocal, &activityID)
    
    pulseCount += 1
    print("[\(getCurrentTime())] \(green)✓ Milimetrik canlılık sinyali gönderildi (#\(pulseCount))\(reset) -> Ekran: Uyanık, Teams: Online (Yeşil)")
    fflush(stdout)
    
    // Tam 30 saniye bekle
    Thread.sleep(forTimeInterval: 30)
}
