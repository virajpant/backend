import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UsersService } from '../users/users.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private usersService: UsersService,
    private notificationGateway: NotificationGateway, // ← INJECTED
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    let assignedToObjId: Types.ObjectId | undefined = undefined;
    let assignedUser: any = null;

    if (dto.assignedTo) {
      assignedUser = await this.usersService.findById(dto.assignedTo);
      if (!assignedUser) throw new BadRequestException('Assignee not found');
      assignedToObjId = new Types.ObjectId(dto.assignedTo);
    }

    const task = await new this.taskModel({
      title: dto.title,
      description: dto.description,
      dueDate: new Date(dto.dueDate),
      priority: dto.priority,
      status: dto.status ?? 'pending',
      createdBy: new Types.ObjectId(userId),
      assignedTo: assignedToObjId,
    }).save();

    const populatedTask = await this.taskModel
      .findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean();

    if (assignedUser) {
      this.notificationGateway.notifyTaskAssigned(populatedTask, assignedUser);
    }

    return populatedTask;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
    userRole: string,
  ) {
    const task = await this.findOne(id, userId, userRole);
    const previousAssigneeId = task.assignedTo
      ? task.assignedTo.toString()
      : null;
    let assignedUser: any = null;

    if (dto.assignedTo !== undefined) {
      if (!dto.assignedTo || dto.assignedTo === '') {
        task.assignedTo = undefined;
      } else {
        assignedUser = await this.usersService.findById(dto.assignedTo);
        if (!assignedUser) throw new BadRequestException('Assignee not found');
        task.assignedTo = new Types.ObjectId(dto.assignedTo);
      }
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.dueDate !== undefined) task.dueDate = new Date(dto.dueDate);
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.status !== undefined) task.status = dto.status;

    const savedTask = await task.save();
    const populatedTask = await this.taskModel
      .findById(savedTask._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean();

    const newAssigneeId = task.assignedTo ? task.assignedTo.toString() : null;
    const isNewAssignment =
      newAssigneeId && newAssigneeId !== previousAssigneeId;

    if (isNewAssignment && assignedUser) {
      this.notificationGateway.notifyTaskAssigned(populatedTask, assignedUser);
    }

    return populatedTask;
  }

  async findAll(userId: string, userRole: string) {
    const userObjId = new Types.ObjectId(userId);
    const query =
      userRole === 'admin'
        ? {}
        : { $or: [{ createdBy: userObjId }, { assignedTo: userObjId }] };

    return this.taskModel
      .find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean();
  }

  async findOne(id: string, userId: string, userRole: string) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    if (userRole !== 'admin' && task.createdBy.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return task;
  }

  async delete(id: string, userId: string, userRole: string) {
    const task = await this.findOne(id, userId, userRole);
    await task.deleteOne();
    return { message: 'Task deleted successfully' };
  }
}
