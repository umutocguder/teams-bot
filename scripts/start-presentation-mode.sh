#!/bin/bash
# 1. Microsoft PowerPoint uygulamasını başlat
osascript << 'EOF'
tell application "Microsoft PowerPoint" to activate
delay 0.8
tell application "System Events"
    tell process "Microsoft PowerPoint"
        -- Template seçim ekranı gelirse doğrudan Enter ile Boş Sunumu seç
        keystroke return
        delay 0.8
        -- Tam Ekran Slayt Gösterisini başlat (Cmd + Shift + Return)
        keystroke return using {command down, shift down}
    end tell
end tell
EOF

# 2. Google Chrome'da Teams Web'i aç ve öne getir
open -a "Google Chrome" "https://teams.cloud.microsoft"

# 3. Durumu doğrula
sleep 2
ASSERTION=$(pmset -g assertions | grep -i "PowerPoint")
if [ -n "$ASSERTION" ]; then
    echo "SUCCESS: PowerPoint Sunum Modu (Slide Show) ve Chrome Teams aktif!"
else
    echo "STARTED: PowerPoint ve Chrome Teams açıldı."
fi
