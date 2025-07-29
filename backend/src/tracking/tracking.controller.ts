import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':parcelId')
  @UseGuards(JwtAuthGuard)
  async getParcelTracking(@Param('parcelId') parcelId: string) {
    return this.trackingService.getParcelTracking(parcelId);
  }

  @Get(':parcelId/live')
  @UseGuards(JwtAuthGuard)
  async getLiveTracking(@Param('parcelId') parcelId: string) {
    return this.trackingService.getLiveTracking(parcelId);
  }

  @Get(':trackingNumber/public')
  async getPublicTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.trackingService.getPublicTracking(trackingNumber);
  }
} 