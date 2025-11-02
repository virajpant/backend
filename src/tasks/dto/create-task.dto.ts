import { IsString, IsOptional, IsDateString, IsMongoId, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsEnum(['pending', 'in-progress', 'completed'])
  @IsOptional()
  status?: 'pending' | 'in-progress' | 'completed';

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;
}