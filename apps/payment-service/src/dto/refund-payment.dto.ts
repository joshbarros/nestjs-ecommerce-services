import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RefundReason } from '../entities/refund.entity';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Refund amount',
    example: 49.99,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Reason for refund',
    enum: RefundReason,
    example: RefundReason.CUSTOMER_REQUEST,
  })
  @IsNotEmpty()
  @IsEnum(RefundReason)
  reason: RefundReason;

  @ApiProperty({
    description: 'Additional details about the refund',
    example: 'Customer not satisfied with product quality',
    required: false,
  })
  @IsOptional()
  @IsString()
  reasonDetails?: string;
}
