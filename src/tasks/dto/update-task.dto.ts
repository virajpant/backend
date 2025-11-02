// src/tasks/dto/update-task.dto.ts
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsIn(['pending', 'in-progress', 'completed'])
  status?: 'pending' | 'in-progress' | 'completed';
}