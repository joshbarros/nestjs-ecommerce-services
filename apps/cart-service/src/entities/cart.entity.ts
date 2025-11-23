import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/database';
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Index(['userId'], { unique: true, where: 'user_id IS NOT NULL' })
@Index(['sessionId'], { unique: true, where: 'session_id IS NOT NULL' })
export class Cart extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'session_id', length: 255, nullable: true })
  @Index()
  sessionId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'discount_code', length: 50, nullable: true })
  discountCode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'item_count', default: 0 })
  itemCount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  // Helper method to check if cart is expired
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  // Helper method to check if cart belongs to a user or guest
  get isGuestCart(): boolean {
    return !this.userId && !!this.sessionId;
  }

  get isUserCart(): boolean {
    return !!this.userId;
  }
}
