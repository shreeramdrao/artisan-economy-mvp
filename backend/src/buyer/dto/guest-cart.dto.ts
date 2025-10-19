import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddGuestCartItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class UpdateGuestCartItemDto {
  @IsNumber()
  quantity: number;
}

export class GuestCartItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  itemId?: string;
}

export class MigrateGuestCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  guestCart: GuestCartItemDto[];
}
