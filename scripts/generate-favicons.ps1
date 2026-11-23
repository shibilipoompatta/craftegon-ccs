Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path (Get-Location) "assets\images\craftegon-symbol-icon.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($src, $width, $height, $destPath) {
    $destBitmap = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($src, 0, 0, $width, $height)
    $graphics.Dispose()
    
    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBitmap.Dispose()
    Write-Host "Created: $destPath ($width x $height)"
}

# Generate PNG icons
Resize-Image $srcImage 48 48 (Join-Path (Get-Location) "assets\images\favicon-48x48.png")
Resize-Image $srcImage 96 96 (Join-Path (Get-Location) "assets\images\favicon-96x96.png")
Resize-Image $srcImage 192 192 (Join-Path (Get-Location) "assets\images\favicon-192x192.png")
Resize-Image $srcImage 180 180 (Join-Path (Get-Location) "assets\images\apple-touch-icon.png")
Resize-Image $srcImage 32 32 (Join-Path (Get-Location) "assets\images\favicon-32x32.png")
Resize-Image $srcImage 16 16 (Join-Path (Get-Location) "assets\images\favicon-16x16.png")

# Also copy apple-touch-icon.png to root for standard crawler discovery
Copy-Item (Join-Path (Get-Location) "assets\images\apple-touch-icon.png") (Join-Path (Get-Location) "apple-touch-icon.png")

$srcImage.Dispose()

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

# Save favicon.ico to root and assets/images/favicon.ico
[System.IO.File]::WriteAllBytes((Join-Path (Get-Location) "favicon.ico"), $icoBytes)
[System.IO.File]::WriteAllBytes((Join-Path (Get-Location) "assets\images\favicon.ico"), $icoBytes)
Write-Host "Created multi-resolution favicon.ico at root and assets/images/ (size: $($icoBytes.Length) bytes)"
