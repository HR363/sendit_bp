import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PickupRequestService } from './pickup-request.service';
import { CreatePickupRequestDto } from './dto/create-pickup-request.dto';
import { Request as ExpressRequest } from 'express';

@Controller('pickup-requests')
export class PickupRequestController {
  constructor(private readonly pickupRequestService: PickupRequestService) {}

  // User: Create pickup request
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPickupRequest(@Body() dto: CreatePickupRequestDto, @Request() req: ExpressRequest) {
    return this.pickupRequestService.createPickupRequest(dto, (req as any).user.userId);
  }

  // Courier: List pending pickup requests
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER_AGENT')
  @Get('pending')
  async getPendingPickupRequests() {
    return this.pickupRequestService.getPendingPickupRequests();
  }

  // Courier: View pickup request by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER_AGENT')
  @Get(':id')
  async getPickupRequestById(@Param('id') id: string) {
    return this.pickupRequestService.getPickupRequestById(id);
  }

  // Courier: Complete pickup request
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER_AGENT')
  @Patch(':id/complete')
  async completePickupRequest(@Param('id') id: string, @Request() req: ExpressRequest) {
    return this.pickupRequestService.completePickupRequest(id, (req as any).user.userId);
  }
} 