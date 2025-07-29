import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ParcelsModule } from './parcels/parcels.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MetricsModule } from './metrics/metrics.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PickupRequestModule } from './pickup-request/pickup-request.module';
import { PricingModule } from './pricing/pricing.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    ThrottlerModule.forRoot(),
    AuthModule,
    UsersModule,
    ParcelsModule,
    CategoriesModule,
    UploadModule,
    ReviewsModule,
    MetricsModule,
    PickupRequestModule,
    PricingModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
