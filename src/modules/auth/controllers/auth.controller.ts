import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/modules/auth/services';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  SeedAdminDto,
  SignupDto,
  VerifyEmailDto,
} from '../dto';
import { DecryptTokenInterceptor } from 'src/interceptors';
@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email with OTP' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({
    status: 400,
    description:
      'Invalid or expired OTP, user not found, or email already verified',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP for email verification' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({
    status: 400,
    description: 'User not found or OTP not yet expired',
  })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return await this.authService.resendOTp(resendOtpDto);
  }

  @ApiBearerAuth()
  @Post('change-password')
  @UseInterceptors(DecryptTokenInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Password change' })
  @ApiResponse({ status: 200, description: 'Password Changed successfully' })
  @ApiResponse({ status: 400, description: 'Enter Correct Password' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req.user;
    return await this.authService.changePassword(user.id, changePasswordDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiBearerAuth()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Request() req: any,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const user = req.user;
    return await this.authService.resetPassword(user, resetPasswordDto);
  }

  @Post('seed-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Seed admin account' })
  @ApiResponse({
    status: 201,
    description: 'Admin account created successfully',
  })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async seedAdmin(@Body() seedAdminDto: SeedAdminDto) {
    return await this.authService.seedAdmin(seedAdminDto);
  }
}
