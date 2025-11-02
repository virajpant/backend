import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: any, @Res() res: Response) {
    const { accessToken, user } = await this.authService.login(dto);

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ message: 'Login successful', user });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('register')
  async register(@Body() dto: any, @Res() res: Response) {
    await this.authService.register(dto.name, dto.email, dto.password);
    return res.json({ message: 'Registered successfully' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return { ok: true, user: req['user'] };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
    });
    return { ok: true, message: 'Logged out successfully' };
  }
}
