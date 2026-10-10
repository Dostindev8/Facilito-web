import { describe, expect, it } from 'vitest';
import { formatRd } from './format';

describe('formatRd', () => {
  it('separa miles con coma y sin decimales', () => {
    expect(formatRd(18450)).toBe('RD$ 18,450');
    expect(formatRd(1250)).toBe('RD$ 1,250');
    expect(formatRd(999)).toBe('RD$ 999');
    expect(formatRd(1234567)).toBe('RD$ 1,234,567');
  });

  it('redondea y conserva el signo', () => {
    expect(formatRd(10.6)).toBe('RD$ 11');
    expect(formatRd(-3275)).toBe('-RD$ 3,275');
    expect(formatRd(0)).toBe('RD$ 0');
  });
});
