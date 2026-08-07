"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const message = exception.message.replace(/\n/g, '');
        switch (exception.code) {
            case 'P2002': {
                const status = common_1.HttpStatus.CONFLICT;
                response.status(status).json({
                    statusCode: status,
                    message: 'Unique constraint failed on the database.',
                    error: 'Conflict',
                });
                break;
            }
            case 'P2025': {
                const status = common_1.HttpStatus.NOT_FOUND;
                response.status(status).json({
                    statusCode: status,
                    message: 'Record to update or delete not found.',
                    error: 'Not Found',
                });
                break;
            }
            default: {
                response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database connection or operation failed.',
                    error: 'Internal Server Error',
                });
                break;
            }
        }
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = __decorate([
    (0, common_1.Catch)(client_1.Prisma.PrismaClientKnownRequestError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map