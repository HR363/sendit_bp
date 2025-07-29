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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/database/prisma.service");
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const promises_1 = require("fs/promises");
let UploadService = class UploadService {
    configService;
    prisma;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    getMulterOptions() {
        return {
            storage: new multer_storage_cloudinary_1.CloudinaryStorage({
                cloudinary: cloudinary_1.v2,
                params: {
                    public_id: (req, file) => `sendit/delivery-images/${Date.now()}-${file.originalname}`,
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
        };
    }
    getProfilePhotoMulterOptions() {
        return {
            storage: new multer_storage_cloudinary_1.CloudinaryStorage({
                cloudinary: cloudinary_1.v2,
                params: {
                    public_id: (req, file) => `sendit/profile-photos/${Date.now()}-${file.originalname}`,
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                if (file.mimetype.startsWith('image/')) {
                    cb(null, true);
                }
                else {
                    cb(new common_1.BadRequestException('Only image files are allowed'), false);
                }
            },
        };
    }
    async uploadProfilePhoto(file, userId) {
        console.log('uploadProfilePhoto called with:', { file: file?.originalname, userId });
        if (!file) {
            console.error('No file provided');
            throw new common_1.BadRequestException('No file uploaded');
        }
        console.log('File details:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId, isActive: true } });
        if (!user) {
            console.error('User not found:', userId);
            throw new common_1.BadRequestException('User not found');
        }
        console.log('User found:', user.email);
        if (!file.mimetype.startsWith('image/')) {
            console.error('Invalid file type:', file.mimetype);
            throw new common_1.BadRequestException('Only image files are allowed');
        }
        try {
            console.log('Uploading to Cloudinary...');
            const result = await cloudinary_1.v2.uploader.upload(file.path, {
                folder: 'sendit/profile-photos',
                public_id: `${Date.now()}-${file.originalname}`,
                resource_type: 'image',
            });
            console.log('Cloudinary upload successful:', result.secure_url);
            await this.prisma.user.update({
                where: { id: userId },
                data: { profilePhoto: result.secure_url },
            });
            console.log('User profile photo updated successfully');
            try {
                await (0, promises_1.unlink)(file.path);
                console.log('Temporary file cleaned up');
            }
            catch (cleanupError) {
                console.error('Failed to clean up temporary file:', cleanupError);
            }
            return { url: result.secure_url };
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            try {
                if (file.path) {
                    await (0, promises_1.unlink)(file.path);
                    console.log('Temporary file cleaned up after error');
                }
            }
            catch (cleanupError) {
                console.error('Failed to clean up temporary file after error:', cleanupError);
            }
            throw new common_1.BadRequestException('Failed to upload image');
        }
    }
    async uploadDeliveryImage(parcelId, file, user) {
        const parcel = await this.prisma.parcel.findUnique({ where: { id: parcelId } });
        if (!parcel || !parcel.isActive)
            throw new common_1.BadRequestException('Parcel not found or inactive');
        const isAssignedCourier = parcel.assignedCourierId === user.userId;
        const isAdmin = user.role === 'ADMIN';
        if (!(isAssignedCourier || isAdmin))
            throw new common_1.ForbiddenException('Not allowed to upload for this parcel');
        if (!file || !file.path)
            throw new common_1.BadRequestException('No file uploaded');
        await this.prisma.parcel.update({
            where: { id: parcelId },
            data: { deliveryImage: file.path },
        });
        return { url: file.path };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], UploadService);
//# sourceMappingURL=upload.service.js.map