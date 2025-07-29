import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/database/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { unlink } from 'fs/promises';

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  getMulterOptions(): MulterOptions {
    return {
      storage: new CloudinaryStorage({
        cloudinary,
        params: {
          public_id: (req, file) => `sendit/delivery-images/${Date.now()}-${file.originalname}`,
          // If you need transformations, add them here if supported by your CloudinaryStorage version:
          // transformation: [{ width: 800, height: 800, crop: 'limit' }],
        },
        // transformation property removed (not supported by Options type)
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    };
  }

  getProfilePhotoMulterOptions(): MulterOptions {
    return {
      storage: new CloudinaryStorage({
        cloudinary,
        params: {
          public_id: (req, file) => `sendit/profile-photos/${Date.now()}-${file.originalname}`,
          // Note: transformation is handled by Cloudinary URL parameters, not here
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    };
  }

  async uploadProfilePhoto(file: Express.Multer.File, userId: string) {
    console.log('uploadProfilePhoto called with:', { file: file?.originalname, userId });
    
    if (!file) {
      console.error('No file provided');
      throw new BadRequestException('No file uploaded');
    }

    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    // Verify user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId, isActive: true } });
    if (!user) {
      console.error('User not found:', userId);
      throw new BadRequestException('User not found');
    }

    console.log('User found:', user.email);

    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      console.error('Invalid file type:', file.mimetype);
      throw new BadRequestException('Only image files are allowed');
    }

    try {
      console.log('Uploading to Cloudinary...');
      // Upload to Cloudinary manually
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'sendit/profile-photos',
        public_id: `${Date.now()}-${file.originalname}`,
        resource_type: 'image',
      });

      console.log('Cloudinary upload successful:', result.secure_url);

      // Update user's profile photo
      await this.prisma.user.update({
        where: { id: userId },
        data: { profilePhoto: result.secure_url },
      });

      console.log('User profile photo updated successfully');

      // Clean up temporary file
      try {
        await unlink(file.path);
        console.log('Temporary file cleaned up');
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file:', cleanupError);
        // Don't throw error for cleanup failure
      }

      return { url: result.secure_url };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // Clean up temporary file on error
      try {
        if (file.path) {
          await unlink(file.path);
          console.log('Temporary file cleaned up after error');
        }
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file after error:', cleanupError);
      }
      
      throw new BadRequestException('Failed to upload image');
    }
  }

  async uploadDeliveryImage(parcelId: string, file: Express.Multer.File, user: { userId: string; role: string }) {
    const parcel = await this.prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel || !parcel.isActive) throw new BadRequestException('Parcel not found or inactive');
    const isAssignedCourier = parcel.assignedCourierId === user.userId;
    const isAdmin = user.role === 'ADMIN';
    if (!(isAssignedCourier || isAdmin)) throw new ForbiddenException('Not allowed to upload for this parcel');
    if (!file || !file.path) throw new BadRequestException('No file uploaded');
    // file.path is the Cloudinary URL
    await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { deliveryImage: file.path },
    });
    return { url: file.path };
  }
}
