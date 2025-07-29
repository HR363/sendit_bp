import { Controller, Post, Param, UploadedFile, UseInterceptors, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request as ExpressRequest } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/profile-photo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/temp',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  }))
  async uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest & { user: { userId: string } },
  ) {
    console.log('Upload controller called with:', {
      file: file?.originalname,
      userId: req.user.userId,
      fileExists: !!file,
      filePath: file?.path
    });
    return this.uploadService.uploadProfilePhoto(file, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/parcels/:id/delivery-image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadDeliveryImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest & { user: { userId: string; role: string } },
  ) {
    return this.uploadService.uploadDeliveryImage(id, file, req.user);
  }
}
