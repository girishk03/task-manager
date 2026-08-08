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
    const isStaticTest = customName === 'Test User';
    const guestId = isStaticTest ? 'test-user-static-uuid-123' : randomUUID();
    const guestEmail = isStaticTest ? 'test_user@taskmanager.local' : `guest_${guestId.substring(0, 8)}@taskmanager.local`;
    const guestName = customName || `Guest_${guestId.substring(0, 4)}`;

    // Use upsert instead of create to avoid duplicates for the static test user
    const user = await this.prisma.user.upsert({
      where: { email: guestEmail },
      update: { name: guestName },
      create: {
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
