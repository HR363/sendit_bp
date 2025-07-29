import { PickupRequestService } from './pickup-request.service';
import { CreatePickupRequestDto } from './dto/create-pickup-request.dto';
import { Request as ExpressRequest } from 'express';
export declare class PickupRequestController {
    private readonly pickupRequestService;
    constructor(pickupRequestService: PickupRequestService);
    createPickupRequest(dto: CreatePickupRequestDto, req: ExpressRequest): Promise<{
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
    completePickupRequest(id: string, req: ExpressRequest): Promise<{
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
