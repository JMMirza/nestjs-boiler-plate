import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePermissionDto {
  @ApiProperty({ example: 'Update User', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'update:user', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ example: 'Allows updating user details', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
