import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Lakshmi Crafts' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'lakshmi@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string; // 🔑 Email is the unique identifier

  @ApiProperty({ example: '+91 9876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'mypassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'seller', enum: ['seller', 'buyer'] })
  @IsIn(['seller', 'buyer'])
  role: 'seller' | 'buyer';
}