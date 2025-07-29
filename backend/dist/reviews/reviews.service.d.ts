import { PrismaService } from '../common/database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createReview(dto: CreateReviewDto, user: {
        userId: string;
        role: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        parcelId: string;
        rating: number;
        comment: string | null;
        userId: string;
    }>;
    getReviewsForParcel(parcelId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        parcelId: string;
        rating: number;
        comment: string | null;
        userId: string;
    }[]>;
    updateReview(id: string, dto: UpdateReviewDto, user: {
        userId: string;
        role: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        parcelId: string;
        rating: number;
        comment: string | null;
        userId: string;
    }>;
    deleteReview(id: string, user: {
        userId: string;
        role: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        parcelId: string;
        rating: number;
        comment: string | null;
        userId: string;
    }>;
    getAllReviews(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        parcelId: string;
        rating: number;
        comment: string | null;
        userId: string;
    }[]>;
    getReviewById(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        parcelId: string;
        rating: number;
        comment: string | null;
        userId: string;
    }>;
}
