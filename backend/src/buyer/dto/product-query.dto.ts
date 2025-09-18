import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, enum: ['en', 'hi', 'kn'] })
  @IsEnum(['en', 'hi', 'kn'])
  @IsOptional()
  language?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ required: false, enum: ['price', 'date', 'popularity'] })
  @IsEnum(['price', 'date', 'popularity'])
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}