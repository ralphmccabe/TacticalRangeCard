Get-Content diff.txt | Where-Object { $_ -match "^[\+\-][^\+\-]" -and $_ -notmatch "[Γ≡�]" -and $_ -notmatch "commsChannel" }
