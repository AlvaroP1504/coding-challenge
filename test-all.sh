#!/bin/bash

echo "=== 🧪 TESTING COMPLETO INTERSEGUROS CHALLENGE ==="
echo ""

echo "1️⃣ Tests unitarios:"
echo "  cd go-api && go test -v ./..."
echo "  cd node-api && npm test"
echo ""

echo "2️⃣ Build sin errores:"
echo "  docker-compose build"
echo ""

echo "3️⃣ Health checks:"
echo "  curl http://localhost:8080/health"
echo "  curl http://localhost:3000/health"
echo ""

echo "4️⃣ QR factorization:"
echo '  curl -X POST http://localhost:8080/qr \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"matrix\":[[1,2],[3,4]]}"'
echo ""

echo "5️⃣ Matrix rotation:"
echo '  curl -X POST http://localhost:8080/rotate \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"matrix\":[[1,2,3],[4,5,6]],\"direction\":\"right\"}"'
echo ""

echo "6️⃣ Direct stats:"
echo '  curl -X POST http://localhost:3000/stats \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"q\":[[1,0],[0,1]],\"r\":[[2,1],[0,3]]}"'
echo ""

echo "7️⃣ JWT test (opcional):"
echo '  TOKEN=$(node node-api/generate-jwt.js "dev-secret" | grep -o "eyJ[^\"]*")'
echo "  export JWT_REQUIRED=true"
echo "  export JWT_SECRET=dev-secret"
echo "  export JWT_TOKEN=\$TOKEN"
echo "  # Restart: docker-compose up --build"
echo '  curl -H "Authorization: Bearer \$TOKEN" \'
echo '    -X POST http://localhost:3000/stats \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"q\":[[1,0]],\"r\":[[2]]}"'
echo ""

echo "8️⃣ Error validation:"
echo '  curl -X POST http://localhost:3000/stats \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"q\":\"invalid\"}"'
echo ""

echo "9️⃣ Diagonal detection:"
echo '  curl -X POST http://localhost:3000/stats \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"q\":[[3,0,0],[0,1,0],[0,0,2]],\"r\":[[5,0],[0,7]]}"'
echo ""

echo "🎯 PowerShell equivalents:"
echo '  Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET'
echo '  Invoke-RestMethod -Uri "http://localhost:8080/qr" -Method POST \'
echo '    -Headers @{"Content-Type"="application/json"} \'
echo '    -Body ("{\"matrix\":[[1,2],[3,4]]}")'
echo '  Invoke-RestMethod -Uri "http://localhost:3000/stats" -Method POST \'
echo '    -Headers @{"Content-Type"="application/json"} \'
echo '    -Body ("{\"q\":[[1,0],[0,1]],\"r\":[[2,1],[0,3]]}")'
echo ""

echo "✅ Tests ready for production deployment!"
