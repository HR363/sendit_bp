import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(dto: CreateReviewDto, user: { userId: string; role: string }) {
    // Only allow if user is sender or receiver of the parcel
    const parcel = await this.prisma.parcel.findUnique({ where: { id: dto.parcelId } });
    if (!parcel || !parcel.isActive) throw new NotFoundException('Parcel not found');
    const isSender = parcel.senderId === user.userId;
    const isReceiver = parcel.receiverId === user.userId;
    if (!(isSender || isReceiver)) throw new ForbiddenException('You can only review parcels you sent or received');
    // Only one review per user per parcel
    const existing = await this.prisma.review.findFirst({ where: { parcelId: dto.parcelId, userId: user.userId, isActive: true } });
    if (existing) throw new BadRequestException('You have already reviewed this parcel');
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

  async getReviewsForParcel(parcelId: string) {
    return this.prisma.review.findMany({
      where: { parcelId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReview(id: string, dto: UpdateReviewDto, user: { userId: string; role: string }) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || !review.isActive) throw new NotFoundException('Review not found');
    if (review.userId !== user.userId) throw new ForbiddenException('You can only update your own review');
    return this.prisma.review.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deleteReview(id: string, user: { userId: string; role: string }) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || !review.isActive) throw new NotFoundException('Review not found');
    if (review.userId !== user.userId) throw new ForbiddenException('You can only delete your own review');
    return this.prisma.review.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  async getAllReviews() {
    return this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getReviewById(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
