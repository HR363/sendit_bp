import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { Request as ExpressRequest } from 'express';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(dto: CreateReviewDto, req: ExpressRequest & {
        user: {
            userId: string;
            role: string;
        };
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
    updateReview(id: string, dto: UpdateReviewDto, req: ExpressRequest & {
        user: {
            userId: string;
            role: string;
        };
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
    deleteReview(id: string, req: ExpressRequest & {
        user: {
            userId: string;
            role: string;
        };
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
