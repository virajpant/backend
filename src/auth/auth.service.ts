import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: 'user' | 'admin' = 'user',
  ) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new UnauthorizedException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      email,
      password: hashed,
      role,
    });
    const { password: _, ...rest } = user.toObject();
    return rest;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
