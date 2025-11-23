import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsMongoId,
  MaxLength,
  Min,
  IsUrl,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'electronics',
    description: 'URL-friendly slug',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    example: 'Electronic devices and accessories',
    description: 'Category description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'parent-category-id',
    description: 'Parent category ID for subcategories',
  })
  @IsMongoId()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/category.jpg',
    description: 'Category image URL',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Category active status',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Sort order for display',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: { custom: 'value' },
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
