import { Module } from '@nestjs/common';
import { PricingController } from './pricing.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [PricingController],
})
export class PricingModule {} 