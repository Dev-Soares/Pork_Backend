import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'Reserva de emergencia' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0.01)
  targetAmount: number;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', required: false })
  @IsDateString()
  deadline: string;
}
