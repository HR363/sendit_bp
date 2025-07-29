import { UploadService } from './upload.service';
import { Request as ExpressRequest } from 'express';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadProfilePhoto(file: Express.Multer.File, req: ExpressRequest & {
        user: {
            userId: string;
        };
    }): Promise<{
        url: string;
    }>;
    uploadDeliveryImage(id: string, file: Express.Multer.File, req: ExpressRequest & {
        user: {
            userId: string;
            role: string;
        };
    }): Promise<{
        url: string;
    }>;
}
