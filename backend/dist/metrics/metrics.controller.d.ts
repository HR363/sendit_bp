import { MetricsService } from './metrics.service';
import { Request as ExpressRequest } from 'express';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getAdminMetrics(): Promise<{
        totalUsers: number;
        totalParcels: number;
        totalRevenue: number;
        parcelsToday: number;
        averageDeliveryTime: number;
        onTimeDeliveryRate: number;
        monthlyStats: {
            month: string;
            parcels: number;
            revenue: number;
        }[];
        recentActivity: {
            trackingNumber: string;
            status: string;
            id: string;
            createdAt: Date;
            actualDeliveryDate: Date | null;
            sender: {
                firstName: string;
                lastName: string;
            } | null;
            receiver: {
                firstName: string;
                lastName: string;
            } | null;
        }[];
        statusDistribution: {
            total: number;
            delivered: number;
            inTransit: number;
            pending: number;
            cancelled: number;
        };
    }>;
    getUserMetrics(req: ExpressRequest): Promise<{
        totalSentParcels: number;
        totalReceivedParcels: number;
        parcelsInTransit: number;
        parcelsPending: number;
        totalSpent: number;
        averageDeliveryTime: number;
        onTimeDeliveryRate: number;
        statusDistribution: {
            total: number;
            delivered: number;
            inTransit: number;
            pending: number;
            cancelled: number;
        };
        recentActivity: {
            trackingNumber: string;
            status: string;
            id: string;
            createdAt: Date;
            actualDeliveryDate: Date | null;
            sender: {
                firstName: string;
                lastName: string;
            } | null;
            receiver: {
                firstName: string;
                lastName: string;
            } | null;
        }[];
    }>;
    getUserPickupHistory(req: ExpressRequest): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        pickupLocation: string;
        assignedCourierId: string | null;
        requesterId: string;
        parcelDetails: string;
        completedAt: Date | null;
    }[]>;
}
