import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateSellerProfileDto {
  @ApiProperty({ example: 'Ramesh Kumar', description: 'Full name of the seller' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+91-9876543210', description: 'Phone number of the seller' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Jaipur, Rajasthan', description: 'Location of the seller' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 'Crafting traditional blue pottery with love and skill.',
    description: 'Short bio / artisan story',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: 'ramesh@upi',
    description: 'UPI ID for payments (optional if bank details are provided)',
  })
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiProperty({ example: '1234567890', description: 'Bank account number (if no UPI)' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiProperty({ example: 'SBIN0001234', description: 'Bank IFSC code' })
  @IsOptional()
  @IsString()
  ifscCode?: string;

  @ApiProperty({ example: true, description: 'Whether seller is verified by admin' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}