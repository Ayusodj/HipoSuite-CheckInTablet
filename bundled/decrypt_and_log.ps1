Param(
  [string]$infile,
  [string]$outfile,
  [string]$sharePath
)
if (-not (Test-Path $infile)) { Write-Error "Input not found"; exit 1 }
try {
  $pass = Read-Host -AsSecureString "Introduce usuario+contraseña"
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass))
  # decrypt via node script
  $node = "node"
  $decryptScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'decrypt.js'
  if (-not $outfile) { $tmp = [System.IO.Path]::GetTempFileName() + '.xlsx'; } else { $tmp = $outfile }
  & $node $decryptScript $infile $tmp --passphrase $plain
  if ($LASTEXITCODE -ne 0) { Write-Error "Decrypt failed"; exit 2 }

  # append log entry to audit.csv in the share path
  if ($sharePath) {
    $name = Read-Host "Nombre"
    $motivo = Read-Host "Motivo"
    $ts = (Get-Date).ToString('o')
    $logLine = "$ts,$name,$motivo"
    $logFile = Join-Path $sharePath 'audit_access_log.csv'
    if (-not (Test-Path $logFile)) { "timestamp,name,motivo" | Out-File -FilePath $logFile -Encoding utf8 }
    Add-Content -Path $logFile -Value $logLine
  }

  # Save as password-protected XLSX using Excel COM (requires Excel installed)
  $protectedPath = if ($sharePath) { Join-Path $sharePath 'checkins_protected.xlsx' } else { (Join-Path (Split-Path $infile -Parent) 'checkins_protected.xlsx') }
  try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $wb = $excel.Workbooks.Open($tmp)
    # FileFormat 51 = xlOpenXMLWorkbook (xlsx)
    $wb.SaveAs($protectedPath, 51, $plain, $plain)
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
  } catch {
    Write-Error "Failed to re-save protected XLSX: $_"
    # fallback: open unprotected tmp
    Start-Process $tmp
    exit 3
  }

  # remove temp file if we created one
  if (-not $outfile) { Remove-Item -Force $tmp }

  # open protected file (Excel will prompt for password)
  Start-Process $protectedPath
} catch {
  Write-Error $_
  exit 9
}
