import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { subDays, startOfDay } from 'date-fns';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getAdminMetrics() {
    // Total users
    const totalUsers = await this.prisma.user.count({ where: { deletedAt: null } });

    // Total parcels
    const totalParcels = await this.prisma.parcel.count({ where: { deletedAt: null } });

    // Total revenue (sum of all parcel prices)
    const totalRevenueResult = await this.prisma.parcel.aggregate({
      _sum: { price: true },
      where: { deletedAt: null }
    });
    const totalRevenue = totalRevenueResult._sum.price || 0;

    // Parcels created today
    const today = startOfDay(new Date());
    const parcelsToday = await this.prisma.parcel.count({
      where: {
        createdAt: { gte: today },
        deletedAt: null
      }
    });

    // Average delivery time (in days)
    const deliveredParcels = await this.prisma.parcel.findMany({
      where: { status: 'DELIVERED', deletedAt: null },
      select: { createdAt: true, actualDeliveryDate: true, estimatedDeliveryDate: true }
    });
    let averageDeliveryTime = 0;
    if (deliveredParcels.length > 0) {
      const totalDays = deliveredParcels.reduce((sum, p) => {
        if (p.actualDeliveryDate) {
          const days = (p.actualDeliveryDate.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }
        return sum;
      }, 0);
      averageDeliveryTime = totalDays / deliveredParcels.length;
    }

    // On-time delivery rate (delivered parcels delivered before or on estimatedDeliveryDate)
    const deliveredWithDates = deliveredParcels.filter(
      p => p.actualDeliveryDate !== null && p.estimatedDeliveryDate !== null
    );
    const onTimeDeliveries = deliveredWithDates.filter(
      p => p.actualDeliveryDate && p.estimatedDeliveryDate && p.actualDeliveryDate <= p.estimatedDeliveryDate
    ).length;
    const onTimeDeliveryRate = deliveredWithDates.length > 0 ? (onTimeDeliveries / deliveredWithDates.length) * 100 : 0;

    // Monthly stats (last 6 months)
    const sixMonthsAgo = subDays(today, 180);
    const monthlyStatsRaw = await this.prisma.parcel.groupBy({
      by: ['createdAt'],
      _count: { _all: true },
      _sum: { price: true },
      where: {
        createdAt: { gte: sixMonthsAgo },
        deletedAt: null
      }
    });
    // Group by month
    const monthlyStats = monthlyStatsRaw.map(stat => ({
      month: stat.createdAt.toISOString().slice(0, 7),
      parcels: stat._count._all,
      revenue: stat._sum.price || 0
    }));

    // Recent activity (last 5 parcels)
    const recentActivity = await this.prisma.parcel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        trackingNumber: true,
        sender: { select: { firstName: true, lastName: true } },
        receiver: { select: { firstName: true, lastName: true } },
        status: true,
        actualDeliveryDate: true,
        createdAt: true
      }
    });

    // Status distribution
    const statusCounts = await this.prisma.parcel.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { deletedAt: null }
    });
    const statusDistribution = {
      total: totalParcels,
      delivered: statusCounts.find(s => s.status === 'DELIVERED')?._count._all || 0,
      inTransit: statusCounts.find(s => s.status === 'IN_TRANSIT')?._count._all || 0,
      pending: statusCounts.find(s => s.status === 'PENDING')?._count._all || 0,
      cancelled: statusCounts.find(s => s.status === 'CANCELLED')?._count._all || 0
    };

    return {
      totalUsers,
      totalParcels,
      totalRevenue,
      parcelsToday,
      averageDeliveryTime,
      onTimeDeliveryRate,
      monthlyStats,
      recentActivity,
      statusDistribution
    };
  }

  async getUserMetrics(userId: string) {
    // Total parcels sent by user
    const totalSentParcels = await this.prisma.parcel.count({
      where: { senderId: userId, deletedAt: null }
    });

    // Total parcels received by user
    const totalReceivedParcels = await this.prisma.parcel.count({
      where: { receiverId: userId, deletedAt: null }
    });

    // Parcels in transit
    const parcelsInTransit = await this.prisma.parcel.count({
      where: {
        senderId: userId,
        status: 'IN_TRANSIT',
        deletedAt: null
      }
    });

    // Parcels pending
    const parcelsPending = await this.prisma.parcel.count({
      where: {
        senderId: userId,
        status: 'PENDING',
        deletedAt: null
      }
    });

    // Total spent (sum of all parcel prices sent by user)
    const totalSpentResult = await this.prisma.parcel.aggregate({
      _sum: { price: true },
      where: { senderId: userId, deletedAt: null }
    });
    const totalSpent = totalSpentResult._sum.price || 0;

    // Average delivery time (in days) for parcels sent by user
    const deliveredParcels = await this.prisma.parcel.findMany({
      where: { senderId: userId, status: 'DELIVERED', deletedAt: null },
      select: { createdAt: true, actualDeliveryDate: true, estimatedDeliveryDate: true }
    });
    let averageDeliveryTime = 0;
    if (deliveredParcels.length > 0) {
      const totalDays = deliveredParcels.reduce((sum, p) => {
        if (p.actualDeliveryDate) {
          const days = (p.actualDeliveryDate.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }
        return sum;
      }, 0);
      averageDeliveryTime = totalDays / deliveredParcels.length;
    }

    // On-time delivery rate (delivered parcels delivered before or on estimatedDeliveryDate)
    const deliveredWithDates = deliveredParcels.filter(
      p => p.actualDeliveryDate !== null && p.estimatedDeliveryDate !== null
    );
    const onTimeDeliveries = deliveredWithDates.filter(
      p => p.actualDeliveryDate && p.estimatedDeliveryDate && p.actualDeliveryDate <= p.estimatedDeliveryDate
    ).length;
    const onTimeDeliveryRate = deliveredWithDates.length > 0 ? (onTimeDeliveries / deliveredWithDates.length) * 100 : 0;

    // Status distribution for parcels sent by user
    const statusCounts = await this.prisma.parcel.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { senderId: userId, deletedAt: null }
    });
    const statusDistribution = {
      total: totalSentParcels,
      delivered: statusCounts.find(s => s.status === 'DELIVERED')?._count._all || 0,
      inTransit: statusCounts.find(s => s.status === 'IN_TRANSIT')?._count._all || 0,
      pending: statusCounts.find(s => s.status === 'PENDING')?._count._all || 0,
      cancelled: statusCounts.find(s => s.status === 'CANCELLED')?._count._all || 0
    };

    // Recent activity (last 5 parcels sent or received by user)
    const recentActivity = await this.prisma.parcel.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        trackingNumber: true,
        sender: { select: { firstName: true, lastName: true } },
        receiver: { select: { firstName: true, lastName: true } },
        status: true,
        actualDeliveryDate: true,
        createdAt: true
      }
    });

    return {
      totalSentParcels,
      totalReceivedParcels,
      parcelsInTransit,
      parcelsPending,
      totalSpent,
      averageDeliveryTime,
      onTimeDeliveryRate,
      statusDistribution,
      recentActivity
    };
  }

  async getUserPickupHistory(userId: string) {
    return this.prisma.pickupRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }
} 