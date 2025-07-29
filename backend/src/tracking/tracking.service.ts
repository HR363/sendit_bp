import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getParcelTracking(parcelId: string): Promise<ParcelTracking> {
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
      throw new NotFoundException('Parcel not found');
    }

    // Parse location data
    const pickupLocation = this.parseLocation(parcel.pickupLocation);
    const destinationLocation = this.parseLocation(parcel.destinationLocation);
    
    // Get current location (for demo, use destination as current)
    const currentLocation = this.getCurrentLocation(parcel, pickupLocation, destinationLocation);
    
    // Get courier location if assigned
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

  async getLiveTracking(parcelId: string): Promise<ParcelTracking> {
    // For live tracking, we would typically get real-time GPS data
    // For now, we'll return the same data but could be enhanced with WebSocket
    return this.getParcelTracking(parcelId);
  }

  async getPublicTracking(trackingNumber: string): Promise<ParcelTracking> {
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
      throw new NotFoundException('Parcel not found');
    }

    // Parse location data
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

  private parseLocation(locationString: string): TrackingLocation {
    try {
      const location = JSON.parse(locationString);
      return {
        lat: location.lat || 0,
        lng: location.lng || 0,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE',
        address: location.address || 'Unknown Location'
      };
    } catch (error) {
      // Fallback to default coordinates
      return {
        lat: 40.7128,
        lng: -74.0060,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE',
        address: 'New York, NY'
      };
    }
  }

  private getCurrentLocation(parcel: any, pickup: TrackingLocation, destination: TrackingLocation): TrackingLocation {
    // For demo purposes, simulate current location based on status
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

  private interpolateLocation(start: TrackingLocation, end: TrackingLocation, progress: number): TrackingLocation {
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

  private getCourierLocation(courierId: string): TrackingLocation {
    // In a real implementation, this would get GPS data from the courier's device
    // For demo purposes, return a simulated location
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.01,
      lng: -74.0060 + (Math.random() - 0.5) * 0.01,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
      address: 'Courier Location'
    };
  }
} 