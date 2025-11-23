import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/database';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'UNFULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  FULFILLED = 'FULFILLED',
  RETURNED = 'RETURNED',
}

@Entity('orders')
@Index(['userId'])
@Index(['orderNumber'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class Order extends BaseEntity {
  @Column({ name: 'order_number', unique: true, length: 50 })
  orderNumber: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'user_email', length: 255 })
  userEmail: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @Index()
  status: OrderStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    name: 'fulfillment_status',
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.UNFULFILLED,
  })
  fulfillmentStatus: FulfillmentStatus;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'shipping_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'discount_code', length: 50, nullable: true })
  discountCode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Shipping Address
  @Column({ name: 'shipping_first_name', length: 100 })
  shippingFirstName: string;

  @Column({ name: 'shipping_last_name', length: 100 })
  shippingLastName: string;

  @Column({ name: 'shipping_phone', length: 20, nullable: true })
  shippingPhone?: string;

  @Column({ name: 'shipping_address_line1', length: 255 })
  shippingAddressLine1: string;

  @Column({ name: 'shipping_address_line2', length: 255, nullable: true })
  shippingAddressLine2?: string;

  @Column({ name: 'shipping_city', length: 100 })
  shippingCity: string;

  @Column({ name: 'shipping_state', length: 100 })
  shippingState: string;

  @Column({ name: 'shipping_postal_code', length: 20 })
  shippingPostalCode: string;

  @Column({ name: 'shipping_country', length: 2 })
  shippingCountry: string;

  // Billing Address (optional, can be same as shipping)
  @Column({ name: 'billing_first_name', length: 100, nullable: true })
  billingFirstName?: string;

  @Column({ name: 'billing_last_name', length: 100, nullable: true })
  billingLastName?: string;

  @Column({ name: 'billing_phone', length: 20, nullable: true })
  billingPhone?: string;

  @Column({ name: 'billing_address_line1', length: 255, nullable: true })
  billingAddressLine1?: string;

  @Column({ name: 'billing_address_line2', length: 255, nullable: true })
  billingAddressLine2?: string;

  @Column({ name: 'billing_city', length: 100, nullable: true })
  billingCity?: string;

  @Column({ name: 'billing_state', length: 100, nullable: true })
  billingState?: string;

  @Column({ name: 'billing_postal_code', length: 20, nullable: true })
  billingPostalCode?: string;

  @Column({ name: 'billing_country', length: 2, nullable: true })
  billingCountry?: string;

  // Payment Information
  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'payment_intent_id', length: 255, nullable: true })
  paymentIntentId?: string;

  @Column({ name: 'transaction_id', length: 255, nullable: true })
  transactionId?: string;

  // Tracking
  @Column({ name: 'tracking_number', length: 100, nullable: true })
  trackingNumber?: string;

  @Column({ name: 'shipping_carrier', length: 100, nullable: true })
  shippingCarrier?: string;

  @Column({ name: 'estimated_delivery', type: 'date', nullable: true })
  estimatedDelivery?: Date;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  // Customer Notes
  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  // Metadata
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  // Helper methods
  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get shippingAddress(): string {
    const parts = [
      this.shippingAddressLine1,
      this.shippingAddressLine2,
      this.shippingCity,
      this.shippingState,
      this.shippingPostalCode,
      this.shippingCountry,
    ].filter(Boolean);
    return parts.join(', ');
  }

  get isShipped(): boolean {
    return this.status === OrderStatus.SHIPPED || this.status === OrderStatus.DELIVERED;
  }

  get isDelivered(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  get isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  get canBeCancelled(): boolean {
    return (
      this.status === OrderStatus.PENDING ||
      this.status === OrderStatus.CONFIRMED ||
      this.status === OrderStatus.PROCESSING
    ) && !this.isShipped;
  }
}
