import { IsString, IsNotEmpty, MinLength, Matches, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'username123', description: 'Username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '0123456789', description: 'Phone number of the user' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có 10 chữ số' })
  phone: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
} 