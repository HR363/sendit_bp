import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  imports: [],
  controllers: [MetricsController],
  providers: [MetricsService, PrismaService],
})
export class MetricsModule {} 