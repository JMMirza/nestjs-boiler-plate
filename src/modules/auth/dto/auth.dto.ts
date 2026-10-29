import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  Matches,
  Length,
  IsBoolean,
} from 'class-validator';
import { PASSWORD_REGEX } from 'src/commons/constants';

// DTOs
export class SignupDto {
  @ApiProperty({
    type: String,
    example: 'John',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  readonly firstName?: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  readonly lastName?: string;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  @IsNotEmpty({ message: 'Full Name is required' })
  @IsString({ message: 'Full name must be a string' })
  readonly fullName: string;

  @ApiProperty({
    type: String,
    example: '+31612345678',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  readonly phone: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email",
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({
    type: String,
    example: 'Abcd@123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one special character, one number, one uppercase character, and be between 8 to 16 characters',
  })
  readonly password: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email",
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({
    type: String,
    example: 'Abcd@123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  readonly password: string;

  @ApiProperty({
    type: String,
    example: 'fcm-token-123',
  })
  @IsOptional()
  @IsString({ message: 'FCM token must be a string' })
  readonly fcmToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email",
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    example: 'NewPassword@123',
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one special character, one number, one uppercase character, and be between 8 to 16 characters',
  })
  readonly newPassword: string;
}

export class SeedAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: "Admin's email",
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({
    type: String,
    example: 'Admin@123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one special character, one number, one uppercase character, and be between 8 to 16 characters',
  })
  readonly password: string;

  @ApiProperty({
    type: String,
    example: '+31612345678',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  readonly phone?: string;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  readonly firstName: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  readonly lastName: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    type: String,
    example: 'Abcd@123',
  })
  @IsNotEmpty({ message: 'Old Password is required' })
  @IsString({ message: 'Old Password must be a string' })
  readonly oldPassword: string;

  @ApiProperty({
    type: String,
    example: 'Abcd@123',
  })
  @IsNotEmpty({ message: 'New Password is required' })
  @IsString({ message: 'New Password must be a string' })
  readonly newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ description: '4-digit OTP', example: '1234' })
  @IsString({ message: 'OTP must be a string' })
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  otp: string;

  @ApiProperty({ description: 'Is forgot password', example: true })
  @IsBoolean()
  forgotPassword: boolean;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
