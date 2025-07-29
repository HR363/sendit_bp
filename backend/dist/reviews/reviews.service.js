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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/database/prisma.service");
const common_2 = require("@nestjs/common");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(dto, user) {
        const parcel = await this.prisma.parcel.findUnique({ where: { id: dto.parcelId } });
        if (!parcel || !parcel.isActive)
            throw new common_2.NotFoundException('Parcel not found');
        const isSender = parcel.senderId === user.userId;
        const isReceiver = parcel.receiverId === user.userId;
        if (!(isSender || isReceiver))
            throw new common_2.ForbiddenException('You can only review parcels you sent or received');
        const existing = await this.prisma.review.findFirst({ where: { parcelId: dto.parcelId, userId: user.userId, isActive: true } });
        if (existing)
            throw new common_2.BadRequestException('You have already reviewed this parcel');
        return this.prisma.review.create({
            data: {
                userId: user.userId,
                parcelId: dto.parcelId,
                rating: dto.rating,
                comment: dto.comment,
                isActive: true,
            },
        });
    }
    async getReviewsForParcel(parcelId) {
        return this.prisma.review.findMany({
            where: { parcelId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateReview(id, dto, user) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review || !review.isActive)
            throw new common_2.NotFoundException('Review not found');
        if (review.userId !== user.userId)
            throw new common_2.ForbiddenException('You can only update your own review');
        return this.prisma.review.update({
            where: { id },
            data: { ...dto },
        });
    }
    async deleteReview(id, user) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review || !review.isActive)
            throw new common_2.NotFoundException('Review not found');
        if (review.userId !== user.userId)
            throw new common_2.ForbiddenException('You can only delete your own review');
        return this.prisma.review.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() },
        });
    }
    async getAllReviews() {
        return this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async getReviewById(id) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_2.NotFoundException('Review not found');
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map