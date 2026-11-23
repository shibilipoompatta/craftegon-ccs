Add-Type -AssemblyName System.Drawing

# 1. Load the cropped badge
$badgePath = Join-Path (Get-Location) "assets\images\craftegon-symbol-badge.png"
$badge = [System.Drawing.Image]::FromFile($badgePath)

function Generate-Icon($srcImg, $width, $height, $destPath) {
    $dest = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Scale badge with 1px margin so borders don't touch image edge
    $margin = [Math]::Max(1, [int]($width * 0.02))
    $drawW = $width - ($margin * 2)
    $drawH = $height - ($margin * 2)
    $g.DrawImage($srcImg, $margin, $margin, $drawW, $drawH)
    $g.Dispose()
    
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Generated $destPath ($width x $height)"
}

# Generate Google Search and standard sizes
Generate-Icon $badge 48 48 (Join-Path (Get-Location) "assets\images\favicon-48x48.png")
Generate-Icon $badge 96 96 (Join-Path (Get-Location) "assets\images\favicon-96x96.png")
Generate-Icon $badge 192 192 (Join-Path (Get-Location) "assets\images\favicon-192x192.png")
Generate-Icon $badge 180 180 (Join-Path (Get-Location) "assets\images\apple-touch-icon.png")
Generate-Icon $badge 180 180 (Join-Path (Get-Location) "apple-touch-icon.png")
Generate-Icon $badge 32 32 (Join-Path (Get-Location) "assets\images\favicon-32x32.png")
Generate-Icon $badge 16 16 (Join-Path (Get-Location) "assets\images\favicon-16x16.png")

$badge.Dispose()

# Now create multi-resolution favicon.ico containing 16x16, 32x32, 48x48 PNGs
$png16 = [System.IO.File]::ReadAllBytes((Join-Path (Get-Location) "assets\images\favicon-16x16.png"))
$png32 = [System.IO.File]::ReadAllBytes((Join-Path (Get-Location) "assets\images\favicon-32x32.png"))
$png48 = [System.IO.File]::ReadAllBytes((Join-Path (Get-Location) "assets\images\favicon-48x48.png"))

$images = @(
    @{ Width = 16; Height = 16; Bytes = $png16 },
    @{ Width = 32; Height = 32; Bytes = $png32 },
    @{ Width = 48; Height = 48; Bytes = $png48 }
)

$numImages = $images.Count
$headerSize = 6
$dirEntrySize = 16
$offset = $headerSize + ($numImages * $dirEntrySize)

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# ICONHEADER
$bw.Write([uint16]0)          # Reserved
$bw.Write([uint16]1)          # Type 1 = ICO
$bw.Write([uint16]$numImages) # Image count

# ICONDIRENTRY list
foreach ($img in $images) {
    $bw.Write([byte]$img.Width)                 # Width (48)
    $bw.Write([byte]$img.Height)                # Height (48)
    $bw.Write([byte]0)                          # Color count
    $bw.Write([byte]0)                          # Reserved
    $bw.Write([uint16]1)                        # Color planes
    $bw.Write([uint16]32)                       # Bits per pixel
    $bw.Write([uint32]$img.Bytes.Length)        # Image size
    $bw.Write([uint32]$offset)                  # Image offset
    $offset += $img.Bytes.Length
}

# Image data (PNG bytes)
foreach ($img in $images) {
    $bw.Write($img.Bytes)
}

$bw.Flush()
$icoBytes = $ms.ToArray()
$bw.Close()
$ms.Close()

# Save favicon.ico to root and assets/images/
[System.IO.File]::WriteAllBytes((Join-Path (Get-Location) "favicon.ico"), $icoBytes)
[System.IO.File]::WriteAllBytes((Join-Path (Get-Location) "assets\images\favicon.ico"), $icoBytes)
Write-Host "Created multi-resolution favicon.ico (size: $($icoBytes.Length) bytes)"
