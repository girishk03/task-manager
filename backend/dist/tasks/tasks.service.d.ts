import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueDate: Date | null;
        userId: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueDate: Date | null;
        userId: string;
    }>;
    create(createTaskDto: CreateTaskDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueDate: Date | null;
        userId: string;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueDate: Date | null;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueDate: Date | null;
        userId: string;
    }>;
}
