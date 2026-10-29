import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../services';
import { AdminInterceptor } from 'src/interceptors/admin.interceptor';
import { DecryptTokenInterceptor } from '../../../interceptors/auth.interceptor';
import { SelfOrAdminInterceptor } from '../../../interceptors/self-or-admin.interceptor';
import {
  CreateUserByAdminDto,
  PaginationQueryDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UpdateSettingsDto,
} from '../dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor) // 🔒 Admin only
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  async getAllUsers(@Query() query: PaginationQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @Get('settings')
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Get notification and security settings' })
  async getSettings(@Request() req: any) {
    return this.userService.getSettings(req.user.id);
  }

  @Patch('settings')
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Update notification and security settings' })
  async updateSettings(@Request() req: any, @Body() dto: UpdateSettingsDto) {
    return this.userService.updateSettings(req.user.id, dto);
  }

  @Post('create')
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  @ApiOperation({ summary: 'Create a user with a role (Admin only)' })
  async createUserByAdmin(@Body() dto: CreateUserByAdminDto) {
    return this.userService.createUserByAdmin(dto);
  }

  @Post('reset-password')
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  @ApiOperation({ summary: 'Generate and email a new password (Admin only)' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }

  // ── Wildcard :id routes (must stay last so static routes above match first) ─

  @Get(':id')
  @UseInterceptors(DecryptTokenInterceptor, SelfOrAdminInterceptor)
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Param('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Patch(':id/profile')
  @UseInterceptors(DecryptTokenInterceptor, SelfOrAdminInterceptor)
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(
    @Param('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @Delete(':id')
  @UseInterceptors(DecryptTokenInterceptor, SelfOrAdminInterceptor)
  @ApiOperation({ summary: 'Delete account permanently' })
  async deleteAccount(@Param('id') userId: string) {
    return this.userService.deleteAccount(userId);
  }
}
