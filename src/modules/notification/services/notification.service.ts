import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../schemas/notification.schema';
import { EmailService } from 'src/services';
import { announcementEmail } from '../../../utils/email-templates';
import { User, UserDocument, UserRole } from 'src/modules/user/schemas';
import { CreateAdminNotificationDto } from '../dto/create-admin-notification-dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { UpdateNotificationDto } from '../dto/update-notification-dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  private async sendEmailNotification(
    userArray: any[],
    title: string,
    description: string,
  ): Promise<void> {
    const emailFormat = announcementEmail(
      title,
      description,
      new Date(Date.now()).toLocaleString(),
    );
    await Promise.all(
      userArray
        ?.filter((user) => user?.emailNotifications !== false)
        .map(async (user) => {
          await this.emailService.sendEmailNotification({
            to: user.email,
            subject: emailFormat.SUBJECT,
            html: emailFormat.HTML,
          });
        }),
    );
  }

  async checkUsersIds(userIds, field) {
    const users = [];
    const verifiedUserIds = [];
    let flag = false;
    await Promise.all(
      userIds.map(async (user) => {
        const userCheck = await this.userModel.findById(user);
        if (!userCheck) {
          flag = true;
        } else {
          if (!verifiedUserIds.includes(user)) {
            users.push(userCheck);
            verifiedUserIds.push(user);
          }
        }
      }),
    );
    if (flag) {
      throw new BadRequestException([`One of the ${field} is invalid`]);
    }
    return { userArrayList: users, userIDs: verifiedUserIds };
  }

  async create(
    createNotification: CreateAdminNotificationDto,
    userId: string,
  ): Promise<any> {
    const { role, type, title, description } = createNotification;
    const users = await this.userModel.find({ role });
    if (!users.length) {
      throw new BadRequestException(['No user found']);
    }
    const readStatuses = [];
    const verifiedUserIds = users?.map((user) => user._id);
    const notification = await this.notificationModel.create({
      title,
      description,
      type,
      users: verifiedUserIds,
      readStatuses,
      createdBy: userId,
    });
    if (type === 'email') {
      this.sendEmailNotification(users, title, description);
    }
    return notification;
  }

  async createInApp(createNotification: any, userId: string): Promise<any> {
    const { action, users, type, title, description } = createNotification;
    let userArray = [];
    let verifiedUserIds = [];
    if (users.length > 0) {
      const { userArrayList, userIDs } = await this.checkUsersIds(
        users,
        'users',
      );
      userArray = userArrayList;
      verifiedUserIds = userIDs;
    } else {
      userArray = await this.userModel.find({ role: UserRole.USER });
      verifiedUserIds = userArray?.map((user) => user._id);
    }
    const readStatuses = [];

    if (type === 'email') {
      this.sendEmailNotification(userArray, title, description);
    }

    return this.notificationModel.create({
      title,
      description,
      type,
      action,
      users: verifiedUserIds,
      readStatuses,
      createdBy: userId,
    });
  }

  async get(user: any): Promise<any> {
    const userId = user.id;
    const notifications: any = await this.notificationModel
      .find({
        users: { $in: [userId] },
      })
      .populate(['createdBy'])
      .sort({ updatedAt: -1 })
      .lean();
    const notificationsCount = await this.notificationModel
      .find({
        users: { $in: [userId] }, // Ensures the user is among those who should receive the notification
        readStatuses: {
          $not: {
            $elemMatch: { user: userId }, // Ensures the user has no read status in the array
          },
        },
      })
      .countDocuments();
    return { notifications, unreadNotifications: notificationsCount };
  }

  async adminListNotifications(userId: any, query: PaginationQueryDto) {
    const { page = 1, limit = 10, search, createdBy } = query;
    const filter: any = {};
    if (createdBy == true) filter.createdBy = new Types.ObjectId(userId);
    else filter.users = { $in: [userId] };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [items, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments(filter),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string): Promise<any> {
    const result: any = await this.notificationModel
      .findById(id)
      .populate('users');

    if (!result) {
      throw new NotFoundException(['Notification not found']);
    }

    return result;
  }

  async update(
    id: string,
    updateNotification: UpdateNotificationDto,
    userId: any,
  ): Promise<any> {
    const { data, action, users } = updateNotification;

    const notification = await this.notificationModel.findById(id);

    if (!notification) {
      throw new NotFoundException(['No notification found']);
    }

    const checkUser = notification?.users?.includes(userId);
    if (!checkUser) {
      throw new BadRequestException(['User is not allowed']);
    }

    const readStatuses = notification?.readStatuses;
    const alreadySeen = readStatuses.find((user) => user.user == userId);
    if (!alreadySeen) {
      readStatuses.push({
        user: userId,
        time: Date.now(),
      });
    }

    return this.notificationModel.findByIdAndUpdate(
      id,
      { data, users, action, readStatuses },
      { new: true },
    );
  }

  async markAsRead(id: any, userId: any) {
    const notification = await this.getById(id);

    const checkUser = notification?.users?.includes(userId);
    if (!checkUser) {
      throw new BadRequestException(['User is not allowed']);
    }

    const readStatuses = notification?.readStatuses;
    const alreadySeen = notification?.readStatuses.find(
      (user) => user.user == userId,
    );
    if (!alreadySeen) {
      readStatuses.push({
        user: userId,
        time: Date.now(),
      });
    }

    await this.notificationModel.findByIdAndUpdate(id, {
      readStatuses,
    });

    const updatedNotification = await this.notificationModel.findById(id);

    return updatedNotification;
  }

  async markAllAsRead(userId: any) {
    const notifications = await this.notificationModel
      .find({ users: { $in: [userId] } })
      .sort({ createdAt: -1 })
      .exec();
    notifications?.map(async (taskNoti) => {
      const readStatuses = taskNoti?.readStatuses;
      const alreadySeen = taskNoti?.readStatuses?.find(
        (user) => user.user == userId,
      );
      if (!alreadySeen) {
        readStatuses?.push({
          user: userId,
          time: Date.now(),
        });
      }
      await this.notificationModel.findByIdAndUpdate(taskNoti._id, {
        readStatuses,
      });
    });
    return notifications;
  }

  async getUnreadNotifications(userId: any): Promise<any> {
    const notifications = await this.notificationModel
      .find({
        users: { $in: [userId] }, // Ensures the user is among those who should receive the notification
        readStatuses: {
          $not: {
            $elemMatch: { user: userId }, // Ensures the user has no read status in the array
          },
        },
      })
      .sort({ createdAt: -1 })
      .exec();
    return notifications;
  }

  async actionPerformed(id) {
    const notification = await this.notificationModel.findById(id);
    if (notification?.type == 'action') {
      notification.isActionDone = true;
      return notification.save();
    }
  }
}
