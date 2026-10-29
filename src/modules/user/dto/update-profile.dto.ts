import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    type: String,
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  readonly firstName?: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  readonly lastName?: string;

  @ApiProperty({
    type: String,
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  readonly fullName?: string;

  @ApiProperty({
    type: String,
    example: '+31612345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  readonly phone?: string;
}
