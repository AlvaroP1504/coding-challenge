import request from 'supertest';
import app from '../index';

describe('Stats API', () => {
  describe('POST /stats', () => {
    it('should calculate matrix statistics correctly', async () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];

      const response = await request(app)
        .post('/stats')
        .send({ matrix, source: 'test' })
        .expect(200);

      expect(response.body).toMatchObject({
        max: 9,
        min: 1,
        avg: 5,
        sum: 45,
        diagonal: [1, 5, 9],
        mainDiagonalSum: 15,
        source: 'test'
      });

      expect(response.body.processedAt).toBeDefined();
    });

    it('should handle rectangular matrices', async () => {
      const matrix = [
        [1, 2, 3, 4],
        [5, 6, 7, 8]
      ];

      const response = await request(app)
        .post('/stats')
        .send({ matrix, source: 'test' })
        .expect(200);

      expect(response.body).toMatchObject({
        max: 8,
        min: 1,
        avg: 4.5,
        sum: 36,
        diagonal: [1, 6], // Solo elementos diagonales disponibles
        mainDiagonalSum: 7
      });
    });

    it('should reject empty matrix', async () => {
      await request(app)
        .post('/stats')
        .send({ matrix: [], source: 'test' })
        .expect(400);
    });

    it('should reject invalid matrix format', async () => {
      await request(app)
        .post('/stats')
        .send({ matrix: 'not-an-array', source: 'test' })
        .expect(400);
    });

    it('should reject matrix with inconsistent row lengths', async () => {
      const matrix = [
        [1, 2, 3],
        [4, 5] // Fila más corta
      ];

      await request(app)
        .post('/stats')
        .send({ matrix, source: 'test' })
        .expect(400);
    });
  });

  describe('GET /stats/history', () => {
    it('should return stats history', async () => {
      // Primero enviar algunas estadísticas
      await request(app)
        .post('/stats')
        .send({ 
          matrix: [[1, 2], [3, 4]], 
          source: 'test' 
        });

      const response = await request(app)
        .get('/stats/history')
        .expect(200);

      expect(response.body).toHaveProperty('totalProcessed');
      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });
  });
});
