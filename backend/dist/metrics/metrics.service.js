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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/database/prisma.service");
const date_fns_1 = require("date-fns");
let MetricsService = class MetricsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminMetrics() {
        const totalUsers = await this.prisma.user.count({ where: { deletedAt: null } });
        const totalParcels = await this.prisma.parcel.count({ where: { deletedAt: null } });
        const totalRevenueResult = await this.prisma.parcel.aggregate({
            _sum: { price: true },
            where: { deletedAt: null }
        });
        const totalRevenue = totalRevenueResult._sum.price ? Number(totalRevenueResult._sum.price) : 0;
        const today = (0, date_fns_1.startOfDay)(new Date());
        const parcelsToday = await this.prisma.parcel.count({
            where: {
                createdAt: { gte: today },
                deletedAt: null
            }
        });
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
        const deliveredWithDates = deliveredParcels.filter((p) => p.actualDeliveryDate !== null && p.estimatedDeliveryDate !== null);
        const onTimeDeliveries = deliveredWithDates.filter((p) => p.actualDeliveryDate && p.estimatedDeliveryDate && p.actualDeliveryDate <= p.estimatedDeliveryDate).length;
        const onTimeDeliveryRate = deliveredWithDates.length > 0 ? (onTimeDeliveries / deliveredWithDates.length) * 100 : 0;
        const sixMonthsAgo = (0, date_fns_1.subDays)(today, 180);
        const monthlyStatsRaw = await this.prisma.parcel.groupBy({
            by: ['createdAt'],
            _count: { _all: true },
            _sum: { price: true },
            where: {
                createdAt: { gte: sixMonthsAgo },
                deletedAt: null
            }
        });
        const monthlyStats = monthlyStatsRaw.map((stat) => ({
            month: stat.createdAt.toISOString().slice(0, 7),
            parcels: stat._count._all,
            revenue: stat._sum.price ? Number(stat._sum.price) : 0
        }));
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
        const statusCounts = await this.prisma.parcel.groupBy({
            by: ['status'],
            _count: { _all: true },
            where: { deletedAt: null }
        });
        const statusDistribution = {
            total: totalParcels,
            delivered: statusCounts.find((s) => s.status === 'DELIVERED')?._count._all || 0,
            inTransit: statusCounts.find((s) => s.status === 'IN_TRANSIT')?._count._all || 0,
            pending: statusCounts.find((s) => s.status === 'PENDING')?._count._all || 0,
            cancelled: statusCounts.find((s) => s.status === 'CANCELLED')?._count._all || 0
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
    async getUserMetrics(userId) {
        const totalSentParcels = await this.prisma.parcel.count({
            where: { senderId: userId, deletedAt: null }
        });
        const totalReceivedParcels = await this.prisma.parcel.count({
            where: { receiverId: userId, deletedAt: null }
        });
        const parcelsInTransit = await this.prisma.parcel.count({
            where: {
                senderId: userId,
                status: 'IN_TRANSIT',
                deletedAt: null
            }
        });
        const parcelsPending = await this.prisma.parcel.count({
            where: {
                senderId: userId,
                status: 'PENDING',
                deletedAt: null
            }
        });
        const totalSpentResult = await this.prisma.parcel.aggregate({
            _sum: { price: true },
            where: { senderId: userId, deletedAt: null }
        });
        const totalSpent = totalSpentResult._sum.price ? Number(totalSpentResult._sum.price) : 0;
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
        const deliveredWithDates = deliveredParcels.filter((p) => p.actualDeliveryDate !== null && p.estimatedDeliveryDate !== null);
        const onTimeDeliveries = deliveredWithDates.filter((p) => p.actualDeliveryDate && p.estimatedDeliveryDate && p.actualDeliveryDate <= p.estimatedDeliveryDate).length;
        const onTimeDeliveryRate = deliveredWithDates.length > 0 ? (onTimeDeliveries / deliveredWithDates.length) * 100 : 0;
        const statusCounts = await this.prisma.parcel.groupBy({
            by: ['status'],
            _count: { _all: true },
            where: { senderId: userId, deletedAt: null }
        });
        const statusDistribution = {
            total: totalSentParcels,
            delivered: statusCounts.find((s) => s.status === 'DELIVERED')?._count._all || 0,
            inTransit: statusCounts.find((s) => s.status === 'IN_TRANSIT')?._count._all || 0,
            pending: statusCounts.find((s) => s.status === 'PENDING')?._count._all || 0,
            cancelled: statusCounts.find((s) => s.status === 'CANCELLED')?._count._all || 0
        };
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
    async getUserPickupHistory(userId) {
        return this.prisma.pickupRequest.findMany({
            where: { requesterId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map