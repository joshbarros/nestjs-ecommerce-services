import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { OrderStatus, FulfillmentStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Order status',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    enum: FulfillmentStatus,
    description: 'Fulfillment status',
  })
  @IsEnum(FulfillmentStatus)
  @IsOptional()
  fulfillmentStatus?: FulfillmentStatus;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Tracking number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: 'UPS',
    description: 'Shipping carrier',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingCarrier?: string;

  @ApiPropertyOptional({
    example: '2024-01-20',
    description: 'Estimated delivery date',
  })
  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string;

  @ApiPropertyOptional({
    example: 'Internal note',
    description: 'Internal notes',
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Customer changed mind' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
