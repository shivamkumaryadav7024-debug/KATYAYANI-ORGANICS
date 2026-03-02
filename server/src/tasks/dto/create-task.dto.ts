import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { TaskStatus } from '../task.schema';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
