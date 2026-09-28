#!/bin/bash
osascript << 'EOF'
tell application "Microsoft PowerPoint"
    try
        close every presentation saving no
    end try
    quit
end tell
EOF
echo "STOPPED: PowerPoint sunum modu kapatıldı."
