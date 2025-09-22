import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { calculateCombinedStats } from './lib/stats';
import { isDiagonal } from './lib/diagonal';

const router = Router();

// Schema de validación para matrices con Zod
const MatrixSchema = z.array(z.array(z.number()));

// Schema para el request POST /stats
const StatsRequestSchema = z.object({
  q: MatrixSchema,
  r: MatrixSchema
});

// Tipos TypeScript derivados del schema
type StatsRequest = z.infer<typeof StatsRequestSchema>;

interface StatsResponse {
  max: number;
  min: number;
  avg: number;
  sum: number;
  isDiagonalQ: boolean;
  isDiagonalR: boolean;
}

/**
 * POST /stats
 * Calcula estadísticas de matrices Q y R
 */
router.post('/stats', (req: Request, res: Response): void => {
  try {
    // Validar request body con Zod
    const validationResult = StatsRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Invalid request format',
        details: validationResult.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
      return;
    }
    
    const { q, r }: StatsRequest = validationResult.data;
    
    // Validaciones adicionales de rectangularidad
    if (!isRectangularMatrix(q)) {
      res.status(400).json({
        error: 'Matrix Q must be rectangular (all rows same length)'
      });
      return;
    }
    
    if (!isRectangularMatrix(r)) {
      res.status(400).json({
        error: 'Matrix R must be rectangular (all rows same length)'
      });
      return;
    }
    
    // Validar que las matrices no estén vacías
    if (q.length === 0 || r.length === 0) {
      res.status(400).json({
        error: 'Matrices Q and R cannot be empty'
      });
      return;
    }
    
    if ((q[0]?.length ?? 0) === 0 || (r[0]?.length ?? 0) === 0) {
      res.status(400).json({
        error: 'Matrix rows cannot be empty'
      });
      return;
    }
    
    // Calcular estadísticas combinadas de Q y R
    const stats = calculateCombinedStats(q, r);
    
    // Verificar si Q y R son diagonales
    const isDiagonalQ = isDiagonal(q);
    const isDiagonalR = isDiagonal(r);
    
    // Preparar respuesta
    const response: StatsResponse = {
      max: stats.max,
      min: stats.min,
      avg: stats.avg,
      sum: stats.sum,
      isDiagonalQ,
      isDiagonalR
    };
    
    // Log de información
    console.log(`📊 Stats calculated for Q(${q.length}x${q[0]?.length ?? 0}) and R(${r.length}x${r[0]?.length ?? 0})`);
    console.log(`   Max: ${stats.max}, Min: ${stats.min}, Avg: ${stats.avg}`);
    console.log(`   isDiagonalQ: ${isDiagonalQ}, isDiagonalR: ${isDiagonalR}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error processing stats request:', error);
    res.status(500).json({
      error: 'Internal server error while calculating statistics'
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({ ok: true });
});

/**
 * Utility function para verificar si una matriz es rectangular
 */
function isRectangularMatrix(matrix: number[][]): boolean {
  if (matrix.length === 0) {
    return false;
  }
  
  const expectedCols = matrix[0]?.length ?? 0;
  return matrix.every(row => row.length === expectedCols);
}

/**
 * Middleware de manejo de errores 404
 */
router.use('*', (_req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /stats'
    ]
  });
});

export default router;
