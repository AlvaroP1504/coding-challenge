import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y configuración
app.use(helmet());

// CORS abierto para desarrollo local
app.use(cors({
  origin: true, // Permite cualquier origen en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Parser de JSON con límite
app.use(express.json({ 
  limit: '10mb',
  strict: true 
}));

// Middleware de logging simple
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Error handling para JSON malformado
app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ 
      error: 'Invalid JSON format in request body' 
    });
    return;
  }
  next(error);
});

// Rutas principales
app.use('/', routes);

// Middleware global de manejo de errores
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Node API ejecutándose en puerto ${PORT}`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   GET  /health`);
  console.log(`   POST /stats`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de señales para graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

export default app;