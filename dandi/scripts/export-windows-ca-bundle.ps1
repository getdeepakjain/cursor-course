# Exports Windows trusted root CAs to a PEM bundle for Node (yarn, npm, etc.).
# Usage (PowerShell, from dandi/):
#   .\scripts\export-windows-ca-bundle.ps1
#   $env:NODE_EXTRA_CA_CERTS = (Resolve-Path .\certs\windows-root-bundle.pem).Path
#   yarn audit
#
# Add NODE_EXTRA_CA_CERTS to your user environment or .env.local tooling for a permanent fix.

$ErrorActionPreference = "Stop"
$outDir = Join-Path $PSScriptRoot ".." "certs"
$outFile = Join-Path $outDir "windows-root-bundle.pem"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = New-Object System.Collections.Generic.List[string]
foreach ($store in @("Cert:\LocalMachine\Root", "Cert:\CurrentUser\Root")) {
  Get-ChildItem $store -ErrorAction SilentlyContinue | ForEach-Object {
    $bytes = $_.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $b64 = [Convert]::ToBase64String($bytes, [Base64FormattingOptions]::InsertLineBreaks)
    $lines.Add("-----BEGIN CERTIFICATE-----")
    $lines.Add($b64)
    $lines.Add("-----END CERTIFICATE-----")
  }
}

[System.IO.File]::WriteAllLines($outFile, $lines)
Write-Host "Wrote $($lines.Count / 3) certificates to $outFile"
Write-Host ""
Write-Host "For this session:"
Write-Host "  `$env:NODE_EXTRA_CA_CERTS = `"$((Resolve-Path $outFile).Path)`""
Write-Host "  yarn audit"
