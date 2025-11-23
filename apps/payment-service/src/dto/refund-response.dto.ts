import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '@app/common';
import { Refund, RefundStatus, RefundReason } from '../entities/refund.entity';

export class RefundResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  paymentId: string;

  @ApiProperty({ example: 49.99 })
  amount: number;

  @ApiProperty({ enum: RefundStatus })
  status: RefundStatus;

  @ApiProperty({ enum: RefundReason })
  reason: RefundReason;

  @ApiProperty({ required: false })
  reasonDetails?: string;

  @ApiProperty({ example: 're_1234567890abcdef', required: false })
  refundTransactionId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  initiatedBy: string;

  @ApiProperty({ required: false })
  processedAt?: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;

  @ApiProperty({ required: false })
  failedAt?: Date;

  @ApiProperty({ required: false })
  failureReason?: string;

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

  static fromEntity(refund: Refund): RefundResponseDto {
    return {
      id: refund.id,
      paymentId: refund.paymentId,
      amount: Number(refund.amount),
      status: refund.status,
      reason: refund.reason,
      reasonDetails: refund.reasonDetails,
      refundTransactionId: refund.refundTransactionId,
      initiatedBy: refund.initiatedBy,
      processedAt: refund.processedAt,
      completedAt: refund.completedAt,
      failedAt: refund.failedAt,
      failureReason: refund.failureReason,
      createdAt: refund.createdAt,
      updatedAt: refund.updatedAt,
      isCompleted: refund.isCompleted,
      isFailed: refund.isFailed,
      isPending: refund.isPending,
    };
  }
}

export class RefundDataResponseDto extends ResponseDto<RefundResponseDto> {
  @ApiProperty({ type: RefundResponseDto })
  data: RefundResponseDto;
}

export class RefundsDataResponseDto extends ResponseDto<RefundResponseDto[]> {
  @ApiProperty({ type: [RefundResponseDto] })
  data: RefundResponseDto[];
}
