import { Routes } from '@nestjs/core';
import { AuthModule } from '../auth';
import { UserModule } from '../user';
import { NotificationModule } from '../notification';
import { AccessControlModule } from '../access-control';
import { ExampleModule } from '../example';

export const routes: Routes = [
  {
    path: '/auth',
    module: AuthModule,
  },
  {
    path: '/user',
    module: UserModule,
  },
  {
    path: '/notification',
    module: NotificationModule,
  },
  {
    path: '/',
    module: AccessControlModule,
  },
  {
    path: '/example',
    module: ExampleModule,
  },
];
