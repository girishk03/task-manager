import { IsString, IsOptional, IsEnum, IsISO8601 } from 'class-validator';
import { TaskStatus, TaskPriority } from './create-task.dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or COMPLETED' })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  @IsOptional()
  priority?: TaskPriority;

  @IsISO8601({}, { message: 'Due date must be a valid ISO 8601 date string' })
  @IsOptional()
  dueDate?: string;
}
