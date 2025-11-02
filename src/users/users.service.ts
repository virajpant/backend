import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: 'user',
    });
    return user.save();
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('name email role').lean();
  }

  async findAll() {
    return this.userModel
      .find({ role: 'user' })
      .select('name email _id')
      .lean();
  }

  async createUserByAdmin(dto: CreateUserDto, adminId: string) {
    const admin = await this.userModel.findById(adminId);
    if (!admin) throw new BadRequestException('Admin not found');
    if (admin.role !== 'admin')
      throw new BadRequestException('Only admins can create users');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: 'user',
    });

    const savedUser = await user.save();

    admin.createdUsers.push(savedUser._id as Types.ObjectId);
    await admin.save();

    return {
      message: 'User created successfully',
      user: savedUser,
    };
  }

  async getUsersCreatedByAdmin(adminId: string) {
    const admin = await this.userModel
      .findById(adminId)
      .populate('createdUsers', 'name email role')
      .lean();

    if (!admin) throw new BadRequestException('Admin not found');
    return admin.createdUsers || [];
  }
}
