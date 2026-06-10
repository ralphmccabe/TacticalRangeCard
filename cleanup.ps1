$ErrorActionPreference = "Continue"

$Sandbox = "C:\Users\RalphMccabe\.gemini\antigravity\scratch\free-trc-sandbox"
$ArchiveParent = "C:\Users\RalphMccabe\.gemini\antigravity\scratch\All_Sandbox_Snapped_of_Current_Versions"
$Staging = "$ArchiveParent\Ready to be pushed"

# 1. Clean up VERSION_HISTORY.txt
$VH = Get-Content "$Sandbox\VERSION_HISTORY.txt" -Raw
$VH = $VH -replace "(?s)============================================================\r?\nv3\.0\.46.*", ""
$VH = $VH.TrimEnd() + "`r`n"
Set-Content "$Sandbox\VERSION_HISTORY.txt" -Value $VH

# 2. Reset sw.js to v44
$SW = Get-Content "$Sandbox\sw.js" -Raw
$SW = $SW -replace "v3\.0\.45", "v3.0.44"
$SW = $SW -replace "v3\.0\.46", "v3.0.44"
Set-Content "$Sandbox\sw.js" -Value $SW

# 3. Reset index.html to ?v=3.0.44
$IDX = Get-Content "$Sandbox\index.html" -Raw
$IDX = $IDX -replace "\?v=3\.0\.45", "?v=3.0.44"
$IDX = $IDX -replace "\?v=3\.0\.46", "?v=3.0.44"
Set-Content "$Sandbox\index.html" -Value $IDX

# 4. Remove the v46 snapshot
Get-ChildItem -Path $ArchiveParent -Filter "Snapshot_v3.0.46*" -Directory | Remove-Item -Recurse -Force

# 5. Fix "Ready to be pushed" so it matches v44 again
Remove-Item -Path "$Staging\*" -Recurse -Force
Copy-Item -Path "$ArchiveParent\Snapshot_v3.0.44_2026-06-01_21-09-29\*" -Destination $Staging -Recurse -Force

Write-Host "Cleanup Complete."
