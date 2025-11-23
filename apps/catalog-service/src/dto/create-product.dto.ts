import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsMongoId,
  IsArray,
  IsEnum,
  MaxLength,
  Min,
  Max,
  IsUrl,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../schemas/product.schema';

export class ProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ example: 'Product front view' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  alt?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

export class ProductVariantDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Red' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value: string;

  @ApiPropertyOptional({ example: 'SKU-RED-001' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 29.99 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;
}

export class ProductDimensionsDto {
  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'cm' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  weightUnit?: string;
}

export class ProductSEODto {
  @ApiPropertyOptional({ example: 'Best Product Ever - Buy Now' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Amazing product with great features',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['product', 'electronics', 'sale'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'wireless-headphones',
    description: 'URL-friendly slug',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'High-quality wireless headphones',
    description: 'Short description',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({
    example: 'Detailed product information...',
    description: 'Long description',
  })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiProperty({ example: 'WH-001', description: 'Stock keeping unit' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 99.99, description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 129.99,
    description: 'Original price for discounts',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 50.0, description: 'Cost to business' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ example: 100, description: 'Stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Track inventory for this product',
  })
  @IsBoolean()
  @IsOptional()
  trackInventory?: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Low stock alert threshold',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  lowStockThreshold?: number;

  @ApiProperty({
    example: ['category-id-1', 'category-id-2'],
    description: 'Category IDs',
  })
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  categoryIds: string[];

  @ApiPropertyOptional({
    type: [ProductImageDto],
    description: 'Product images',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    type: [ProductVariantDto],
    description: 'Product variants',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({
    type: ProductDimensionsDto,
    description: 'Product dimensions',
  })
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  @IsOptional()
  dimensions?: ProductDimensionsDto;

  @ApiPropertyOptional({
    example: ['wireless', 'bluetooth', 'audio'],
    description: 'Product tags',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Sony', description: 'Brand name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ example: 'TechStore', description: 'Vendor name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  vendor?: string;

  @ApiPropertyOptional({
    example: 'vendor-user-id',
    description: 'Vendor user ID',
  })
  @IsMongoId()
  @IsOptional()
  vendorId?: string;

  @ApiPropertyOptional({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    description: 'Product status',
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ example: true, description: 'Is product active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is featured product' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Is digital product',
  })
  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Requires shipping',
  })
  @IsBoolean()
  @IsOptional()
  requiresShipping?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Is taxable' })
  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @ApiPropertyOptional({ type: ProductSEODto, description: 'SEO data' })
  @ValidateNested()
  @Type(() => ProductSEODto)
  @IsOptional()
  seo?: ProductSEODto;

  @ApiPropertyOptional({
    example: { custom: 'value' },
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
