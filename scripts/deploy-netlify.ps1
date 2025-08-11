param(
  [string]$SiteId,
  [string]$AuthToken
)

Write-Host "==> Generating version.json"
$version = @{ version = "$(git rev-parse --short HEAD)"; build = "$(Get-Date -AsUTC -Format o)" } | ConvertTo-Json
Set-Content -Path "public/version.json" -Value $version -Encoding UTF8

Write-Host "==> Installing deps (npm ci)"
$env:NODE_OPTIONS="--max_old_space_size=4096"
npm ci

Write-Host "==> Building (npm run build)"
npm run build

Write-Host "==> Deploying to Netlify"
$env:NETLIFY_AUTH_TOKEN = if ($AuthToken) { $AuthToken } else { $env:NETLIFY_AUTH_TOKEN }
if (-not $SiteId) { Write-Error "Provide -SiteId or set NETLIFY_SITE_ID env."; exit 1 }

npx netlify deploy --prod --dir=dist --site $SiteId --message "Deploy $(Get-Date -Format s)"
