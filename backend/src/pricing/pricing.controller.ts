import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PricingService, PricingRequest, PricingResponse } from '../common/pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class CalculatePricingDto {
  categoryId: string;
  weight: number;
  pickupLocation: string;
  destinationLocation: string;
  serviceType: 'Standard' | 'Express' | 'Overnight';
}

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  @UseGuards(JwtAuthGuard)
  async calculatePricing(@Body() dto: CalculatePricingDto): Promise<PricingResponse> {
    return this.pricingService.calculatePricing(dto);
  }
} 