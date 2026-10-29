import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas';
import {
  CreateUserByAdminDto,
  PaginationQueryDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UpdateSettingsDto,
} from '../dto';
import { EmailService, findAll } from 'src/services';
import {
  Role,
  RoleDocument,
} from 'src/modules/access-control/schemas/role.schema';
import {
  userCreated,
  userCreatedPasswordReset,
} from 'src/utils/email-templates';
import * as generator from 'generate-password';

const SETTINGS_FIELDS =
  'full_name emailNotifications pushNotifications twoFactorAuth sessionTimeout lastPasswordChange';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private readonly emailService: EmailService,
  ) {}

  private generatePassword(): string {
    return generator.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      strict: true,
    });
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new BadRequestException(['User not found']);
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    const { firstName, lastName, fullName, phone } = dto;

    if (firstName !== undefined) user.first_name = firstName;
    if (lastName !== undefined) user.last_name = lastName;
    if (fullName !== undefined) user.full_name = fullName;
    if (phone !== undefined) user.phone = phone;
    await user.save();
    return user;
  }

  async deleteAccount(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    await user.deleteOne();
    return user;
  }

  async getAllUsers(query: PaginationQueryDto) {
    const { page, limit, search, sortBy, sortOrder } = query;

    const filter: any = { role: { $ne: UserRole.ADMIN } };
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    return findAll(
      this.userModel,
      limit,
      search,
      page,
      ['email', 'first_name', 'last_name', 'full_name'],
      filter,
      '-password',
      [],
      sort,
    );
  }

  async createUserByAdmin(dto: CreateUserByAdminDto) {
    const { email, firstName, lastName, phone, roleId } = dto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser)
      throw new BadRequestException(['User already exists with this email']);

    const role = await this.roleModel.findById(roleId);
    if (!role) throw new BadRequestException(['Invalid role']);

    const password = this.generatePassword();

    // Plain password is hashed by the User schema pre-save hook
    const user = await this.userModel.create({
      email,
      first_name: firstName || '',
      last_name: lastName || '',
      full_name: `${firstName || ''} ${lastName || ''}`.trim(),
      phone,
      password,
      emailVerified: true, // Admin-created users are auto-verified
      role: role?.name?.toLowerCase() || UserRole.USER,
      roleId: role._id,
      profileSetup: false,
    });

    // Send system-generated password via email
    const emailFormat = userCreated(user, password);
    await this.emailService.sendEmailNotification({
      to: user.email,
      subject: emailFormat.SUBJECT,
      html: emailFormat.HTML,
    });

    return { message: 'User created and credentials sent via email', user };
  }

  async getSettings(userId: string) {
    const user = await this.userModel.findById(userId).select(SETTINGS_FIELDS);
    if (!user) throw new BadRequestException(['User not found']);
    return user;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const { fullName, ...rest } = dto;
    const update: any = { ...rest };
    if (fullName !== undefined) update.full_name = fullName;

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .select(SETTINGS_FIELDS);
    if (!user) throw new BadRequestException(['User not found']);
    return user;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email } = dto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException(['User not found']);

    const newPassword = this.generatePassword();
    user.password = newPassword;
    await user.save();

    const emailFormat = userCreatedPasswordReset(user, newPassword);
    await this.emailService.sendEmailNotification({
      to: user.email,
      subject: emailFormat.SUBJECT,
      html: emailFormat.HTML,
    });

    return { message: 'New password sent to email' };
  }
}
