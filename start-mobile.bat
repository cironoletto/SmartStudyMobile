@echo off
title SmartStudy - Mobile
color 0E

echo 🟣 Avvio Metro Bundler...
start cmd /k "npx react-native start"
timeout /t 3 > nul

echo 🟢 Avvio App Android...
npx react-native run-android

pause
