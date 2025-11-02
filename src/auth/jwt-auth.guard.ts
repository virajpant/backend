import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.jwt;

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return super.canActivate(context);
  }
}