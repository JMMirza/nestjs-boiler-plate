import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument, Permission, PermissionDocument } from '../schemas';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto';
import { User, UserDocument } from 'src/modules/user/schemas';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
  ) {}

  // ---------- Role Methods ----------

  async createRole(dto: CreateRoleDto) {
    const role = await this.roleModel.create({
      ...dto,
      permissions: dto.permissions?.map((id) => new Types.ObjectId(id)) || [],
    });
    return role.populate('permissions');
  }

  async getAllRoles() {
    return this.roleModel.find().populate('permissions').lean();
  }

  async getRoleById(id: string) {
    const role = await this.roleModel.findById(id).populate('permissions');
    if (!role) throw new NotFoundException(['Role not found']);
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException(['Role not found']);

    if (dto.permissions) {
      role.permissions = dto.permissions.map((id) => new Types.ObjectId(id));
    }

    Object.assign(role, dto);
    await role.save();
    return role.populate('permissions');
  }

  async deleteRole(id: string) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException(['Role not found']);
    const getAssociations = await this.userModel.find({ roleId: role._id });
    if (getAssociations.length > 0) {
      throw new BadRequestException([
        'Cannot delete role with associated users',
      ]);
    }
    await role.deleteOne();
    return { success: true };
  }

  // ---------- Permission Methods ----------

  async createPermission(dto: CreatePermissionDto) {
    return this.permissionModel.create(dto);
  }

  async getAllPermissions() {
    return this.permissionModel.find().lean();
  }

  async getPermissionById(id: string) {
    const permission = await this.permissionModel.findById(id);
    if (!permission) throw new NotFoundException(['Permission not found']);
    return permission;
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const permission = await this.permissionModel.findById(id);
    if (!permission) throw new NotFoundException(['Permission not found']);

    Object.assign(permission, dto);
    await permission.save();
    return permission;
  }

  async deletePermission(id: string) {
    const permission = await this.permissionModel.findById(id);
    if (!permission) throw new NotFoundException(['Permission not found']);
    await permission.deleteOne();
    return { success: true };
  }
}
