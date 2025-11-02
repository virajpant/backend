import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('admin', 'user')
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @Roles('admin', 'user')
  async findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @Roles('admin', 'user')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.findOne(id, req.user.id, req.user.role);
  }

  @Put(':id')
  @Roles('admin', 'user')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(
      id,
      updateTaskDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles('admin', 'user')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.delete(id, req.user.id, req.user.role);
  }
}
