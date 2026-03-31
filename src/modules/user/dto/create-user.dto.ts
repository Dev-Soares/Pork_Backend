import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum Plan {
  BASICO = 'BASICO',
  PADRAO = 'PADRAO',
  AVANCADO = 'AVANCADO',
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A senha deve ter no minimo 8 caracteres' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 4500.75 })
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiProperty({ enum: Plan, example: Plan.BASICO })
  @IsEnum(Plan)
  @IsNotEmpty()
  plan: Plan;
}
