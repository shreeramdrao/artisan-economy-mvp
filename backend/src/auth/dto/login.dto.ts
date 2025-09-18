import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string; // ✅ Email is the unique identifier

  @ApiProperty({ example: 'mypassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'seller', enum: ['seller', 'buyer'] })
  @IsIn(['seller', 'buyer'])
  role: 'seller' | 'buyer';
}