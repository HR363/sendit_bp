import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../common/mail.service';
import { PricingService } from '../common/pricing.service';

@Injectable()
export class ParcelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly pricingService: PricingService,
  ) {}

  async createParcel(dto: CreateParcelDto, user: { userId: string; role: string }) {
    if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    // Generate unique tracking number
    const trackingNumber = uuidv4();
    
    // For now, we'll use the current user as both sender and receiver
    // since the schema requires these relationships
    // Ensure estimatedDeliveryDate is in proper ISO format
    let estimatedDeliveryDate = dto.estimatedDeliveryDate;
    if (!estimatedDeliveryDate) {
      // If no date provided, set to 3 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      estimatedDeliveryDate = futureDate.toISOString();
    } else if (typeof estimatedDeliveryDate === 'string' && !estimatedDeliveryDate.includes('T')) {
      // If it's a date string without time, add time component
      estimatedDeliveryDate = new Date(estimatedDeliveryDate + 'T00:00:00.000Z').toISOString();
    }

    // Calculate dynamic pricing
    const pricingRequest = {
      categoryId: dto.categoryId || await this.getDefaultCategoryId(),
      weight: Number(dto.weight),
      pickupLocation: dto.pickupLocation,
      destinationLocation: dto.destinationLocation,
      serviceType: dto.serviceType || 'Standard'
    };

    const pricing = await this.pricingService.calculatePricing(pricingRequest);

    const data: any = {
      senderName: dto.senderName,
      senderPhone: dto.senderPhone,
      senderEmail: dto.senderEmail,
      receiverName: dto.receiverName,
      receiverPhone: dto.receiverPhone,
      receiverEmail: dto.receiverEmail,
      pickupLocation: dto.pickupLocation,
      destinationLocation: dto.destinationLocation,
      weight: Number(dto.weight),
      description: dto.description || '',
      status: dto.status,
      estimatedDeliveryDate: estimatedDeliveryDate,
      price: pricing.totalPrice,
      trackingNumber,
      isActive: true,
    };
    
    // Connect to existing user as sender
    const senderUserId = dto.senderId || user.userId;
    data.sender = { connect: { id: senderUserId } };
    
    // Connect to existing user as receiver
    const receiverUserId = dto.receiverId || user.userId;
    data.receiver = { connect: { id: receiverUserId } };
    
    // Connect to the user who created the parcel
    data.createdBy = { connect: { id: user.userId } };
    
    // If the creator is a courier, assign the parcel to them
    if (user.role === 'COURIER_AGENT') {
      data.assignedCourier = { connect: { id: user.userId } };
    }
    
    // Handle category relationship
    if (dto.categoryId) {
      data.category = { connect: { id: dto.categoryId } };
    } else {
      // Use a default category if none is provided
      const defaultCategory = await this.getDefaultCategory();
      data.category = { connect: { id: defaultCategory.id } };
    }
    
    const parcel = await this.prisma.parcel.create({ data });
    // Return safe fields only
    const { id, senderId, receiverId, categoryId, trackingNumber: tn, status, isActive, createdAt, updatedAt } = parcel;
    return { id, senderId, receiverId, categoryId, trackingNumber: tn, status, isActive, createdAt, updatedAt };
  }

  async updateParcel(id: string, dto: UpdateParcelDto, user: { userId: string; role: string }) {
    if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel || !parcel.isActive) throw new ForbiddenException('Parcel not found or inactive');
    const updated = await this.prisma.parcel.update({
      where: { id },
      data: { ...dto },
    });
    return updated;
  }

  async assignCourier(id: string, dto: any) { // Assuming AssignCourierDto is no longer needed or changed
    // Only admin can assign
    // (Controller already guards, but double-check here)
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel || !parcel.isActive) throw new ForbiddenException('Parcel not found or inactive');
    const updated = await this.prisma.parcel.update({
      where: { id },
      data: { assignedCourierId: dto.assignedCourierId },
    });
    return updated;
  }

  async updateStatus(id: string, dto: UpdateParcelStatusDto, user: { userId: string; role: string }) {
    if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel || !parcel.isActive) throw new ForbiddenException('Parcel not found or inactive');
    // Update status
    const updated = await this.prisma.parcel.update({
      where: { id },
      data: { status: dto.status },
    });
    // Add to status history
    await this.prisma.parcelStatusHistory.create({
      data: {
        parcelId: id,
        status: dto.status,
        location: parcel.destinationLocation, // or pickupLocation, or pass in DTO if needed
        updatedById: user.userId,
      },
    });
    // Send status update emails
    const sender = await this.prisma.user.findUnique({ where: { id: parcel.senderId ?? undefined } });
    const receiver = await this.prisma.user.findUnique({ where: { id: parcel.receiverId ?? undefined } });
    if (sender) {
      await this.mailService.sendStatusUpdateEmail(sender.email, sender.firstName, parcel.trackingNumber, dto.status);
    }
    if (receiver) {
      await this.mailService.sendStatusUpdateEmail(receiver.email, receiver.firstName, parcel.trackingNumber, dto.status);
    }
    // If delivered, send delivery confirmation
    if (dto.status === 'DELIVERED') {
      if (sender) {
        await this.mailService.sendDeliveryConfirmationEmail(sender.email, sender.firstName, parcel.trackingNumber);
      }
      if (receiver) {
        await this.mailService.sendDeliveryConfirmationEmail(receiver.email, receiver.firstName, parcel.trackingNumber);
      }
    }
    return updated;
  }

  async getSentParcels(userId: string) {
    // First get the user to get their email
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return this.prisma.parcel.findMany({
      where: { 
        senderEmail: user.email, 
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReceivedParcels(userId: string) {
    // First get the user to get their email
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return this.prisma.parcel.findMany({
      where: { 
        receiverEmail: user.email, 
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssignedParcels(userId: string) {
    return this.prisma.parcel.findMany({
      where: { assignedCourierId: userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllParcels() {
    return this.prisma.parcel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getParcelById(id: string, user: { userId: string; role: string }) {
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel || !parcel.isActive) return null;
    const isSender = parcel.senderId === user.userId;
    const isReceiver = parcel.receiverId === user.userId;
    const isAssignedCourier = parcel.assignedCourierId === user.userId;
    const isAdmin = user.role === 'ADMIN';
    if (!(isSender || isReceiver || isAssignedCourier || isAdmin)) {
      throw new (await import('@nestjs/common')).ForbiddenException('Access denied');
    }
    return parcel;
  }

  async softDeleteParcel(id: string, user: { userId: string; role: string }) {
    if (!['ADMIN', 'COURIER_AGENT'].includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel || !parcel.isActive) throw new ForbiddenException('Parcel not found or already deleted');
    const updated = await this.prisma.parcel.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    return updated;
  }

  async getParcelStatusHistory(id: string, user: { userId: string; role: string }) {
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel || !parcel.isActive) throw new NotFoundException('Parcel not found');
    const isSender = parcel.senderId === user.userId;
    const isReceiver = parcel.receiverId === user.userId;
    const isAssignedCourier = parcel.assignedCourierId === user.userId;
    const isAdmin = user.role === 'ADMIN';
    if (!(isSender || isReceiver || isAssignedCourier || isAdmin)) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.parcelStatusHistory.findMany({
      where: { parcelId: id },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getDefaultCategoryId(): Promise<string> {
    const defaultCategory = await this.getDefaultCategory();
    return defaultCategory.id;
  }

  private async getDefaultCategory() {
    // First, try to find a default category
    const defaultCategory = await this.prisma.parcelCategory.findFirst({
      where: { isActive: true }
    });
    
    if (defaultCategory) {
      return defaultCategory;
    } else {
      // If no categories exist, create a default one
      return await this.prisma.parcelCategory.create({
        data: {
          name: 'General',
          description: 'General parcel category',
          minWeight: 0,
          maxWeight: 100,
          pricePerKg: 5,
          basePrice: 10,
          isActive: true
        }
      });
    }
  }
}
