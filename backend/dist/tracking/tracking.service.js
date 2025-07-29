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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/database/prisma.service");
let TrackingService = class TrackingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getParcelTracking(parcelId) {
        const parcel = await this.prisma.parcel.findUnique({
            where: { id: parcelId, isActive: true },
            include: {
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                assignedCourier: true
            }
        });
        if (!parcel) {
            throw new common_1.NotFoundException('Parcel not found');
        }
        const pickupLocation = this.parseLocation(parcel.pickupLocation);
        const destinationLocation = this.parseLocation(parcel.destinationLocation);
        const currentLocation = this.getCurrentLocation(parcel, pickupLocation, destinationLocation);
        const courierLocation = parcel.assignedCourier ?
            this.getCourierLocation(parcel.assignedCourier.id) : undefined;
        return {
            parcelId: parcel.id,
            trackingNumber: parcel.trackingNumber,
            currentLocation,
            pickupLocation,
            destinationLocation,
            status: parcel.status,
            estimatedDelivery: parcel.estimatedDeliveryDate.toISOString(),
            courierLocation,
            statusHistory: parcel.statusHistory
        };
    }
    async getLiveTracking(parcelId) {
        return this.getParcelTracking(parcelId);
    }
    async getPublicTracking(trackingNumber) {
        const parcel = await this.prisma.parcel.findUnique({
            where: { trackingNumber, isActive: true },
            include: {
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });
        if (!parcel) {
            throw new common_1.NotFoundException('Parcel not found');
        }
        const pickupLocation = this.parseLocation(parcel.pickupLocation);
        const destinationLocation = this.parseLocation(parcel.destinationLocation);
        const currentLocation = this.getCurrentLocation(parcel, pickupLocation, destinationLocation);
        return {
            parcelId: parcel.id,
            trackingNumber: parcel.trackingNumber,
            currentLocation,
            pickupLocation,
            destinationLocation,
            status: parcel.status,
            estimatedDelivery: parcel.estimatedDeliveryDate.toISOString(),
            statusHistory: parcel.statusHistory
        };
    }
    parseLocation(locationString) {
        try {
            const location = JSON.parse(locationString);
            return {
                lat: location.lat || 0,
                lng: location.lng || 0,
                timestamp: new Date().toISOString(),
                status: 'ACTIVE',
                address: location.address || 'Unknown Location'
            };
        }
        catch (error) {
            return {
                lat: 40.7128,
                lng: -74.0060,
                timestamp: new Date().toISOString(),
                status: 'ACTIVE',
                address: 'New York, NY'
            };
        }
    }
    getCurrentLocation(parcel, pickup, destination) {
        const now = new Date();
        switch (parcel.status) {
            case 'PENDING':
                return pickup;
            case 'PICKED_UP':
                return this.interpolateLocation(pickup, destination, 0.2);
            case 'IN_TRANSIT':
                return this.interpolateLocation(pickup, destination, 0.6);
            case 'OUT_FOR_DELIVERY':
                return this.interpolateLocation(pickup, destination, 0.9);
            case 'DELIVERED':
                return destination;
            default:
                return pickup;
        }
    }
    interpolateLocation(start, end, progress) {
        const lat = start.lat + (end.lat - start.lat) * progress;
        const lng = start.lng + (end.lng - start.lng) * progress;
        return {
            lat,
            lng,
            timestamp: new Date().toISOString(),
            status: 'IN_TRANSIT',
            address: `En route to destination (${Math.round(progress * 100)}% complete)`
        };
    }
    getCourierLocation(courierId) {
        return {
            lat: 40.7128 + (Math.random() - 0.5) * 0.01,
            lng: -74.0060 + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            address: 'Courier Location'
        };
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map