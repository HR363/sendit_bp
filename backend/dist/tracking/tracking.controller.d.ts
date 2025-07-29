import { TrackingService } from './tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    getParcelTracking(parcelId: string): Promise<import("./tracking.service").ParcelTracking>;
    getLiveTracking(parcelId: string): Promise<import("./tracking.service").ParcelTracking>;
    getPublicTracking(trackingNumber: string): Promise<import("./tracking.service").ParcelTracking>;
}
