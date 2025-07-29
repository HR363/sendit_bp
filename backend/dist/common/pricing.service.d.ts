import { PrismaService } from './database/prisma.service';
export interface PricingRequest {
    categoryId: string;
    weight: number;
    pickupLocation: string;
    destinationLocation: string;
    serviceType: 'Standard' | 'Express' | 'Overnight';
}
export interface PricingResponse {
    basePrice: number;
    weightPrice: number;
    distancePrice: number;
    serviceMultiplier: number;
    totalPrice: number;
    breakdown: {
        category: string;
        weight: number;
        distance: number;
        serviceType: string;
        estimatedDays: number;
    };
}
export declare class PricingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculatePricing(request: PricingRequest): Promise<PricingResponse>;
    private calculateDistance;
    private haversineDistance;
    private toRadians;
    private estimateDistanceFromAddresses;
    private extractCity;
    private extractState;
    private getEstimatedDays;
}
