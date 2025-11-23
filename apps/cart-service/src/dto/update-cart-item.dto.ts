import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'New quantity' })
  @IsNumber()
  @Min(1)
  @Max(999)
  quantity: number;
}
