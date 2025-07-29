import { PrismaService } from '../common/database/prisma.service';
export declare class MetricsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getUserMetrics(userId: string): Promise<{
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
    getUserPickupHistory(userId: string): Promise<{
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
