import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/database';
import { Exclude } from 'class-transformer';

export enum AddressType {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  BOTH = 'BOTH',
}

@Entity('addresses')
@Index(['userId', 'isDefault'])
export class Address extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'address_line1', length: 255 })
  addressLine1: string;

  @Column({ name: 'address_line2', length: 255, nullable: true })
  addressLine2?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ name: 'state_province', length: 100 })
  stateProvince: string;

  @Column({ name: 'postal_code', length: 20 })
  postalCode: string;

  @Column({ length: 2 })
  country: string; // ISO 3166-1 alpha-2 country code

  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.SHIPPING,
  })
  type: AddressType;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ length: 255, nullable: true })
  notes?: string;

  // Computed property for full address
  get fullAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.stateProvince,
      this.postalCode,
      this.country,
    ].filter(Boolean);
    return parts.join(', ');
  }

  // Computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
