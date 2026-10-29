import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  SignupDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  JwtPayloadDto,
  SeedAdminDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendOtpDto,
} from '../dto';
import { User, UserDocument, UserRole } from 'src/modules/user/schemas';
import * as generator from 'generate-password';
import { EmailService } from 'src/services';
import { forgotPassword, verifyEmail } from 'src/utils/email-templates';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private createToken(user: any): string {
    const payload: JwtPayloadDto = {
      id: user._id,
      email: user.email,
      name: user.full_name,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private generateOtp() {
    return generator.generate({
      length: 4,
      numbers: true,
      uppercase: false,
      lowercase: false,
      symbols: false,
    });
  }

  async signup(signupDto: SignupDto) {
    const { email, fullName, firstName, lastName, phone, password } = signupDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException(['Email or phone already registered']);
    }

    // Create new user
    const otp = this.generateOtp();
    const user = new this.userModel({
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      password,
      otp,
      otpExpiredAt: new Date(Date.now() + 5 * 60000),
      role: UserRole.USER,
      profileSetup: false,
    });

    await user.save();
    const emailFormat = verifyEmail(otp);
    await this.emailService.sendEmailNotification({
      to: user.email,
      subject: emailFormat.SUBJECT,
      html: emailFormat.HTML,
    });

    return {
      message: 'Please verify your email',
    };
  }

  async verifyEmail(body: VerifyEmailDto) {
    const { otp, email, forgotPassword } = body;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException(["User doesn't exist."]);
    }
    if (forgotPassword) {
      if (user.resetToken !== otp || user.resetTokenExpiry < new Date()) {
        throw new BadRequestException(['Invalid or expired OTP.']);
      }
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      const token = this.createToken(user);
      return {
        message: 'Email successfully verified, Now Reset your password.',
        token,
      };
    }
    if (user.emailVerified) {
      throw new BadRequestException(['Email already verified.']);
    }
    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpiredAt < new Date()) {
      throw new BadRequestException(['Invalid or expired OTP.']);
    }

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiredAt = undefined;
    await user.save();
    const token = this.createToken(user);
    return {
      message: 'Email successfully verified',
      user: {
        id: user._id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        role: user.role,
        profileSetup: user.profileSetup,
      },
      token,
    };
  }

  async resendOTp(data: ResendOtpDto) {
    const { email } = data;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException(["User doesn't exist."]);
    }

    if (user.emailVerified) {
      throw new BadRequestException(['User email is already verified']);
    }
    if (user.otpExpiredAt > new Date()) {
      throw new BadRequestException(['Please try after five minutes']);
    }
    const otp = this.generateOtp();
    user.otp = otp;
    user.otpExpiredAt = new Date(Date.now() + 5 * 60000);
    await user.save();

    const emailFormat = verifyEmail(otp);
    await this.emailService.sendEmailNotification({
      to: user.email,
      subject: emailFormat.SUBJECT,
      html: emailFormat.HTML,
    });

    return {
      message:
        'Your OTP is sent to email. Please use that OTP to verify your account.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, fcmToken } = loginDto;

    // Find user by email
    const user = await this.userModel
      .findOne({ email })
      .populate({
        path: 'roleId', // populate the role first
        populate: {
          path: 'permissions', // then populate permissions inside role
          model: 'Permission', // optional if Mongoose can't infer model
        },
      })
      .exec();
    if (!user) {
      throw new UnauthorizedException(['Invalid credentials']);
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(['Invalid credentials']);
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(['Please verify your email first']);
    }
    // Update FCM token if provided
    if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    // Generate JWT token
    const token = this.createToken(user);
    const userObj: any = {
      id: user._id,
      email: user.email,
      name: user.full_name,
      phone: user.phone,
      role: user.role,
      profileSetup: user.profileSetup,
      profilePicture: user.profilePicture,
    };
    if (user.roleId) {
      userObj.role = user.roleId;
    }
    return {
      message: 'Login successful',
      user: userObj,
      token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException(['Email not found']);
    }

    // Generate reset token
    const resetToken = this.generateOtp();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (you might want to add these fields to User model)
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const emailFormat = forgotPassword(user.full_name, resetToken);
    await this.emailService.sendEmailNotification({
      to: user.email,
      subject: emailFormat.SUBJECT,
      html: emailFormat.HTML,
    });

    return {
      message: 'Password reset email sent',
    };
  }

  async resetPassword(userObj: any, resetPasswordDto: ResetPasswordDto) {
    const { newPassword } = resetPasswordDto;
    const user = await this.userModel.findById(userObj.id);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    user.password = newPassword;
    await user.save();
    return {
      message: 'Password reset successful',
    };
  }

  async seedAdmin(seedAdminDto: SeedAdminDto) {
    const { email, password, phone, firstName, lastName } = seedAdminDto;

    // Check if admin already exists
    const existingAdmin = await this.userModel.findOne({
      role: UserRole.ADMIN,
    });

    if (existingAdmin) {
      throw new ConflictException(['Admin account already exists']);
    }

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException(['Email already registered']);
    }

    // Create full name
    const fullName = `${firstName} ${lastName}`;
    // Create admin user
    const admin = new this.userModel({
      email,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone,
      password,
      role: UserRole.ADMIN,
      emailVerified: true,
      profileSetup: true,
    });

    await admin.save();

    return {
      message: 'Admin account created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.full_name,
        role: admin.role,
      },
    };
  }

  async changePassword(userId: any, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    // Find user by email
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(['Invalid user']);
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw new BadRequestException(['Enter Correct Password']);
    }

    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save();

    return {
      message: 'Password Changed successfully',
    };
  }
}
