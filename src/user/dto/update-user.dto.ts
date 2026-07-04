import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/schemas/user.schema';

export class UpdateUserDto {
  @ApiProperty({ example: 'newusername', description: 'Tên đăng nhập mới', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: '0123456789', description: 'Số điện thoại mới', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có 10 chữ số' })
  phone?: string;

  @ApiProperty({ example: 'newpassword123', description: 'Mật khẩu mới', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password?: string;

  @ApiProperty({ enum: UserRole, description: 'Role của user', required: false })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'ID của người quản lý', required: false })
  @IsOptional()
  managedBy?: string;
} 