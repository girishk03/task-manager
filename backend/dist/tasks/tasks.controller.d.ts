import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    create(createTaskDto: CreateTaskDto, req: any): Promise<{
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
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
