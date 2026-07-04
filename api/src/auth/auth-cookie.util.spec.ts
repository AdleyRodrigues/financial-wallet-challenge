import {
  buildAuthCookieOptions,
  getJwtExpiresIn,
  parseExpiresInToMs,
} from './auth-cookie.util';

describe('auth-cookie.util', () => {
  describe('getJwtExpiresIn', () => {
    it('returns default when value is missing or invalid', () => {
      expect(getJwtExpiresIn(undefined)).toBe('2h');
      expect(getJwtExpiresIn('')).toBe('2h');
      expect(getJwtExpiresIn('invalid')).toBe('2h');
    });

    it('returns configured value when valid', () => {
      expect(getJwtExpiresIn('30m')).toBe('30m');
    });
  });

  describe('parseExpiresInToMs', () => {
    it('parses supported units', () => {
      expect(parseExpiresInToMs('10s')).toBe(10_000);
      expect(parseExpiresInToMs('5m')).toBe(300_000);
      expect(parseExpiresInToMs('2h')).toBe(7_200_000);
      expect(parseExpiresInToMs('1d')).toBe(86_400_000);
    });
  });

  describe('buildAuthCookieOptions', () => {
    it('builds httpOnly cookie options aligned with jwt expiry', () => {
      expect(buildAuthCookieOptions('2h', false)).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7_200_000,
      });
    });

    it('enables secure cookies in production', () => {
      expect(buildAuthCookieOptions('2h', true).secure).toBe(true);
    });
  });
});
