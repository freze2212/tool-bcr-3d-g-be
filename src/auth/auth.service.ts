import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { username, password, phone, managedByUsername } = registerDto;
    
    console.log('Register request data:', {
      username,
      phone,
      managedByUsername,
      fullDto: registerDto
    });

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new BadRequestException('Tên đăng nhập đã tồn tại');
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingPhone = await this.userModel.findOne({ phone });
    if (existingPhone) {
      throw new BadRequestException('Số điện thoại đã tồn tại');
    }

    // Tìm người quản lý theo username
    let managedBy: string | null = null;
    if (managedByUsername) {
      console.log('Finding manager with username:', managedByUsername);
      const manager = await this.userModel.findOne({ username: managedByUsername }).exec() as UserDocument;
      if (!manager) {
        throw new BadRequestException('Không tìm thấy người quản lý');
      }
      if (manager.role !== UserRole.ADMIN && manager.role !== UserRole.SUPERADMIN) {
        throw new BadRequestException('Người quản lý phải là admin hoặc superadmin');
      }
      managedBy = (manager._id as any).toString();
      console.log('Found manager:', { id: managedBy, role: manager.role });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      username,
      password: hashedPassword,
      phone,
      coins: 0,
      role: UserRole.USER,
      managedBy
    });

    const savedUser = await user.save();
    const { password: _, ...result } = savedUser.toObject();

    console.log('Created user:', {
      id: savedUser._id,
      username: savedUser.username,
      managedBy: savedUser.managedBy
    });

    return {
      message: 'Đăng ký thành công',
      user: result
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.username, loginDto.password);
      const payload = { 
        username: user.username, 
        sub: user._id, 
        role: user.role,
        coins: user.coins 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
          coins: user.coins,
          phone: user.phone,
          managedBy: user.managedBy
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Đăng nhập thất bại');
    }
  }
} 