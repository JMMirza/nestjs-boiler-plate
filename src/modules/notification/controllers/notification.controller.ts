import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { UpdateNotificationDto } from '../dto/update-notification-dto';
import { DecryptTokenInterceptor } from 'src/interceptors';
import { CreateAdminNotificationDto } from '../dto/create-admin-notification-dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { AdminInterceptor } from 'src/interceptors/admin.interceptor';

@ApiTags('Notifications')
@ApiBearerAuth() // Indicates the controller requires an authenticated token
@Controller()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get all notifications for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications retrieved successfully.',
  })
  @UseInterceptors(DecryptTokenInterceptor)
  @Get()
  async getAll(@Request() request: any, @Query() query: PaginationQueryDto) {
    const user = request.user;
    if (user.role == 'admin') {
      return this.notificationService.adminListNotifications(user.id, query);
    }
    return await this.notificationService.get(user);
  }

  @ApiOperation({
    summary: 'Get unread notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of unread notifications retrieved successfully.',
  })
  @UseInterceptors(DecryptTokenInterceptor)
  @Get('unread-notification')
  async getUnread(@Request() request: any) {
    const user = request.user;
    return await this.notificationService.getUnreadNotifications(user.id);
  }

  @ApiOperation({ summary: 'Get a specific notification by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully.',
  })
  @ApiParam({ name: 'id', description: 'ID of the notification to retrieve' })
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.notificationService.getById(id);
  }

  @ApiOperation({ summary: 'Action Performed' })
  @ApiResponse({
    status: 200,
    description: 'Notification action performed successfully.',
  })
  @ApiParam({ name: 'id', description: 'ID of the notification to retrieve' })
  @UseInterceptors(DecryptTokenInterceptor)
  @Get('action-performed/:id')
  async actionPerformed(@Param('id') id: string) {
    return await this.notificationService.actionPerformed(id);
  }

  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully.',
  })
  @UseInterceptors(DecryptTokenInterceptor)
  @Post()
  async createNotification(
    @Body() createNotification: CreateAdminNotificationDto,
    @Request() request: any,
  ) {
    const user = request.user;
    return await this.notificationService.create(createNotification, user.id);
  }

  @ApiOperation({ summary: 'Update a notification by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully.',
  })
  @ApiParam({ name: 'id', description: 'ID of the notification to update' })
  @UseInterceptors(DecryptTokenInterceptor)
  @Put('/update/:id')
  async updateNotification(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto,
    @Request() request: any,
  ) {
    const user = request.user;
    return await this.notificationService.update(id, updateDto, user.id);
  }

  @ApiOperation({ summary: 'Mark a notification as read by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the notification to mark as read',
  })
  @UseInterceptors(DecryptTokenInterceptor)
  @Put('/mark-as-read/:id')
  async markAsRead(@Param('id') id: string, @Request() request: any) {
    const user = request.user;
    return await this.notificationService.markAsRead(id, user.id);
  }

  @ApiOperation({
    summary: 'Mark all notifications as read for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully.',
  })
  @UseInterceptors(DecryptTokenInterceptor)
  @Put('/mark-all-as-read')
  async markAllAsRead(@Request() request: any) {
    const user = request.user;
    return await this.notificationService.markAllAsRead(user.id);
  }
}
