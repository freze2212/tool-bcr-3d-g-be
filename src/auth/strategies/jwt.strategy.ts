import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    const user = await this.userModel.findById(payload.sub);
    console.log('Found user:', user);
    if (!user) {
      return null;
    }
    const result = {
      sub: user._id,
      username: user.username,
      role: user.role,
      coins: user.coins
    };
    console.log('Returning user data:', result);
    return result;
  }
} 