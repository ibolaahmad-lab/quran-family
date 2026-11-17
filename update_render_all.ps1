$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$oldFunc = @"
function renderAllViews() {
  renderAyahPills();
  renderVerseCards();
  renderTafsirView();
  inspectAyah(0);
}
"@

$newFunc = @"
function renderAllViews() {
  renderAyahPills();
  renderVerseCards();
  renderTafsirView();
  if (typeof renderInteractiveMushafPage === 'function') renderInteractiveMushafPage();
  inspectAyah(0);
}
"@

$content = $content.Replace($oldFunc.Replace("`r`n", "`n"), $newFunc.Replace("`r`n", "`n"))
[System.IO.File]::WriteAllText($path, $content.Replace("`n", "`r`n"), [System.Text.Encoding]::UTF8)
Write-Host "renderAllViews successfully updated!"
