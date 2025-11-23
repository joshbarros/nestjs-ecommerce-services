import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({ example: 'SAVE10', description: 'Discount code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;
}
