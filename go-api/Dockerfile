# Dockerfile para Go API
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copiar archivos de módulo Go
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fuente
COPY . .

# Compilar aplicación
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Imagen final
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copiar binario compilado
COPY --from=builder /app/main .

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["./main"]
