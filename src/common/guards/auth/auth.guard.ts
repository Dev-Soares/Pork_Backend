import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BaseJwtGuard } from './base-jwt.guard';
import type { RequestTokenPayload } from 'src/common/types/req-types';

type AuthGuardRequest = {
  cookies?: { access_token?: string };
  user?: RequestTokenPayload;
};

@Injectable()
export class AuthGuard extends BaseJwtGuard implements CanActivate {
  constructor(jwtService: JwtService, configService: ConfigService) {
    super(jwtService, configService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthGuardRequest>();
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    try {
      request.user = await this.verifyToken(token);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      }
      throw new UnauthorizedException('Token inválido');
    }
  }
}
