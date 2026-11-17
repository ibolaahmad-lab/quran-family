$qaris = @(
    'Alafasy_128kbps',
    'Abdul_Basit_Murattal_192kbps',
    'Abdul_Basit_Mujawwad_128kbps',
    'Husary_128kbps',
    'Husary_128kbps_Mujawwad',
    'Minshawy_Murattal_128kbps',
    'Minshawy_Mujawwad_192kbps',
    'Ghamadi_40kbps',
    'MaherAlMuaiqly128kbps',
    'Abu_Bakr_Ash-Shaatree_128kbps',
    'Abdurrahmaan_As-Sudais_192kbps',
    'Saood_ash-Shuraym_128kbps',
    'Yasser_Ad-Dussary_128kbps',
    'Ali_Jaber_64kbps',
    'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    'Fares_Abbad_64kbps',
    'Hani_Rifai_192kbps',
    'Nasser_Alqatami_128kbps',
    'Abdullaah_3awwaad_Al-Juhaynee_128kbps'
)

foreach ($q in $qaris) {
    $u = "https://everyayah.com/data/$q/001001.mp3"
    try {
        $req = [System.Net.WebRequest]::Create($u)
        $req.Method = 'HEAD'
        $req.Timeout = 4000
        $res = $req.GetResponse()
        Write-Host "OK (200): $q"
        $res.Close()
    } catch {
        Write-Host "FAIL: $q ($($_.Exception.Message))"
    }
}
