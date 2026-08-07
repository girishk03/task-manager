import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { dueDate, ...rest } = createTaskDto;
    return this.prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    // Ensure task exists and belongs to the user
    await this.findOne(id, userId);

    const { dueDate, ...rest } = updateTaskDto;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Ensure task exists and belongs to the user
    await this.findOne(id, userId);

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
