param(
  [switch]$Detached
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$runtimeRoot = Join-Path $repoRoot '.local-runtime\ComfyUI'
$venvPython = Join-Path $runtimeRoot '.venv\Scripts\python.exe'
$logDir = Join-Path $repoRoot '.local-output\dev-logs'
$stdoutLog = Join-Path $logDir 'comfy-local.stdout.log'
$stderrLog = Join-Path $logDir 'comfy-local.stderr.log'

if (-not (Test-Path $venvPython)) {
  throw 'Local sandbox runtime is not installed yet. Run pnpm run setup:local-sandbox:runtime first.'
}

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$arguments = @('main.py', '--listen', '127.0.0.1', '--port', '8188')

if ($Detached) {
  $process = Start-Process -FilePath $venvPython -ArgumentList $arguments -WorkingDirectory $runtimeRoot -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru -WindowStyle Hidden
  Write-Host "Started ComfyUI runtime in the background. PID: $($process.Id)"
  Write-Host "- stdout: $stdoutLog"
  Write-Host "- stderr: $stderrLog"
  exit 0
}

& $venvPython @arguments
exit $LASTEXITCODE
