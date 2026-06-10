$Host.UI.RawUI.WindowTitle = "TRC Backup Utility"
Clear-Host
Write-Host "=========================================" -ForegroundColor Green
Write-Host "       TRC APP - USB BACKUP UTILITY" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

$drive = Read-Host "Enter the letter of your USB drive (for example, type D or E)"

$dest = "$($drive):\TRC_App_Releases_Backup"
$src = "C:\Users\RalphMccabe\.gemini\antigravity\scratch\All_Sandbox_Snapped_of_Current_Versions"

Write-Host ""
Write-Host "Creating backup folder on drive $drive..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Write-Host "Copying all Snapshots and Releases to USB. Please wait..." -ForegroundColor Yellow
Copy-Item -Path "$src\*" -Destination $dest -Recurse -Force

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host " BACKUP COMPLETE! ALL FILES TRANSFERRED!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "You can now safely eject your USB drive."
Write-Host ""
Pause
