import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '@app/common';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentGateway,
} from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'ORD-1637582400000-ABC123' })
  orderId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 99.99 })
  amount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentGateway })
  paymentGateway: PaymentGateway;

  @ApiProperty({ example: 'ch_1234567890abcdef', required: false })
  transactionId?: string;

  @ApiProperty({ example: 'pi_1234567890abcdef', required: false })
  gatewayOrderId?: string;

  @ApiProperty({ example: '4242', required: false })
  cardLastFour?: string;

  @ApiProperty({ example: 'Visa', required: false })
  cardBrand?: string;

  @ApiProperty({ required: false })
  paidAt?: Date;

  @ApiProperty({ required: false })
  failedAt?: Date;

  @ApiProperty({ required: false })
  refundedAt?: Date;

  @ApiProperty({ required: false })
  failureReason?: string;

  @ApiProperty({ required: false })
  failureCode?: string;

  @ApiProperty({ example: 0 })
  refundedAmount: number;

  @ApiProperty({ required: false })
  refundReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: false })
  isCompleted: boolean;

  @ApiProperty({ example: false })
  isFailed: boolean;

  @ApiProperty({ example: true })
  isPending: boolean;

  @ApiProperty({ example: false })
  isRefunded: boolean;

  @ApiProperty({ example: true })
  canBeRefunded: boolean;

  @ApiProperty({ example: 99.99 })
  remainingRefundableAmount: number;

  static fromEntity(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: Number(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      paymentGateway: payment.paymentGateway,
      transactionId: payment.transactionId,
      gatewayOrderId: payment.gatewayOrderId,
      cardLastFour: payment.cardLastFour,
      cardBrand: payment.cardBrand,
      paidAt: payment.paidAt,
      failedAt: payment.failedAt,
      refundedAt: payment.refundedAt,
      failureReason: payment.failureReason,
      failureCode: payment.failureCode,
      refundedAmount: Number(payment.refundedAmount),
      refundReason: payment.refundReason,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      isCompleted: payment.isCompleted,
      isFailed: payment.isFailed,
      isPending: payment.isPending,
      isRefunded: payment.isRefunded,
      canBeRefunded: payment.canBeRefunded,
      remainingRefundableAmount: payment.remainingRefundableAmount,
    };
  }
}

export class PaymentDataResponseDto extends ResponseDto<PaymentResponseDto> {
  @ApiProperty({ type: PaymentResponseDto })
  data: PaymentResponseDto;
}

export class PaymentsDataResponseDto extends ResponseDto<PaymentResponseDto[]> {
  @ApiProperty({ type: [PaymentResponseDto] })
  data: PaymentResponseDto[];
}
