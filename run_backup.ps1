$dest = "D:\TRC_App_Releases_Backup"
$src = "C:\Users\RalphMccabe\.gemini\antigravity\scratch\All_Sandbox_Snapped_of_Current_Versions"
Write-Host "Creating backup folder on drive D:..."
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Write-Host "Copying all Snapshots and Releases to USB. Please wait..."
Copy-Item -Path "$src\*" -Destination $dest -Recurse -Force
Write-Host "Backup Complete!"
