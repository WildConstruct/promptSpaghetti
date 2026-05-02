param(
  [switch]$SkipModelDownload
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$runtimeRoot = Join-Path $repoRoot '.local-runtime\ComfyUI'
$venvRoot = Join-Path $runtimeRoot '.venv'
$venvPython = Join-Path $venvRoot 'Scripts\python.exe'
$modelDir = Join-Path $runtimeRoot 'models\checkpoints'
$modelPath = Join-Path $modelDir 'flux1-schnell-fp8.safetensors'
$pythonPath = 'C:\Users\behmb\AppData\Local\Programs\Python\Python312\python.exe'

if (-not (Test-Path $pythonPath)) {
  $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
  if ($pythonCommand) {
    $pythonPath = $pythonCommand.Source
  }
}

if (-not (Test-Path $pythonPath)) {
  throw 'Unable to locate Python for the local sandbox runtime setup.'
}

if (-not (Test-Path $runtimeRoot)) {
  Write-Host "Cloning ComfyUI into $runtimeRoot..."
  git clone https://github.com/comfyanonymous/ComfyUI.git $runtimeRoot
} else {
  Write-Host "ComfyUI already present at $runtimeRoot"
}

if (-not (Test-Path $venvPython)) {
  Write-Host 'Creating ComfyUI virtual environment...'
  & $pythonPath -m venv $venvRoot
}

Write-Host 'Upgrading pip...'
& $venvPython -m pip install --upgrade pip

Write-Host 'Installing PyTorch CUDA 12.8 wheels...'
& $venvPython -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128

Write-Host 'Installing ComfyUI requirements...'
& $venvPython -m pip install -r (Join-Path $runtimeRoot 'requirements.txt')

Write-Host 'Installing huggingface_hub for model download support...'
& $venvPython -m pip install huggingface_hub

New-Item -ItemType Directory -Path $modelDir -Force | Out-Null

if (-not $SkipModelDownload -and -not (Test-Path $modelPath)) {
  Write-Host 'Downloading Flux Schnell FP8 checkpoint...'
  $downloadScript = @"
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id="Comfy-Org/flux1-schnell",
    filename="flux1-schnell-fp8.safetensors",
    local_dir=r"$modelDir",
    local_dir_use_symlinks=False,
)
"@
  $downloadScript | & $venvPython -
} elseif (Test-Path $modelPath) {
  Write-Host "Checkpoint already present at $modelPath"
} else {
  Write-Host 'Skipping model download by request.'
}

Write-Host ''
Write-Host 'Local sandbox runtime setup complete.'
Write-Host "- Runtime root: $runtimeRoot"
Write-Host "- Python: $venvPython"
Write-Host "- Checkpoint: $modelPath"
Write-Host "- Next: pnpm run start:local-sandbox:runtime"
