param()

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$runnerPath = Join-Path $scriptDir 'runPublishCompatRefresh.mjs'

$candidateNodePaths = @(
  $env:npm_node_execpath,
  (Join-Path $env:ProgramFiles 'nodejs\node.exe'),
  (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe')
) | Where-Object { $_ -and (Test-Path $_) }

$nodePath = $candidateNodePaths | Select-Object -First 1

if (-not $nodePath) {
  $nodeCommand = Get-Command node -ErrorAction SilentlyContinue

  if ($nodeCommand) {
    $nodePath = $nodeCommand.Source
  }
}

if (-not $nodePath) {
  Write-Error 'Unable to locate node.exe for the publish-compat refresh runner.'
  exit 1
}

& $nodePath $runnerPath
exit $LASTEXITCODE
