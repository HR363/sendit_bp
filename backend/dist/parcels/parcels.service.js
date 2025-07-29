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
exports.ParcelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/database/prisma.service");
const uuid_1 = require("uuid");
const mail_service_1 = require("../common/mail.service");
const pricing_service_1 = require("../common/pricing.service");
let ParcelsService = class ParcelsService {
    prisma;
    mailService;
    pricingService;
    constructor(prisma, mailService, pricingService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.pricingService = pricingService;
    }
    async createParcel(dto, user) {
        if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
            throw new common_1.ForbiddenException('Insufficient role');
        }
        const trackingNumber = (0, uuid_1.v4)();
        let estimatedDeliveryDate = dto.estimatedDeliveryDate;
        if (!estimatedDeliveryDate) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 3);
            estimatedDeliveryDate = futureDate.toISOString();
        }
        else if (typeof estimatedDeliveryDate === 'string' && !estimatedDeliveryDate.includes('T')) {
            estimatedDeliveryDate = new Date(estimatedDeliveryDate + 'T00:00:00.000Z').toISOString();
        }
        const pricingRequest = {
            categoryId: dto.categoryId || await this.getDefaultCategoryId(),
            weight: Number(dto.weight),
            pickupLocation: dto.pickupLocation,
            destinationLocation: dto.destinationLocation,
            serviceType: dto.serviceType || 'Standard'
        };
        const pricing = await this.pricingService.calculatePricing(pricingRequest);
        const data = {
            senderName: dto.senderName,
            senderPhone: dto.senderPhone,
            senderEmail: dto.senderEmail,
            receiverName: dto.receiverName,
            receiverPhone: dto.receiverPhone,
            receiverEmail: dto.receiverEmail,
            pickupLocation: dto.pickupLocation,
            destinationLocation: dto.destinationLocation,
            weight: Number(dto.weight),
            description: dto.description || '',
            status: dto.status,
            estimatedDeliveryDate: estimatedDeliveryDate,
            price: pricing.totalPrice,
            trackingNumber,
            isActive: true,
        };
        const senderUserId = dto.senderId || user.userId;
        data.sender = { connect: { id: senderUserId } };
        const receiverUserId = dto.receiverId || user.userId;
        data.receiver = { connect: { id: receiverUserId } };
        data.createdBy = { connect: { id: user.userId } };
        if (user.role === 'COURIER_AGENT') {
            data.assignedCourier = { connect: { id: user.userId } };
        }
        if (dto.categoryId) {
            data.category = { connect: { id: dto.categoryId } };
        }
        else {
            const defaultCategory = await this.getDefaultCategory();
            data.category = { connect: { id: defaultCategory.id } };
        }
        const parcel = await this.prisma.parcel.create({ data });
        const { id, senderId, receiverId, categoryId, trackingNumber: tn, status, isActive, createdAt, updatedAt } = parcel;
        return { id, senderId, receiverId, categoryId, trackingNumber: tn, status, isActive, createdAt, updatedAt };
    }
    async updateParcel(id, dto, user) {
        if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
            throw new common_1.ForbiddenException('Insufficient role');
        }
        const parcel = await this.prisma.parcel.findUnique({ where: { id } });
        if (!parcel || !parcel.isActive)
            throw new common_1.ForbiddenException('Parcel not found or inactive');
        const updated = await this.prisma.parcel.update({
            where: { id },
            data: { ...dto },
        });
        return updated;
    }
    async assignCourier(id, dto) {
        const parcel = await this.prisma.parcel.findUnique({ where: { id } });
        if (!parcel || !parcel.isActive)
            throw new common_1.ForbiddenException('Parcel not found or inactive');
        const updated = await this.prisma.parcel.update({
            where: { id },
            data: { assignedCourierId: dto.assignedCourierId },
        });
        return updated;
    }
    async updateStatus(id, dto, user) {
        if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
            throw new common_1.ForbiddenException('Insufficient role');
        }
        const parcel = await this.prisma.parcel.findUnique({ where: { id } });
        if (!parcel || !parcel.isActive)
            throw new common_1.ForbiddenException('Parcel not found or inactive');
        const updated = await this.prisma.parcel.update({
            where: { id },
            data: { status: dto.status },
        });
        await this.prisma.parcelStatusHistory.create({
            data: {
                parcelId: id,
                status: dto.status,
                location: parcel.destinationLocation,
                updatedById: user.userId,
            },
        });
        const sender = await this.prisma.user.findUnique({ where: { id: parcel.senderId ?? undefined } });
        const receiver = await this.prisma.user.findUnique({ where: { id: parcel.receiverId ?? undefined } });
        if (sender) {
            await this.mailService.sendStatusUpdateEmail(sender.email, sender.firstName, parcel.trackingNumber, dto.status);
        }
        if (receiver) {
            await this.mailService.sendStatusUpdateEmail(receiver.email, receiver.firstName, parcel.trackingNumber, dto.status);
        }
        if (dto.status === 'DELIVERED') {
            if (sender) {
                await this.mailService.sendDeliveryConfirmationEmail(sender.email, sender.firstName, parcel.trackingNumber);
            }
            if (receiver) {
                await this.mailService.sendDeliveryConfirmationEmail(receiver.email, receiver.firstName, parcel.trackingNumber);
            }
        }
        return updated;
    }
    async getSentParcels(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.parcel.findMany({
            where: {
                senderEmail: user.email,
                isActive: true
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getReceivedParcels(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.parcel.findMany({
            where: {
                receiverEmail: user.email,
                isActive: true
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAssignedParcels(userId) {
        return this.prisma.parcel.findMany({
            where: { assignedCourierId: userId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllParcels() {
        return this.prisma.parcel.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getParcelById(id, user) {
        const parcel = await this.prisma.parcel.findUnique({ where: { id } });
        if (!parcel || !parcel.isActive)
            return null;
        const isSender = parcel.senderId === user.userId;
        const isReceiver = parcel.receiverId === user.userId;
        const isAssignedCourier = parcel.assignedCourierId === user.userId;
        const isAdmin = user.role === 'ADMIN';
        if (!(isSender || isReceiver || isAssignedCourier || isAdmin)) {
            throw new (await Promise.resolve().then(() => require('@nestjs/common'))).ForbiddenException('Access denied');
        }
        return parcel;
    }
    async softDeleteParcel(id, user) {
        if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
            throw new common_1.ForbiddenException('Insufficient role');
        }
        const parcel = await this.prisma.parcel.findUnique({ where: { id } });
        if (!parcel || !parcel.isActive)
            throw new common_1.ForbiddenException('Parcel not found or already deleted');
        const updated = await this.prisma.parcel.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() },
        });
        return updated;
    }
    async getParcelStatusHistory(id, user) {
        const parcel = await this.prisma.parcel.findUnique({ where: { id } });
        if (!parcel || !parcel.isActive)
            throw new common_1.NotFoundException('Parcel not found');
        const isSender = parcel.senderId === user.userId;
        const isReceiver = parcel.receiverId === user.userId;
        const isAssignedCourier = parcel.assignedCourierId === user.userId;
        const isAdmin = user.role === 'ADMIN';
        if (!(isSender || isReceiver || isAssignedCourier || isAdmin)) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.parcelStatusHistory.findMany({
            where: { parcelId: id },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getDefaultCategoryId() {
        const defaultCategory = await this.getDefaultCategory();
        return defaultCategory.id;
    }
    async getDefaultCategory() {
        const defaultCategory = await this.prisma.parcelCategory.findFirst({
            where: { isActive: true }
        });
        if (defaultCategory) {
            return defaultCategory;
        }
        else {
            return await this.prisma.parcelCategory.create({
                data: {
                    name: 'General',
                    description: 'General parcel category',
                    minWeight: 0,
                    maxWeight: 100,
                    pricePerKg: 5,
                    basePrice: 10,
                    isActive: true
                }
            });
        }
    }
};
exports.ParcelsService = ParcelsService;
exports.ParcelsService = ParcelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        pricing_service_1.PricingService])
], ParcelsService);
//# sourceMappingURL=parcels.service.js.map