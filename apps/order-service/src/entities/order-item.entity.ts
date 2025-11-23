import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/database';
import { Order } from './order.entity';

@Entity('order_items')
@Index(['orderId'])
export class OrderItem extends BaseEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  @Index()
  orderId: string;

  @Column({ name: 'product_id', length: 255 })
  productId: string; // MongoDB ObjectId from catalog-service

  @Column({ name: 'product_name', length: 200 })
  productName: string;

  @Column({ name: 'product_slug', length: 200 })
  productSlug: string;

  @Column({ length: 100 })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice?: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'variant_id', length: 255, nullable: true })
  variantId?: string;

  @Column({ name: 'variant_name', length: 100, nullable: true })
  variantName?: string;

  @Column({ name: 'variant_value', length: 100, nullable: true })
  variantValue?: string;

  @Column({ default: 'kg' })
  weightUnit: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  weight?: number;

  @Column({ name: 'requires_shipping', default: true })
  requiresShipping: boolean;

  @Column({ name: 'is_digital', default: false })
  isDigital: boolean;

  @Column({ name: 'fulfilled_quantity', default: 0 })
  fulfilledQuantity: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Helper methods
  get isFulfilled(): boolean {
    return this.fulfilledQuantity >= this.quantity;
  }

  get isPartiallyFulfilled(): boolean {
    return this.fulfilledQuantity > 0 && this.fulfilledQuantity < this.quantity;
  }

  get remainingQuantity(): number {
    return this.quantity - this.fulfilledQuantity;
  }

  get hasDiscount(): boolean {
    return this.discountAmount > 0;
  }

  calculateTotals(): void {
    this.subtotal = Number((this.price * this.quantity).toFixed(2));
    this.total = Number((this.subtotal + this.taxAmount - this.discountAmount).toFixed(2));
  }
}
