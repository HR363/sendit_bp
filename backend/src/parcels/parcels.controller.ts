import { Controller, Post, Put, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { AssignCourierDto } from './dto/assign-courier.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { ParcelsService } from './parcels.service';
import { Request as ExpressRequest } from 'express';

@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'COURIER_AGENT')
  @Post()
  createParcel(@Body() dto: CreateParcelDto, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.createParcel(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'COURIER_AGENT')
  @Put(':id')
  updateParcel(@Param('id') id: string, @Body() dto: UpdateParcelDto, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.updateParcel(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/assign')
  assignCourier(@Param('id') id: string, @Body() dto: AssignCourierDto) {
    return this.parcelsService.assignCourier(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'COURIER_AGENT')
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateParcelStatusDto, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.updateStatus(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sent')
  getSentParcels(@Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.getSentParcels(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  getReceivedParcels(@Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.getReceivedParcels(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER_AGENT')
  @Get('assigned')
  getAssignedParcels(@Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.getAssignedParcels(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  getAllParcels() {
    return this.parcelsService.getAllParcels();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getParcelById(@Param('id') id: string, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.getParcelById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/history')
  getParcelStatusHistory(@Param('id') id: string, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.getParcelStatusHistory(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'COURIER_AGENT')
  @Delete(':id')
  softDeleteParcel(@Param('id') id: string, @Request() req: ExpressRequest & { user: { userId: string; role: string } }) {
    return this.parcelsService.softDeleteParcel(id, req.user);
  }
}
