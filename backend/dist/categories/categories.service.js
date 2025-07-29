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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/database/prisma.service");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllCategories() {
        return this.prisma.parcelCategory.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCategoryById(id) {
        const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
        if (!category || !category.isActive)
            throw new common_2.NotFoundException('Category not found');
        return category;
    }
    async getCategoryPricing(id, weight) {
        const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
        if (!category || !category.isActive)
            throw new common_2.NotFoundException('Category not found');
        const minWeight = category.minWeight.toNumber ? category.minWeight.toNumber() : Number(category.minWeight);
        const maxWeight = category.maxWeight.toNumber ? category.maxWeight.toNumber() : Number(category.maxWeight);
        const basePrice = category.basePrice.toNumber ? category.basePrice.toNumber() : Number(category.basePrice);
        const pricePerKg = category.pricePerKg.toNumber ? category.pricePerKg.toNumber() : Number(category.pricePerKg);
        if (weight < minWeight || weight > maxWeight) {
            throw new common_3.BadRequestException('Weight out of category range');
        }
        const price = basePrice + weight * pricePerKg;
        return { categoryId: id, weight, price };
    }
    async createCategory(dto) {
        const category = await this.prisma.parcelCategory.create({
            data: { ...dto, isActive: true },
        });
        return category;
    }
    async updateCategory(id, dto) {
        const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
        if (!category || !category.isActive)
            throw new common_2.NotFoundException('Category not found');
        const updated = await this.prisma.parcelCategory.update({
            where: { id },
            data: { ...dto },
        });
        return updated;
    }
    async softDeleteCategory(id) {
        const category = await this.prisma.parcelCategory.findUnique({ where: { id } });
        if (!category || !category.isActive)
            throw new common_2.NotFoundException('Category not found');
        const updated = await this.prisma.parcelCategory.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() },
        });
        return updated;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map