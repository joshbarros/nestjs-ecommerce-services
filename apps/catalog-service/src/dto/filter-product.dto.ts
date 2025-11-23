import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsMongoId,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../schemas/product.schema';

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_LOW_HIGH = 'price_low_high',
  PRICE_HIGH_LOW = 'price_high_low',
  NAME_A_Z = 'name_a_z',
  NAME_Z_A = 'name_z_a',
  POPULAR = 'popular',
  RATING = 'rating',
}

export class FilterProductDto {
  @ApiPropertyOptional({
    example: 'wireless headphones',
    description: 'Search query',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'category-id',
    description: 'Filter by category ID',
  })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'Sony',
    description: 'Filter by brand',
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Minimum price',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Maximum price',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    description: 'Filter by status',
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter featured products only',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: 'bluetooth',
    description: 'Filter by tag',
  })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Minimum rating (1-5)',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  minRating?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Only in-stock products',
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;

  @ApiPropertyOptional({
    enum: SortBy,
    example: SortBy.NEWEST,
    description: 'Sort order',
  })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Items per page',
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
