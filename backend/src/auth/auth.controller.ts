import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('guest')
  async loginGuest(@Body('name') name?: string) {
    return this.authService.loginGuest(name);
  }
}
