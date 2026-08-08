import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginGuest(customName?: string) {
    const guestId = randomUUID();
    const guestEmail = `guest_${guestId.substring(0, 8)}@taskmanager.local`;
    const guestName = customName || `Guest_${guestId.substring(0, 4)}`;

    const user = await this.prisma.user.create({
      data: {
        id: guestId,
        email: guestEmail,
        name: guestName,
        role: 'guest',
      },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
