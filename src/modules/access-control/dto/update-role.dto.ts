import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 'Updated Role Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['672f1e2b83d1df4d87e32c13'],
    description: 'Array of Permission ObjectIds',
    required: false,
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
