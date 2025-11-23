import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '../entities/address.entity';

export class AddressResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiProperty({ example: '123 Main Street' })
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  addressLine2?: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY' })
  stateProvince: string;

  @ApiProperty({ example: '10001' })
  postalCode: string;

  @ApiProperty({ example: 'US' })
  country: string;

  @ApiProperty({ enum: AddressType, example: AddressType.SHIPPING })
  type: AddressType;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiPropertyOptional({ example: 'Ring doorbell twice' })
  notes?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}
