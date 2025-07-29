import { PricingService, PricingResponse } from '../common/pricing.service';
export declare class CalculatePricingDto {
    categoryId: string;
    weight: number;
    pickupLocation: string;
    destinationLocation: string;
    serviceType: 'Standard' | 'Express' | 'Overnight';
}
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    calculatePricing(dto: CalculatePricingDto): Promise<PricingResponse>;
}
