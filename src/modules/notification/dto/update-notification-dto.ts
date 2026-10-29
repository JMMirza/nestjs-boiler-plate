import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({
    type: Array,
    example: [{ url: '/rejected' }],
  })
  @IsNotEmpty({ message: 'action is required' })
  readonly action: object[];

  @ApiProperty({
    type: Array,
    example: [{ url: '/rejected' }],
  })
  @IsNotEmpty({ message: 'data is required' })
  readonly data: object[];

  @ApiProperty({
    type: Array,
    example: ['64af92427c3b88e036b6d398'],
  })
  @IsNotEmpty({ message: 'users is required' })
  readonly users: object[];
}
