import {
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '@app/database';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  WALLET = 'WALLET',
  UPI = 'UPI',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentGateway {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
  SQUARE = 'SQUARE',
  INTERNAL = 'INTERNAL',
}

@Entity('payments')
@Index(['orderId'])
@Index(['userId'])
@Index(['status'])
@Index(['paymentMethod'])
export class Payment extends BaseEntity {
  @Column({ name: 'order_id', length: 255 })
  orderId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    name: 'payment_gateway',
    type: 'enum',
    enum: PaymentGateway,
  })
  paymentGateway: PaymentGateway;

  @Column({ name: 'transaction_id', length: 255, nullable: true })
  transactionId?: string;

  @Column({ name: 'gateway_order_id', length: 255, nullable: true })
  gatewayOrderId?: string;

  @Column({
    name: 'gateway_response',
    type: 'jsonb',
    nullable: true,
  })
  gatewayResponse?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Card details (last 4 digits only for security)
  @Column({ name: 'card_last_four', length: 4, nullable: true })
  cardLastFour?: string;

  @Column({ name: 'card_brand', length: 50, nullable: true })
  cardBrand?: string;

  // Payment timestamps
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date;

  // Failure details
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({ name: 'failure_code', length: 100, nullable: true })
  failureCode?: string;

  // Refund details
  @Column({ name: 'refunded_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  get isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  get isPending(): boolean {
    return (
      this.status === PaymentStatus.PENDING ||
      this.status === PaymentStatus.PROCESSING
    );
  }

  get isRefunded(): boolean {
    return (
      this.status === PaymentStatus.REFUNDED ||
      this.status === PaymentStatus.PARTIALLY_REFUNDED
    );
  }

  get canBeRefunded(): boolean {
    return (
      this.status === PaymentStatus.COMPLETED &&
      Number(this.refundedAmount) < Number(this.amount)
    );
  }

  get remainingRefundableAmount(): number {
    return Number((Number(this.amount) - Number(this.refundedAmount)).toFixed(2));
  }
}
