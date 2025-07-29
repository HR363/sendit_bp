import { Module } from '@nestjs/common';
import { PickupRequestService } from './pickup-request.service';
import { PickupRequestController } from './pickup-request.controller';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  imports: [],
  controllers: [PickupRequestController],
  providers: [PickupRequestService, PrismaService],
})
export class PickupRequestModule {} 