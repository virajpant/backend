// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Param,
  Req,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already exists');
    return this.usersService.create(dto);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createUserAsAdmin(@Body() dto: CreateUserDto, @Req() req: any) {
    const admin = req.user;
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already exists');
    return this.usersService.createUserByAdmin(dto, admin.id);
  }

  @Get('created')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getCreatedUsers(@Req() req: any) {
    const admin = req.user;
    return this.usersService.getUsersCreatedByAdmin(admin.id);
  }

  // FIXED: Only admin can get ALL users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')  // ← REMOVE 'user'
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;
    const user = await this.usersService.findById(id);
    if (!user) throw new BadRequestException('User not found');

    // Optional: Allow user to view own profile
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new BadRequestException('Unauthorized');
    }
    return user;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return req.user; // ← Return actual user data
  }
}