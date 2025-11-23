import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  productId: string;

  @ApiProperty({ example: 'Wireless Headphones' })
  productName: string;

  @ApiProperty({ example: 'wireless-headphones' })
  productSlug: string;

  @ApiProperty({ example: 'WH-001' })
  sku: string;

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiPropertyOptional({ example: 129.99 })
  compareAtPrice?: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 199.98 })
  subtotal: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'variant-id' })
  variantId?: string;

  @ApiPropertyOptional({ example: 'Color' })
  variantName?: string;

  @ApiPropertyOptional({ example: 'Red' })
  variantValue?: string;

  @ApiProperty({ example: true })
  available: boolean;

  @ApiPropertyOptional({ example: 50 })
  stockQuantity?: number;

  @ApiProperty({ example: false })
  hasDiscount: boolean;

  @ApiPropertyOptional({ example: 60.00 })
  discountAmount?: number;

  @ApiPropertyOptional({ example: 23.08 })
  discountPercentage?: number;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  userId?: string;

  @ApiPropertyOptional({ example: 'session-id-12345' })
  sessionId?: string;

  @ApiProperty({ example: 199.98 })
  subtotal: number;

  @ApiProperty({ example: 0 })
  discount: number;

  @ApiPropertyOptional({ example: 'SAVE10' })
  discountCode?: string;

  @ApiProperty({ example: 20.00 })
  tax: number;

  @ApiProperty({ example: 0.1 })
  taxRate: number;

  @ApiProperty({ example: 219.98 })
  total: number;

  @ApiProperty({ example: 2 })
  itemCount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ example: false })
  isExpired: boolean;

  @ApiProperty({ example: false })
  isGuestCart: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  lastActivity: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}
