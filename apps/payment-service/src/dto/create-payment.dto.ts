import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  Min,
  Length,
} from 'class-validator';
import { PaymentMethod, PaymentGateway } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 99.99,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment gateway',
    enum: PaymentGateway,
    example: PaymentGateway.STRIPE,
  })
  @IsNotEmpty()
  @IsEnum(PaymentGateway)
  paymentGateway: PaymentGateway;

  @ApiProperty({
    description: 'Additional metadata',
    example: { customerIp: '192.168.1.1', userAgent: 'Mozilla/5.0' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
