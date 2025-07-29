"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PricingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./database/prisma.service");
const common_2 = require("@nestjs/common");
let PricingService = PricingService_1 = class PricingService {
    prisma;
    logger = new common_1.Logger(PricingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculatePricing(request) {
        const category = await this.prisma.parcelCategory.findUnique({
            where: { id: request.categoryId }
        });
        if (!category || !category.isActive) {
            throw new common_2.BadRequestException('Category not found or inactive');
        }
        const minWeight = Number(category.minWeight);
        const maxWeight = Number(category.maxWeight);
        if (request.weight < minWeight || request.weight > maxWeight) {
            throw new common_2.BadRequestException(`Weight must be between ${minWeight}kg and ${maxWeight}kg for this category`);
        }
        const basePrice = Number(category.basePrice);
        const pricePerKg = Number(category.pricePerKg);
        const weightPrice = request.weight * pricePerKg;
        const distance = this.calculateDistance(request.pickupLocation, request.destinationLocation);
        const distancePrice = distance * 0.5;
        const serviceMultipliers = {
            'Standard': 1.0,
            'Express': 1.5,
            'Overnight': 2.0
        };
        const serviceMultiplier = serviceMultipliers[request.serviceType];
        const estimatedDays = this.getEstimatedDays(request.serviceType);
        const subtotal = basePrice + weightPrice + distancePrice;
        const totalPrice = subtotal * serviceMultiplier;
        return {
            basePrice,
            weightPrice,
            distancePrice,
            serviceMultiplier,
            totalPrice: Math.round(totalPrice * 100) / 100,
            breakdown: {
                category: category.name,
                weight: request.weight,
                distance: Math.round(distance * 100) / 100,
                serviceType: request.serviceType,
                estimatedDays
            }
        };
    }
    calculateDistance(pickupLocation, destinationLocation) {
        try {
            const pickup = JSON.parse(pickupLocation);
            const destination = JSON.parse(destinationLocation);
            if (pickup.latitude && pickup.longitude && destination.latitude && destination.longitude) {
                return this.haversineDistance(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude);
            }
            return this.estimateDistanceFromAddresses(pickup.address, destination.address);
        }
        catch (error) {
            this.logger.warn('Failed to parse location data, using default distance');
            return 50;
        }
    }
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    estimateDistanceFromAddresses(pickupAddress, destinationAddress) {
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
    extractCity(address) {
        const parts = address.split(',').map(part => part.trim());
        return parts[1] || 'Unknown';
    }
    extractState(address) {
        const parts = address.split(',').map(part => part.trim());
        return parts[2] || 'Unknown';
    }
    getEstimatedDays(serviceType) {
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
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = PricingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map