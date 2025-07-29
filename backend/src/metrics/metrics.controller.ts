import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MetricsService } from './metrics.service';
import { Request as ExpressRequest } from 'express';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  async getAdminMetrics() {
    return this.metricsService.getAdminMetrics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserMetrics(@Request() req: ExpressRequest) {
    return this.metricsService.getUserMetrics((req as any).user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/pickup-history')
  async getUserPickupHistory(@Request() req: ExpressRequest) {
    return this.metricsService.getUserPickupHistory((req as any).user.id);
  }
} 