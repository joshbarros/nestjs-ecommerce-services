import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Product ID from catalog service',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 1, description: 'Quantity to add', default: 1 })
  @IsNumber()
  @Min(1)
  @Max(999)
  quantity: number = 1;

  @ApiPropertyOptional({
    example: 'variant-id',
    description: 'Product variant ID if applicable',
  })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({
    example: 'session-id-12345',
    description: 'Session ID for guest carts',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;
}
