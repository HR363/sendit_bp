import { PrismaService } from '../common/database/prisma.service';
import type { ParcelStatusHistory } from '@prisma/client';
export interface TrackingLocation {
    lat: number;
    lng: number;
    timestamp: string;
    status: string;
    address?: string;
}
export interface ParcelTracking {
    parcelId: string;
    trackingNumber: string;
    currentLocation: TrackingLocation;
    pickupLocation: TrackingLocation;
    destinationLocation: TrackingLocation;
    status: string;
    estimatedDelivery: string;
    courierLocation?: TrackingLocation;
    statusHistory: ParcelStatusHistory[];
}
export declare class TrackingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getParcelTracking(parcelId: string): Promise<ParcelTracking>;
    getLiveTracking(parcelId: string): Promise<ParcelTracking>;
    getPublicTracking(trackingNumber: string): Promise<ParcelTracking>;
    private parseLocation;
    private getCurrentLocation;
    private interpolateLocation;
    private getCourierLocation;
}
