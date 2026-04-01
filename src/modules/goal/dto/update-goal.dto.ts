import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateGoalDto {
  @ApiPropertyOptional({ example: 'Viagem para Europa' })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 15000 })
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  targetAmount?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentAmount?: number;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  achieved?: boolean;
}
