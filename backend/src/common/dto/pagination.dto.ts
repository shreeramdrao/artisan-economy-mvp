// backend/src/common/dto/pagination.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 12,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  items: T[];

  @ApiProperty({ description: 'Total number of items', example: 240 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 2 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 12 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 20 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there are more pages', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there are previous pages', example: true })
  hasPrev: boolean;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}
