import { UserController } from 'src/modules/user/controllers';
import { UserService } from 'src/modules/user/services';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from 'src/services';
import { User, UserSchema } from './schemas';
import { Role, RoleSchema } from '../access-control/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService],
})
export class UserModule {}
