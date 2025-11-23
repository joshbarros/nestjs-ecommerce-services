import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsUrl,
  MaxLength,
  MinLength,
  Matches,
  IsIn,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '1990-01-15',
    description: 'Date of birth (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Gender',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'Software developer passionate about e-commerce',
    description: 'User bio',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 'Acme Corp', description: 'Company name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  company?: string;

  @ApiPropertyOptional({
    example: 'Software Engineer',
    description: 'Occupation',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({
    example: 'https://example.com',
    description: 'Personal website',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Preferred language (ISO 639-1)',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z]{2}$/, {
    message: 'Language must be a valid ISO 639-1 code (e.g., en, es, fr)',
  })
  language?: string;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Preferred currency (ISO 4217)',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{3}$/, {
    message: 'Currency must be a valid ISO 4217 code (e.g., USD, EUR, GBP)',
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 'America/New_York',
    description: 'Timezone',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  timezone?: string;

  // Notification preferences
  @ApiPropertyOptional({
    example: true,
    description: 'Enable email notifications',
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Enable SMS notifications',
  })
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Receive marketing emails',
  })
  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Receive order updates',
  })
  @IsBoolean()
  @IsOptional()
  orderUpdates?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Subscribe to newsletter',
  })
  @IsBoolean()
  @IsOptional()
  newsletterSubscription?: boolean;

  // Privacy settings
  @ApiPropertyOptional({
    example: 'private',
    description: 'Profile visibility',
    enum: ['public', 'private', 'friends'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['public', 'private', 'friends'])
  profileVisibility?: string;

  @ApiPropertyOptional({ example: false, description: 'Show email publicly' })
  @IsBoolean()
  @IsOptional()
  showEmail?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Show phone publicly' })
  @IsBoolean()
  @IsOptional()
  showPhone?: boolean;
}
