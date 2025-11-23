import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '@app/database';
import { Payment } from './payment.entity';

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RefundReason {
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  FRAUDULENT = 'FRAUDULENT',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PRODUCT_NOT_AVAILABLE = 'PRODUCT_NOT_AVAILABLE',
  OTHER = 'OTHER',
}

@Entity('refunds')
@Index(['paymentId'])
@Index(['status'])
export class Refund extends BaseEntity {
  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({
    type: 'enum',
    enum: RefundReason,
    default: RefundReason.CUSTOMER_REQUEST,
  })
  reason: RefundReason;

  @Column({ name: 'reason_details', type: 'text', nullable: true })
  reasonDetails?: string;

  @Column({ name: 'refund_transaction_id', length: 255, nullable: true })
  refundTransactionId?: string;

  @Column({
    name: 'gateway_response',
    type: 'jsonb',
    nullable: true,
  })
  gatewayResponse?: Record<string, any>;

  @Column({ name: 'initiated_by', type: 'uuid' })
  initiatedBy: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  get isCompleted(): boolean {
    return this.status === RefundStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === RefundStatus.FAILED;
  }

  get isPending(): boolean {
    return (
      this.status === RefundStatus.PENDING ||
      this.status === RefundStatus.PROCESSING
    );
  }
}
