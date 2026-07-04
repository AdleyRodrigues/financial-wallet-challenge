import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
  };

  const strategy = new JwtStrategy(configService as never);

  it('maps jwt exp claim to sessionExpiresAt', () => {
    const exp = Math.floor(
      new Date('2026-07-04T22:30:00.000Z').getTime() / 1000,
    );

    expect(
      strategy.validate({
        sub: 'user-id',
        email: 'alice@example.com',
        exp,
      }),
    ).toEqual({
      id: 'user-id',
      email: 'alice@example.com',
      sessionExpiresAt: '2026-07-04T22:30:00.000Z',
    });
  });

  it('rejects payload without exp', () => {
    expect(() =>
      strategy.validate({
        sub: 'user-id',
        email: 'alice@example.com',
      }),
    ).toThrow(UnauthorizedException);
  });
});
