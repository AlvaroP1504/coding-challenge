# === 🧪 TESTING COMPLETO INTERSEGUROS CHALLENGE ===

Write-Host "=== 🧪 TESTING COMPLETO INTERSEGUROS CHALLENGE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣ Tests unitarios:" -ForegroundColor Yellow
Write-Host "  cd go-api; go test -v ./..."
Write-Host "  cd node-api; npm test"
Write-Host ""

Write-Host "2️⃣ Build sin errores:" -ForegroundColor Yellow
Write-Host "  docker-compose build"
Write-Host ""

Write-Host "3️⃣ Health checks:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:8080/health"
Write-Host "  curl http://localhost:3000/health"
Write-Host ""

Write-Host "4️⃣ QR factorization:" -ForegroundColor Yellow
Write-Host '  Invoke-RestMethod -Uri "http://localhost:8080/qr" -Method POST \'
Write-Host '    -Headers @{"Content-Type"="application/json"} \'
Write-Host '    -Body ''{"matrix":[[1,2],[3,4]]}'''
Write-Host ""

Write-Host "5️⃣ Matrix rotation:" -ForegroundColor Yellow
Write-Host '  Invoke-RestMethod -Uri "http://localhost:8080/rotate" -Method POST \'
Write-Host '    -Headers @{"Content-Type"="application/json"} \'
Write-Host '    -Body ''{"matrix":[[1,2,3],[4,5,6]],"direction":"right"}'''
Write-Host ""

Write-Host "6️⃣ Direct stats:" -ForegroundColor Yellow
Write-Host '  Invoke-RestMethod -Uri "http://localhost:3000/stats" -Method POST \'
Write-Host '    -Headers @{"Content-Type"="application/json"} \'
Write-Host '    -Body ''{"q":[[1,0],[0,1]],"r":[[2,1],[0,3]]}'''
Write-Host ""

Write-Host "7️⃣ JWT test (opcional):" -ForegroundColor Yellow
Write-Host '  $token = (node node-api/generate-jwt.js "dev-secret" | Select-String "eyJ").Matches[0].Value'
Write-Host '  $env:JWT_REQUIRED = "true"'
Write-Host '  $env:JWT_SECRET = "dev-secret"'
Write-Host '  $env:JWT_TOKEN = $token'
Write-Host "  # Restart: docker-compose up --build"
Write-Host '  Invoke-RestMethod -Uri "http://localhost:3000/stats" -Method POST \'
Write-Host '    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} \'
Write-Host '    -Body ''{"q":[[1,0]],"r":[[2]]}'''
Write-Host ""

Write-Host "8️⃣ Error validation:" -ForegroundColor Yellow
Write-Host '  Invoke-RestMethod -Uri "http://localhost:3000/stats" -Method POST \'
Write-Host '    -Headers @{"Content-Type"="application/json"} \'
Write-Host '    -Body ''{"q":"invalid"}'''
Write-Host ""

Write-Host "9️⃣ Diagonal detection:" -ForegroundColor Yellow
Write-Host '  Invoke-RestMethod -Uri "http://localhost:3000/stats" -Method POST \'
Write-Host '    -Headers @{"Content-Type"="application/json"} \'
Write-Host '    -Body ''{"q":[[3,0,0],[0,1,0],[0,0,2]],"r":[[5,0],[0,7]]}'''
Write-Host ""

Write-Host "✅ Tests ready for production deployment!" -ForegroundColor Green
