import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user123', description: 'Tên đăng nhập' })
  @IsString()
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  username: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: '0123456789', description: 'Số điện thoại' })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có 10 chữ số' })
  phone: string;

  @ApiProperty({ example: 'admin123', description: 'Tên đăng nhập của người quản lý', required: false })
  @IsString()
  @IsOptional()
  managedByUsername?: string;
} 