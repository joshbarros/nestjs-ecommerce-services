import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@app/database';

@Entity('user_profiles')
@Index(['userId'], { unique: true })
export class UserProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  @Index()
  userId: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ name: 'is_phone_verified', default: false })
  isPhoneVerified: boolean;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ length: 10, nullable: true })
  gender?: string; // 'male', 'female', 'other', 'prefer_not_to_say'

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ length: 500, nullable: true })
  bio?: string;

  @Column({ length: 255, nullable: true })
  company?: string;

  @Column({ length: 100, nullable: true })
  occupation?: string;

  @Column({ length: 255, nullable: true })
  website?: string;

  @Column({ length: 2, default: 'en' })
  language: string; // ISO 639-1 language code

  @Column({ length: 3, default: 'USD' })
  currency: string; // ISO 4217 currency code

  @Column({ length: 50, nullable: true })
  timezone?: string;

  // Notification preferences
  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @Column({ name: 'sms_notifications', default: false })
  smsNotifications: boolean;

  @Column({ name: 'marketing_emails', default: true })
  marketingEmails: boolean;

  @Column({ name: 'order_updates', default: true })
  orderUpdates: boolean;

  @Column({ name: 'newsletter_subscription', default: false })
  newsletterSubscription: boolean;

  // Privacy settings
  @Column({ name: 'profile_visibility', default: 'private' })
  profileVisibility: string; // 'public', 'private', 'friends'

  @Column({ name: 'show_email', default: false })
  showEmail: boolean;

  @Column({ name: 'show_phone', default: false })
  showPhone: boolean;

  // Metadata
  @Column({ name: 'last_password_change', type: 'timestamp', nullable: true })
  lastPasswordChange?: Date;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', length: 255, nullable: true })
  twoFactorSecret?: string;
}
