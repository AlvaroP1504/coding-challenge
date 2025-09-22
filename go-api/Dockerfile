# syntax=docker/dockerfile:1

# --- Builder ---
    FROM golang:1.22-bullseye AS builder
    WORKDIR /app
    COPY go.mod ./
    COPY . .
    RUN go mod tidy
    RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
        go build -ldflags="-s -w" -o /out/main .
    
    # --- Runner (alpine con curl) ---
    FROM alpine:3.20
    WORKDIR /
    RUN adduser -D -H appuser && apk add --no-cache curl
    COPY --from=builder /out/main /main
    
    ENV PORT=8080
    ENV NODE_API_URL=http://node-api:3000
    ENV DOCKER_ENV=true
    
    USER appuser
    EXPOSE 8080
    
    # Healthcheck HTTP real
    HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
      CMD curl -fsS http://localhost:${PORT}/health || exit 1
    
    ENTRYPOINT ["/main"]
    