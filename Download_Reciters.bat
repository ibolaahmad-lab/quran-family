@echo off
title Quran Audio Downloader - Koran Hifz Master
chcp 65001 >nul
cd /d "%~dp0"

:MENU
cls
echo ======================================================================
echo           QURAN HIFZ MASTER - OFFLINE AUDIO DOWNLOADER
echo ======================================================================
echo Wählen Sie den Rezitator, den Sie für die Offline-Nutzung herunterladen möchten:
echo (هر قاری را که دوست دارید برای استفاده آفلاین انتخاب کنید)
echo.
echo  [1] Saad Al-Ghamdi (سعد الغامدي)      - ca. 600 MB (Sehr leicht & schnell)
echo  [2] Mishary Alafasy (مشاري راشد العفاسي) - ca. 1.8 GB (Original Studio 128k)
echo  [3] Mohamed El-Minshawi (المنشاوي)       - ca. 1.9 GB (Traditioneller Murattal)
echo  [4] Nur Sure 1 (Al-Fatiha) als Schnelltest herunterladen
echo  [5] Beenden (خروج)
echo ======================================================================
set /p opt="Ihre Auswahl / انتخاب شما (1-5): "

if "%opt%"=="1" goto GHAMDI
if "%opt%"=="2" goto ALAFASY
if "%opt%"=="3" goto MINSHAWI
if "%opt%"=="4" goto TEST_FATIHA
if "%opt%"=="5" goto EXIT
goto MENU

:GHAMDI
echo.
echo Saad Al-Ghamdi wird heruntergeladen...
powershell -ExecutionPolicy Bypass -File "%~dp0download_reciter.ps1" -Reciter "Ghamadi_40kbps" -StartSurah 1 -EndSurah 114
pause
goto MENU

:ALAFASY
echo.
echo Mishary Rashid Alafasy wird heruntergeladen...
powershell -ExecutionPolicy Bypass -File "%~dp0download_reciter.ps1" -Reciter "Alafasy_128kbps" -StartSurah 1 -EndSurah 114
pause
goto MENU

:MINSHAWI
echo.
echo Mohamed Siddiq El-Minshawi wird heruntergeladen...
powershell -ExecutionPolicy Bypass -File "%~dp0download_reciter.ps1" -Reciter "Minshawy_Murattal_128kbps" -StartSurah 1 -EndSurah 114
pause
goto MENU

:TEST_FATIHA
echo.
echo Sure 1 (Al-Fatiha) fuer alle 3 Rezitatoren wird heruntergeladen...
powershell -ExecutionPolicy Bypass -File "%~dp0download_reciter.ps1" -Reciter "Ghamadi_40kbps" -StartSurah 1 -EndSurah 1
powershell -ExecutionPolicy Bypass -File "%~dp0download_reciter.ps1" -Reciter "Alafasy_128kbps" -StartSurah 1 -EndSurah 1
powershell -ExecutionPolicy Bypass -File "%~dp0download_reciter.ps1" -Reciter "Minshawy_Murattal_128kbps" -StartSurah 1 -EndSurah 1
pause
goto MENU

:EXIT
exit
