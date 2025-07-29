import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories() {
    return this.prisma.parcelCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
    if (!category || !category.isActive) throw new NotFoundException('Category not found');
    return category;
  }

  async getCategoryPricing(id: string, weight: number) {
    const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
    if (!category || !category.isActive) throw new NotFoundException('Category not found');
    const minWeight = (category.minWeight as any).toNumber ? (category.minWeight as any).toNumber() : Number(category.minWeight);
    const maxWeight = (category.maxWeight as any).toNumber ? (category.maxWeight as any).toNumber() : Number(category.maxWeight);
    const basePrice = (category.basePrice as any).toNumber ? (category.basePrice as any).toNumber() : Number(category.basePrice);
    const pricePerKg = (category.pricePerKg as any).toNumber ? (category.pricePerKg as any).toNumber() : Number(category.pricePerKg);
    if (weight < minWeight || weight > maxWeight) {
      throw new BadRequestException('Weight out of category range');
    }
    const price = basePrice + weight * pricePerKg;
    return { categoryId: id, weight, price };
  }

  async createCategory(dto: CreateCategoryDto) {
    const category = await this.prisma.parcelCategory.create({
      data: { ...dto, isActive: true },
    });
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
    if (!category || !category.isActive) throw new NotFoundException('Category not found');
    const updated = await this.prisma.parcelCategory.update({
      where: { id },
      data: { ...dto },
    });
    return updated;
  }

  async softDeleteCategory(id: string) {
    const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
    if (!category || !category.isActive) throw new NotFoundException('Category not found');
    const updated = await this.prisma.parcelCategory.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    return updated;
  }
}
