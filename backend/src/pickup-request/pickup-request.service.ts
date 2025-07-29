import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreatePickupRequestDto } from './dto/create-pickup-request.dto';

@Injectable()
export class PickupRequestService {
  constructor(private prisma: PrismaService) {}

  async createPickupRequest(dto: CreatePickupRequestDto, userId: string) {
    return this.prisma.pickupRequest.create({
      data: {
        requesterId: userId,
        parcelDetails: dto.parcelDetails,
        pickupLocation: dto.pickupLocation,
        status: 'PENDING',
        assignedCourierId: dto.assignedCourierId || null,
      },
    });
  }

  async getPendingPickupRequests() {
    return this.prisma.pickupRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPickupRequestById(id: string) {
    const request = await this.prisma.pickupRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Pickup request not found');
    return request;
  }

  async completePickupRequest(id: string, courierId: string) {
    const request = await this.prisma.pickupRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Pickup request not found');
    if (request.status !== 'PENDING') throw new ForbiddenException('Pickup request is not pending');
    return this.prisma.pickupRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        assignedCourierId: courierId,
        completedAt: new Date(),
      },
    });
  }
} 