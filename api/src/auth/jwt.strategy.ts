import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthenticatedUser } from './types/authenticated-user.type';
import { JwtPayload } from './types/jwt-payload.type';

type RequestWithCookies = Request & {
  cookies?: {
    accessToken?: string;
  };
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (request: RequestWithCookies): string | null =>
        request.cookies?.accessToken ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.exp) {
      throw new UnauthorizedException('Invalid session');
    }

    return {
      id: payload.sub,
      email: payload.email,
      sessionExpiresAt: new Date(payload.exp * 1000).toISOString(),
    };
  }
}
