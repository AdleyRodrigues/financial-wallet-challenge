import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { buildAuthCookieOptions, getJwtExpiresIn } from './auth-cookie.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type SafeUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type MeUser = SafeUser & {
  sessionExpiresAt: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: SafeUser }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createWithWallet({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return { user: this.toSafeUser(user) };
  }

  async login(dto: LoginDto, response: Response): Promise<{ user: SafeUser }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    this.setAuthCookie(response, token);
    return { user: this.toSafeUser(user) };
  }

  logout(response: Response): { message: string } {
    response.clearCookie('accessToken', this.getClearCookieOptions());
    return { message: 'Logout successful' };
  }

  async me(
    userId: string,
    sessionExpiresAt: string,
  ): Promise<{ user: MeUser }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      user: {
        ...this.toSafeUser(user),
        sessionExpiresAt,
      },
    };
  }

  private setAuthCookie(response: Response, token: string): void {
    response.cookie('accessToken', token, this.getAuthCookieOptions());
  }

  private getAuthCookieOptions() {
    return buildAuthCookieOptions(
      getJwtExpiresIn(this.configService.get<string>('JWT_EXPIRES_IN')),
      this.configService.get('NODE_ENV') === 'production',
    );
  }

  private getClearCookieOptions() {
    const { httpOnly, secure, sameSite } = this.getAuthCookieOptions();
    return { httpOnly, secure, sameSite };
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
