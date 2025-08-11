param(
  [switch]$Prebuilt
)

Write-Host "==> Generating version.json"
$version = @{ version = "$(git rev-parse --short HEAD)"; build = "$(Get-Date -AsUTC -Format o)" } | ConvertTo-Json
Set-Content -Path "public/version.json" -Value $version -Encoding UTF8

if ($Prebuilt) {
  Write-Host "==> Skipping local build (Vercel will build)"
} else {
  Write-Host "==> Installing deps (npm ci)"
  $env:NODE_OPTIONS="--max_old_space_size=4096"
  npm ci
  Write-Host "==> Building (npm run build)"
  npm run build
}

Write-Host "==> Deploying to Vercel"
# Uses linked project settings in Vercel; run `npx vercel link` once.
if ($Prebuilt) {
  npx vercel deploy --prod --prebuilt --confirm
} else {
  npx vercel deploy --prod --confirm
}
