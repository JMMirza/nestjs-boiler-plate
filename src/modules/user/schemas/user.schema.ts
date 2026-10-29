import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';
import { Role } from 'src/modules/access-control/schemas';

export type UserDocument = HydratedDocument<User> & {
  validatePassword(password: string): Promise<boolean>;
};

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema()
export class User extends Base {
  @Prop({ required: false, default: [] })
  fcmTokens: string[];

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  first_name: string;

  @Prop({ required: false, default: '' })
  last_name: string;

  @Prop({ required: false, default: '' })
  full_name: string;

  @Prop({ required: false })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    default: UserRole.USER,
    required: true,
  })
  role: string;

  @Prop({ type: Types.ObjectId, ref: Role.name, required: false })
  roleId: Types.ObjectId;

  @Prop({
    type: {},
    required: false,
    default: null,
  })
  profilePicture: Record<string, any>;

  @Prop({ required: false })
  otp: string;

  @Prop({ required: false, type: Date, default: null })
  otpExpiredAt: Date;

  @Prop({ required: false, default: false })
  emailVerified: boolean;

  @Prop({ required: false, default: false })
  profileSetup: boolean;

  @Prop({ type: Date, default: Date.now })
  lastSeen: Date;

  // Password reset fields
  @Prop({ required: false })
  resetToken: string;

  @Prop({ required: false })
  resetTokenExpiry: Date;

  // Notification & security settings
  @Prop({ required: false, default: true })
  emailNotifications: boolean;

  @Prop({ required: false, default: true })
  pushNotifications: boolean;

  @Prop({ required: false, default: false })
  twoFactorAuth: boolean;

  @Prop({ required: false, default: 30 })
  sessionTimeout: number;

  @Prop({ required: false, type: Date, default: null })
  lastPasswordChange: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Add index for reset token queries
UserSchema.index({ resetToken: 1 });
UserSchema.index({ resetTokenExpiry: 1 });

// Extend with BaseSchema for common fields
UserSchema.add(BaseSchema);
