import { isDiagonal, getDiagonalElements, getDiagonalSum, isSquareMatrix } from '../diagonal';

describe('Diagonal Utils', () => {
  describe('isDiagonal', () => {
    it('should detect diagonal matrix', () => {
      const matrix = [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3]
      ];
      expect(isDiagonal(matrix)).toBe(true);
    });

    it('should detect non-diagonal matrix', () => {
      const matrix = [
        [1, 2, 0],
        [0, 2, 0],
        [0, 0, 3]
      ];
      expect(isDiagonal(matrix)).toBe(false);
    });

    it('should handle rectangular diagonal matrix', () => {
      const matrix = [
        [1, 0],
        [0, 2],
        [0, 0]
      ];
      expect(isDiagonal(matrix)).toBe(true);
    });

    it('should handle tolerance', () => {
      const matrix = [
        [1, 0.0000001, 0],
        [0, 2, 0],
        [0, 0, 3]
      ];
      expect(isDiagonal(matrix, 1e-6)).toBe(true);
      expect(isDiagonal(matrix, 1e-8)).toBe(false);
    });

    it('should return false for empty matrix', () => {
      expect(isDiagonal([])).toBe(false);
    });
  });

  describe('getDiagonalElements', () => {
    it('should extract diagonal from square matrix', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      expect(getDiagonalElements(matrix)).toEqual([1, 5, 9]);
    });

    it('should extract diagonal from rectangular matrix', () => {
      const matrix = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12]
      ];
      expect(getDiagonalElements(matrix)).toEqual([1, 6, 11]);
    });

    it('should return empty array for empty matrix', () => {
      expect(getDiagonalElements([])).toEqual([]);
    });
  });

  describe('getDiagonalSum', () => {
    it('should calculate diagonal sum', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      expect(getDiagonalSum(matrix)).toBe(15); // 1 + 5 + 9
    });

    it('should return 0 for empty matrix', () => {
      expect(getDiagonalSum([])).toBe(0);
    });
  });

  describe('isSquareMatrix', () => {
    it('should detect square matrix', () => {
      const matrix = [
        [1, 2],
        [3, 4]
      ];
      expect(isSquareMatrix(matrix)).toBe(true);
    });

    it('should detect non-square matrix', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      expect(isSquareMatrix(matrix)).toBe(false);
    });

    it('should return false for empty matrix', () => {
      expect(isSquareMatrix([])).toBe(false);
    });
  });
});
