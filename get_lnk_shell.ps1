$path1 = "C:\Users\Ibo\Desktop\تەفسیری نامی ( مامۆستا عبدالكریم مدرس ) - YouTube.lnk"
$path2 = "C:\Users\Ibo\Desktop\عبدالكريم الديوان - YouTube.lnk"

function Get-LnkInfo($path) {
    $sh = New-Object -ComObject Shell.Application
    $folder = $sh.Namespace((Split-Path $path))
    $item = $folder.ParseName((Split-Path $path -Leaf))
    $link = $item.GetLink
    return [PSCustomObject]@{
        Name = (Split-Path $path -Leaf)
        Path = $link.Path
        Arguments = $link.Arguments
    }
}

Get-LnkInfo $path1 | Format-List
Get-LnkInfo $path2 | Format-List
