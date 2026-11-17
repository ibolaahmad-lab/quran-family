@echo off
title Koran Hifz Studio - iPad Server
echo ==============================================================
echo    Koran Hifz Studio - Lokaler Server fuer iPad und Tablet
echo ==============================================================
echo.
echo Der Server laeuft jetzt auf Port 8080!
echo.
echo Oeffnen Sie auf dem iPad im Safari-Browser folgende Adresse:
echo    http://192.168.178.41:8080
echo.
echo Tipp: Tippen Sie im iPad Safari auf "Teilen" -> "Zum Home-Bildschirm"
echo ==============================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
