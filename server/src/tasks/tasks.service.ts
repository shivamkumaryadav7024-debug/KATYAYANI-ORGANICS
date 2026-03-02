import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(userId: string, dto: CreateTaskDto) {
    return this.taskModel.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findAll(userId: string, status?: TaskStatus) {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (status) filter.status = status;
    return this.taskModel.find(filter).sort({ createdAt: -1 });
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId.toString() !== userId) throw new ForbiddenException();

    return this.taskModel.findByIdAndUpdate(taskId, dto, { new: true, runValidators: true });
  }

  async remove(userId: string, taskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId.toString() !== userId) throw new ForbiddenException();

    await task.deleteOne();
    return { message: 'Task deleted' };
  }
}
