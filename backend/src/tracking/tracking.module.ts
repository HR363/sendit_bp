import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  controllers: [TrackingController],
  providers: [TrackingService, PrismaService],
  exports: [TrackingService]
})
export class TrackingModule {} 