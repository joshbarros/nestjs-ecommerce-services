import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phoneNumber?: string;

  @ApiProperty({ example: false })
  isPhoneVerified: boolean;

  @ApiPropertyOptional({ example: '1990-01-15' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'male' })
  gender?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Software developer' })
  bio?: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  company?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  occupation?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  website?: string;

  @ApiProperty({ example: 'en' })
  language: string;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  timezone?: string;

  @ApiProperty({ example: true })
  emailNotifications: boolean;

  @ApiProperty({ example: false })
  smsNotifications: boolean;

  @ApiProperty({ example: true })
  marketingEmails: boolean;

  @ApiProperty({ example: true })
  orderUpdates: boolean;

  @ApiProperty({ example: false })
  newsletterSubscription: boolean;

  @ApiProperty({ example: 'private' })
  profileVisibility: string;

  @ApiProperty({ example: false })
  showEmail: boolean;

  @ApiProperty({ example: false })
  showPhone: boolean;

  @ApiProperty({ example: false })
  twoFactorEnabled: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}
