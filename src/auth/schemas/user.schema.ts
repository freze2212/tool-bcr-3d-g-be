import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN'
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ default: 0 })
  coins: number;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  managedBy: MongooseSchema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User); 