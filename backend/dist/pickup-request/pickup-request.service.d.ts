import { PrismaService } from '../common/database/prisma.service';
import { CreatePickupRequestDto } from './dto/create-pickup-request.dto';
export declare class PickupRequestService {
    private prisma;
    constructor(prisma: PrismaService);
    createPickupRequest(dto: CreatePickupRequestDto, userId: string): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        pickupLocation: string;
        assignedCourierId: string | null;
        requesterId: string;
        parcelDetails: string;
        completedAt: Date | null;
    }>;
    getPendingPickupRequests(): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        pickupLocation: string;
        assignedCourierId: string | null;
        requesterId: string;
        parcelDetails: string;
        completedAt: Date | null;
    }[]>;
    getPickupRequestById(id: string): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        pickupLocation: string;
        assignedCourierId: string | null;
        requesterId: string;
        parcelDetails: string;
        completedAt: Date | null;
    }>;
    completePickupRequest(id: string, courierId: string): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        pickupLocation: string;
        assignedCourierId: string | null;
        requesterId: string;
        parcelDetails: string;
        completedAt: Date | null;
    }>;
}
