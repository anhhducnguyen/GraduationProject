@echo off
cd /d %~dp0

start "Server" cmd /k "cd server && npm run dev"
start "Face" cmd /k "cd Silent-Face-Anti-Spoofing && python mqtt.py"
start "Admin" cmd /k "cd admin && npm run dev"
