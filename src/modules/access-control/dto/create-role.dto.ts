import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'Name of the role' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Role with full access', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['672f1e2b83d1df4d87e32c13', '672f1e2b83d1df4d87e32c14'],
    description: 'Array of Permission ObjectIds',
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}
