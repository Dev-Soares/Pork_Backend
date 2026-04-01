import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 'Supermercado' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ example: 'Alimentacao' })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ example: 250.5 })
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: '2026-03-31T12:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  date?: string;
}
