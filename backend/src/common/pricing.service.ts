import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { BadRequestException } from '@nestjs/common';

export interface PricingRequest {
  categoryId: string;
  weight: number;
  pickupLocation: string; // JSON string with coordinates
  destinationLocation: string; // JSON string with coordinates
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

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculatePricing(request: PricingRequest): Promise<PricingResponse> {
    // Get category pricing
    const category = await this.prisma.parcelCategory.findUnique({
      where: { id: request.categoryId }
    });

    if (!category || !category.isActive) {
      throw new BadRequestException('Category not found or inactive');
    }

    // Validate weight against category limits
    const minWeight = Number(category.minWeight);
    const maxWeight = Number(category.maxWeight);
    
    if (request.weight < minWeight || request.weight > maxWeight) {
      throw new BadRequestException(`Weight must be between ${minWeight}kg and ${maxWeight}kg for this category`);
    }

    // Calculate base pricing from category
    const basePrice = Number(category.basePrice);
    const pricePerKg = Number(category.pricePerKg);
    const weightPrice = request.weight * pricePerKg;

    // Calculate distance
    const distance = this.calculateDistance(request.pickupLocation, request.destinationLocation);
    
    // Distance pricing: $0.50 per km
    const distancePrice = distance * 0.5;

    // Service type multipliers
    const serviceMultipliers = {
      'Standard': 1.0,
      'Express': 1.5,
      'Overnight': 2.0
    };

    const serviceMultiplier = serviceMultipliers[request.serviceType];
    const estimatedDays = this.getEstimatedDays(request.serviceType);

    // Calculate total price
    const subtotal = basePrice + weightPrice + distancePrice;
    const totalPrice = subtotal * serviceMultiplier;

    return {
      basePrice,
      weightPrice,
      distancePrice,
      serviceMultiplier,
      totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      breakdown: {
        category: category.name,
        weight: request.weight,
        distance: Math.round(distance * 100) / 100,
        serviceType: request.serviceType,
        estimatedDays
      }
    };
  }

  private calculateDistance(pickupLocation: string, destinationLocation: string): number {
    try {
      const pickup = JSON.parse(pickupLocation);
      const destination = JSON.parse(destinationLocation);

      // If coordinates are provided, use Haversine formula
      if (pickup.latitude && pickup.longitude && destination.latitude && destination.longitude) {
        return this.haversineDistance(
          pickup.latitude, pickup.longitude,
          destination.latitude, destination.longitude
        );
      }

      // If only addresses are provided, estimate distance based on address similarity
      // This is a simplified estimation - in production, you'd use a geocoding service
      return this.estimateDistanceFromAddresses(pickup.address, destination.address);
    } catch (error) {
      this.logger.warn('Failed to parse location data, using default distance');
      return 50; // Default 50km distance
    }
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimateDistanceFromAddresses(pickupAddress: string, destinationAddress: string): number {
    // This is a simplified estimation
    // In production, you'd use a geocoding service like Google Maps API
    
    // Simple heuristic: if addresses are in same city, assume 10km
    // If different cities, assume 50km
    // If different states, assume 500km
    
    const pickupCity = this.extractCity(pickupAddress);
    const destCity = this.extractCity(destinationAddress);
    
    if (pickupCity === destCity) {
      return 10;
    }
    
    const pickupState = this.extractState(pickupAddress);
    const destState = this.extractState(destinationAddress);
    
    if (pickupState === destState) {
      return 50;
    }
    
    return 500;
  }

  private extractCity(address: string): string {
    // Simple city extraction - in production, use proper address parsing
    const parts = address.split(',').map(part => part.trim());
    return parts[1] || 'Unknown';
  }

  private extractState(address: string): string {
    // Simple state extraction - in production, use proper address parsing
    const parts = address.split(',').map(part => part.trim());
    return parts[2] || 'Unknown';
  }

  private getEstimatedDays(serviceType: string): number {
    switch (serviceType) {
      case 'Standard':
        return 3;
      case 'Express':
        return 2;
      case 'Overnight':
        return 1;
      default:
        return 3;
    }
  }
} 