import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAdminNotificationDto {
  @ApiProperty({
    type: String,
    example: 'email',
    description: "'email' also sends an email; any other value is in-app only",
  })
  @IsNotEmpty({ message: 'Type is required' })
  readonly type: string;

  @ApiProperty({
    type: String,
    example: 'user',
    description: 'Role of the users who should receive the notification',
  })
  @IsNotEmpty({ message: 'Role is required' })
  readonly role: string;

  @ApiProperty({
    type: String,
    example: 'Scheduled maintenance',
  })
  @IsNotEmpty({ message: 'Title is required' })
  readonly title: string;

  @ApiProperty({
    type: String,
    example: '',
  })
  @IsOptional()
  readonly description: string;
}
