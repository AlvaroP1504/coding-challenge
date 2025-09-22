import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
}

/**
 * Middleware opcional de JWT
 * Solo valida si JWT_REQUIRED=true en env
 */
export function jwtMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Solo validar JWT si está habilitado
  if (process.env.JWT_REQUIRED !== 'true') {
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ 
      error: 'JWT_SECRET not configured but JWT_REQUIRED=true' 
    });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'Authorization header with Bearer token required' 
    });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer '
  
  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    // Agregar info del usuario al request si necesario
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(401).json({ error: 'Token verification failed' });
    }
  }
}

/**
 * Genera un token de prueba (para desarrollo)
 */
export function generateTestToken(secret: string, expiresIn: string = '1h'): string {
  return jwt.sign(
    { 
      sub: 'test-user',
      role: 'admin' 
    },
    secret,
    { expiresIn }
  );
}

/**
 * Verifica si JWT está habilitado
 */
export function isJWTEnabled(): boolean {
  return process.env.JWT_REQUIRED === 'true';
}
