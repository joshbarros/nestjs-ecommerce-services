import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
} from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Transaction ID from payment gateway',
    example: 'ch_1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'Payment gateway order ID',
    example: 'pi_1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  gatewayOrderId?: string;

  @ApiProperty({
    description: 'Response from payment gateway',
    required: false,
  })
  @IsOptional()
  @IsObject()
  gatewayResponse?: Record<string, any>;

  @ApiProperty({
    description: 'Last 4 digits of card',
    example: '4242',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardLastFour?: string;

  @ApiProperty({
    description: 'Card brand',
    example: 'Visa',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardBrand?: string;
}

export class FailPaymentDto {
  @ApiProperty({
    description: 'Reason for payment failure',
    example: 'Insufficient funds',
  })
  @IsNotEmpty()
  @IsString()
  failureReason: string;

  @ApiProperty({
    description: 'Failure code from payment gateway',
    example: 'card_declined',
    required: false,
  })
  @IsOptional()
  @IsString()
  failureCode?: string;

  @ApiProperty({
    description: 'Response from payment gateway',
    required: false,
  })
  @IsOptional()
  @IsObject()
  gatewayResponse?: Record<string, any>;
}
