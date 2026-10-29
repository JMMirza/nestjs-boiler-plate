import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessControlService } from '../services/access-control.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto';
import { AdminInterceptor } from 'src/interceptors/admin.interceptor';
import { DecryptTokenInterceptor } from 'src/interceptors';

@ApiTags('Admin - Access Control')
@ApiBearerAuth()
@Controller('admin/access-control')
@UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  // ---------- Role Routes ----------

  @Post('roles')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.accessControlService.createRole(dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  getAllRoles() {
    return this.accessControlService.getAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  getRoleById(@Param('id') id: string) {
    return this.accessControlService.getRoleById(id);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update role by ID' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.accessControlService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete role by ID' })
  deleteRole(@Param('id') id: string) {
    return this.accessControlService.deleteRole(id);
  }

  // ---------- Permission Routes ----------

  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.accessControlService.createPermission(dto);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  getAllPermissions() {
    return this.accessControlService.getAllPermissions();
  }

  @Get('permissions/:id')
  @ApiOperation({ summary: 'Get permission by ID' })
  getPermissionById(@Param('id') id: string) {
    return this.accessControlService.getPermissionById(id);
  }

  @Put('permissions/:id')
  @ApiOperation({ summary: 'Update permission by ID' })
  updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.accessControlService.updatePermission(id, dto);
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Delete permission by ID' })
  deletePermission(@Param('id') id: string) {
    return this.accessControlService.deletePermission(id);
  }
}
