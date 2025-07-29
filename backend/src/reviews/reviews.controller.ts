import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { Request as ExpressRequest } from 'express';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(@Body() dto: CreateReviewDto, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.reviewsService.createReview(dto, req.user);
  }

  @Get('parcel/:parcelId')
  getReviewsForParcel(@Param('parcelId') parcelId: string) {
    return this.reviewsService.getReviewsForParcel(parcelId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.reviewsService.updateReview(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteReview(@Param('id') id: string, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.reviewsService.deleteReview(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('/admin/reviews')
  getAllReviews() {
    return this.reviewsService.getAllReviews();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('/admin/reviews/:id')
  getReviewById(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }
}
