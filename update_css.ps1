$filePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html'
$code = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$oldCss = @"
.layout-grid {

  display: grid;

  grid-template-columns: 360px 1fr;

  gap: 26px;

  align-items: start;

}



@media (max-width: 1080px) {

  .layout-grid {

    grid-template-columns: 1fr;

  }

}
"@

$newCss = @"
.layout-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1080px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

/* Modern QuranLoop-Style Navigation Rail */
.modern-nav-rail {
  width: 260px;
  background: var(--bg-card);
  border: 1.5px solid var(--gold-border);
  border-radius: 20px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
  position: sticky;
  top: 16px;
  z-index: 100;
  transition: all 0.3s ease;
}

@media (max-width: 1080px) {
  .modern-nav-rail {
    width: 100%;
    position: relative;
    top: 0;
  }
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px 14px;
  border-bottom: 1px solid rgba(229, 184, 76, 0.2);
}
.brand-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--gold-primary), #997316);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 1.35rem;
  box-shadow: 0 4px 15px rgba(229, 184, 76, 0.35);
}
.brand-title {
  font-weight: 800;
  font-size: 1.12rem;
  color: #ffffff;
  letter-spacing: 0.5px;
}
.brand-sub {
  font-family: var(--quran-font);
  font-size: 0.88rem;
  color: var(--gold-light);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: transparent;
  color: #cbd5e1;
  font-size: 0.94rem;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}
.nav-item:hover {
  background: rgba(229, 184, 76, 0.12);
  color: #ffffff;
  border-color: rgba(229, 184, 76, 0.3);
}
.nav-item.active {
  background: linear-gradient(135deg, rgba(229, 184, 76, 0.25), rgba(16, 185, 129, 0.18));
  color: var(--gold-light);
  border-color: var(--gold-border);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
}
.nav-item i {
  font-size: 1.15rem;
  color: var(--gold-primary);
  width: 22px;
  text-align: center;
}

.nav-quick-jump {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(229, 184, 76, 0.25);
  border-radius: 12px;
  padding: 12px;
}
.nav-quick-select {
  width: 100%;
  background: #181410;
  color: #fef08a;
  border: 1px solid var(--gold-border);
  border-radius: 8px;
  padding: 7px 8px;
  font-size: 0.82rem;
  font-weight: 700;
  outline: none;
  cursor: pointer;
}
.nav-page-input {
  width: 60px;
  background: #181410;
  color: #ffffff;
  border: 1px solid rgba(229, 184, 76, 0.3);
  border-radius: 8px;
  padding: 6px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
}
.nav-quick-btn {
  flex: 1;
  background: rgba(229, 184, 76, 0.15);
  border: 1px solid rgba(229, 184, 76, 0.3);
  color: var(--gold-light);
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  font-weight: 800;
}
.nav-quick-btn:hover {
  background: var(--gold-primary);
  color: #000;
}

.nav-footer-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px;
  background: rgba(229, 184, 76, 0.14);
  border: 1.5px solid var(--gold-border);
  border-radius: 12px;
  color: var(--gold-light);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-footer-btn:hover {
  background: var(--gold-primary);
  color: #000;
  box-shadow: 0 4px 15px rgba(229, 184, 76, 0.4);
}

/* Settings Drawer (QuranLoop-Style Slide-over) */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.drawer-overlay.open {
  opacity: 1;
  visibility: visible;
}
.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 90vw;
  background: rgba(20, 16, 12, 0.98);
  border-left: 2px solid var(--gold-border);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-panel.open {
  transform: translateX(0);
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 22px;
  border-bottom: 1.5px solid rgba(229, 184, 76, 0.25);
  background: rgba(0, 0, 0, 0.4);
}
.drawer-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.3rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: color 0.2s ease;
}
.drawer-close-btn:hover {
  color: #ffffff;
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.drawer-card {
  background: var(--bg-card);
  border: 1px solid var(--gold-border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
}
"@

$normCode = $code.Replace("`r`n", "`n")
$normOldCss = $oldCss.Replace("`r`n", "`n")
$normNewCss = $newCss.Replace("`r`n", "`n")

if ($normCode.Contains($normOldCss)) {
    $updated = $normCode.Replace($normOldCss, $normNewCss)
    [System.IO.File]::WriteAllText($filePath, $updated.Replace("`n", "`r`n"), [System.Text.Encoding]::UTF8)
    Write-Output "Successfully updated CSS in index.html"
} else {
    Write-Output "Old CSS pattern not found"
}
