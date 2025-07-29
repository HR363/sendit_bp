export declare class CreateParcelDto {
    senderId?: string;
    receiverId?: string;
    categoryId?: string;
    senderName: string;
    senderPhone: string;
    senderEmail: string;
    receiverName: string;
    receiverPhone: string;
    receiverEmail: string;
    pickupLocation: string;
    destinationLocation: string;
    weight: number;
    description?: string;
    status: string;
    estimatedDeliveryDate: string;
    actualDeliveryDate?: string;
    serviceType?: 'Standard' | 'Express' | 'Overnight';
    price?: number;
}
