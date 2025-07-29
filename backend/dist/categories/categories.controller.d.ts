import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getAllCategories(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        minWeight: import("@prisma/client/runtime/library").Decimal;
        maxWeight: import("@prisma/client/runtime/library").Decimal;
        pricePerKg: import("@prisma/client/runtime/library").Decimal;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getCategoryById(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        minWeight: import("@prisma/client/runtime/library").Decimal;
        maxWeight: import("@prisma/client/runtime/library").Decimal;
        pricePerKg: import("@prisma/client/runtime/library").Decimal;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    getCategoryPricing(id: string, weight: string): Promise<{
        categoryId: string;
        weight: number;
        price: any;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        minWeight: import("@prisma/client/runtime/library").Decimal;
        maxWeight: import("@prisma/client/runtime/library").Decimal;
        pricePerKg: import("@prisma/client/runtime/library").Decimal;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        minWeight: import("@prisma/client/runtime/library").Decimal;
        maxWeight: import("@prisma/client/runtime/library").Decimal;
        pricePerKg: import("@prisma/client/runtime/library").Decimal;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    softDeleteCategory(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        minWeight: import("@prisma/client/runtime/library").Decimal;
        maxWeight: import("@prisma/client/runtime/library").Decimal;
        pricePerKg: import("@prisma/client/runtime/library").Decimal;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }>;
}
