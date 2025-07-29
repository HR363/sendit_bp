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
exports.PickupRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/database/prisma.service");
let PickupRequestService = class PickupRequestService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPickupRequest(dto, userId) {
        return this.prisma.pickupRequest.create({
            data: {
                requesterId: userId,
                parcelDetails: dto.parcelDetails,
                pickupLocation: dto.pickupLocation,
                status: 'PENDING',
                assignedCourierId: dto.assignedCourierId || null,
            },
        });
    }
    async getPendingPickupRequests() {
        return this.prisma.pickupRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPickupRequestById(id) {
        const request = await this.prisma.pickupRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Pickup request not found');
        return request;
    }
    async completePickupRequest(id, courierId) {
        const request = await this.prisma.pickupRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Pickup request not found');
        if (request.status !== 'PENDING')
            throw new common_1.ForbiddenException('Pickup request is not pending');
        return this.prisma.pickupRequest.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                assignedCourierId: courierId,
                completedAt: new Date(),
            },
        });
    }
};
exports.PickupRequestService = PickupRequestService;
exports.PickupRequestService = PickupRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PickupRequestService);
//# sourceMappingURL=pickup-request.service.js.map