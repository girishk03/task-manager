import { IsString, IsNotEmpty, IsOptional, IsEnum, IsISO8601 } from 'class-validator';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title: string;

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
