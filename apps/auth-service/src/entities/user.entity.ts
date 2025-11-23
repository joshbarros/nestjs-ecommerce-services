import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from '@app/database';
import { UserRole } from '@app/common';
import { Exclude } from 'class-transformer';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ unique: true, length: 255 })
  @Index()
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true, length: 255 })
  @Exclude()
  emailVerificationToken?: string;

  @Column({ name: 'password_reset_token', nullable: true, length: 255 })
  @Exclude()
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true, type: 'timestamp' })
  @Exclude()
  passwordResetExpires?: Date;

  @Column({ name: 'refresh_token', nullable: true, length: 500 })
  @Exclude()
  refreshToken?: string;

  @Column({ name: 'last_login', nullable: true, type: 'timestamp' })
  lastLogin?: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
