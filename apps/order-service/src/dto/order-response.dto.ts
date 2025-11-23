import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '../entities/order.entity';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  productSlug: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  originalPrice?: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  total: number;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  variantId?: string;

  @ApiPropertyOptional()
  variantName?: string;

  @ApiPropertyOptional()
  variantValue?: string;

  @ApiProperty()
  requiresShipping: boolean;

  @ApiProperty()
  isDigital: boolean;

  @ApiProperty()
  fulfilledQuantity: number;

  @ApiProperty()
  isFulfilled: boolean;

  @ApiProperty()
  remainingQuantity: number;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: FulfillmentStatus })
  fulfillmentStatus: FulfillmentStatus;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  shippingCost: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  discount: number;

  @ApiPropertyOptional()
  discountCode?: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  shippingFirstName: string;

  @ApiProperty()
  shippingLastName: string;

  @ApiPropertyOptional()
  shippingPhone?: string;

  @ApiProperty()
  shippingAddressLine1: string;

  @ApiPropertyOptional()
  shippingAddressLine2?: string;

  @ApiProperty()
  shippingCity: string;

  @ApiProperty()
  shippingState: string;

  @ApiProperty()
  shippingPostalCode: string;

  @ApiProperty()
  shippingCountry: string;

  @ApiPropertyOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  trackingNumber?: string;

  @ApiPropertyOptional()
  shippingCarrier?: string;

  @ApiPropertyOptional()
  estimatedDelivery?: Date;

  @ApiPropertyOptional()
  shippedAt?: Date;

  @ApiPropertyOptional()
  deliveredAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  cancellationReason?: string;

  @ApiPropertyOptional()
  customerNotes?: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  isShipped: boolean;

  @ApiProperty()
  isDelivered: boolean;

  @ApiProperty()
  isCancelled: boolean;

  @ApiProperty()
  canBeCancelled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
