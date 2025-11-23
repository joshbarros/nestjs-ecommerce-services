import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/database';
import { Cart } from './cart.entity';

@Entity('cart_items')
@Index(['cartId', 'productId'], { unique: true })
export class CartItem extends BaseEntity {
  @Column({ name: 'cart_id', type: 'uuid' })
  @Index()
  cartId: string;

  @Column({ name: 'product_id', length: 255 })
  @Index()
  productId: string; // MongoDB ObjectId from catalog-service

  @Column({ name: 'product_name', length: 200 })
  productName: string;

  @Column({ name: 'product_slug', length: 200 })
  productSlug: string;

  @Column({ length: 100 })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'variant_id', length: 255, nullable: true })
  variantId?: string;

  @Column({ name: 'variant_name', length: 100, nullable: true })
  variantName?: string;

  @Column({ name: 'variant_value', length: 100, nullable: true })
  variantValue?: string;

  @Column({ default: true })
  available: boolean;

  @Column({ name: 'stock_quantity', nullable: true })
  stockQuantity?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  // Calculate subtotal based on quantity and price
  calculateSubtotal(): void {
    this.subtotal = Number((this.price * this.quantity).toFixed(2));
  }

  // Check if item has a discount
  get hasDiscount(): boolean {
    return !!this.compareAtPrice && this.compareAtPrice > this.price;
  }

  // Calculate discount amount
  get discountAmount(): number {
    if (!this.hasDiscount) return 0;
    return Number(((this.compareAtPrice! - this.price) * this.quantity).toFixed(2));
  }

  // Calculate discount percentage
  get discountPercentage(): number {
    if (!this.hasDiscount) return 0;
    return Number((((this.compareAtPrice! - this.price) / this.compareAtPrice!) * 100).toFixed(2));
  }
}
