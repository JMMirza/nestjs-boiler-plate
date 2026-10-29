import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Create User', description: 'Name of permission' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'create:user', description: 'Action key' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({ example: 'Allows creating new users', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
